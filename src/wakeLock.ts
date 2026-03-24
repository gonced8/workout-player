let wakeLock: WakeLockSentinel | null = null;
let isWorkoutActive = false;

export async function requestWakeLock(): Promise<boolean> {
  if (!('wakeLock' in navigator)) {
    return false;
  }

  try {
    const sentinel = await navigator.wakeLock.request('screen');
    wakeLock = sentinel;
    sentinel.addEventListener('release', () => {
      if (wakeLock === sentinel) {
        wakeLock = null;
      }
    });
    return true;
  } catch {
    return false;
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLock) {
    try {
      await wakeLock.release();
    } catch {
      // Ignore release errors
    }
    wakeLock = null;
  }
  isWorkoutActive = false;
}

export function setWorkoutActive(active: boolean): void {
  isWorkoutActive = active;
}

export function setupVisibilityHandler(): void {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && isWorkoutActive && !wakeLock) {
      await requestWakeLock();
    }
  });
}
