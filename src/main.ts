import './style.css';
import { WorkoutPlayer } from './player';
import { WorkoutUI } from './ui';
import { parseWorkout, flattenSteps } from './workout';
import type { Workout } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const player = new WorkoutPlayer();
const ui = new WorkoutUI(app);

const sampleWorkout = {
  version: 1,
  title: 'Circuit workout',
  description: 'Warm up, 3 rounds of push-ups and squats with rest between, then cool down.',
  equipment: ['bodyweight'],
  skipLastRest: true,
  steps: [
    { id: 'warmup', type: 'timer', name: 'Warm up', durationSeconds: 90 },
    {
      id: 'circuit-1',
      type: 'group',
      name: 'Circuit 1',
      rounds: 3,
      skipLastRest: true,
      steps: [
        { id: 'c1-pushups', type: 'reps', name: 'Push-ups', reps: 10, estimatedDurationSeconds: 30, notes: 'Keep your core tight' },
        { id: 'c1-rest1', type: 'timer', name: 'Rest', durationSeconds: 30 },
        { id: 'c1-squats', type: 'reps', name: 'Squats', reps: 12, estimatedDurationSeconds: 40, notes: 'Go deep!' },
        { id: 'c1-rest2', type: 'timer', name: 'Rest', durationSeconds: 30 }
      ]
    },
    { id: 'cooldown', type: 'timer', name: 'Cool down', durationSeconds: 60 }
  ]
};

function init(): void {
  ui.showLanding(handlePreview, handleLoadSample);
}

function handlePreview(json: string): void {
  try {
    const workout = parseWorkout(json);
    const flatSteps = flattenSteps(workout);

    ui.showPreview(
      workout,
      flatSteps,
      () => ui.showLanding(handlePreview, handleLoadSample, json),
      () => ui.showCountdown(() => startWorkout(workout), flatSteps[0] ?? null)
    );
  } catch (error) {
    ui.showError(error instanceof Error ? error.message : 'Invalid workout');
  }
}

function startWorkout(workout: Workout): void {
  player.loadWorkout(workout);
  player.start();

  const showPlayerState = () => {
    ui.showPlayer(
      player.getState(),
      () => player.pause(),
      () => player.resume(),
      () => player.next(),
      () => player.completeRepsStep(),
      handleEndWorkout
    );
  };

  player.onUpdate(showPlayerState);
  showPlayerState();
}

function handleLoadSample(): void {
  ui.loadSampleIntoTextarea(JSON.stringify(sampleWorkout, null, 2));
}

function handleEndWorkout(): void {
  player.stop();
  init();
}

init();
