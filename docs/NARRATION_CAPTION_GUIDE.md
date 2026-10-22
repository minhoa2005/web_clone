# Narration caption implementation

The guided tour captions are tied to the voice recording's clock. They must not be driven by a fixed character timer: a fixed timer can finish a sentence before the recording reaches it, or remove the sentence before a learner has time to read it.

## Source contract

For every event, keep these two records aligned:

- `src/narration.js`: the Vietnamese narration text keyed by the event ID.
- `public/audio/<event-id>.mp3`: the matching voice recording.

The narration text is split into sentence-sized segments at `.`, `!`, and `?`. Keep punctuation in the source text so the segment boundaries remain understandable. Avoid adding a new caption-only script that differs from the spoken recording.

## Timing model

`src/App.jsx` maps the sentence segments onto the actual `HTMLAudioElement.duration` and reads `audio.currentTime` while the recording plays.

1. Each segment receives a weight based on its character count, with a small allowance for commas, semicolons, and colons.
2. The recording duration is divided across those weighted segments.
3. The active segment types in during the first 70% of its allocated time (`NARRATION_REVEAL_RATIO` in `src/App.jsx`).
4. The completed segment stays visible for the remaining 30%, until the audio clock enters the next segment.
5. Updates are sampled from the audio clock every 80ms (`NARRATION_SYNC_INTERVAL` in `src/App.jsx`), so the caption follows the recording rather than wall-clock narration timers.

This is intentionally an approximate speech alignment: it uses the real recording duration and the script's sentence lengths without requiring a separate forced-alignment file. If a sentence is spoken much faster or slower than its length suggests, split the script into smaller spoken units so the weighted timing can follow it more closely.

## Interaction rules

- Starting or advancing an event resets the caption and starts it when that event's audio begins.
- Pausing stops the caption clock and leaves the current text visible.
- Resuming continues from the audio's current time.
- Stopping, changing events, audio errors, and completion clear the caption.
- `prefers-reduced-motion: reduce` reveals the active sentence immediately, but still changes sentences from the audio clock.
- Keep the visual caption in the lower-third overlay above the narration controls; do not duplicate it in the left detail panel.
- The visible typed text is `aria-hidden`; a single full-sentence narration live region is provided for assistive technology so screen readers do not announce every character.

## Adding a new narration

1. Add the event's complete spoken copy to `src/narration.js` using the exact event ID.
2. Add the matching MP3 at `public/audio/<event-id>.mp3`.
3. Keep the number and order of spoken sentences aligned with the written copy.
4. Test play, pause, resume, next, stop, audio error, and reduced-motion behavior.
5. Do not replace the audio-clock sync with `setTimeout`/`setInterval` character pacing. The interval in `App.jsx` is only a sampling loop; `audio.currentTime` remains the source of truth.
