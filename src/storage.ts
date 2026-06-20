import type { Workout } from './types';

const RECENT_WORKOUTS_KEY = 'workout-player:recent-workouts';
const MAX_RECENT_WORKOUTS = 3;

export interface RecentWorkout {
  id: string;
  title: string;
  savedAt: string;
  workout: Workout;
}

function isRecentWorkout(value: unknown): value is RecentWorkout {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<RecentWorkout>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.savedAt === 'string' &&
    !!candidate.workout &&
    typeof candidate.workout === 'object'
  );
}

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadRecentWorkouts(): RecentWorkout[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(RECENT_WORKOUTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentWorkout).slice(0, MAX_RECENT_WORKOUTS);
  } catch {
    return [];
  }
}

export function saveRecentWorkout(workout: Workout): RecentWorkout[] {
  const storage = getStorage();
  if (!storage) return [];

  const savedAt = new Date().toISOString();
  const id = `${workout.title}:${JSON.stringify(workout.steps)}`;
  const recentWorkout: RecentWorkout = {
    id,
    title: workout.title,
    savedAt,
    workout,
  };

  const recentWorkouts = [
    recentWorkout,
    ...loadRecentWorkouts().filter((entry) => entry.id !== id),
  ].slice(0, MAX_RECENT_WORKOUTS);

  try {
    storage.setItem(RECENT_WORKOUTS_KEY, JSON.stringify(recentWorkouts));
  } catch {
    return loadRecentWorkouts();
  }

  return recentWorkouts;
}
