---
name: Dòng chảy lịch sử
description: An annotated historical folio for Vietnamese learning.
colors:
  paper: "#f3eddf"
  paper-light: "#faf6ec"
  ink: "#2c2922"
  muted: "#70695d"
  red: "#922e2b"
  red-hover: "#752420"
  line: "#d8cfbd"
  selected-paper: "#e9dfcc"
  button-text: "#fff8eb"
  field: "#fffaf1"
  world: "#1b2420"
  world-ink: "#e2ddcc"
  land: "#64705a"
  geographic-emphasis: "#e7cf9c"
  geographic-hover: "#e6c789"
typography:
  display:
    fontFamily: "Noto Serif, Georgia, serif"
    fontSize: "58px"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Noto Serif, Georgia, serif"
    fontSize: "clamp(30px,2.7vw,43px)"
    fontWeight: 500
    lineHeight: 1.22
    letterSpacing: "-.035em"
  title:
    fontFamily: "Noto Serif, Georgia, serif"
    fontSize: "29px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-.025em"
  body:
    fontFamily: "Be Vietnam Pro, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.9
  summary:
    fontFamily: "Be Vietnam Pro, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "Be Vietnam Pro, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 400
rounded:
  square: "0"
  dot: "50%"
spacing:
  compact: "8px"
  control: "12px"
  section: "24px"
  canvas: "30px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.button-text}"
    rounded: "{rounded.square}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.red-hover}"
    textColor: "{colors.button-text}"
  button-icon:
    backgroundColor: "transparent"
    rounded: "{rounded.square}"
    padding: "10px"
    width: "44px"
  search-field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    padding: "12px"
  period-selected:
    backgroundColor: "{colors.selected-paper}"
    textColor: "{colors.red}"
    padding: "12px 20px"
  source-container:
    backgroundColor: "transparent"
    padding: "18px 0"
  drawer:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink}"
    width: "min(680px,95vw)"
    height: "100dvh"
---

# Design System: Dòng chảy lịch sử

## Overview

**Creative North Star: "The Annotated Historical Folio"**

Warm paper, scholarly serif headings and restrained red annotations give the interface the character of a working historical volume. Vietnamese reading is primary; compact references and controls support a spacious account rather than compete with it.

The dark olive geographic field is a quiet companion to the paper. Its globe focuses on a selected record and settles. Opaque surfaces, fine rules and a book-derived mark preserve the approved editorial character; generated imagery, decorative particles and continuous visual effects have no role in this world.

**Key Characteristics:**

- Warm paper and dark olive tonal contrast.
- Serif dates and headings paired with Vietnamese reading typography.
- Square controls, fine rules and restrained red annotations.
- Geographic movement that settles after a deliberate selection.

## Colors

The palette combines aged paper, warm ink, archival red and subdued olive geography. Frontmatter owns the normative color values.

### Primary

- **Archival Red** (`red`): selected dates, active navigation, source links, primary actions and reading-surface focus outlines. `red-hover` darkens primary action hover.

### Secondary

- **Geographic Parchment** (`geographic-emphasis`): selected place names on the olive canvas. `geographic-hover` supplies its hover and focus response.
- **Muted Olive Land** (`land`): the globe's land surface; let the selected locations carry emphasis.

### Neutral

- **Warm Paper** (`paper`): the application frame and chronological dock.
- **Reading Ivory** (`paper-light`): the reading panel and drawers.
- **Warm Ink** (`ink`) and **Footnote Ink** (`muted`): reading hierarchy and supporting references.
- **Paper Rule** (`line`): fine boundaries between chapters, sources and controls.
- **Selected Paper** (`selected-paper`): selected periods and index results.
- **Field Ivory** (`field`) and **Button Ivory** (`button-text`): search surfaces and filled-action labels.
- **Olive Canvas** (`world`) and **Map Ivory** (`world-ink`): the geographic surface and its base foreground.

**The Annotation Rule.** Red marks selection, evidence and action; it does not become a broad decorative background.

## Typography

**Display and heading font:** self-hosted Noto Serif, with Georgia and serif fallbacks.
**Body and control font:** self-hosted Be Vietnam Pro, with Arial and sans-serif fallbacks.

Serif dates establish chronology; clear sans-serif prose carries sustained Vietnamese reading. Use the frontmatter roles as the normative desktop hierarchy. The summary is slightly larger than body prose; compact labels serve metadata rather than long explanations. The event heading balances within (15ch), extending to (18ch) on phones.

At the phone breakpoint the event heading becomes (36px), the year (55px), and drawer title (26px). At wide desktop the year becomes (70px). Preserve Vietnamese diacritics and the shipped self-hosted font subsets.

## Layout

