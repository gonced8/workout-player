let wakeLock: WakeLockSentinel | null = null;
let isWorkoutActive = false;
let hasInstalledVisibilityHandler = false;

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

async function restoreWakeLockIfNeeded(): Promise<void> {
  if (document.visibilityState === 'visible' && isWorkoutActive && !wakeLock) {
    await requestWakeLock();
  }
}

export function setupVisibilityHandler(): void {
  if (hasInstalledVisibilityHandler) return;
  hasInstalledVisibilityHandler = true;

  const restore = (): void => {
    void restoreWakeLockIfNeeded();
  };

  document.addEventListener('visibilitychange', restore);
  window.addEventListener('pageshow', restore);
  window.addEventListener('focus', restore);
}
