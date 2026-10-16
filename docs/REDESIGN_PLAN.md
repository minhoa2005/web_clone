> SUPERSEDED — The user rejected this redesign on 16 October 2026. Current scope: keep the original clone and replace its content only. See README.md and DESIGN.md.

# Dòng chảy lịch sử — Việt Nam trong bối cảnh thế giới

## 1. Purpose and status

This is a proposed redesign and implementation plan for a Vietnamese-first educational website about the history of the Communist Party of Vietnam, intended for Vietnamese students. It replaces the travel-gallery subject while retaining useful globe, navigation, and static-site foundations.

**Core concept:** move through history in chronological order; at every stop, connect the Party's decisions and developments in Vietnam with their geographical and international context. A persistent bottom timeline controls a readable event record and a deliberately quiet globe.

The learning outcome is that students can explain **what happened, when, where, in what context, and why it mattered**, with a visible route back to the source. The globe must explain geography or relationships at each stop; events without a meaningful geographic change still deserve space in the chronology.

This document is a planning deliverable. It does not claim that performance has been fixed, content fully transcribed, or the proposed design implemented. Final title and visual direction remain proposals.

## 2. Source authority and research findings

### Primary source

`docs/Giao trinh lich su dang cong san viet nam.pdf` is a 440-page scanned textbook. The title pages identify **Bộ Giáo dục và Đào tạo, Giáo trình Lịch sử Đảng Cộng sản Việt Nam, dành cho bậc đại học hệ không chuyên lý luận chính trị, Nhà xuất bản Chính trị quốc gia Sự thật, Hà Nội, 2021**.

The scan has no usable text layer in the inspected pages. Title pages, contents, chapter openings, and selected event pages were inspected visually. A complete event catalogue still requires OCR or manual transcription followed by checking against the page images. This plan does not imply all 440 pages have been read.

Verified structural anchors:

| Textbook section | Printed page anchors | Consequence for the website |
|---|---|---|
| Introductory chapter: subject, functions, tasks, methods of study | Contents pp. 437–438; opening listed at p. 11 | Put methods and learning guidance in a short introduction and source guide. |
| Chapter 1: Party formation and leadership of the struggle for power, 1930–1945 | Opening p. 35; context p. 36 onward | Preserve this chapter as a major navigation level. |
| International context and Nguyễn Ái Quốc's preparation | pp. 37–38, 49–58 | Add a clearly labelled pre-1930 context sequence. |
| Founding conference and first political programme | pp. 61–66 | Separate conference dates, anniversary, organizational developments, and programme content. |
| Chapter 2: the two resistance wars, 1945–1975 | Opening p. 127; sections pp. 128 and 180 | Divide the learning sequence at 1954 without losing the parent chapter. |
| Chapter 3: transition to socialism and renovation, from 1975 | Opening p. 237; sections pp. 238 and 260 | Divide at 1986 and preserve policy, economic, and institutional history alongside diplomacy. |
| Review questions, conclusion, references | Contents pp. 438–439 | Use chapter summaries and review prompts linked to their source pages. |

The supplied edition contains material referencing the Thirteenth Party Congress; inspected later pages include its cited documents. Therefore, **“đến nay” means the coverage of the 2021 edition**, not an automatically current account through 2026. Proposed navigation may say “1986–2021,” with a scope note that the actual endpoint is the last verified event covered by this edition. Goals for 2030 or 2045 must be labelled as stated objectives, never presented as events that have happened.

### Supplementary research

Use the textbook for teaching structure and core interpretation. Supplement with attributable records from museums, archives, the Party document portal, the Ministry of Foreign Affairs, and the institutions involved in an event.

