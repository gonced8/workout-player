import type { PlayerState, FlatStep, Workout, Step } from './types';
import { formatTime, formatDuration, flattenSteps, estimateDuration } from './workout';
import { playCountdownBeep, playCompletionSound, initSound } from './sound';

interface PlayerCallbacks {
  onPause: () => void;
  onResume: () => void;
  onNext: () => void;
  onComplete: () => void;
  onEnd: () => void;
}

export class WorkoutUI {
  private appElement: HTMLElement;
  private currentView: 'landing' | 'preview' | 'countdown' | 'player' = 'landing';
  private callbacks: PlayerCallbacks | null = null;
  private lastStepIndex = -1;
  private lastPauseState = false;

  constructor(appElement: HTMLElement) {
    this.appElement = appElement;
  }

  public showLanding(
    onPreview: (json: string) => void,
    onLoadSample: () => void,
    initialJson?: string
  ): void {
    this.currentView = 'landing';
    this.appElement.innerHTML = `
      <div class="landing">
        <h1>Workout Player</h1>
        <p>Paste your workout JSON or load a sample to get started.</p>
        
        <div class="input-section">
          <label for="workout-json">Workout JSON:</label>
          <textarea 
            id="workout-json" 
            placeholder="Paste workout JSON here..."
            rows="10"
          ></textarea>
          <div id="duration-estimate"></div>
          <div id="error-message" class="error"></div>
        </div>

        <div class="button-group">
          <button id="load-sample-btn" class="secondary">Load Sample</button>
          <button id="start-btn" class="primary">Validate & Preview</button>
        </div>
      </div>
    `;

    const textarea = document.getElementById('workout-json') as HTMLTextAreaElement;
    const errorEl = document.getElementById('error-message') as HTMLDivElement;
    const durationEl = document.getElementById('duration-estimate') as HTMLDivElement;

    if (initialJson) {
      textarea.value = initialJson;
      textarea.dispatchEvent(new Event('input'));
    }

    textarea.addEventListener('input', () => {
      try {
        const json = textarea.value.trim();
        if (json) {
          const workout = JSON.parse(json);
          const flat = flattenSteps(workout);
          durationEl.textContent = `Estimated duration: ${formatDuration(estimateDuration(flat))}`;
          durationEl.className = 'duration-estimate';
          errorEl.textContent = '';
        } else {
          durationEl.textContent = '';
        }
      } catch {
        durationEl.textContent = '';
      }
    });

    document.getElementById('start-btn')?.addEventListener('click', () => {
      const json = textarea.value.trim();
      if (!json) {
        errorEl.textContent = 'Please enter workout JSON';
        return;
      }
      try {
        onPreview(json);
      } catch (error) {
        errorEl.textContent = error instanceof Error ? error.message : 'Invalid workout';
      }
    });

    document.getElementById('load-sample-btn')?.addEventListener('click', onLoadSample);
  }

  public showPreview(
    workout: Workout,
    flatSteps: FlatStep[],
    onBack: () => void,
    onStart: () => void
  ): void {
    this.currentView = 'preview';
    const duration = estimateDuration(flatSteps);

    this.appElement.innerHTML = `
      <div class="preview">
        <h1 class="preview-title">${workout.title}</h1>
        ${workout.description ? `<p class="preview-description">${workout.description}</p>` : ''}
        ${workout.equipment?.length ? `<p class="preview-equipment">Equipment: ${workout.equipment.join(', ')}</p>` : ''}
        <p class="preview-duration">Estimated duration: ${formatDuration(duration)} · ${flatSteps.length} steps</p>
        <ul class="preview-steps">
          ${this.renderPreviewStepsTree(workout.steps)}
        </ul>
        <div class="preview-actions">
          <button id="preview-back-btn" class="secondary large">Back to edit</button>
          <button id="preview-start-btn" class="primary large">Start workout</button>
        </div>
      </div>
    `;

    document.getElementById('preview-back-btn')?.addEventListener('click', onBack);
    document.getElementById('preview-start-btn')?.addEventListener('click', onStart);
  }

