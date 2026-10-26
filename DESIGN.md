---
name: Lịch sử Đảng — original Field Atlas presentation
description: Original cloned interface, with Vietnamese history content only.
colors:
  ink: "#0b0b0c"
  bone: "#ece7de"
  vermilion: "#e6402e"
  muted: "rgba(236, 231, 222, .55)"
  hairline: "rgba(236, 231, 222, .14)"
---

## Overview

The user's 16 October correction requires the original clone's appearance and interactions. This supersedes the rejected annotated-folio design. The original stylesheet at commit ef7b1dd is the visual authority; this is a content adaptation.

## Colors

Retain the clone's black ground, bone lettering and red globe/pin emphasis. No paper, olive or replacement palette.

## Typography

Keep Archivo body and Bodoni Moda/Didot display typography, font sizes, tracking and italic treatments as defined in the original stylesheet. Translate labels to Vietnamese within their existing components.

## Layout

Keep the full-screen globe, bottom floating mode switch, desktop right-hand list and left slide-out panel. Retain the original 760px breakpoint. On small screens, replace the hidden desktop index with one compact bottom chronology that progresses from current context to nearby events to the full index; it must yield to the reading panel.

## Elevation & Depth

Keep the original satellite textures, atmosphere, translucent controls and panel, grain and existing motion.

## Shapes

Preserve pill controls, circular pins and close action, and original rectangular photo slots.

## Components

The original two-mode switch selects two chronological ranges. The place list groups historical events by period and year. Detail notes contain historical text; evidence slots contain identified textbook pages, with one source link in the reading panel. Dragging, focus camera and Escape-to-close remain. The user's cleanup removes the hero text, top-left branding, summary counts, gesture instructions and random exploration action. Keep the centered title and chronological controls. Event-location choices reuse the existing list-button appearance inside the detail panel. Selecting a location centers its marker and highlights only its country; selected views do not auto-rotate. Connection lines are steady, never shooting dashes. Intentional selections use a 1.5-second camera journey and one-second country highlight rise/fall. Initial loading honors reduced motion. The selected textbook page becomes the evidence surface (`src/EvidenceCard.jsx`): it flies from the ribbon into a slot beside the reading panel, stays clear of the body copy, and on small screens appears inside the panel. The reproduction itself carries no repeated header, metadata, note or controls. The detail panel opens on real camera and evidence signals rather than a fixed delay; reduced motion goes straight to the readable state. The event list has no top fade obscuring its first heading. Scrollable lists and detail panels share narrow warm-gray thumbs on transparent dark tracks, with red hover and no arrow buttons. Era changes reset the event list to its start.

Chapters come from the six periods already in the data (`src/chapters.js`) and appear through chronology grouping and the tour conclusion (`src/HistoricalRecap.jsx`), not as a persistent HUD or boundary card. The two era pills remain unchanged, and no new chapter copy is written.

The neutral overview is the first-load composition unless a valid event deep link is present. The globe, chronology and transport controls are self-explanatory; no first-use instructions or transition status card should obscure them. Evidence reproductions carry no duplicate title, page label, scan note, zoom action, or full-source action because attribution and the source link already live in the reading panel. All interactive targets are at least 44px, modal recap focus remains contained, and reduced-motion users receive the readable state without travel animation.

## Do's and Don'ts

- Do preserve the original stylesheet and component composition.
- Do use the supplied textbook and clearly identified supplementary sources.
- Do label source page reproductions as pages, never event photographs.
- Do keep events without verified venues free of invented coordinates.
- Do not reintroduce the rejected folio design or interpret this as a request for a new design.
