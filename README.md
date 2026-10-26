# Lịch sử Đảng — original clone, historical content

The original Field Atlas clone supplies the unchanged visual presentation: dark satellite Earth, red atmosphere, pulsing pins, floating two-mode controls, right-hand list and left slide-out detail panel. The original styling is retained, with a small addition for event-location choices. The rejected folio redesign is archived in `.impeccable/archive/folio-version/` and is not the current direction.

## Run

```powershell
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Select **1911–1945** or **1945–2021** using the original mode switch. The original place list now groups events by period and year. Pins open historical accounts. Close details with × or Escape. Deep links use `#event=hoi-nghi-1930`.

Selecting an event states its year, place and "Đang di chuyển đến địa danh…" immediately, then opens the detail panel when the globe camera has settled and the source page has docked; **Mở ngay** skips the transition and reduced motion opens the panel directly. A 6-second watchdog only covers a failed signal. The cited page travels from the image ribbon into an evidence card beside the panel — inside the panel on mobile — labelled as a textbook scan with its page number, a controlled zoom and a link to that page in the PDF. The 2021 scan has no text layer, so the card states that rather than inventing an excerpt. Supplement-only events (ASEAN, WTO) show their external record instead of a page. Use the guided-play controls above the mode switch to hear a chronological tour of all 36 events using ElevenLabs recordings. Playback starts at the selected event (or at the beginning), moves the globe to each documented location, and plays the corresponding clip at `public/audio/<event-id>.mp3` via a single HTML audio player, advancing only when that clip ends. Pause and resume preserve playback position within the clip. Stop, skip, previous/next, and manual event selection cancel or replace the active clip so audio never overlaps and stale callbacks cannot advance the timeline. Events without a verified location remain in the tour and play their audio without camera movement or marker creation. Missing or failed clips stop playback at that event and present a visible error without falling back to browser speech synthesis. Captions remain in `src/narration.js`. See `docs/AUTO_PLAY_GUIDE.md` for audio asset details and playback behavior.

The six learning periods are now first-class chapters: a compact badge states the current chapter and its position, crossing into a new chapter shows a quiet, non-blocking boundary marker with the period's own thesis and event count, and the reading panel repeats the chapter label. Finishing the guided tour opens a conclusion listing the six chapters, their ranges and counts, with **Phát lại từ đầu** and a close action. No chapter text is new: it comes from `PERIODS` in `src/history.js`. Mobile keeps its existing composition; the chapter line appears inside the panel.

The 18 October cleanup removes the large hero text, top-left branding, summary counts, gesture instructions and random exploration button. Timeline controls remain. Era changes select the first event in that era and focus its primary marker. Only the focused marker’s country is highlighted; closing details clears the highlight. Events without verified locations have no selected marker or country. Multi-location events offer location choices inside the existing detail panel. Route lines are steady and only represent documented connections.

The 36 sourced records live in `src/history.js`; `src/historicalPlaces.js` adapts them to the clone's existing place/photo contract. `src/App.jsx` retains the original interface and globe implementation. `src/style.css` retains the original styling with compact related-location controls. Source-page images replace travel photographs in the existing gallery slots, with the complete textbook linked from each account. The PDF in `docs/` is the source of truth. Modern country shapes only orient the reader; relationship arcs follow sourced event connections, not fictional travel routes.

Keyboard and assistive-technology paths: globe pins keep their 14 px dot with a 44 px target but stay out of the tab order, so the chronology is the single keyboard route to every event; the two era controls are ordinary pressed buttons; the detail panel is a labelled dialog that takes focus when opened and returns focus to the triggering row on close or Escape; transport and close actions are 44 px; chronology text is 11 px at the warm-grey contrast it needs to be readable. The layout holds at 200% zoom.

Both modes share six chronological learning periods from the supplied 2021 textbook. Events without verified sites remain in the list with no invented pin. Shared locations use one selectable pin; individual events remain available from the list. The original mobile behavior, including hiding the right-hand list, remains intact.

`targets/field-atlas/` preserves original clone and Pingfusi history. No new hosting or Pingfusi review is claimed. Earlier performance measurements describe the rejected version, not this restored implementation.
