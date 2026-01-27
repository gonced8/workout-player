// Workout request format (for AI input)
export interface WorkoutRequest {
  durationMinutes: number;
  focus: string;
  equipment: string[];
  intensity?: 'light' | 'moderate' | 'heavy';
  goals?: string[];
}

// Workout playback format (what the app consumes)
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
  rest?: boolean; // If true, treated as rest for skipLastRest logic
}

export interface RepsStep extends BaseStep {
  type: 'reps';
  reps: number;
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
  stepStartedAt: number | null; // timestamp for wall-clock timer
  timerDuration: number | null; // original duration we're counting down from
  remainingSeconds: number | null; // current remaining time for display
}
