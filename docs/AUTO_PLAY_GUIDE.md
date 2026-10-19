# Guided timeline playback

## Goal

Add a **Phát thuyết minh** control to the existing globe experience. One click starts a chronological, narrated tour of the 36 events using ElevenLabs recordings. The active event remains visible in the right-hand list and detail panel while the globe moves to its documented location.

The Vietnamese voice-over copy is preserved in [`src/narration.js`](../src/narration.js), keyed by the event IDs in `src/history.js`. It serves as the single source for narration captions displayed in the detail panel.

## Implementation status

The tour is implemented in `src/App.jsx` and `src/style.css`: it traverses all 36 events, syncs the selected list row and detail panel, focuses located events before playing their audio clips, and provides play/pause, stop, previous, and next controls. Playback uses pre-recorded ElevenLabs Vietnamese audio files loaded locally through a single HTML audio player element. Browser speech synthesis has been completely replaced, and there is no fallback to synthetic speech.

## Proposed interaction

1. Start at the currently selected event. If no event is selected, start at the first event. Continue in `EVENTS` chronological order through both existing date ranges, including the transition between them.
2. For each event, select its row, update the detail panel and URL state, and focus the globe on its primary documented location. For events with multiple documented locations, begin at the primary location and retain the existing location choices. Draw only the relationship lines already sourced for that event.
3. Play the local audio clip for that event. Advance only when that clip ends, followed by a short transition before presenting the next item.
4. Events without a verified location remain fully included in the tour and play their audio. Do not add a marker, highlight, or guessed camera destination for them.
5. Provide **Play/Pause**, **Stop**, **Previous**, and **Next** controls with a visible event position such as “8 of 36.” Manual selection during playback becomes the new active event and the tour continues from there.

## Audio approach

### Asset naming and local asset placement
- Spoken audio clips are provided as local MP3 files recorded via ElevenLabs.
- **Asset naming**: Each file is named `<event-id>.mp3`, where `<event-id>` exactly matches the keys in `src/history.js` and `src/narration.js` (for example, `hanh-trinh-1911.mp3`, `hoi-nghi-1930.mp3`, `dai-hoi-xiii-2021.mp3`).
- **Asset placement**: All 36 audio files are placed locally in `public/audio/<event-id>.mp3`. They are served directly as static files by Vite (`${import.meta.env.BASE_URL}audio/<event-id>.mp3`) and are never bundled into the JavaScript bundle. No placeholder audio files are committed or generated.
- **Captions**: Narration captions remain sourced from `src/narration.js` and are displayed in the detail panel during tour playback and pause.

### Playback behavior
- **Single HTML audio player/ref**: Playback is managed by a single `<audio>` element and ref in `src/App.jsx`.
- **Camera synchronization**: On step start, the globe initiates travel toward the event location. Playback starts after camera arrival (1750ms delay, or 100ms when reduced motion is requested or when an event has no location coordinates).
- **Advancement on clip end**: The tour advances to the next chronological event only when the current clip ends (`ended` event), with a short 700ms gap.
- **Pause and resume**: Pausing during playback pauses the HTML audio element and preserves its exact playback position (`audio.currentTime`). Resuming restarts audio from that saved position.
- **Clip cancellation without overlap**: Stopping, skipping (Previous/Next), and manual event selection cancel or replace the active clip immediately. The player unloads any active resource (`removeAttribute('src')`, `load()`), and a sequence token (`tourTokenRef`) is incremented so stale `ended` or `error` handlers cannot trigger or advance the timeline.
- **Events without verified locations**: Unlocated events (such as countrywide resolutions and policies) remain part of the tour, playing their audio and displaying captions while leaving the globe camera and marker state unchanged.
- **Missing or failed clips**: If an audio file is missing (404) or fails to play, playback stops immediately at that event and displays a visible error banner (`.guided-controls__error`). There is no fallback to browser speech synthesis.

## Implementation details

### 1. Playback state and sequence
State includes `idle`, `playing`, `paused`, and `complete`, tracked alongside `tourIndex` and a cancellation token (`tourTokenRef`). The 36-event sequence is derived strictly from `EVENTS` in chronological order across the 1911–1945 and 1945–2021 ranges.

### 2. Connect to the existing app
Tour controls sit directly above the mode switch. On each step, `choosePlace` synchronizes the active mode tab, list row selection, URL hash, detail panel, and globe camera.

### 3. HTML audio player adapter
A single HTML audio element rendered in JSX is controlled via `audioRef`. Clips are requested from `public/audio/<event-id>.mp3`. Stale event listeners are detached before loading or unloading clips, and error events halt playback with user-facing error feedback.

### 4. Coordinate camera and narration
Camera travel takes 1.5 seconds. The player waits 1.75 seconds to ensure the camera is steady before starting playback. When `prefers-reduced-motion` is active or the event has no verified location, audio starts after a minimal 100ms delay.

### 5. Accessible controls and feedback
Controls include accessible labels, state indicators, and an aria-live position label. Errors are presented in a prominent alert banner above the playback toolbar.

## Completion checks

- A full run visits every event once in chronological order and crosses both existing mode ranges correctly.
- Play, pause/resume, stop, previous/next, manual event selection, deep links, and closing event details leave no overlapping audio or stale progression.
- Pause/resume preserves the current clip playback position.
- Events with no verified location do not create pins or country highlights; multi-location selections preserve the chosen place.
- The camera arrives at each located event before narration, and reduced-motion behavior skips the camera tween cleanly.
- Missing or failed clips stop playback at that event with a visible error; no browser speech synthesis fallback is invoked.
- Narration captions in `src/narration.js` remain visible in the detail panel during tour playback.
- Desktop and mobile controls, captions, and active-list feedback remain usable.
