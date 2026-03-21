# Workout Player

A web-based workout player for strength training. Load AI-generated workouts and follow along with timer and rep-based exercises, complete with sound cues and screen wake lock support.

## Features

- ⏱️ **Timer steps** with countdown and automatic advancement
- 💪 **Rep-based exercises** with manual completion
- 🔄 **Circuit/group support** with multiple rounds
- 🔊 **Audio cues** for timer completion and countdown (3-2-1)
- 📱 **Screen Wake Lock** to keep your phone awake during workouts
- ⏰ **Wall-clock timers** that stay accurate even when your phone locks
- 📊 **Progress tracking** with step indicators
- 👀 **Next step preview** to prepare for upcoming exercises
- 📝 **Coaching notes** display for exercise cues
- 🎨 **Dark mode** support (system preference)

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

### Build for Production

```bash
# Build the app
npm run build

# Preview the build
npm run preview
```

## Deploy to Cloudflare Pages

### Option 1: Wrangler CLI

```bash
# Build the app
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=workout-player
```

### Option 2: Git Integration

1. Push this repository to GitHub/GitLab
2. Connect to Cloudflare Pages from the dashboard
3. Set build configuration:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: (leave empty or set to repo root)

The `wrangler.json` file is already configured with `pages_build_output_dir: "./dist"`.

## Usage

### Load a Workout

1. **Paste JSON**: Copy workout JSON and paste into the textarea
2. **Load Sample**: Click "Load Sample" to see an example workout
3. **JSON Schema**: Click "View JSON Schema" to open a dialog with the full JSON Schema (for LLM prompts); use **Copy** to put it on the clipboard
4. **Start**: Click "Validate & Preview" to review the workout, then start from the preview screen

### During a Workout

- **Timer steps**: Countdown automatically advances when time's up
- **Rep steps**: Tap "Done" when you complete the reps
- **Pause/Resume**: Control the timer as needed
- **Skip**: Jump to the next step
- **End Workout**: Stop and return to the landing page

### Creating Workouts

See [`docs/FORMAT.md`](docs/FORMAT.md) for complete documentation on:

- Workout request format (for AI input)
- Workout playback format (JSON schema)
- Using schemas with AI (ChatGPT, Claude, etc.)
- Example workouts

Sample workouts are in [`docs/samples/`](docs/samples/).

## Workout Format Quick Reference

```json
{
  "version": 1,
  "title": "My Workout",
  "equipment": ["bodyweight"],
  "steps": [
    {
      "id": "warmup",
      "type": "timer",
      "name": "Warm up",
      "durationSeconds": 60
    },
    {
      "id": "pushups",
      "type": "reps",
      "name": "Push-ups",
      "reps": 10,
      "notes": "Keep core tight"
    },
    {
      "id": "circuit",
      "type": "group",
      "name": "Circuit 1",
      "rounds": 3,
      "steps": [
        { "id": "squats", "type": "reps", "name": "Squats", "reps": 12 },
        { "id": "rest", "type": "timer", "name": "Rest", "durationSeconds": 30 }
      ]
    }
  ]
}
```

## Technical Details

- **Framework**: Vite + TypeScript
- **APIs Used**:
  - Web Audio API (for sound)
  - Screen Wake Lock API (to keep screen on)
  - Page Visibility API (for background timer accuracy)
- **Styling**: Vanilla CSS with CSS custom properties
- **Browser Support**: Modern browsers with ES2020+ support

### Wall-Clock Timer Implementation

The timer uses `Date.now()` to compute remaining time instead of accumulating `setInterval` ticks. This ensures:

- Timer stays accurate even when the browser throttles background tabs
- When you lock your phone and unlock later, the timer shows the correct remaining time
- If time is up while the phone was locked, it advances immediately on unlock

## Future Enhancements

See [`docs/FORMAT.md`](docs/FORMAT.md) section 8 for planned improvements:

- PWA support for offline access and home screen install
- Workout history tracking (localStorage)
- Export/import workout files
- Countdown audio cues (3-2-1)
- Dark mode toggle
- Keyboard shortcuts for desktop
- Vibration API for haptic feedback

## License

See [LICENSE](LICENSE) file.

## Contributing

Contributions welcome! Please ensure:

- TypeScript types are correct
- Workouts validate against the schema
- Timer implementation remains wall-clock based
- UI remains accessible (ARIA attributes, focus management)
