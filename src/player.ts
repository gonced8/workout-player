import type { Workout, FlatStep, PlayerState } from './types';
import { flattenSteps } from './workout';
import { playCompletionSound, playCountdownBeep, initSound } from './sound';
import { requestWakeLock, releaseWakeLock, setWorkoutActive, setupVisibilityHandler } from './wakeLock';

export class WorkoutPlayer {
  private state: PlayerState;
  private timerIntervalId: number | null = null;
  private onStateChange: ((state: PlayerState) => void) | null = null;

  constructor() {
    this.state = {
      workout: null,
      flatSteps: [],
      currentStepIndex: 0,
      isPlaying: false,
      isPaused: false,
      stepStartedAt: null,
      timerDuration: null,
      remainingSeconds: null
    };

    setupVisibilityHandler();
    this.setupVisibilityListener();
  }

  public loadWorkout(workout: Workout): void {
    this.stop();
    this.state.workout = workout;
    this.state.flatSteps = flattenSteps(workout);
    this.state.currentStepIndex = 0;
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.stepStartedAt = null;
    this.state.timerDuration = null;
    this.state.remainingSeconds = null;
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
    if (!this.state.isPlaying || this.state.isPaused) {
      return;
    }

    this.state.isPaused = true;
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    // Compute and store remaining time at pause
    const currentStep = this.getCurrentStep();
    if (currentStep?.type === 'timer' && this.state.stepStartedAt !== null && this.state.timerDuration !== null) {
      const elapsed = (Date.now() - this.state.stepStartedAt) / 1000;
      this.state.remainingSeconds = Math.max(0, this.state.timerDuration - elapsed);
      this.state.timerDuration = this.state.remainingSeconds; // Update duration for resume
    }

    this.notifyStateChange();
  }

  public resume(): void {
    if (!this.state.isPlaying || !this.state.isPaused) {
      return;
    }

    this.state.isPaused = false;
    this.startCurrentStep();
    this.notifyStateChange();
  }

  public next(): void {
    if (!this.state.isPlaying) {
      return;
    }

    // Clear any running timer
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    // Play completion sound if we're skipping a timer step
    const currentStep = this.getCurrentStep();
    if (currentStep?.type === 'timer') {
      playCompletionSound();
    }

    this.advanceToNextStep();
  }

  public stop(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.stepStartedAt = null;
    this.state.timerDuration = null;
    this.state.remainingSeconds = null;
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

  public getNextStep(): FlatStep | null {
    return this.state.flatSteps[this.state.currentStepIndex + 1] ?? null;
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
      // Reps step - just wait for user to complete
      this.state.stepStartedAt = null;
      this.state.timerDuration = null;
      this.state.remainingSeconds = null;
      this.notifyStateChange();
    }
  }

  private startTimer(step: { durationSeconds: number }): void {
    // Determine what duration to count down from
    const duration = this.state.timerDuration ?? step.durationSeconds;
    
    // Store when this timer started and what duration we're counting from
    this.state.stepStartedAt = Date.now();
    this.state.timerDuration = duration;
    this.state.remainingSeconds = duration;

    // Update UI every 100ms for smooth countdown
    this.timerIntervalId = window.setInterval(() => {
      this.updateTimer();
    }, 100);

    this.notifyStateChange();
  }

  private updateTimer(): void {
    const prevRemaining = this.state.remainingSeconds;
    const remaining = this.computeRemaining();
    this.state.remainingSeconds = remaining;

    // Play countdown beeps at 3, 2, 1 seconds (only once per second)
    const prevSeconds = prevRemaining ? Math.ceil(prevRemaining) : 0;
    const currentSeconds = Math.ceil(remaining);
    
    if (prevSeconds !== currentSeconds && (currentSeconds === 3 || currentSeconds === 2 || currentSeconds === 1)) {
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

    // Calculate elapsed time since this timer started
    const elapsed = (Date.now() - this.state.stepStartedAt) / 1000;
    // Subtract from the original duration
    return Math.max(0, this.state.timerDuration - elapsed);
  }

  private onTimerComplete(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    this.state.remainingSeconds = 0;
    playCompletionSound();
    
    // Immediate advance (no delay)
    this.advanceToNextStep();
  }

  private advanceToNextStep(): void {
    this.state.currentStepIndex++;
    
    // Clear pause state when moving to new step
    this.state.isPaused = false;

    if (this.state.currentStepIndex >= this.state.flatSteps.length) {
      this.completeWorkout();
    } else {
      this.state.stepStartedAt = null;
      this.state.timerDuration = null;
      this.state.remainingSeconds = null;
      this.startCurrentStep();
    }
  }

  private completeWorkout(): void {
    console.log('Workout complete!');
    this.stop();
    this.notifyStateChange();
  }

  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.state.isPlaying && !this.state.isPaused) {
        // Recompute remaining time when page becomes visible
        const currentStep = this.getCurrentStep();
        if (currentStep?.type === 'timer') {
          const remaining = this.computeRemaining();
          if (remaining <= 0) {
            // Time's up while we were away - complete immediately
            this.onTimerComplete();
          } else {
            this.notifyStateChange();
          }
        }
      }
    });
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }
}
