# Field Atlas — Earth study

React + Vite recreation of the interactive Earth portion of the Field Atlas reference.

## Run

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. The `#florence` deep link opens the Florence detail state.

## Interaction

- Drag to rotate and use the wheel or trackpad to zoom.
- Rotation pauses while interacting, then resumes after a short idle period.
- Select a pin to focus the globe and open the location card.
- Switch between visited and wishlist pins, or use “Surprise me”.
- Press Escape or the close button to dismiss a location.

## Build

```powershell
npm run build
npm run preview
```

Earth textures and country outlines are stored locally in `public/assets` so the globe does not depend on the original site's runtime assets.
