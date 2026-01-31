import type { Workout, Step, FlatStep, GroupStep, RoundContext } from './types';

export function parseWorkout(json: string): Workout {
  try {
    const workout = JSON.parse(json);
    validateWorkout(workout);
    return workout;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
    throw error;
  }
}

export function validateWorkout(workout: unknown): asserts workout is Workout {
  if (!workout || typeof workout !== 'object') {
    throw new Error('Workout must be an object');
  }

  const w = workout as Record<string, unknown>;

  if (typeof w.version !== 'number' || w.version !== 1) {
    throw new Error('Workout version must be 1');
  }

  if (typeof w.title !== 'string' || !w.title) {
    throw new Error('Workout must have a title');
  }

  if (!Array.isArray(w.steps) || w.steps.length === 0) {
    throw new Error('Workout must have at least one step');
  }

  // Validate each step
  for (let i = 0; i < w.steps.length; i++) {
    validateStep(w.steps[i], `steps[${i}]`);
  }
}

function validateStep(step: unknown, path: string): void {
  if (!step || typeof step !== 'object') {
    throw new Error(`${path}: Step must be an object`);
  }

  const s = step as Record<string, unknown>;

  if (typeof s.id !== 'string' || !s.id) {
    throw new Error(`${path}: Step must have an id`);
  }

  if (typeof s.type !== 'string') {
    throw new Error(`${path}: Step must have a type`);
  }

  if (typeof s.name !== 'string' || !s.name) {
    throw new Error(`${path}: Step must have a name`);
  }

  switch (s.type) {
    case 'timer':
      if (typeof s.durationSeconds !== 'number' || s.durationSeconds <= 0) {
        throw new Error(`${path}: Timer step must have positive durationSeconds`);
      }
      break;
    case 'reps':
      if (typeof s.reps !== 'number' || s.reps <= 0) {
        throw new Error(`${path}: Reps step must have positive reps`);
      }
      if (s.estimatedDurationSeconds !== undefined) {
        if (typeof s.estimatedDurationSeconds !== 'number' || s.estimatedDurationSeconds <= 0) {
          throw new Error(`${path}: Reps step estimatedDurationSeconds must be a positive number`);
        }
      }
      break;
    case 'group':
      if (typeof s.rounds !== 'number' || s.rounds < 1) {
        throw new Error(`${path}: Group step must have rounds >= 1`);
      }
      if (!Array.isArray(s.steps) || s.steps.length === 0) {
        throw new Error(`${path}: Group step must have at least one nested step`);
      }
      for (let i = 0; i < s.steps.length; i++) {
        validateStep(s.steps[i], `${path}.steps[${i}]`);
      }
      break;
    default:
      throw new Error(`${path}: Unknown step type "${s.type}"`);
  }
}

export function flattenSteps(workout: Workout): FlatStep[] {
  const result: FlatStep[] = [];

  for (const step of workout.steps) {
    flattenStep(step, result, undefined);
  }

  // Apply workout-level skipLastRest
  if (workout.skipLastRest && result.length > 0) {
    const lastStep = result[result.length - 1];
    if (lastStep && isRest(lastStep)) {
      result.pop();
    }
  }

  return result;
}

function flattenStep(step: Step, result: FlatStep[], roundContext?: RoundContext): void {
  if (step.type === 'group') {
    flattenGroup(step, result);
  } else {
    // Timer or reps step - add directly
    const flatStep: FlatStep = {
      ...step,
      roundContext
    };
    result.push(flatStep);
  }
}

function flattenGroup(group: GroupStep, result: FlatStep[]): void {
  const roundContext: RoundContext = {
    groupName: group.name,
    currentRound: 1,
    totalRounds: group.rounds
  };

  for (let round = 1; round <= group.rounds; round++) {
    roundContext.currentRound = round;
    const roundStartIndex = result.length;

    // Flatten all nested steps for this round
    for (const step of group.steps) {
      flattenStep(step, result, { ...roundContext });
    }

    // Skip last rest only after the final round of the group
    if (group.skipLastRest && round === group.rounds && result.length > roundStartIndex) {
      const lastStepInRound = result[result.length - 1];
      if (lastStepInRound && isRest(lastStepInRound)) {
        result.pop();
      }
    }
  }
}

function isRest(step: FlatStep): boolean {
  if (step.type !== 'timer') {
    return false;
  }
  // A step is rest if it has rest: true or name is "Rest" (case-insensitive)
  return step.rest === true || step.name.toLowerCase() === 'rest';
}

export function estimateDuration(flatSteps: FlatStep[]): number {
  let totalSeconds = 0;
  for (const step of flatSteps) {
    if (step.type === 'timer') {
      totalSeconds += step.durationSeconds;
    } else {
      // Use optional estimated duration, otherwise ~5 seconds per rep
      totalSeconds += step.estimatedDurationSeconds ?? step.reps * 5;
    }
  }
  return totalSeconds;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes === 0) {
    return `${secs}s`;
  }
  if (secs === 0) {
    return `${minutes}m`;
  }
  return `${minutes}m ${secs}s`;
}

export function formatTime(seconds: number): string {
  // Use Math.ceil so that 29.9 seconds displays as "30"
  // This prevents the "fast first second" feeling
  const totalSeconds = Math.ceil(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
