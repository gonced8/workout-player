import type { Workout, FlatStep, PlayerState } from './types';
import { flattenSteps } from './workout';
import { playCompletionSound, playCountdownBeep, initSound, resumeAudioContext } from './sound';
import {
  requestWakeLock,
  releaseWakeLock,
  setWorkoutActive,
  setupVisibilityHandler,
} from './wakeLock';

export class WorkoutPlayer {
  private state: PlayerState;
  private timerIntervalId: number | null = null;
  private onStateChange: ((state: PlayerState) => void) | null = null;

  constructor() {
    this.state = this.createInitialState();
    setupVisibilityHandler();
    this.setupVisibilityListener();
  }

  private createInitialState(): PlayerState {
    return {
      workout: null,
      flatSteps: [],
      currentStepIndex: 0,
      isPlaying: false,
      isPaused: false,
      stepStartedAt: null,
      timerDuration: null,
      remainingSeconds: null,
    };
  }

  private resetTimerState(): void {
    this.state.stepStartedAt = null;
    this.state.timerDuration = null;
    this.state.remainingSeconds = null;
  }

  private clearTimer(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  public loadWorkout(workout: Workout): void {
    this.stop();
    this.state = {
      ...this.createInitialState(),
      workout,
      flatSteps: flattenSteps(workout),
    };
    this.notifyStateChange();
  }

  public async start(): Promise<void> {
    if (!this.state.workout || this.state.flatSteps.length === 0) {
      throw new Error('No workout loaded');
    }

    initSound();
    this.state.isPlaying = true;
    this.state.isPaused = false;
    setWorkoutActive(true);
    await requestWakeLock();
    this.startCurrentStep();
    this.notifyStateChange();
  }

  public pause(): void {
    if (!this.state.isPlaying || this.state.isPaused) return;

    this.state.isPaused = true;
    this.clearTimer();

    const currentStep = this.getCurrentStep();
    if (
      currentStep?.type === 'timer' &&
      this.state.stepStartedAt !== null &&
      this.state.timerDuration !== null
    ) {
      const elapsed = (Date.now() - this.state.stepStartedAt) / 1000;
      this.state.remainingSeconds = Math.max(0, this.state.timerDuration - elapsed);
      this.state.timerDuration = this.state.remainingSeconds;
    }

    this.notifyStateChange();
  }

  public resume(): void {
    if (!this.state.isPlaying || !this.state.isPaused) return;

    this.state.isPaused = false;
    this.startCurrentStep();
    this.notifyStateChange();
  }

  public next(): void {
    if (!this.state.isPlaying) return;

    this.clearTimer();

    if (this.getCurrentStep()?.type === 'timer') {
      playCompletionSound();
    }

    this.advanceToNextStep();
  }

  public stop(): void {
    this.clearTimer();
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.resetTimerState();
    setWorkoutActive(false);
    releaseWakeLock();
    this.notifyStateChange();
  }

  public completeRepsStep(): void {
    const currentStep = this.getCurrentStep();
    if (currentStep?.type === 'reps' && this.state.isPlaying) {
      playCompletionSound();
      this.advanceToNextStep();
    }
  }

  public getState(): PlayerState {
    return { ...this.state };
  }

  public getCurrentStep(): FlatStep | null {
    return this.state.flatSteps[this.state.currentStepIndex] ?? null;
  }

  public onUpdate(callback: (state: PlayerState) => void): void {
    this.onStateChange = callback;
  }

  private startCurrentStep(): void {
    const currentStep = this.getCurrentStep();
    if (!currentStep) {
      this.completeWorkout();
      return;
    }

    if (currentStep.type === 'timer') {
      this.startTimer(currentStep);
    } else {
      this.resetTimerState();
      this.notifyStateChange();
    }
  }

  private startTimer(step: { durationSeconds: number }): void {
    const duration = this.state.timerDuration ?? step.durationSeconds;

    this.state.stepStartedAt = Date.now();
    this.state.timerDuration = duration;
    this.state.remainingSeconds = duration;

    this.timerIntervalId = window.setInterval(() => this.updateTimer(), 100);
    this.notifyStateChange();
  }

  private updateTimer(): void {
    const prevRemaining = this.state.remainingSeconds;
    const remaining = this.computeRemaining();
    this.state.remainingSeconds = remaining;

    // Play countdown beeps at 3, 2, 1 seconds (once per second)
    const prevSeconds = prevRemaining ? Math.ceil(prevRemaining) : 0;
    const currentSeconds = Math.ceil(remaining);

    if (prevSeconds !== currentSeconds && currentSeconds >= 1 && currentSeconds <= 3) {
      playCountdownBeep();
    }

    if (remaining <= 0) {
      this.onTimerComplete();
    } else {
      this.notifyStateChange();
    }
  }

  private computeRemaining(): number {
    if (this.state.stepStartedAt === null || this.state.timerDuration === null) {
      return 0;
    }
    const elapsed = (Date.now() - this.state.stepStartedAt) / 1000;
    return Math.max(0, this.state.timerDuration - elapsed);
  }

  private onTimerComplete(): void {
    this.clearTimer();
    this.state.remainingSeconds = 0;
    playCompletionSound();
    this.advanceToNextStep();
  }

  private advanceToNextStep(): void {
    this.state.currentStepIndex++;
    this.state.isPaused = false;

    if (this.state.currentStepIndex >= this.state.flatSteps.length) {
      this.completeWorkout();
    } else {
      this.resetTimerState();
      this.startCurrentStep();
    }
  }

  private completeWorkout(): void {
    this.stop();
    this.notifyStateChange();
  }

  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.state.isPlaying && !this.state.isPaused) {
        resumeAudioContext();
        const currentStep = this.getCurrentStep();
        if (currentStep?.type === 'timer') {
          const remaining = this.computeRemaining();
          if (remaining <= 0) {
            this.onTimerComplete();
          } else {
            this.notifyStateChange();
          }
        }
      }
    });
  }

  private notifyStateChange(): void {
    this.onStateChange?.(this.getState());
  }
}