The desktop application occupies the viewport (100dvh), with a minimum height (640px), header (86px), flexible workspace and chronological dock (190px). The workspace splits into reading (`minmax(360px,33%)`) and geographic (`minmax(0,1fr)`) regions. The reading region scrolls independently and uses padding (28px 34px 20px); boundaries are single fine rules.

At (1100px) and below, the reading column becomes `minmax(340px,39%)`, horizontal padding tightens, and the edition caption disappears. At (1600px) and above, the header grows to (94px), dock to (205px), and reading padding to (35px 48px 25px).

At (760px) and below, use document scrolling and stack the geographic panel above the narrative. The geographic panel is (280px) tall; narrative padding is (28px 24px). Header navigation keeps accessible names while showing icons. Drawers occupy the full viewport width.

The phone timeline is fixed to the bottom and collapsed by default: the mobile row has a minimum height (68px), plus its top border, giving a collapsed dock of (69px) before the bottom safe-area inset. Expanding reveals horizontally scrolling periods and event ticks. Reserve bottom document padding (90px plus safe area) when collapsed and (240px plus safe area) when expanded. Do not let the dock cover the final reading content.

## Elevation & Depth

Depth comes from opaque tonal regions, typography and rules. Reading surfaces and controls have no card shadows. The phone dock alone uses a subtle upward shadow (`0 -5px 20px rgb(36 30 22 / .07)`) to clarify its fixed position. The modal backdrop (`rgb(20 24 20 / .62)`) separates the drawer from the page without blurring it. The globe is matte, with no atmosphere or shiny surface treatment.

**The Quiet Surface Rule.** Use fine rules and tonal contrast for structure; reserve elevation for the fixed mobile dock and modal separation.

## Shapes

Controls are square-cornered. Sources, reading panels and drawers remain rectangular with fine (1px) borders or separators. Circles belong to map points and timeline dots. The active event dot combines a filled red center with a small paper-toned outline; selected periods use a top rule rather than a pill. Icons use simple stroked line work.

## Components

### Buttons and fields

Primary next actions are red with ivory text and a minimum height (44px). Hover deepens the red. Previous and icon actions remain square and restrained; icon controls are (44px) wide with minimum height (44px). Disabled controls use opacity (.35). Reading-surface focus is an offset outline (2px, 4px offset); geography uses its parchment focus color.

The search field is an ivory rectangle with a fine paper-rule border and padding (12px), accompanied by a visible search icon. Native select fields share the surface and border treatment. Keep descriptive labels and the empty-result recovery action.

### Chronological navigation

Six equal desktop period columns sit above a horizontal event track. A selected period gains selected paper, red text and a top rule (2px). The selected event uses a filled dot and red date. Event positions represent sequence, not proportional duration. Keep previous/next actions, arrow-key event navigation and a distinct mobile expander with an exposed expanded state.

### Evidence and drawers

The evidence preview is an edge-to-edge ruled row, not a floating card. Its page thumbnail is a textbook reproduction; it must never be presented as an event photograph. Supporting text leads to the source drawer.

Index and source drawers use native modal dialogs with focus handling, a close action, Escape dismissal and backdrop dismissal. Search results are ruled rows with a serif year; selected rows repeat the period selection treatment. Source-page tabs retain visible selected state. Source loading failures retain an accessible route to the full PDF.

### Geographic stage

The olive field holds a matte globe, compact map controls and selected place labels. A 2D orientation map remains available while 3D loads, on failure and through a deliberate mode switch. Contemporary geographic geometry is identified as orientation rather than a reconstruction of historical borders.

Camera movement lasts (550ms) after selection; reduced motion makes it immediate (0ms). Buttons and links transition color and background only (150ms, ease) when reduced motion is not requested. There is no automatic rotation, animated route dash, damping, pulse or continuous grain. Rendering wakes for camera changes, dragging, wheel input and resizing, then pauses at rest; hidden documents pause immediately. Wake windows preserve an in-flight camera transition rather than shorten it.

## Do's and Don'ts

### Do:

- **Do** keep Vietnamese reading and its diacritics clear in the shipped font pairing.
- **Do** use red for selected chronology, evidence and deliberate actions.
- **Do** preserve square controls, fine rules and opaque paper surfaces.
- **Do** keep the collapsed mobile dock clear of reading content and respect safe-area insets.
- **Do** let the globe settle and retain the 2D reading fallback.

### Don't:

- **Don't** add decorative particles, continuous rotation, grain or pulsing routes.
- **Don't** replace the editorial rules with rounded floating cards or blurred glass.
- **Don't** show a textbook page reproduction as an event photograph.
- **Don't** hide focus states or make dragging the only way to navigate.
- **Don't** imply that map geometry depicts historical borders or that timeline spacing measures duration.
