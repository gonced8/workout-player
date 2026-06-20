import type { Workout } from './types';

const RECENT_WORKOUTS_KEY = 'workout-player:recent-workouts';
const MAX_RECENT_WORKOUTS = 3;

export interface RecentWorkout {
  id: string;
  title: string;
  lastPlayedAt: string;
  workout: Workout;
}

interface StoredRecentWorkout extends Partial<RecentWorkout> {
  savedAt?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function canonicalStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalStringify).join(',')}]`;
  }

  if (isRecord(value)) {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`);
    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

function createWorkoutId(workout: Workout): string {
  return canonicalStringify(workout);
}

function normalizeRecentWorkout(value: unknown): RecentWorkout | null {
  if (!isRecord(value)) return null;

  const candidate = value as StoredRecentWorkout;
  const lastPlayedAt = candidate.lastPlayedAt ?? candidate.savedAt;
  const workout = candidate.workout;

  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.title !== 'string' ||
    typeof lastPlayedAt !== 'string' ||
    !workout ||
    typeof workout !== 'object'
  ) {
    return null;
  }

  return {
    id: createWorkoutId(workout as Workout),
    title: candidate.title,
    lastPlayedAt,
    workout: workout as Workout,
  };
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
    return parsed
      .flatMap((item) => normalizeRecentWorkout(item) ?? [])
      .slice(0, MAX_RECENT_WORKOUTS);
  } catch {
    return [];
  }
}

export function saveRecentWorkout(workout: Workout): RecentWorkout[] {
  const storage = getStorage();
  if (!storage) return [];

  const id = createWorkoutId(workout);
  const lastPlayedAt = new Date().toISOString();
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
