# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Vietnamese students studying the history of the Communist Party of Vietnam. Vietnamese is the primary interface and content language, confirmed by the user on 15 October 2026.

## Product Purpose

Explain the history of the Communist Party of Vietnam sequentially across historical periods, using an interactive globe to explain the places and international connections associated with events.

## Evidence and Content Authority

The supplied `docs/Giao trinh lich su dang cong san viet nam.pdf` is the primary source of truth. Its title pages identify the Ministry of Education and Training textbook for university students outside political theory majors, published by Nha xuat ban Chinh tri quoc gia Su that, Hanoi, 2021. Internet research may supplement the supplied document; additional claims must retain their own sources and must not silently change the textbook's coverage.

## Confirmed Requirements

- Prepare a comprehensive redesign concept and sequential implementation plan before implementation.
- Keep the working foundations of the existing globe application where they serve the new subject.
- Organize the learning experience chronologically, with a bottom timeline proposed by the user.
- Replace the travel-gallery subject, copy, and visual identity with an identity appropriate to the history topic.
- Address the reported severe lag and slow loading; decorative effects may be reduced or removed.
- Preserve source traceability and historically accurate relationships between dates, locations, and events.

## Existing Technical Constraints

React 19, Vite 7, and globe.gl are already present. The repository includes local globe assets and a relative-path static deployment setup. Saved Pingfusi artifacts are project history and must be preserved.

## Implemented Direction

The user requested implementation on 15 October 2026. The working title is **Dòng chảy lịch sử**, with warm ivory reading surfaces, restrained red emphasis and a dark olive geographic field. The first release contains 36 events across six periods, a bottom timeline, searchable contents, cited page previews and a 2D fallback. See DESIGN.md and docs/VERIFICATION.md.

## Open Decisions

- Final editorial sign-off and additions to the 36-event selection.
- Whether a separately sourced extension beyond the textbook's 2021 edition is wanted.
- Final deployment destination and named devices for performance acceptance.
