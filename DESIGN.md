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

Keep the full-screen globe, top identity and counts, bottom floating mode switch, lower-left hero, desktop right-hand list and left slide-out panel. Retain the original 760px responsive rules. No new bottom timeline or reading columns.

## Elevation & Depth

Keep the original satellite textures, atmosphere, translucent controls and panel, grain and existing motion.

## Shapes

Preserve pill controls, circular pins and close action, and original rectangular photo slots.

## Components

The original two-mode switch selects two chronological ranges. The place list groups historical events by period and year. Detail notes contain historical text; photo slots contain identified textbook pages, with full-page links. Dragging, zoom, focus camera and Escape-to-close remain. The user's 18 October cleanup removes the hero text, top-left branding, summary counts, gesture instructions and random exploration action. Keep the centered title and chronological controls. Event-location choices reuse the existing list-button appearance inside the detail panel. Selecting a location centers its marker and highlights only its country; selected views do not auto-rotate. Connection lines are steady, never shooting dashes. Intentional selections use a 1.5-second camera journey and one-second country highlight rise/fall, as explicitly requested by the user. Initial loading honors reduced motion. The selected textbook page becomes the evidence surface (`src/EvidenceCard.jsx`): it flies from the ribbon into a slot beside the reading panel, stays clear of the body copy, and on small screens appears inside the panel instead. It is labelled as a scan with its page number, offers a restrained zoom and a link to the exact PDF page; supplement-only events show a clearly different external source. A selection states its event, year and travel status at once (`src/experience.js`), and the detail panel opens on the real camera and evidence signals rather than a fixed delay; a visible "Mở ngay" control skips the transition. Reduced motion goes straight to the readable state. The event list has no top fade obscuring its first heading. Scrollable lists and detail panels share narrow warm-gray thumbs on transparent dark tracks, with red hover and no arrow buttons. Era changes reset the event list to its start.

## Do's and Don'ts

- Do preserve the original stylesheet and component composition.
- Do use the supplied textbook and clearly identified supplementary sources.
- Do label source page reproductions as pages, never event photographs.
- Do keep events without verified venues free of invented coordinates.
- Do not reintroduce the rejected folio design or interpret this as a request for a new design.
