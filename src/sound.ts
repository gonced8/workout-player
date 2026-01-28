// Web Audio API beep sounds (no external assets required)
let audioContext: AudioContext | null = null;

export function initSound(): void {
  if (!audioContext && 'AudioContext' in window) {
    audioContext = new AudioContext();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }
}

interface BeepOptions {
  frequency: number;
  duration: number;
  volume: number;
}

function playBeep({ frequency, duration, volume }: BeepOptions): void {
  if (!audioContext) return;

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
}

function ensureContextAndPlay(options: BeepOptions): void {
  if (!audioContext) initSound();
  if (!audioContext) return;

  if (audioContext.state === 'suspended') {
    audioContext.resume().then(() => playBeep(options));
  } else {
    playBeep(options);
  }
}

export function playCompletionSound(): void {
  ensureContextAndPlay({ frequency: 800, duration: 0.15, volume: 0.3 });
}

export function playCountdownBeep(): void {
  ensureContextAndPlay({ frequency: 1000, duration: 0.1, volume: 0.2 });
}
