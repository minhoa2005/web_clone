# Verification — 15 October 2026

Implemented the approved redesign locally. No deployment, physical-phone benchmark or Pingfusi human approval is claimed.

## Content and behavior

There are 36 records across six periods. Thirty-four cite supplied textbook pages; two cite official institutional supplements. Eighty-five cited page images are bundled. Relevant pages were extracted and inspected; this is not a claim to reading every page of the 440-page scan or independent historian sign-off. The founding conference interval and anniversary are distinguished. Post-2021 goals are not presented as achieved outcomes.

Seven Node tests pass, covering chronology/identifiers/periods, source assets, geographic references, Vietnamese search, filters, hash recovery and avoidance of invented policy locations. The existing build passed before changes; the final production build passes. The original project had no test script.

Browser checks used the production build in Chromium at 1280×720, 1440×900 and emulated 390×844. Verified navigation, accent-insensitive search, Paris event selection, source drawer, browser back restoration and 2D/3D switching. Traversing all 36 events forward/backward and another 30 changes left one canvas after 100 changes. Endpoint navigation disabled correctly. This is not a formal memory-leak proof.

A mobile bug was reproduced before repair: changing events while reading deeply left the new heading at −65.75px. After repair the article returned to its start and the heading appeared at 140.25px. A post-commit reset targets document scrolling on mobile and the reading panel on desktop.

An independent agent finish reviewer identified four issues: mobile reading position, concealed globe marker, small learning text and oversized mobile dock. All four were repaired and re-reviewed as resolved, with no blocking residuals within that scope. The reviewer inspected code and replacement screenshots; the implementer supplied browser results. This is not human editorial approval.

## Performance

Geography fell from 3,083,491 to 143,145 bytes, a 95.4% reduction. Removed continuous rotation/effects, capped pixel ratio at 1.25 and paused rendering after camera/interaction settles. Pointer interaction, resize, visibility and new selections wake rendering. The engine is lazy-loaded, fonts use local WOFF2 subsets and source images load on request.

| Local production idle scene | Observation | Main-thread task time | Script time |
| --- | ---: | ---: | ---: |
| Original clone | 238.57s | 88.890s | 87.525s |
| Redesigned settled scene | 50.04s | 0.002s | 0s |

Chromium Performance metrics show removal of continuous idle work on this machine. These observations do not establish FPS, cold-load speed, battery life or physical-phone performance. Raw observations: `.impeccable/review/performance.json`. Three/globe chunks remain large and trigger Vite's chunk warning, although deferred. The full PDF is still a 17.9MB download when opened. Original reference assets remain unused at runtime.

## Evidence and limits

Final captures: `.impeccable/review/desktop.png` and `mobile.png`. The design detector returned no findings for changed UI files. Build and source tests do not replace an accessibility audit, expert content review, physical-device measurements or validation on the eventual host. Historical borders are not modeled. Timeline stops are equal-spaced and explicitly labeled as not proportional elapsed time.
