# Workout Player Format Documentation

This document describes the formats used by the Workout Player app: the **request format** (for asking AI to generate a workout) and the **playback format** (the JSON the app consumes).

## Table of Contents

1. [Workout Request Format](#workout-request-format) (for AI input)
2. [Workout Playback Format](#workout-playback-format) (for the app)
3. [Using Schemas with AI](#using-schemas-with-ai)
4. [Examples](#examples)

---

## Workout Request Format

When asking an AI to generate a workout, use this format to describe what you want.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `durationMinutes` | number | Yes | Target total duration (5-120 minutes) |
| `focus` | string | Yes | Workout focus (e.g., "upper body", "legs", "full body", "core") |
| `equipment` | string[] | Yes | Available equipment (e.g., ["dumbbells", "resistance band"] or ["bodyweight"]) |
| `intensity` | string | No | Intensity level: "light", "moderate", or "heavy" |
| `goals` | string[] | No | Workout goals (e.g., ["build muscle", "endurance"]) |

### Example Request

```json
{
  "durationMinutes": 30,
  "focus": "upper body",
  "equipment": ["dumbbells", "resistance band"],
  "intensity": "moderate",
  "goals": ["build muscle"]
}
```

### Example Prompt

> Generate a strength workout as JSON. Request: 30 minutes, upper body, equipment: dumbbells and resistance band, moderate intensity. Return a JSON object that validates against the workout playback schema.

---

## Workout Playback Format

This is the JSON format the Workout Player app consumes. After the AI generates a workout, it should output this format.

### Root Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | number | Yes | Schema version (must be 1) |
| `title` | string | Yes | Workout title |
| `description` | string | No | Optional description |
| `equipment` | string[] | No | Equipment needed for the workout |
| `skipLastRest` | boolean | No | Skip the last rest step at the end of the workout |
| `steps` | Step[] | Yes | Array of workout steps (at least one) |

### Step Types

Steps can be one of three types: **timer**, **reps**, or **group**.

#### Timer Step

A timed exercise or rest period with a countdown.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | "timer" | Yes | Step type |
| `name` | string | Yes | Step name (e.g., "Warm up", "Rest") |
| `durationSeconds` | number | Yes | Duration in seconds (positive integer) |
| `rest` | boolean | No | Mark as rest for `skipLastRest` logic |
| `notes` | string | No | Optional coaching cues |

**Example:**

```json
{
  "id": "warmup",
  "type": "timer",
  "name": "Warm up",
  "durationSeconds": 90
}
```

#### Reps Step

An exercise with a specific number of repetitions (user confirms completion).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | "reps" | Yes | Step type |
| `name` | string | Yes | Exercise name (e.g., "Push-ups") |
| `reps` | number | Yes | Number of repetitions (positive integer) |
| `notes` | string | No | Optional coaching cues |

**Example:**

```json
{
  "id": "pushups",
  "type": "reps",
  "name": "Push-ups",
  "reps": 12,
  "notes": "Keep your core tight"
}
```

#### Group Step

A group of steps repeated for multiple rounds (e.g., circuits). Groups can be nested.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | "group" | Yes | Step type |
| `name` | string | Yes | Group name (e.g., "Circuit 1") |
| `rounds` | number | Yes | Number of rounds (positive integer) |
| `skipLastRest` | boolean | No | Skip the last rest step in each round |
| `steps` | Step[] | Yes | Nested steps (at least one; can include groups) |
| `notes` | string | No | Optional notes about the group |

**Example:**

```json
{
  "id": "circuit-1",
  "type": "group",
  "name": "Circuit 1",
  "rounds": 3,
  "skipLastRest": true,
  "steps": [
    {
      "id": "c1-pushups",
      "type": "reps",
      "name": "Push-ups",
      "reps": 10
    },
    {
      "id": "c1-rest",
      "type": "timer",
      "name": "Rest",
      "durationSeconds": 30
    },
    {
      "id": "c1-squats",
      "type": "reps",
      "name": "Squats",
      "reps": 12
    }
  ]
}
```

### skipLastRest Logic

- A step is considered a "rest" if:
  - It's a timer step AND
  - It has `"rest": true` OR its `name` is "Rest" (case-insensitive)
- **Workout-level `skipLastRest`**: Skips the very last rest step in the entire workout.
- **Group-level `skipLastRest`**: Skips the last rest step in each round of that group.
- Other timer steps (e.g., "Cool down", "Warm up") are NOT skipped unless explicitly marked with `"rest": true`.

---

## Using Schemas with AI

Two JSON Schema files are provided to ensure strict input/output validation:

1. **`workout-request-schema.json`**: Describes the request format (AI input)
2. **`workout-playback-schema.json`**: Describes the playback format (AI output)

### Method 1: Function/Tool Schema

Pass the request schema as a function parameter schema when using structured output:

```json
{
  "name": "generate_workout",
  "description": "Generate a workout based on user requirements",
  "parameters": {
    "$ref": "./workout-request-schema.json"
  }
}
```

The AI should return a workout that validates against `workout-playback-schema.json`.

### Method 2: System Prompt

Include both schemas in your system prompt:

```
You are a fitness coach. When the user requests a workout, they will provide a JSON object matching this schema:

[paste workout-request-schema.json]

You must return a workout JSON object that validates against this schema:

[paste workout-playback-schema.json]
```

### Method 3: User Prompt

Paste both schemas directly into the user message:

```
Generate a workout for me. My request (valid against workout-request-schema.json):
{
  "durationMinutes": 30,
  "focus": "upper body",
  "equipment": ["dumbbells"],
  "intensity": "moderate"
}

Return a workout JSON (valid against workout-playback-schema.json).
```

---

## Examples

See the `samples/` directory for complete workout examples:

- **`circuit-workout.json`**: 3-round circuit with groups and `skipLastRest`
- **`upper-body-30min.json`**: 30-minute upper body workout with dumbbells
- **`quick-fullbody.json`**: 15-minute bodyweight full-body workout

### Complete Example: Circuit Workout

```json
{
  "version": 1,
  "title": "Circuit workout",
  "description": "Warm up, 3 rounds of push-ups and squats, then cool down.",
  "equipment": ["bodyweight"],
  "skipLastRest": true,
  "steps": [
    {
      "id": "warmup",
      "type": "timer",
      "name": "Warm up",
      "durationSeconds": 90
    },
    {
      "id": "circuit-1",
      "type": "group",
      "name": "Circuit 1",
      "rounds": 3,
      "skipLastRest": true,
      "steps": [
        {
          "id": "c1-pushups",
          "type": "reps",
          "name": "Push-ups",
          "reps": 10,
          "notes": "Keep your core tight"
        },
        {
          "id": "c1-rest1",
          "type": "timer",
          "name": "Rest",
          "durationSeconds": 30
        },
        {
          "id": "c1-squats",
          "type": "reps",
          "name": "Squats",
          "reps": 12,
          "notes": "Go deep!"
        },
        {
          "id": "c1-rest2",
          "type": "timer",
          "name": "Rest",
          "durationSeconds": 30
        }
      ]
    },
    {
      "id": "cooldown",
      "type": "timer",
      "name": "Cool down",
      "durationSeconds": 60
    }
  ]
}
```

**Effective playback order:**

1. Warm up (90s)
2. **Circuit 1 — Round 1 of 3:**
   - Push-ups × 10
   - Rest (30s)
   - Squats × 12
   - ~~Rest (30s)~~ ← Skipped (`skipLastRest: true`)
3. **Circuit 1 — Round 2 of 3:**
   - Push-ups × 10
   - Rest (30s)
   - Squats × 12
   - ~~Rest (30s)~~ ← Skipped
4. **Circuit 1 — Round 3 of 3:**
   - Push-ups × 10
   - Rest (30s)
   - Squats × 12
   - ~~Rest (30s)~~ ← Skipped
5. Cool down (60s)

Total steps: **11** (not 14, because 3 rest steps are skipped per the `skipLastRest` rules).

---

## Tips for AI Generation

- **Warm-up**: Start with 60-90 seconds of dynamic stretching or light cardio.
- **Rest periods**: 20-45 seconds between exercises, depending on intensity.
- **Circuits**: Use groups with 2-4 rounds for efficient workouts.
- **Cool-down**: End with 60-120 seconds of stretching (don't mark as rest).
- **Rep estimates**: Use 5 seconds per rep when estimating total duration.
- **Equipment consistency**: Only include exercises that use the requested equipment.

---

## Schema Validation

You can validate workout JSON using standard JSON Schema validators. In JavaScript/TypeScript:

```typescript
import Ajv from 'ajv';
import playbackSchema from './workout-playback-schema.json';

const ajv = new Ajv();
const validate = ajv.compile(playbackSchema);

const valid = validate(workoutData);
if (!valid) {
  console.error(validate.errors);
}
```

The Workout Player app performs its own validation and will show clear error messages for invalid workouts.
