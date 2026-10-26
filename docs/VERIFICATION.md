# Current verification — 26 October 2026

The current implementation keeps the restored Field Atlas composition while completing the interaction and accessibility pass: neutral first load, deep-link restoration, source-page docking, guided-tour recap, and a three-state mobile chronology. Repeated coaching, transition copy, chapter HUD copy, and evidence chrome have been removed; source attribution remains in the reading panel.

Automated checks cover all 36 sourced events, chronological mode coverage, geographic pin deduplication, no invented coordinates, evidence mappings, experience-state transitions, chapters, narration, reduced motion, and mobile timeline behavior. Run `npm test` and `npm run build` for the current results.

Keyboard behavior includes a single chronological route to events, focus transfer into and out of the reading panel, Escape-to-close, 44px primary controls, and a focus-contained modal recap. The mobile index is available without exposing the desktop side list. A valid `#event=…&location=…` URL restores its event; a URL without an event begins at the overview.

The initial shell loads separately from the WebGL application chunk. Audio uses `preload="none"`; the ambient image ribbon renders fewer cards and eagerly requests only its first two images. Physical-device GPU performance and expert historical editorial sign-off remain outside this repository's automated verification.
