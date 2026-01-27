import './style.css';
import { WorkoutPlayer } from './player';
import { WorkoutUI } from './ui';
import { parseWorkout } from './workout';

const app = document.querySelector<HTMLDivElement>('#app')!;
const player = new WorkoutPlayer();
const ui = new WorkoutUI(app);

// Sample workout
const sampleWorkout = {
  version: 1,
  title: "Circuit workout",
  description: "Warm up, 3 rounds of push-ups and squats with rest between, then cool down.",
  equipment: ["bodyweight"],
  skipLastRest: true,
  steps: [
    { id: "warmup", type: "timer", name: "Warm up", durationSeconds: 90 },
    {
      id: "circuit-1",
      type: "group",
      name: "Circuit 1",
      rounds: 3,
      skipLastRest: true,
      steps: [
        { id: "c1-pushups", type: "reps", name: "Push-ups", reps: 10, notes: "Keep your core tight" },
        { id: "c1-rest1", type: "timer", name: "Rest", durationSeconds: 30 },
        { id: "c1-squats", type: "reps", name: "Squats", reps: 12, notes: "Go deep!" },
        { id: "c1-rest2", type: "timer", name: "Rest", durationSeconds: 30 }
      ]
    },
    { id: "cooldown", type: "timer", name: "Cool down", durationSeconds: 60 }
  ]
};

function init() {
  // Show landing page
  ui.showLanding(handleStart, handleLoadSample);
}

function handleStart(json: string) {
  try {
    const workout = parseWorkout(json);
    player.loadWorkout(workout);
    player.start();

    // Listen for state changes
    player.onUpdate((state) => {
      ui.showPlayer(
        state,
        () => player.pause(),
        () => player.resume(),
        () => player.next(),
        () => player.completeRepsStep(),
        handleEndWorkout
      );
    });

    // Show initial player state
    ui.showPlayer(
      player.getState(),
      () => player.pause(),
      () => player.resume(),
      () => player.next(),
      () => player.completeRepsStep(),
      handleEndWorkout
    );
  } catch (error) {
    ui.showError(error instanceof Error ? error.message : 'Failed to start workout');
  }
}

function handleLoadSample() {
  ui.loadSampleIntoTextarea(JSON.stringify(sampleWorkout, null, 2));
}

function handleEndWorkout() {
  player.stop();
  init();
}

// Start the app
init();
