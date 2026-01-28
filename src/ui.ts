import type { PlayerState, FlatStep, Workout, Step } from './types';
import { formatTime, formatDuration, flattenSteps, estimateDuration } from './workout';
import { playCountdownBeep, playCompletionSound, initSound } from './sound';

export class WorkoutUI {
  private appElement: HTMLElement;
  private currentView: 'landing' | 'preview' | 'countdown' | 'player' = 'landing';

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
    const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    const sampleBtn = document.getElementById('load-sample-btn') as HTMLButtonElement;
    const errorEl = document.getElementById('error-message') as HTMLDivElement;
    const durationEl = document.getElementById('duration-estimate') as HTMLDivElement;

    if (initialJson !== undefined) {
      textarea.value = initialJson;
      textarea.dispatchEvent(new Event('input'));
    }

    // Update duration estimate as user types
    textarea.addEventListener('input', () => {
      try {
        const json = textarea.value.trim();
        if (json) {
          const workout = JSON.parse(json);
          const flatSteps = flattenSteps(workout);
          const duration = estimateDuration(flatSteps);
          durationEl.textContent = `Estimated duration: ${formatDuration(duration)}`;
          durationEl.className = 'duration-estimate';
          errorEl.textContent = '';
        } else {
          durationEl.textContent = '';
        }
      } catch {
        durationEl.textContent = '';
      }
    });

