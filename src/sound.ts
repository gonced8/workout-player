// Web Audio API beep sound (no external assets required)
let audioContext: AudioContext | null = null;

export function initSound(): void {
  if (!audioContext && 'AudioContext' in window) {
    audioContext = new AudioContext();
  }
}

export function playCompletionSound(): void {
  if (!audioContext) {
    initSound();
  }

  if (!audioContext) {
    console.warn('AudioContext not available');
    return;
  }

  try {
    // Create a short beep at 800Hz
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    // Short beep with fade out
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (error) {
    console.error('Failed to play completion sound:', error);
  }
}

export function playCountdownBeep(): void {
  if (!audioContext) {
    initSound();
  }

  if (!audioContext) {
    return;
  }

  try {
    // Shorter, higher pitch beep for countdown
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.error('Failed to play countdown beep:', error);
  }
}
