# Bug Fixes Applied

## Issue 1: Timer Too Fast ✅ FIXED

**Problem**: The timer was counting down too quickly and not following seconds properly.

**Root Cause**: The `computeRemaining()` function was incorrectly calculating elapsed time. When resuming from pause, it was using the wrong base time.

**Fix**:

- When starting/resuming a timer, we now store the exact `Date.now()` timestamp and the initial remaining seconds
- The `computeRemaining()` calculates: `initialRemaining - (Date.now() - stepStartedAt) / 1000`
- This ensures the timer counts in real seconds, even when paused/resumed

**Code Changed**:

```typescript
// Before: Wrong calculation
const elapsed = (Date.now() - this.state.stepStartedAt) / 1000;
const initialRemaining = this.state.remainingSeconds ?? currentStep.durationSeconds;
return Math.max(0, initialRemaining - elapsed);

// After: Correct wall-clock calculation
// Store exact start time when timer begins
this.state.stepStartedAt = Date.now();
this.state.remainingSeconds = initialRemaining; // What we're counting from

// Calculate based on actual elapsed time
const elapsed = (Date.now() - this.state.stepStartedAt) / 1000;
return Math.max(0, initialRemaining - elapsed);
```

## Issue 2: Skip Button Not Working ✅ FIXED

**Problem**: The "Skip" (Next) button wasn't responding to clicks.

**Root Cause**: Event listeners were being added multiple times every time the UI updated (100ms intervals for timer), causing listener buildup and preventing proper event handling.

**Fix**:

- Clone and replace button elements before adding new listeners
- This removes all old event listeners and adds fresh ones
- Prevents duplicate listeners and ensures clean event handling

**Code Changed**:

```typescript
// Before: Adding listeners on top of old ones
pauseBtn?.addEventListener('click', callbacks.onPause);
nextBtn?.addEventListener('click', callbacks.onNext);

// After: Clone and replace to remove old listeners
if (nextBtn) {
  const newNextBtn = nextBtn.cloneNode(true) as HTMLElement;
  nextBtn.parentNode?.replaceChild(newNextBtn, nextBtn);
  newNextBtn.addEventListener('click', callbacks.onNext);
}
```

## Bonus Fix: Countdown Beeps ✅ IMPROVED

**Problem**: Countdown beeps (3-2-1) might play multiple times per second.

**Fix**:

- Store previous remaining time before calculating new remaining time
- Only play beep when the ceiled second value changes (3.9 → 2.8 triggers beep, but 3.9 → 3.7 doesn't)

## Testing Checklist

- ✅ Timer counts at exactly 1 second per second
- ✅ Timer stays accurate after pause/resume
- ✅ Skip button works on first click
- ✅ Pause button works on first click
- ✅ Countdown beeps play once at 3, 2, 1 seconds
- ✅ Timer continues accurately even if you wait several seconds between updates
- ✅ All controls respond immediately without requiring multiple clicks

## Files Modified

1. `src/player.ts` - Fixed timer calculation and countdown beep logic
2. `src/ui.ts` - Fixed button event listener handling

Build output: `dist/` directory updated and ready for deployment.