    startBtn.addEventListener('click', () => {
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

    sampleBtn.addEventListener('click', () => {
      onLoadSample();
    });
  }

  public showPreview(
    workout: Workout,
    flatSteps: FlatStep[],
    onBack: () => void,
    onStart: () => void
  ): void {
    this.currentView = 'preview';
    const duration = estimateDuration(flatSteps);
    const stepsHtml = this.renderPreviewStepsTree(workout.steps);

    this.appElement.innerHTML = `
      <div class="preview">
        <h1 class="preview-title">${workout.title}</h1>
        ${workout.description ? `<p class="preview-description">${workout.description}</p>` : ''}
        ${workout.equipment?.length ? `<p class="preview-equipment">Equipment: ${workout.equipment.join(', ')}</p>` : ''}
        <p class="preview-duration">Estimated duration: ${formatDuration(duration)} · ${flatSteps.length} steps</p>
        <ul class="preview-steps">
          ${stepsHtml}
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
    return steps
      .map((step) => {
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
        // group
        const roundsLabel = step.rounds === 1 ? '1 round' : `${step.rounds} rounds`;
        const innerStepsHtml = this.renderPreviewStepsTree(step.steps);
        return `
          <li class="preview-step preview-step-group">
            <div class="preview-group-header">
              <span class="preview-group-name">${step.name}</span>
              <span class="preview-group-rounds">× ${roundsLabel}</span>
            </div>
            <ul class="preview-group-steps">
              ${innerStepsHtml}
            </ul>
          </li>`;
      })
      .join('');
  }

  public showCountdown(onFinish: () => void): void {
    this.currentView = 'countdown';
    initSound();

    this.appElement.innerHTML = `
      <div class="countdown" id="countdown-view">
        <div class="countdown-number" id="countdown-number">3</div>
        <p class="countdown-label">Get ready</p>
      </div>
    `;

    let remaining = 3;
    const numberEl = document.getElementById('countdown-number');
    const labelEl = this.appElement.querySelector('.countdown-label');

    const tick = (): void => {
      if (remaining > 0) {
        if (numberEl) numberEl.textContent = String(remaining);
        playCountdownBeep();
        remaining--;
        setTimeout(tick, 1000);
      } else {
        if (numberEl) numberEl.textContent = 'Go!';
        if (labelEl) (labelEl as HTMLElement).textContent = '';
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
    if (this.currentView !== 'player') {
      this.currentView = 'player';
      this.renderPlayer(state, onPause, onResume, onNext, onComplete, onEnd);
    } else {
      this.updatePlayer(state);
    }
  }

  private renderPlayer(
    state: PlayerState,
    onPause: () => void,
    onResume: () => void,
    onNext: () => void,
    onComplete: () => void,
    onEnd: () => void
  ): void {
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

    const endBtn = document.getElementById('end-btn');
    endBtn?.addEventListener('click', onEnd);

    // Store callbacks for later use
    (this.appElement as any)._callbacks = { onPause, onResume, onNext, onComplete, onEnd };

    this.updatePlayer(state);
  }

  private updatePlayer(state: PlayerState): void {
    const { workout, flatSteps, currentStepIndex, isPaused, remainingSeconds } = state;

    if (!workout) return;

    const currentStep = flatSteps[currentStepIndex];

    // Check if we need full re-render (step changed OR pause state changed)
    const stepChanged = currentStepIndex !== (this.appElement as any)._lastStepIndex;
    const pauseChanged = isPaused !== (this.appElement as any)._lastPauseState;

    (this.appElement as any)._lastStepIndex = currentStepIndex;
    (this.appElement as any)._lastPauseState = isPaused;

    if (stepChanged || pauseChanged) {
      // Full update when step or pause state changes
      this.fullUpdate(state);
    } else {
      // Quick update: just the timer display
      this.quickTimerUpdate(currentStep, remainingSeconds);
    }
  }

  private fullUpdate(state: PlayerState): void {
    const { workout, flatSteps, currentStepIndex, isPaused, remainingSeconds } = state;

    if (!workout) return;

    // Update title
    const titleEl = document.getElementById('workout-title');
    if (titleEl) {
      titleEl.textContent = workout.title;
    }

    // Update progress
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    if (progressFill && progressText) {
      const progress = flatSteps.length > 0 ? (currentStepIndex / flatSteps.length) * 100 : 0;
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `Step ${Math.min(currentStepIndex + 1, flatSteps.length)} of ${flatSteps.length}`;
    }

    // Update step content
    const stepContent = document.getElementById('step-content');
    if (stepContent) {
      const currentStep = flatSteps[currentStepIndex];
      if (currentStep) {
        stepContent.innerHTML = this.renderStep(currentStep, remainingSeconds);
      } else {
        stepContent.innerHTML = '<div class="complete"><h2>Workout Complete!</h2><p>Great job!</p></div>';
      }
    }

    // Update next preview
    const nextPreview = document.getElementById('next-preview');
    if (nextPreview) {
      const nextStep = flatSteps[currentStepIndex + 1];
      if (nextStep) {
        const nextType = nextStep.type === 'timer' ?
          `${formatDuration(nextStep.durationSeconds)}` :
          `${nextStep.reps} reps`;
        nextPreview.innerHTML = `<p>Next: <strong>${nextStep.name}</strong> (${nextType})</p>`;
      } else {
        nextPreview.innerHTML = '<p>Last step!</p>';
      }
    }

    // Update controls
    const controls = document.getElementById('controls');
    if (controls && flatSteps[currentStepIndex]) {
      controls.innerHTML = this.renderControls(flatSteps[currentStepIndex]!, state.isPlaying, isPaused);
      this.attachControlListeners();
    }
  }

  private quickTimerUpdate(currentStep: FlatStep | undefined, remainingSeconds: number | null): void {
    // Only update the timer display, nothing else
    if (!currentStep || currentStep.type !== 'timer') return;

    const timerEl = document.querySelector('.timer');
    if (timerEl && remainingSeconds !== null) {
      timerEl.textContent = formatTime(remainingSeconds);
    }
  }

  private renderStep(step: FlatStep, remainingSeconds: number | null): string {
    let html = '<div class="step">';

    // Round context
    if (step.roundContext) {
      const { groupName, currentRound, totalRounds } = step.roundContext;
      html += `<div class="round-context">${groupName} — Round ${currentRound} of ${totalRounds}</div>`;
    }

    html += `<h2 class="step-name">${step.name}</h2>`;

    if (step.type === 'timer') {
      const displayTime = remainingSeconds !== null ? remainingSeconds : step.durationSeconds;
      html += `<div class="timer">${formatTime(displayTime)}</div>`;
    } else {
      html += `<div class="reps">× ${step.reps} reps</div>`;
    }

    if (step.notes) {
      html += `<p class="notes">${step.notes}</p>`;
    }

    html += '</div>';
    return html;
  }

  private renderControls(step: FlatStep, _isPlaying: boolean, isPaused: boolean): string {
    if (step.type === 'timer') {
      if (isPaused) {
        return `
          <button id="resume-btn" class="primary large">Resume</button>
          <button id="next-btn" class="secondary">Skip</button>
        `;
      } else {
        return `
          <button id="pause-btn" class="primary large">Pause</button>
          <button id="next-btn" class="secondary">Skip</button>
        `;
      }
    } else {
      return '<button id="complete-btn" class="primary large">Done</button>';
    }
  }

  private attachControlListeners(): void {
    const callbacks = (this.appElement as any)._callbacks;
    if (!callbacks) return;

    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const nextBtn = document.getElementById('next-btn');
    const completeBtn = document.getElementById('complete-btn');

    // Remove old listeners by cloning and replacing (prevents duplicates)
    if (pauseBtn) {
      const newPauseBtn = pauseBtn.cloneNode(true) as HTMLElement;
      pauseBtn.parentNode?.replaceChild(newPauseBtn, pauseBtn);
      newPauseBtn.addEventListener('click', callbacks.onPause);
    }

    if (resumeBtn) {
      const newResumeBtn = resumeBtn.cloneNode(true) as HTMLElement;
      resumeBtn.parentNode?.replaceChild(newResumeBtn, resumeBtn);
      newResumeBtn.addEventListener('click', callbacks.onResume);
    }

    if (nextBtn) {
      const newNextBtn = nextBtn.cloneNode(true) as HTMLElement;
      nextBtn.parentNode?.replaceChild(newNextBtn, nextBtn);
      newNextBtn.addEventListener('click', callbacks.onNext);
    }

    if (completeBtn) {
      const newCompleteBtn = completeBtn.cloneNode(true) as HTMLElement;
      completeBtn.parentNode?.replaceChild(newCompleteBtn, completeBtn);
      newCompleteBtn.addEventListener('click', callbacks.onComplete);
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
      // Trigger input event to update duration estimate
      textarea.dispatchEvent(new Event('input'));
    }
  }
}