- [Hồ Chí Minh Museum](https://baotanghochiminh.vn/) is a research starting point for biographical records and artifacts. Cite an individual record when using it, rather than the homepage.
- [Ministry of Foreign Affairs: Paris Agreement](https://web.mofa.gov.vn/web/guest/tin-chi-tiet/chi-tiet/hiep-dinh-paris-nam-1973-moc-son-choi-loi-cua-ngoai-giao-cach-mang-viet-nam-19040-139.html) corroborates the 27 January 1973 milestone discussed on textbook p. 227.
- [ASEAN's institutional chronology](https://asean.org/asean-milestone/) places Vietnam's admission on 28 July 1995 in Bandar Seri Begawan, Brunei. This is a useful example of why the location of an event must be researched, rather than assigning every ASEAN event to its secretariat in Jakarta.
- [WTO's accession record](https://www.wto.org/english/thewto_e/acc_e/a1_vietnam_e.htm) distinguishes negotiations and admission: Vietnam became a member on 11 January 2007. Do not collapse a 2006 accession decision into the effective membership date.

An important source discrepancy already exists: textbook p. 61 gives the founding conference as 6 January–7 February 1930 and explains the annual 3 February anniversary in a footnote. An [older Party portal account](https://tulieuvankien.dangcongsan.vn/ho-so-su-kien-nhan-chung/su-kien-va-nhan-chung/ngay-thanh-lap-dang-cong-san-viet-nam-3-2-1930-3342) gives a different conference range. Follow the supplied textbook for the core learning record, retain both citations in editorial notes, and do not silently blend them. Textbook p. 63 also distinguishes the later admission of Đông Dương Cộng sản Liên đoàn on 24 February.

## 3. What stays, what changes

| Existing foundation | Treatment |
|---|---|
| React, Vite, static deployment | Keep. No framework migration is needed for this redesign. |
| Globe drag, zoom, location focus | Keep the capability; verify it in the new layout and on touch devices. |
| Globe lifetime and resize handling | Preserve the single-instance approach and cleanup; strengthen asynchronous cleanup where necessary. |
| Place selection and detail panel | Adapt to event selection and an event reading pane. |
| Hash links and Escape handling | Retain shareable event links and appropriate dismissal; extend browser-history behavior deliberately. |
| Local assets and Vite relative base | Preserve correct nested deployment paths. |
| Country highlighting | Use selectively for orientation, subject to historical geography rules. |
| Existing Pingfusi records | Preserve as the previous clone's history. The new design needs its own brief and acceptance criteria. |
| Travel places, wishlist, Newark home hub, random selection | Replace with verified historical events, chapter navigation, next/previous steps, and relevant relationships. |
| External travel photos and CF branding | Remove from the redesigned experience. Source historical assets independently. |
| Permanent spinning, pulsing pins, moving dashes, animated grain | Remove from the default experience. Reintroduce only a bounded effect that helps explain an event and meets the performance budget. |

The old application supplies useful interaction patterns, but the previous hosted inspection did not visibly render the globe or photos. Asset delivery, initialization, and WebGL availability need their own verification before those foundations can be called reliable.

## 4. Recommended visual concept: an annotated historical folio

**Working title:** Dòng chảy lịch sử  
**Subtitle:** Lịch sử Đảng Cộng sản Việt Nam trong bối cảnh thế giới

The screen behaves like an open historical record: the selected event is the principal document, the globe explains its geographic context, and the timeline provides chronological reference. Its visual character comes from a Vietnamese scholarly publication and an annotated atlas: clear chapter numbering, dates, captions, restrained red rules, and source references.

The first viewport should immediately show a real event, its date, a readable explanation, the relevant geography, and how to move forward. A compact introductory option explains the purpose; no long cinematic introduction blocks the lesson.

### Proposed palette

| Role | Proposed colour | Use |
|---|---|---|
| Reading surface | Warm ivory `#F3EBDD` | Narrative pane, source drawer, timeline background |
| Main ink | Charcoal `#241E1A` | Body copy and headings |
| Primary accent | Deep red `#9E2929` | Active event, chapter rule, primary controls |
| Secondary accent | Aged brass `#A8844F` | Small emphasis, selected relationships, annotations |
| Globe field | Deep brown-black `#171B1A` | Quiet geographic canvas with muted land and sea |
| Supporting ink | Warm grey `#655D54` | Captions and secondary text, subject to contrast checks |

Use red as a meaningful selection and identity colour. Keep brass for accents rather than small body text on ivory. Verify every text and control pairing; these swatches are a proposal, not a completed accessibility audit.

### Type and imagery

- Use a Vietnamese-capable serif for chapter and event headings, paired with a clear sans serif for body copy, controls, and dates. Noto Serif and Be Vietnam Pro are candidates, subject to glyph and licence verification.
- Set desktop body copy around 17–18px with generous line spacing; mobile around 16–17px. Long passages open into a wider reading view.
- Prefer flat, opaque reading surfaces and simple separators. Keep labels legible without tiny uppercase tracking.
- Use authenticated photographs, documents, newspaper excerpts, and maps with captions, dates, archive credits, and rights information. Preserve meaningful original colour where present.
- Avoid simulated archival photographs. A generated illustration, if ever used, must be explicitly labelled and must not function as evidence.
- No animated paper texture, floating dust, particle field, heavy glass blur, or permanent atmospheric glow.

### Alternatives and tradeoff

A predominantly dark cartographic atlas would maximize globe scale but make extended textbook reading less comfortable. A conventional article with an occasional map would be the simplest reading experience but weaken the continuous time-and-place relationship. The annotated folio is recommended because it gives narrative and geography stable, distinct places while keeping the bottom timeline visible. Its main risk is crowding on smaller screens; the responsive layout below resolves that by stacking rather than shrinking the text.

## 5. Historical structure and release coverage

Retain the textbook's three main chapters. Within them, expose six manageable learning periods:

| Learning period | Student-facing label | What it needs to explain | Geographic emphasis |
|---|---|---|---|
| Before 1930 | Bối cảnh và quá trình chuẩn bị | Colonial context; Nguyễn Ái Quốc's search, political development, and organizational preparation | Vietnam, France, Soviet Union, China; other locations only where supported |
| 1930–1945 | Đảng ra đời và đấu tranh giành chính quyền | Founding, first programme, movements, strategy, and seizure of power | Hong Kong and domestic locations; international context where relevant |
| 1945–1954 | Bảo vệ chính quyền và kháng chiến | State building, Party leadership, resistance, diplomacy | Vietnam and Indochina, relevant foreign relationships, Geneva |
| 1954–1975 | Hai nhiệm vụ chiến lược và thống nhất đất nước | Developments in North and South, leadership decisions, international support, war and negotiations | Vietnam, Laos, Cambodia, relevant international actors, Paris |
| 1975–1986 | Xây dựng đất nước và bảo vệ Tổ quốc | State reunification, reconstruction, policy choices, conflicts, difficulties, and lessons | Vietnam and documented regional/international contexts |
| 1986–edition endpoint | Đổi mới và hội nhập quốc tế | Reform, congresses and policy development, economic and institutional change, diplomacy and integration | Vietnam, bilateral relations, regional and international institutions |

This is an editorial subdivision, not a replacement for the textbook's chapter titles. Shared boundary years are resolved by the event's actual date and chapter assignment, not by an ambiguous year-only filter.

Start with approximately **30–40 verified milestone records**, balanced across the six periods. The exact count is a content budget, not a historical claim. Do not let the international story displace domestic Party history: each chapter must include its key decisions, programmes, outcomes, difficulties, and lessons, not only journeys and treaties.

### Initial event candidates

| Candidate stop | Evidence available for planning | Treatment before release |
|---|---|---|
| 1911 departure; 1919 demands; 1920 political turning point in France | Textbook pp. 50–51; museum records can supplement | Create separate stops; do not draw an invented complete travel itinerary. |
| 1923 Soviet Union; 1924–1927 Guangzhou organization and training | pp. 52, 55–57 | Connect the documented places and explain organizational preparation. |
| 1928 activity in Siam | p. 57 | Preserve the historical place name; research city-level precision separately. |
| Founding conference and first programme, 1930 | pp. 61–66 | Date interval, anniversary note, and programme content are distinct fields. |
| Movements and strategic developments, 1930–1945 | Chapter 1 and contents establish the scope | Select and transcribe the chapter's core milestones before publishing exact records. |
| Revolution and new state, 1945; Party leadership and resistance, 1945–1954 | Chapter openings pp. 127–128 establish scope | Verify individual dates, actors, and locations against the full relevant sections. |
| Geneva, 1954 | pp. 173–175 | Distinguish conference opening, agreement, participants, and outcomes. |
| Strategic developments, 1954–1975; Paris Agreement, 1973 | p. 180; pp. 226–230; MOFA record | Keep domestic developments in sequence; Paris is one diplomatic milestone within it. |
| 1975 transition, state reunification, and 1975–1986 policy period | pp. 231, 237–238, 259–260 | Distinguish the 1975 military outcome from subsequent state reunification. |
| Sixth Congress and Đổi mới, December 1986 | pp. 260–262 | Show policy content and domestic context; do not turn reform into a decorative international route. |
| ASEAN admission, 1995; WTO membership, 2007 | ASEAN and WTO institutional records | Cross-reference the textbook's integration discussion and label supplemental detail. |
| Later congresses and integration through the edition's endpoint | Later inspected pages and 2021 references establish coverage | Audit exact events and dates; keep future targets separate. |

Context from before 1911 remains accessible in the opening record. If the verified content catalogue makes earlier dates central, extend the timeline to include them rather than compressing them into the 1911 label.

## 6. Desktop composition

| Screen region | Contents and purpose |
|---|---|
| Compact top bar | Project name, current textbook chapter, “Mục lục,” “Nguồn tư liệu,” and display/accessibility controls |
| Left reading pane, approximately one third of the workspace | Date, title, short account, context, Party role, significance, archival media, source references |
| Globe, remaining workspace | Selected and related locations, a short geographic explanation, minimal legend, zoom/reset controls |
| Bottom timeline, approximately 120–160px at desktop sizes | Chapter/period bands, chronological ticks, selected event/date, previous/next controls, and current position |
| Optional index or source drawer | Opens when requested; avoids a permanently dense third column |

Reserve real layout space for the timeline. It must not overlay or obscure the bottom of the article or globe controls. Use the actual globe container dimensions for camera framing, so the selected location remains visible beside the pane.

Example screen content:

> **Chương 1 · Đảng ra đời**  
> **1930 · Hội nghị thành lập Đảng Cộng sản Việt Nam**  
> Hương Cảng · Bối cảnh, nội dung, ý nghĩa  
> Giáo trình 2021, tr. 61–66 · Xem nguồn

The globe focuses on Hong Kong and displays only relationships explicitly attached to this record. A date detail explains the conference interval and the 3 February anniversary. Students can advance to the next event, open the first programme, or return to the period overview.

## 7. Timeline and navigation behavior

1. **Begin with a short overview and first selected context stop.** Show the chronological range, source edition, and “Bắt đầu hành trình.” Students may jump directly to a chapter without completing earlier stops.
2. **Use two timeline levels.** A compact overview shows the six periods; an expanded active-period track exposes its events. Students do not have to target dozens of dots across a century at once.
3. **Keep time representation honest.** Within a dated track, positions correspond to dates. Crowded events are clustered or opened in a list. If a sequence is spaced equally for readability, explicitly present it as an event sequence rather than a proportional time axis.
4. **Make event steps the default.** Previous/next buttons and focused keyboard navigation advance one verified record at a time. Selecting a year with multiple events opens the ordered choices.
5. **Make scrubbing inexpensive.** During pointer movement update the date preview and selected tick; commit article and camera changes when the student releases or chooses an event. Do not recreate the globe or rebuild geometry on every pointer movement.
6. **Synchronize from one selected event.** Timeline, article, globe, active chapter, and URL all derive from the same identifier. A selected place alone cannot silently change the chronology.
7. **Support multiple events in one place.** Clicking a pin opens the events for that location within the active period, ordered chronologically. Selecting an event changes the date and narrative together.
8. **Provide meaningful return paths.** Closing a source or media drawer returns focus to its trigger. Returning to the overview preserves the chosen period. Browser Back/Forward restores committed event choices; continuous scrub previews do not flood history.
9. **Keep playback optional and out of the first release.** Manual progression suits study. A later presentation mode can advance on explicit input or a generous adjustable interval, pause on interaction, and obey reduced-motion preferences.
10. **Support shareable links.** For example, `#event=hoi-nghi-thanh-lap-dang-1930`; reload restores the record and period. Invalid links offer the overview instead of crashing.

## 8. Globe semantics and historical geography

- Show the active event and a small set of relevant places. Default to approximately 4–12 visible markers and no more than four relationship lines; dense records use a selectable list rather than an unreadable globe.
- Replace the Newark-centered route network completely. Every link needs a documented meaning: journey, organizational connection, negotiation, diplomatic relationship, or contextual connection.
- Use a legend and labels to distinguish relationships. A schematic connection must not look like a documented ship route, troop movement, or precisely reconstructed border.
- Store **where an event occurred**, **which actors participated**, and **which places it affected** separately. A conference in Switzerland involving several states is one venue with multiple participants, not multiple identical location events.
- Use historical names in the narrative, with present-day orientation where useful: for example, “Mátxcơva, Liên Xô (nay thuộc Liên bang Nga)” and “Xiêm (nay là Thái Lan).” Verify naming against the event date.
- Existing country geometry is a contemporary orientation layer. Label it clearly and do not portray it as a map of historical sovereignty. Default to muted coastlines and event points where modern country fills could mislead.
- Only add a historical boundary overlay when its date, source, extent, and legend have been verified. It can be a later feature; an unsourced changing-border animation must not be invented.
- Use city/region-level precision if that is all the source supports. Never create a precise building coordinate simply to fill a data field.
- Allow events with no specific venue. Their text remains fully usable; the globe may show a labelled regional context without inventing a point.
- Stop camera movement after a short transition. No automatic spinning while reading. If both endpoints cannot be seen at once, offer labelled location choices rather than forcing a confusing rotation.

## 9. Event record and sources

Keep the content as small, versioned local JavaScript or JSON modules. A backend, CMS, large state library, and search service are unnecessary for the first release.

Each event needs:

| Field group | Required information |
|---|---|
| Identity | Stable ID, Vietnamese title, parent chapter and period, narrative order |
| Dates | Display label, known start/end, precision (day/month/year/range), anniversary or interpretive note where relevant |
| Learning content | Short summary, context, Party role/decision, outcome/significance, optional review question |
| Geography | Venue/location references, historical names, modern orientation labels, coordinate precision; geography may be absent |
| Relationships | From/to places, type, explanation, evidence; optional rather than generated by proximity |
| Sources | Document ID or URL, printed page and PDF page where applicable, short locator, source role, checked date, editorial status |
| Media | File, caption, date, archive/creator, source URL, rights, alt text, image dimensions |

Separate shared locations and sources from event records to avoid contradictory names and repeated reference metadata. Keep the implementation small: events, places, and sources are sufficient until the content proves a need for more.

A source drawer shows the textbook edition and relevant page references first, followed by supplementary evidence. Provide a page-image excerpt or a PDF link where permitted, but do not load the entire 440-page scan during initial navigation. Verify the relationship between printed page numbers and PDF page indices rather than assuming a fixed offset for every file.

Search should support Vietnamese with and without diacritics, dates, place names, and key terms. Search results retain event dates and chapters. A place filter must say that it narrows the results; the chapter overview remains available so students can recover chronological context.

## 10. Performance remediation

### Known code facts versus unknown bottlenecks

The current code enables permanent auto-rotation, damping, animated dashes on all location arcs, pulsating DOM markers, a broad atmospheric effect, an animated grain layer, and a full country polygon layer. The grain element extends beyond the viewport with `inset: -100%`. The country GeoJSON is approximately **3.08 MB before transfer compression**; the Earth image is approximately **95 KB**, and the bump map approximately **378 KB**.

There is **no separate particle layer configured in the inspected application**. Reducing decoration is still appropriate, but “too many particles” is not yet a measured root cause. Invisible globe/media behavior also needs diagnosis independently of frame-rate problems.

### Ordered engineering work

**A. Reproduce and record the baseline.** Test a production build at a fixed desktop viewport and a representative physical phone. Record hardware, browser, DPR, network conditions, cold/warm loading, frame times while dragging and changing events, main-thread activity, rendering cost where observable, transfer size, and memory after repeated navigation. Compare the same scenario before and after each material change.

**B. Resolve rendering failures first.** Verify nested asset URLs, successful responses, image decoding, globe-ready state, WebGL capability, and console failures. Distinguish unsupported/failed rendering from a slow but working scene. Keep readable content and a visible error/fallback available throughout.

**C. Remove continuous decoration.** Remove grain animation and all pin pulses, disable automatic rotation and dash animation, remove the atmosphere and bump texture in the initial lightweight scene, and replace panel blur with opaque surfaces. This also makes reading calmer. Profile the meaningful changes independently so improvement can be attributed.

**D. Reduce active scene work.** Render the selected event's points and relationships rather than the entire catalogue. Start with simple static markers; reserve HTML for a selected label or a small number of accessible targets. Keep a full HTML event list as the keyboard equivalent. Use static line arcs where possible instead of tubes; lower curve subdivisions only as far as the visible result permits. Do not enable point merging if individual point interaction depends on an API that merging disables.

**E. Simplify geography.** Produce a lightweight orientation asset, measure transfer and geometry cost, and load detailed geometry only when needed. Prefer selected-country/region geometry over transparent polygon caps for the whole world. Target a simplified base geography payload of at most approximately 500 KB uncompressed, then verify that important locations and coastlines are retained. This is an engineering target, not permission to distort historical geography.

**F. Bound rendering resolution.** Start around DPR 1 for constrained devices and cap higher-quality rendering around 1.5, with an explicit total drawing-buffer budget. Confirm the locked library's renderer behavior before changing it. Avoid blindly multiplying canvas resolution by the full device DPR. Lower detail can soften the globe slightly while keeping HTML text sharp.

**G. Separate page readiness from 3D readiness.** Load the timeline and current text immediately; dynamically load the globe code and geography afterward. Keep the initial article usable if the globe takes longer. Preload only the next useful media asset, not all chapters or the textbook scan.

**H. Control render lifetime carefully.** Pause rendering in a hidden tab and resume on visibility. Investigate true idle/on-demand rendering only with tested wake-up behavior for drag, wheel, touch, resize, loaded textures, data changes, and camera transitions. Globe.GL's documented `pauseAnimation()` also cancels interaction, so calling it on a visible globe and assuming interaction will wake it is not a complete solution. Do not add a second render loop over the library's existing one.

**I. Keep the scene stable.** Initialize one globe instance and update its data. React scrubbing must not reinitialize WebGL. Cancel or ignore late asynchronous responses after disposal; remove listeners, observers, timers, and GPU resources on cleanup. Preserve development Strict Mode and test production separately rather than hiding lifecycle defects by disabling it.

**J. Optimize media and verify fallback.** Use appropriately sized local/approved archive images, modern image formats where suitable, explicit dimensions, and lazy loading below the selected record. A failed image shows a captioned unavailable state. A failed WebGL context offers an authored static locator or simplified 2D map plus the complete event list, timeline, text, and sources.

Technical references: [Globe.GL API](https://globe.gl/), [Three.js on-demand rendering](https://threejs.org/manual/pages/rendering-on-demand.html), and [Three.js drawing-buffer/responsive guidance](https://threejs.org/manual/pages/responsive.html). Check APIs against the installed lockfile version during implementation; current documentation alone does not prove compatibility.

### Proposed acceptance targets

| Measure | Target and test conditions |
|---|---|
| Reading readiness | On a recorded midrange-phone/4G test profile, current text and timeline usable within 2 seconds; globe enhancement may finish afterward. |
| LCP and layout stability | LCP at most 2.5 seconds and CLS at most 0.1 in the agreed test profile; confirm in field data after deployment where available. |
| Control response | Selection feedback within 100 ms; INP at most 200 ms once measurable. Camera movement must not delay text selection. |
| Interactive rendering | Target 60 fps desktop and at least 30 fps on the agreed midrange phone; report p95 frame time, not only average FPS. Use a defined 10-second drag scenario. |
| Hidden tab | No active globe animation work after visibility pause settles. |
| Repeated navigation | After 100 next/previous changes, no extra canvases, repeated resource accumulation, or continuing upward memory trend after collection/settling. |
| Degraded mode | Timeline, reading, event selection, and citations work with WebGL unavailable and with images failing. |

Targets are proposed gates, not measured results or guarantees across every device. Name the acceptance devices before declaring a performance pass. If a target fails, first reduce decorative and geometric cost; preserve the educational content and essential controls.

## 11. Responsive behavior and accessibility

**Desktop:** reading pane beside globe; timeline spans the reserved bottom strip. Use a drawer for chapter index or sources. Support 1280px and 1440px layouts as well as wider screens.

**Tablet:** reduce chrome and optionally collapse the reading pane. Keep the current date and next/previous controls visible. Do not leave a large panel floating over the selected place.

**Phone:** use normal vertical document flow, with the globe or static locator above a readable event record. A compact bottom dock shows the current date and previous/next actions, with an expandable period track. Reserve safe-area space and keep sources reachable. Do not reproduce the current full-height overflow lock if it prevents reading long content.

All interactive paths need keyboard equivalents. Timeline ticks are labelled buttons; a slider, if included, has a meaningful date value and keyboard behavior. Scope arrow-key handling to focused controls so it does not override normal reading. Use approximately 44px touch targets, visible focus, meaningful headings, text labels in addition to colour, and contrast-tested text. Respect reduced motion in both CSS and globe/camera behavior. A drawer acting as a modal must manage focus and return it when dismissed; a non-modal reading pane must not trap focus.

Test Vietnamese names and diacritics at real sizes, text zoom at 200%, small screens, long titles, same-year clusters, image failures, and a screen-reader route through the timeline and source records.

## 12. Sequential implementation plan

| Phase | Work | Reviewable output and exit criterion |
|---|---|---|
| 1. Baseline and preservation | Record current production behavior and rendering failures; capture reproducible performance; preserve old source state and Pingfusi history. | Baseline evidence and a list of working/broken capabilities. No claim of a speed fix without numbers. |
| 2. Source inventory and chronology | OCR/transcribe relevant pages, verify against images, create period/event catalogue, record source conflicts, determine edition endpoint. | A balanced 30–40-event candidate matrix, each entry dated at supported precision and linked to evidence; unverified entries stay out of publication. |
| 3. Content prototype | Fully author three records that exercise different needs: founding conference, Geneva/Paris negotiation, and domestic Đổi mới policy. Define shared locations and sources. | Test data demonstrates intervals, multiple actors, historical names, an event with few/no international lines, and working citations. |
| 4. Performance-first globe repair | Fix asset/WebGL failures; remove continuous effects; constrain markers, arcs, geometry, and resolution; add loading/failure states. | A working globe and first before/after measurements on the baseline devices. |
| 5. Layout and visual prototype | Implement the proposed folio layout, palette/type, bottom timeline space, one representative record, and phone composition. | A concrete desktop/phone preview for design review, with real Vietnamese content and no placeholder travel branding. |
| 6. Timeline and state integration | Connect event selection, chapter navigation, next/previous, URL state, browser history, and globe focus. | A coherent vertical slice: reload/deep link/Back/Forward restore the same event everywhere; scrubbing does not recreate the scene. |
| 7. Full content and archive media | Populate all approved periods, add policy explanations and chapter summaries, asset credits, source drawer, and basic local search. | All published records have complete references; no travel data, invented routes, uncredited images, or misleading historical fills. |
| 8. Accessibility and degraded modes | Complete keyboard and screen-reader flows, touch handling, reduced motion, long-form reading, and WebGL/image failure fallback. | Students can complete the learning sequence and inspect its sources without dragging or relying on WebGL. |
| 9. Verification and preview release | Run behavior checks and production build; compare performance against baseline; inspect desktop and phone; check final source citations and nested deployment paths. | Versioned preview, measured report, content-review notes, and an explicit list of any remaining limitations. |

Implement in small, reviewable changes. Keep content work distinct from renderer changes where possible so historical mistakes and performance regressions are easy to trace.

## 13. Code areas and scope control

- `src/App.jsx`: retain the application entry; replace travel-specific state and UI with event/chapter state. Extract the globe and timeline when their responsibilities become substantial, not an entire generic component framework.
- `src/places.js`: preserve old travel data in Git history; replace its role with small historical events/places/sources modules. Avoid retaining unused wishlist aliases in the new runtime.
- `src/style.css`: establish the new tokens and layout, remove decorative animations, and implement readable phone flow.
- `index.html`: update Vietnamese language, title, description, fallback content, fonts, and initial non-3D experience.
- `public/assets/`: retain reusable Earth assets only where useful; add optimized geography and independently sourced historical media with attribution metadata.
- `vite.config.js`: preserve relative base handling and build compatibility. Revisit chunking only from bundle evidence.
- `context.md`: after implementation, update the project description so future work does not inherit the travel-clone brief.
- `targets/field-atlas/`: preserve. A redesign should not overwrite old review receipts or claim to pass the original pixel-matching contract.

No dependency upgrade, new state library, animation package, CMS, backend, user accounts, or 3D-engine replacement is assumed. If the existing globe library cannot meet the measured budgets after bounded optimization, present that evidence before proposing an engine replacement.

## 14. Verification and release definition

There is currently no test script in `package.json`. During implementation, use a small behavior-focused test setup only where it proves meaningful behavior. For any rendering or state bug being fixed, first reproduce it with an automated test where feasible; if WebGL cannot be exercised reliably in that environment, record a repeatable browser reproduction and the limitation.

Required checks:

1. Chronology is stable; date ranges and partial dates do not acquire invented precision; events belong to the correct periods.
2. Every published event has valid sources and geographic references, or an explicit non-geographic treatment.
3. Event selection updates article, timeline, chapter, globe, and URL coherently; multiple events at one location remain selectable.
4. Deep links, invalid links, reload, Back/Forward, keyboard selection, and drawer dismissal work.
5. Source and map failure states are visible and usable; the application does not silently hide missing evidence.
6. Lifecycle cleanup handles Strict Mode, delayed geography responses, resize, navigation, and visibility changes without duplicate scenes.
7. Desktop and mobile screenshots show readable Vietnamese, complete controls, and no timeline overlap. Verify touch gestures on a physical device where available and state what was actually tested.
8. Production build and a nested-path preview resolve every required asset. Test the hosted result, not only localhost.
9. Performance is reported against the recorded baseline using identical scenarios and named devices.
10. A content reviewer checks historical accuracy and learning coverage; a design review evaluates this educational brief. A new Pingfusi review is optional if available and separately authorized, and must not reuse the old clone-identical verdict as the redesign's goal.

The first release is complete when all six periods contain approved content, students can follow the chronology and understand each location's role, citations are usable, the core journey survives loss of WebGL, and agreed performance targets are demonstrated. Later additions can include presentation playback, quizzes, historical boundary layers, and a separately sourced post-2021 extension.

## 15. Remaining decisions

The user has confirmed Vietnamese students and Vietnamese-first content. Before implementation, resolve the proposed title/visual composition, the person or process that signs off historical content, and the acceptance devices. A later-than-textbook extension is optional; the default plan remains faithful to the supplied 2021 edition.

The recommended first implementation milestone is a **fast, cited three-event vertical slice** with the final timeline/state model. It proves that the globe, chronology, source handling, reading layout, and performance approach work together before the whole textbook-derived catalogue is populated.
