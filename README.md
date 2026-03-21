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

## Deploy to GitHub Pages

The repo includes [`.github/workflows/pages.yml`](.github/workflows/pages.yml), which builds with Vite and deploys the `dist` output on every push to `main`.

1. In the GitHub repo, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Under **Custom domain**, enter `workout.goncaloraposo.com` and follow GitHub’s DNS checks ([Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)).
4. Push to `main`; the **Deploy to GitHub Pages** workflow publishes the site.

**Custom domain** (`https://workout.goncaloraposo.com/`): the workflow sets `VITE_BASE=/` so asset URLs match the domain root. [`public/CNAME`](public/CNAME) is copied into `dist` so the hostname stays configured on deploy.

**Default GitHub Pages URL** (`https://<user>.github.io/<repo>/`): remove the `VITE_BASE: /` env block from [`.github/workflows/pages.yml`](.github/workflows/pages.yml) and delete `public/CNAME` so the build uses the repo-based base from [`vite.config.ts`](vite.config.ts).

**Local build matching production** (custom domain):

```bash
VITE_BASE=/ npm run build
```

**Local build matching** `*.github.io/<repo>/`:

```bash
GITHUB_REPOSITORY=yourname/your-repo npm run build
```

### Cloudflare Pages (optional)

You can still deploy `dist` to Cloudflare Pages with root URL `npm run build` (default base `/`) or set `VITE_BASE` if the app is hosted under a subpath. The `wrangler.json` file keeps `pages_build_output_dir: "./dist"` for Wrangler.

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
