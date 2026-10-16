# Dòng chảy lịch sử

Vietnamese-first learning atlas about the history of the Communist Party of Vietnam: 36 chronological events, six learning periods, a geographic view and cited source pages, from the 1911 background to the supplied textbook's 2021 edition.

## Run and verify

```powershell
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Production output is `dist/`. Keep Vite's relative base for subdirectory hosting. Event links use `#event=hoi-nghi-1930`; unknown links recover to the first event.

## Learning experience

- Select a period, dated stop, or previous/next. Text and globe follow one selected event.
- Open **Mục lục** to search dates, places and Vietnamese text with or without accents.
- Open **Nguồn tư liệu** to compare textbook page images and open the complete PDF.
- Drag or zoom the globe, select a named location, or switch to the 2D orientation map.
- On phones, expand **Dòng thời gian** for the full period and event controls.

## Sources

The primary source is `docs/Giao trinh lich su dang cong san viet nam.pdf`, Bộ Giáo dục và Đào tạo, NXB Chính trị quốc gia Sự thật, 2021. Each record cites pages or a named institutional supplement. ASEAN 1995 and WTO 2007 link separate official sources. Articles are selected study summaries, not exhaustive textbook coverage.

Country shapes show modern orientation, not historical borders. Connections represent annotated relationships, not reconstructed journeys. Nationwide policies do not receive invented locations.

## Maintenance

- `src/history.js`: events, source metadata, locations and search.
- `src/App.jsx`: reading, timeline, navigation and source drawers.
- `src/GlobeStage.jsx`: lazy 3D scene, paused at rest.
- `src/geography.js`: shared geography loading and 2D projection.
- `src/style.css`, `src/fonts.css`: visual system and self-hosted Vietnamese fonts.
- `scripts/prepare-assets.py`: reproduce geometry and cited page WebPs; requires Python, Pillow and pypdf.
- `scripts/prepare-fonts.py`: reproduce subsets and licenses from Google Fonts.
- `docs/REDESIGN_PLAN.md`, `DESIGN.md`, `docs/VERIFICATION.md`: approved plan, implemented design and validation.

Preserve original clone references and Pingfusi history in `targets/field-atlas/`. Those hosted drafts are historical; this redesign has not been uploaded there.
