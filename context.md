# Current project context — 19 October 2026

The user rejected the folio redesign and clarified that the original Field Atlas clone remains authoritative. The project changes its content to Vietnamese history while preserving the original dark globe presentation, layout, and interactions. Do not reintroduce the rejected paper theme, 2D switch, source drawer, or a separate bottom timeline.

The current application uses the supplied 2021 textbook as its primary source, with attributable supplementary sources where the records identify them. `src/history.js` contains 36 events across six periods; `src/historicalPlaces.js` adapts them to the existing globe and detail panel. The original styling is preserved with small additions for related-location choices and guided-play controls. `targets/field-atlas/` and the supplied textbook must remain intact.

## Interaction contract — 18 October 2026

Highlight only the focused marker’s country. Era controls select their first event and center its marker. Marker selection preserves its location ID and country, uses the exact marker longitude, and can recenter after manual globe movement. Countrywide events without a verified site have neither a marker nor a highlight. Connection lines represent sourced relationships only. The original interface and mobile behavior remain authoritative. Current interaction notes are in `README.md` and `DESIGN.md`.

## Guided timeline narration — 19 October 2026

The controls above the mode switch narrate all 36 events in chronological order, starting from the selected event or from the beginning. Playback updates the mode and active right-hand list row, focuses each documented location, and plays the local ElevenLabs Vietnamese recording at `public/audio/<event-id>.mp3` using a single HTML audio player, while captions remain displayed from `src/narration.js`. Events without verified coordinates stay in the tour and play their audio without camera movement or marker creation. Play/pause preserves the clip position; stop, skip, previous/next, and manual event selection cancel or replace the active clip so audio never overlaps and stale callbacks cannot advance the timeline. Missing or failed audio clips stop playback at that event and present a visible error without falling back to browser speech synthesis. The asset naming, placement, and architecture notes are in `docs/AUTO_PLAY_GUIDE.md`.