  private renderPreviewStepsTree(steps: Step[]): string {
    return steps.map((step) => {
      if (step.type === 'timer') {
        return `
          <li class="preview-step preview-step-timer">
            <span class="preview-step-name">${step.name}</span>
            <span class="preview-step-meta">${formatDuration(step.durationSeconds)}</span>
          </li>`;
      }
      if (step.type === 'reps') {
        return `
          <li class="preview-step preview-step-reps">
            <span class="preview-step-name">${step.name}</span>
            <span class="preview-step-meta">× ${step.reps} reps</span>
          </li>`;
      }
      // Group
      const roundsLabel = step.rounds === 1 ? '1 round' : `${step.rounds} rounds`;
      return `
        <li class="preview-step preview-step-group">
          <div class="preview-group-header">
            <span class="preview-group-name">${step.name}</span>
            <span class="preview-group-rounds">× ${roundsLabel}</span>
          </div>
          <ul class="preview-group-steps">
            ${this.renderPreviewStepsTree(step.steps)}
          </ul>
        </li>`;
    }).join('');
  }

  public showCountdown(onFinish: () => void, firstStep?: FlatStep | null): void {
    this.currentView = 'countdown';
    initSound();

    const nextPreviewHtml = firstStep
      ? `<div class="next-preview countdown-next-preview">${this.renderNextPreview(firstStep)}</div>`
      : '';

    this.appElement.innerHTML = `
      <div class="countdown">
        <div class="countdown-number" id="countdown-number">3</div>
        <p class="countdown-label">Get ready</p>
        ${nextPreviewHtml}
      </div>
    `;

    let remaining = 3;
    const numberEl = document.getElementById('countdown-number');
    const labelEl = this.appElement.querySelector('.countdown-label') as HTMLElement;

    const tick = (): void => {
      if (remaining > 0) {
        if (numberEl) numberEl.textContent = String(remaining);
        playCountdownBeep();
        remaining--;
        setTimeout(tick, 1000);
      } else {
        if (numberEl) numberEl.textContent = 'Go!';
        if (labelEl) labelEl.textContent = '';
        playCompletionSound();
        setTimeout(onFinish, 400);
      }
    };

    tick();
  }

  public showPlayer(
    state: PlayerState,
    onPause: () => void,
    onResume: () => void,
    onNext: () => void,
    onComplete: () => void,
    onEnd: () => void
  ): void {
    this.callbacks = { onPause, onResume, onNext, onComplete, onEnd };

    if (this.currentView !== 'player') {
      this.currentView = 'player';
      this.lastStepIndex = -1;
      this.lastPauseState = false;
      this.renderPlayer(state);
    } else {
      this.updatePlayer(state);
    }
  }

  private renderPlayer(state: PlayerState): void {
    this.appElement.innerHTML = `
      <div class="player">
        <div class="player-header">
          <h2 id="workout-title"></h2>
          <button id="end-btn" class="secondary">End Workout</button>
        </div>

        <div class="progress-bar">
          <div id="progress-fill" class="progress-fill"></div>
        </div>
        <div id="progress-text" class="progress-text"></div>

        <div id="step-content" class="step-content"></div>

        <div id="next-preview" class="next-preview"></div>

        <div id="controls" class="controls"></div>
      </div>
    `;

    document.getElementById('end-btn')?.addEventListener('click', () => this.callbacks?.onEnd());
    this.updatePlayer(state);
  }

  private updatePlayer(state: PlayerState): void {
    const { workout, flatSteps, currentStepIndex, isPaused, remainingSeconds } = state;
    if (!workout) return;

    const stepChanged = currentStepIndex !== this.lastStepIndex;
    const pauseChanged = isPaused !== this.lastPauseState;

    this.lastStepIndex = currentStepIndex;
    this.lastPauseState = isPaused;

    if (stepChanged || pauseChanged) {
      this.fullUpdate(state);
    } else {
      // Quick update: just the timer display
      const currentStep = flatSteps[currentStepIndex];
      if (currentStep?.type === 'timer' && remainingSeconds !== null) {
        const timerEl = document.querySelector('.timer');
        if (timerEl) timerEl.textContent = formatTime(remainingSeconds);
      }
    }
  }

