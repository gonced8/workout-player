// Workout playback format
export interface Workout {
  version: number;
  title: string;
  description?: string;
  equipment?: string[];
  skipLastRest?: boolean;
  steps: Step[];
}

export type Step = TimerStep | RepsStep | GroupStep;

export interface BaseStep {
  id: string;
  name: string;
  notes?: string;
}

export interface TimerStep extends BaseStep {
  type: 'timer';
  durationSeconds: number;
  rest?: boolean;
}

export interface RepsStep extends BaseStep {
  type: 'reps';
  reps: number;
  /** Optional estimated duration in seconds for total workout time estimation */
  estimatedDurationSeconds?: number;
}

export interface GroupStep extends BaseStep {
  type: 'group';
  rounds: number;
  skipLastRest?: boolean;
  steps: Step[];
}

// Flattened step for playback (after group expansion)
export type FlatStep = FlatTimerStep | FlatRepsStep;

export interface FlatTimerStep extends BaseStep {
  type: 'timer';
  durationSeconds: number;
  rest?: boolean;
  roundContext?: RoundContext;
}

export interface FlatRepsStep extends BaseStep {
  type: 'reps';
  reps: number;
  estimatedDurationSeconds?: number;
  roundContext?: RoundContext;
}

export interface RoundContext {
  groupName: string;
  currentRound: number;
  totalRounds: number;
}

// Player state
export interface PlayerState {
  workout: Workout | null;
  flatSteps: FlatStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  stepStartedAt: number | null;
  timerDuration: number | null;
  remainingSeconds: number | null;
}
