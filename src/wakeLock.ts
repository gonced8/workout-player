let wakeLock: WakeLockSentinel | null = null;
let isWorkoutActive = false;

export async function requestWakeLock(): Promise<boolean> {
  if (!('wakeLock' in navigator)) {
    console.warn('Screen Wake Lock API not supported');
    return false;
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('Screen Wake Lock acquired');

    wakeLock.addEventListener('release', () => {
      console.log('Screen Wake Lock released');
    });

    return true;
  } catch (error) {
    console.error('Failed to request wake lock:', error);
    return false;
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLock) {
    try {
      await wakeLock.release();
      wakeLock = null;
    } catch (error) {
      console.error('Failed to release wake lock:', error);
    }
  }
  isWorkoutActive = false;
}

export function setWorkoutActive(active: boolean): void {
  isWorkoutActive = active;
}

export function isWakeLockSupported(): boolean {
  return 'wakeLock' in navigator;
}

// Re-request wake lock when page becomes visible again (if workout is active)
export function setupVisibilityHandler(): void {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && isWorkoutActive && !wakeLock) {
      console.log('Page visible again, re-requesting wake lock');
      await requestWakeLock();
    }
  });
}
