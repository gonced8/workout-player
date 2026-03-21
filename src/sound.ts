// Sound and haptic feedback for workout player
// Uses Web Audio API for sounds (note: muted in iOS silent mode)

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioContext && 'AudioContext' in window) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Call during user interaction to unlock audio on iOS
export function initSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}

interface BeepOptions {
  frequency: number;
  duration: number;
  volume: number;
}

function playBeep({ frequency, duration, volume }: BeepOptions): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

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
