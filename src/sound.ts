// Sound and haptic feedback for workout player
// Uses Web Audio API for sounds and Vibration API for haptics

let audioContext: AudioContext | null = null;

// Unlock audio on iOS by playing through both Web Audio and HTML5 Audio
let audioUnlocked = false;
let silentAudio: HTMLAudioElement | null = null;

// Base64 encoded tiny silent MP3 (for iOS audio session unlock)
const SILENT_MP3 =
  'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+1DEAAAGAAGn9AAAIwAANP8AAARM2AXACAAAgAoADDDAiAaFBkUFEBRZ+CAYQ5EfygIIDCAwYMGDBgwYMGDBgwYMB8Hz/g+D4Ph+H8Hz/B8/wfB8Hw/D+D5/g+D4Ph+H8AAAAAAAAAAAAAAAAAAAAAD/+1DEKQPAAAGkAAAAIAAANIAAAAQAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export function initSound(): void {
  if (!audioContext && 'AudioContext' in window) {
    audioContext = new AudioContext();
  }

  // Create silent audio element for iOS
  if (!silentAudio) {
    silentAudio = new Audio(SILENT_MP3);
    silentAudio.volume = 0.01;
  }

  // Unlock audio on user interaction
  if (!audioUnlocked) {
    unlockAudio();
  }
}

async function unlockAudio(): Promise<void> {
  if (audioUnlocked) return;

  try {
    // Resume AudioContext
    if (audioContext?.state === 'suspended') {
      await audioContext.resume();
    }

    // Play silent audio to unlock iOS audio session
    if (silentAudio) {
      silentAudio.muted = false;
      await silentAudio.play().catch(() => {});
      silentAudio.pause();
      silentAudio.currentTime = 0;
    }

    audioUnlocked = true;
  } catch {
    // Ignore errors, audio may still work
  }
}

interface BeepOptions {
  frequency: number;
  duration: number;
  volume: number;
}

function playBeep({ frequency, duration, volume }: BeepOptions): void {
  if (!audioContext) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    // Ignore audio errors
  }
}

function ensureContextAndPlay(options: BeepOptions): void {
  if (!audioContext) initSound();
  if (!audioContext) return;

  if (audioContext.state === 'suspended') {
    audioContext
      .resume()
      .then(() => playBeep(options))
      .catch(() => {});
  } else {
    playBeep(options);
  }
}

// Vibration patterns (in milliseconds)
// Works on Android, Chrome OS, etc. iOS Safari doesn't support Vibration API but won't error.
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
  ensureContextAndPlay({ frequency: 800, duration: 0.15, volume: 0.5 });
  // Double vibration for completion: vibrate 200ms, pause 100ms, vibrate 200ms
  vibrate([200, 100, 200]);
}

export function playCountdownBeep(): void {
  ensureContextAndPlay({ frequency: 1000, duration: 0.1, volume: 0.3 });
  // Short vibration for countdown
  vibrate(100);
}
