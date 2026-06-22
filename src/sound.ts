// Sound and haptic feedback for workout player
// Uses Web Audio API for sounds (note: muted in iOS silent mode)

type AudioContextConstructor = typeof AudioContext;
type SafariAudioContextState = AudioContextState | 'interrupted';

interface WindowWithWebKitAudioContext extends Window {
  webkitAudioContext?: AudioContextConstructor;
}

let audioContext: AudioContext | null = null;
let audioContextCreatedAt = 0;
let hasInstalledUnlockListeners = false;
let resumeTimeoutId: number | null = null;
let keepAliveIntervalId: number | null = null;
let pendingAudioCallbacks: Array<() => void> = [];

const CONTEXT_REFRESH_AGE_MS = 15 * 60 * 1000;
const KEEP_ALIVE_INTERVAL_MS = 20 * 1000;

function contextNeedsResume(state: SafariAudioContextState | string): boolean {
  return state === 'suspended' || state === 'interrupted';
}

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  return window.AudioContext ?? (window as WindowWithWebKitAudioContext).webkitAudioContext;
}

function flushPendingAudio(): void {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running' || pendingAudioCallbacks.length === 0) return;

  const callbacks = pendingAudioCallbacks;
  pendingAudioCallbacks = [];
  callbacks.forEach((callback) => callback());
}

function closeAudioContext(): void {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = null;
    audioContextCreatedAt = 0;
    return;
  }

  const ctx = audioContext;
  audioContext = null;
  audioContextCreatedAt = 0;
  void ctx.close().catch(() => {});
}

function createAudioContext(): AudioContext | null {
  const AudioContextCtor = getAudioContextConstructor();
  if (!AudioContextCtor) return null;

  try {
    const ctx = new AudioContextCtor();
    audioContextCreatedAt = Date.now();

    // iOS Safari can leave an AudioContext interrupted after the app is backgrounded.
    // When it reports that state, try to resume as soon as WebKit allows it again.
    ctx.addEventListener('statechange', () => {
      if (ctx.state === 'running') {
        flushPendingAudio();
        return;
      }

      if (document.visibilityState === 'visible' && contextNeedsResume(ctx.state)) {
        void ctx
          .resume()
          .then(flushPendingAudio)
          .catch(() => scheduleResumeRetry(ctx));
      }
    });

    return ctx;
  } catch {
    return null;
  }
}

function getAudioContext(forceRefresh = false): AudioContext | null {
  if (audioContext?.state === 'closed') {
    audioContext = null;
    audioContextCreatedAt = 0;
  }

  if (forceRefresh && audioContext) {
    closeAudioContext();
  }

  if (!audioContext) {
    audioContext = createAudioContext();
  }

  return audioContext;
}

function scheduleResumeRetry(ctx: AudioContext): void {
  if (resumeTimeoutId !== null) return;

  resumeTimeoutId = window.setTimeout(() => {
    resumeTimeoutId = null;
    if (document.visibilityState === 'visible' && contextNeedsResume(ctx.state)) {
      void ctx
        .resume()
        .then(flushPendingAudio)
        .catch(() => {});
    }
  }, 250);
}

function queueAudioCallback(callback: () => void): void {
  // Keep the latest few cues instead of letting old missed beeps build up after a long background.
  pendingAudioCallbacks = [...pendingAudioCallbacks.slice(-2), callback];
}

/** Run callback after AudioContext is running (iOS suspends/interrupts in background). */
function ensureContextResumed(fn: () => void): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'running') {
    fn();
    return;
  }

  queueAudioCallback(fn);

  if (contextNeedsResume(ctx.state)) {
    void ctx
      .resume()
      .then(() => {
        if (ctx.state === 'running') {
          flushPendingAudio();
        } else {
          scheduleResumeRetry(ctx);
        }
      })
      .catch(() => {
        scheduleResumeRetry(ctx);
      });
  }
}

function primeAudioContext(forceRefresh = false): void {
  const shouldRefreshStaleContext =
    audioContext !== null && Date.now() - audioContextCreatedAt > CONTEXT_REFRESH_AGE_MS;
  const ctx = getAudioContext(forceRefresh || shouldRefreshStaleContext);
  if (!ctx) return;

  if (contextNeedsResume(ctx.state)) {
    void ctx
      .resume()
      .then(flushPendingAudio)
      .catch(() => scheduleResumeRetry(ctx));
  }

  if (ctx.state !== 'running') return;

  try {
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    flushPendingAudio();
  } catch {
    // Ignore unlock errors
  }
}

function installUnlockListeners(): void {
  if (hasInstalledUnlockListeners) return;
  hasInstalledUnlockListeners = true;

  const unlock = (): void => primeAudioContext();
  const options: AddEventListenerOptions = { passive: true, capture: true };

  // WebKit usually requires a fresh user activation after returning from the home
  // screen or app switcher. Re-prime audio on the next gesture instead of waiting
  // for the next scheduled beep to fail silently.
  window.addEventListener('pointerdown', unlock, options);
  window.addEventListener('touchend', unlock, options);
  window.addEventListener('click', unlock, options);
  window.addEventListener('keydown', unlock, options);
}

// Call during user interaction to unlock audio on iOS
export function initSound(): void {
  installUnlockListeners();
  primeAudioContext();
}

function playKeepAlivePulse(): void {
  ensureContextResumed(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 30;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.03);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignore keep-alive errors
    }
  });
}

/** Keep iOS Safari's audio session alive throughout long workouts. */
export function startSoundKeepAlive(): void {
  initSound();
  if (keepAliveIntervalId !== null) return;

  keepAliveIntervalId = window.setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    playKeepAlivePulse();
  }, KEEP_ALIVE_INTERVAL_MS);
}

export function stopSoundKeepAlive(): void {
  if (keepAliveIntervalId === null) return;
  clearInterval(keepAliveIntervalId);
  keepAliveIntervalId = null;
}

/** Pre-warm context when returning to the tab mid-workout (e.g. after minimize on iOS). */
export function resumeAudioContext(): void {
  const ctx = getAudioContext(
    document.visibilityState === 'visible' && audioContext?.state === 'interrupted'
  );
  if (!ctx) return;

  if (contextNeedsResume(ctx.state)) {
    void ctx
      .resume()
      .then(flushPendingAudio)
      .catch(() => scheduleResumeRetry(ctx));
  } else if (ctx.state === 'running') {
    flushPendingAudio();
  }
}

interface BeepOptions {
  frequency: number;
  duration: number;
  volume: number;
}

function playBeep({ frequency, duration, volume }: BeepOptions): void {
  ensureContextResumed(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio errors
    }
  });
}

function vibrate(pattern: number | number[]): void {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
}

export function playCompletionSound(): void {
  playBeep({ frequency: 800, duration: 0.15, volume: 0.5 });
  vibrate([200, 100, 200]);
}

export function playCountdownBeep(): void {
  playBeep({ frequency: 1000, duration: 0.1, volume: 0.3 });
  vibrate(100);
}
