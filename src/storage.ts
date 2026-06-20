import type { Workout } from './types';

const RECENT_WORKOUTS_KEY = 'workout-player:recent-workouts';
const MAX_RECENT_WORKOUTS = 3;

export interface RecentWorkout {
  id: string;
  title: string;
  /** ISO timestamp for the most recent time this workout was started. */
  lastPlayedAt: string;
  /** @deprecated Use lastPlayedAt. Kept for compatibility with older localStorage entries. */
  savedAt?: string;
  workout: Workout;
}

function isRecentWorkout(value: unknown): value is RecentWorkout {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<RecentWorkout>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    (typeof candidate.lastPlayedAt === 'string' || typeof candidate.savedAt === 'string') &&
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

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, nestedValue]) => [key, sortObjectKeys(nestedValue)])
    );
  }

  return value;
}

function getWorkoutId(workout: Workout): string {
  return JSON.stringify(
    sortObjectKeys({
      title: workout.title,
      description: workout.description,
      equipment: workout.equipment,
      skipLastRest: workout.skipLastRest,
      steps: workout.steps,
    })
  );
}

function normalizeRecentWorkout(entry: RecentWorkout): RecentWorkout {
  return {
    ...entry,
    id: getWorkoutId(entry.workout),
    lastPlayedAt: entry.lastPlayedAt ?? entry.savedAt ?? new Date(0).toISOString(),
  };
}

export function loadRecentWorkouts(): RecentWorkout[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(RECENT_WORKOUTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isRecentWorkout)
      .map(normalizeRecentWorkout)
      .filter(
        (entry, index, recentWorkouts) =>
          recentWorkouts.findIndex((candidate) => candidate.id === entry.id) === index
      )
      .sort(
        (workoutA, workoutB) =>
          new Date(workoutB.lastPlayedAt).getTime() - new Date(workoutA.lastPlayedAt).getTime()
      )
      .slice(0, MAX_RECENT_WORKOUTS);
  } catch {
    return [];
  }
}

export function saveRecentWorkout(workout: Workout): RecentWorkout[] {
  const storage = getStorage();
  if (!storage) return [];

  const lastPlayedAt = new Date().toISOString();
  const id = getWorkoutId(workout);
  const recentWorkout: RecentWorkout = {
    id,
    title: workout.title,
    lastPlayedAt,
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