  private fullUpdate(state: PlayerState): void {
    const { workout, flatSteps, currentStepIndex, isPaused, remainingSeconds } = state;
    if (!workout) return;

    const currentStep = flatSteps[currentStepIndex];
    const nextStep = flatSteps[currentStepIndex + 1];

    // Title
    const titleEl = document.getElementById('workout-title');
    if (titleEl) titleEl.textContent = workout.title;

    // Progress
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    if (progressFill && progressText) {
      const progress = flatSteps.length > 0 ? (currentStepIndex / flatSteps.length) * 100 : 0;
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `Step ${Math.min(currentStepIndex + 1, flatSteps.length)} of ${flatSteps.length}`;
    }

    // Step content
    const stepContent = document.getElementById('step-content');
    if (stepContent) {
      stepContent.innerHTML = currentStep
        ? this.renderStep(currentStep, remainingSeconds)
        : '<div class="complete"><h2>Workout Complete!</h2><p>Great job!</p></div>';
    }

    // Next preview (visible during countdowns and reps steps)
    const nextPreview = document.getElementById('next-preview');
    if (nextPreview) {
      if (nextStep) {
        nextPreview.innerHTML = this.renderNextPreview(nextStep);
      } else {
        nextPreview.innerHTML = '<p class="next-preview-last">Last step!</p>';
      }
    }

    // Controls
    const controls = document.getElementById('controls');
    if (controls && currentStep) {
      controls.innerHTML = this.renderControls(currentStep, isPaused);
      this.attachControlListeners(currentStep, isPaused);
    }
  }

  private renderNextPreview(step: FlatStep): string {
    const meta = step.type === 'timer'
      ? formatDuration(step.durationSeconds)
      : `× ${step.reps} reps`;
    let html = `
      <p class="next-preview-label">Up next</p>
      <p class="next-preview-name">${step.name}</p>
      <p class="next-preview-meta">${meta}</p>`;
    if (step.notes) {
      html += `<p class="next-preview-notes">${step.notes}</p>`;
    }
    return html;
  }

  private renderStep(step: FlatStep, remainingSeconds: number | null): string {
    const parts: string[] = ['<div class="step">'];

    if (step.roundContext) {
      const { groupName, currentRound, totalRounds } = step.roundContext;
      parts.push(`<div class="round-context">${groupName} — Round ${currentRound} of ${totalRounds}</div>`);
    }

    parts.push(`<h2 class="step-name">${step.name}</h2>`);

    if (step.type === 'timer') {
      const time = remainingSeconds ?? step.durationSeconds;
      parts.push(`<div class="timer">${formatTime(time)}</div>`);
    } else {
      parts.push(`<div class="reps">× ${step.reps} reps</div>`);
    }

    if (step.notes) {
      parts.push(`<p class="notes">${step.notes}</p>`);
    }

    parts.push('</div>');
    return parts.join('');
  }

  private renderControls(step: FlatStep, isPaused: boolean): string {
    if (step.type === 'timer') {
      const mainBtn = isPaused
        ? '<button id="resume-btn" class="primary large">Resume</button>'
        : '<button id="pause-btn" class="primary large">Pause</button>';
      return `${mainBtn}<button id="next-btn" class="secondary">Skip</button>`;
    }
    return '<button id="complete-btn" class="primary large">Done</button>';
  }

  private attachControlListeners(step: FlatStep, isPaused: boolean): void {
    if (!this.callbacks) return;

    if (step.type === 'timer') {
      if (isPaused) {
        document.getElementById('resume-btn')?.addEventListener('click', this.callbacks.onResume);
      } else {
        document.getElementById('pause-btn')?.addEventListener('click', this.callbacks.onPause);
      }
      document.getElementById('next-btn')?.addEventListener('click', this.callbacks.onNext);
    } else {
      document.getElementById('complete-btn')?.addEventListener('click', this.callbacks.onComplete);
    }
  }

  public showError(message: string): void {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.className = 'error visible';
    }
  }

  public loadSampleIntoTextarea(json: string): void {
    const textarea = document.getElementById('workout-json') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = json;
      textarea.dispatchEvent(new Event('input'));
    }
  }
}
