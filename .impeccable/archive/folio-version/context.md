# Project context

The user requested implementation of `docs/REDESIGN_PLAN.md` on 15 October 2026. The previous Field Atlas clone is now a Vietnamese educational history atlas, **Dòng chảy lịch sử**. See README.md for commands and file responsibilities, PRODUCT.md for requirements, DESIGN.md for design rules and docs/VERIFICATION.md for evidence and limits.

React 19, Vite 7 and globe.gl remain. One selected event drives narrative, timeline, location and hash navigation. The globe is lazy, has no particles or auto-rotation, and stops rendering at rest. A 2D orientation fallback preserves learning without WebGL. Source page images load on request; the full 17.9MB PDF is linked rather than fetched at startup.

The supplied 2021 textbook is authoritative. Coverage ends at 2021, with identified supplements for ASEAN and WTO. Modern shapes must never be described as historical borders. Distinguish event sites, international connections and nationwide policies without a single location.

Preserve `targets/field-atlas/`, containing original clone and review history. Earlier Pingfusi round 2 was blocked by zero credits; no new hosted redesign or Pingfusi human approval is claimed. The local redesign received a scoped independent agent review and browser checks recorded in docs/VERIFICATION.md.
