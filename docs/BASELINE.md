# Baseline before the archival-documentary redesign

Captured 26 October 2026 on `temp-1` @ `43c0b66`, before any Phase 0 change.
Reference screenshots live in `docs/baseline/`.

| Screenshot | Viewport | URL |
| --- | --- | --- |
| `desktop-initial.png` | 1440×900 | `/` |
| `desktop-dien-bien.png` | 1440×900 | `/#event=dien-bien-1954` |
| `mobile-initial.png` | 390×844 | `/` |

## Verified baseline

- `npm test` → 15 tests, 15 pass (`tests/*.test.js`, `node --test`).
- `npm run build` → succeeds in ~12 s, 458 modules. Chunks: `three` 1,378.55 kB,
  `three-globe` 484.46 kB, `react` 221.84 kB, `index` 86.23 kB, `globe` 64.47 kB,
  `index.css` 23.89 kB, plus the 17,853 kB textbook PDF copied into `dist/assets/`.
  Rollup warns that chunks exceed 500 kB (pre-existing).
- Assets: 86 source-page images (`public/assets/sources`, 9.8 MB), 36 narration clips
  (`public/audio`, 9.8 MB), `earth-dark.jpg` + `earth-topology.png` globe textures.

## Active implementation

`src/App.jsx` (778 lines) is the only globe implementation in production: it owns
`GlobeStage` (globe.gl + three) and all selection, tour and narration state.
`src/GlobeStage.jsx` is not imported anywhere; `src/PivotDemos.jsx` was a separate
route at `/pivot-demos`. `src/places.js` (820 lines) is the original clone data and is
not used by the app either — `src/historicalPlaces.js` adapts `src/history.js`.

## Event selection (as-is)

1. `choosePlace(place, locationId)` sets `mode`, `selected`, `focusedLocationId`,
   increments `focusRevision`, resets `focusReadyRevision` and sets
   `detailReady = false`.
2. It then unconditionally arms `setTimeout(open, 3500)` — 1100 ms under reduced
   motion. Nothing else gates the panel.
3. In parallel, `GlobeStage` starts `pointOfView` (900 ms on first focus, 1500 ms on
   reselect), highlights the country, and calls `onFocusReady` after
   `max(camera, highlight) + 1000 ms` (≈2500 ms on reselect).
4. `EventImageField` waits for that focus-ready revision, then runs an 820 ms
   ribbon→centre promotion and calls `onPromotionComplete`, which can open the panel
   before the timer fires.
5. Result: no visible feedback for the first 2.5–3.5 s beyond the pin highlight, no
   way to skip, and the 3500 ms timer is independent of the actual animation state.
6. `window.history.replaceState` writes `#event=<id>&location=<id>` immediately, so
   the URL is correct even while the panel is still closed.
7. On load, `readEventHash('')` falls back to `EVENTS[0]`, so `/` always opens with
   1911 preselected (visible in `desktop-initial.png`).

## Narration / guided tour (as-is)

- Single `<audio>` element, `preload="auto"`. Play starts at the selected event, or at
  the beginning after completion.
- Per event: camera delay 1750 ms (100 ms reduced motion, or when the event has no
  verified location), then `audio.src = BASE_URL/audio/<id>.mp3`, `play()`.
- Advance happens on `ended` + 700 ms gap. Pause/resume keeps the clip position.
  Stop, skip, prev/next and manual selection bump `tourTokenRef` and cancel the clip.
- Captions come from `src/narration.js`; reveal is interpolated every 80 ms from
  audio time, weighted by sentence length. No speech-synthesis fallback.
- Missing/failed clips stop the tour and show a Vietnamese error inside
  `.guided-controls`; the error text currently names `public/audio/...mp3` to users.

## Hash and Escape (as-is)

- `hashchange` restores the event, stops the tour, bumps `focusRevision`, and opens
  the panel immediately (`detailReady = true`).
- `Escape` on `window` always calls `closePlace()`, which stops the tour and strips the
  hash. It is not scoped to the panel and does not depend on focus.

## Reduced motion (as-is)

- `src/motion.js` resolves `?motion=`/`#motion=` overrides before the media query and
  mirrors the result onto `document.documentElement.dataset.motion`; `style.css`
  neutralises animations unless `[data-motion='full']`.
- Globe camera tweens drop to 0 ms, polygon transitions to 0, promotion is instant, the
  panel delay becomes 1100 ms.

## Known gaps this plan targets

- Panel timing is a blind timer, not a completion signal; no skip affordance.
- The image ribbon renders every card twice (24 + 24 on desktop, 10 + 10 on mobile).
- Pins have a 14 px hit area, mobile hides the chronology entirely, the panel has no
  focus management, and the textbook PDF is 17.8 MB.
