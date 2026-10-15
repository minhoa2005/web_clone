# Project context

## Purpose

Recreate the interactive Earth/map section of [Field Atlas](https://map.carlfung.dev/#florence) as a Vite + React application. The initial reference state is Florence. The visual direction is a dark atlas: satellite globe, red atmospheric edge, country outlines, red travel pins and routes, editorial serif headings, and restrained controls.

## Stack and commands

- React 19, Vite 7, `globe.gl` / Three.js.
- `npm install` installs dependencies.
- `npm run dev` starts the local development server.
- `npm run build` creates the static site in `dist/`.
- `npm run preview` serves the production build locally.

## Project map

- `src/App.jsx` — globe setup, rotation and pointer interaction, hash navigation, location detail, modes, and controls.
- `src/places.js` — home location, 49 visited places, 26 wishlist places, notes, coordinates, and original photo paths.
- `src/style.css` — dark editorial layout, globe pins, panels, controls, animation, and responsive rules.
- `src/main.jsx` — React entry point.
- `public/assets/earth-dark.jpg`, `earth-topology.png`, `countries-50m.geojson` — local globe textures and country geometry.
- `targets/field-atlas/` — Pingfusi target, captured reference artifacts, build copy, review receipts, and workflow state. Preserve this directory because it contains the hosted draft and review history.

## Current implementation

The globe auto-rotates; dragging and zooming pause rotation temporarily. It has animated arcs and pulsing clickable pins, visited/wishlist modes, a surprise action, place focus, country highlighting, Escape-to-close, and hash links such as `#florence`. It starts with Florence selected. The right navigation groups all locations by region and country; the detail panel uses photo paths from the source place data and original public image URLs.

Globe textures and country outlines use Vite's relative base URL so they load inside Pingfusi's nested draft path. The application has been built and visually checked locally at the Florence state.

## Pingfusi review status

The first independent human review (round 1) rejected the hosted draft with: “The globe and the images and lists are not rendered.” This exposed root-absolute asset URLs and missing location/photo UI. Those issues have been fixed in the current source and visually confirmed on both localhost and the hosted draft. Round 1 receipt: `targets/field-atlas/review-qa.json`; workflow record: `targets/field-atlas/workflow.json`. The first hosted draft is <https://pingfusi.com/d/q9QW9tL0Oo4O>.

The updated build is in `dist/` and synchronized to `targets/field-atlas/clone/`. Updated hosted draft: <https://pingfusi.com/d/KTf3mmU7bIcD>. Pingfusi refused to file review round 2 with `Insufficient credits (0)`; the independent review loop is blocked until the Pingfusi account is topped up at <https://pingfusi.com/dashboard>. Do not repeat the filing until credits are available.

The pixel-perfect workflow's measure, visual, coverage, strict, and behavior gates also remain environment-blocked because Pingfusi's compositor probes refused the WebGL reference and clone; keep those limitations documented rather than forcing gates green.
