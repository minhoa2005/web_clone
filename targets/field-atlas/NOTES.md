# Field Atlas clone notes

| Iteration | Observation | Gate/reviewer | Change |
| --- | --- | --- | --- |
| 1 | The kit's headless and headful Chrome runners both refused the live page's measurement probe at 14 rAF Hz after three samples. | Environment refusal, not a visual gate result. | Used the named browser fallback as far as the available browser controls permit; adapted the globe in the requested React/Vite stack from the public page's authored HTML, CSS, and JavaScript. |
| 2 | The React entry initially failed because the JSX transform used the classic runtime without a React binding in `App.jsx`. | Local browser AX tree exposed `React is not defined`. | Added the React import to the component; the app now renders and interactions are visible. |
| 3 | The first Florence deep link needed its active map mode and country highlight restored when the globe data finishes loading. | Source behavior and local interaction inspection. | Initialize mode from the hash and apply the selected country when the polygon data arrives. |
| 4 | Clone-only capture refused the WebGL page at 6–8 rAF Hz in both headless and headful runners; the live page had already refused at 14 rAF Hz. | Pingfusi compositor probes; the gates were recorded as environment-blocked. | Published the Vite build for the scoped human review, with the globe as the review region. |

The requested clone scope is the globe experience: Earth, route arcs, location pins, title, mode switch, surprise action, and a compact location detail panel. The reference's separate photo gallery and place index are outside that scope.

The target width remains Pingfusi's default 1728px; DPR is set to 1 to reduce rendering cost. The review draft is the `dist/` build recorded by `pingfusi publish --target field-atlas`. The review round is intentionally out of band because the measurement and behavior capture gates were blocked by the compositor probe.
