# Lịch sử Đảng — original clone, historical content

The original Field Atlas clone supplies the unchanged visual presentation: dark satellite Earth, red atmosphere, pulsing pins, floating two-mode controls, right-hand list and left slide-out detail panel. The stylesheet is identical to commit `ef7b1dd`. The rejected folio redesign is archived in `.impeccable/archive/folio-version/` and is not the current direction.

## Run

```powershell
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Select **1911–1945** or **1945–2021** using the original mode switch. The original place list now groups events by period and year. Pins open historical accounts; **khám phá** retains the original random selection action. Close details with × or Escape. Deep links use `#event=hoi-nghi-1930`.

The 36 sourced records live in `src/history.js`; `src/historicalPlaces.js` adapts them to the clone's existing place/photo contract. `src/App.jsx` retains the original interface and globe implementation. `src/style.css` is the original stylesheet. Source-page images replace travel photographs in the existing gallery slots, with the complete textbook linked from each account. The PDF in `docs/` is the source of truth. Modern country shapes only orient the reader; relationship arcs follow sourced event connections, not fictional travel routes.

Both modes share six chronological learning periods from the supplied 2021 textbook. Events without verified sites remain in the list with no invented pin. Shared locations use one selectable pin; individual events remain available from the list. The original mobile behavior, including hiding the right-hand list, remains intact.

`targets/field-atlas/` preserves original clone and Pingfusi history. No new hosting or Pingfusi review is claimed. Earlier performance measurements describe the rejected version, not this restored implementation.
