# Motion systems benchmark

Nine production design systems were analyzed: Material Design 3, Shopify Polaris, IBM Carbon, Microsoft Fluent 2, Apple HIG, Adobe Spectrum, GitHub Primer, eBay Skin, and Uber Base. The research focused on what each system tokenizes, how those tokens are named, how far each system extends along the composition depth axis, and what implicit positions each system takes on unresolved questions in motion token design. Two additional systems (Wise, Spotify Encore) are known to have motion token work but could not be fully benchmarked — see the final section.

---

## Cross-system findings

### 1. Duration + semantically named cubic-beziers is the universal baseline

All nine systems, without exception, tokenize a duration scale and a set of named easing curves. The duration values differ; the naming conventions differ; but the structure is identical. This is the settled, uncontroversial layer of motion token design.

What is less settled is the naming logic. eBay Skin anchors its minimum duration to hardware: `instant = 17ms` is one video frame at 60fps. Adobe Spectrum decouples token name from value entirely (`–100` does not mean 100ms). Uber Base uses a weight-rank scale where `timing100 = 250ms`. GitHub Primer exposes two layers — raw millisecond-named tokens at the primitive level (`duration.100 = 100ms`) and intent-named tokens at the semantic level (`micro`, `short`, `medium`, `long`). The name-value coupling is itself a design decision.

### 2. Spring tokens exist on native platforms; the web remains tween-only

Apple HIG is entirely spring-first on iOS/macOS. Material Design 3 has six spring configs on Android (distinguished by spatial vs. effects use). On the web, no system in this benchmark publishes spring tokens — because CSS has no native spring primitive. The `linear()` function is the viable approximation path, but no system has shipped a resolver-based spring pipeline to web as part of a public token system.

This is not a gap in ambition. It is a resolution problem: the source token (spring config) must be transformed to a CSS-native output at build time. The resolver in this repository (`tokens/spring-resolver.js`) demonstrates the transformation for the three baseline spring configs.

### 3. Intent segmentation is present in most systems but encoded differently

A distinction between functional/utilitarian motion and expressive/decorative motion appears in five or six of the nine systems — but the mechanism for encoding that distinction varies widely:

- **IBM Carbon** encodes it structurally: every animation call must pass `motion("standard", "productive")` or `motion("standard", "expressive")`. The intent is a parameter, not a guideline.
- **Material Design 3** encodes it as two curve tracks: `standard` (utilitarian) and `emphasized` (M3's signature expressive curve, which cannot even be expressed as a single cubic-bezier — it has an inflection point).
- **Apple HIG** encodes it conditionally: overshoot (bounce) is only appropriate when the originating gesture has velocity (swipe, drag). A tap has no momentum — using a bouncy spring on a tap is physically unjustified.
- **eBay Skin** encodes it as a three-tier volume hierarchy: basic, utilitarian, immersive. The `bounce` curve exists but is limited to the expressive track.
- **Microsoft Fluent 2** states it as a design principle without a structural mechanism.
- **Shopify Polaris** prohibits expressive motion entirely. Primer similarly has no expressive or decorative category — all motion is functional.

The finding: intent segmentation is not a standard with a known correct implementation. Each system encodes the distinction in a way suited to its organizational context and constraints.

### 4. Composite transition tokens as the primary authoring surface appear in only one system

GitHub Primer is the only system in this benchmark that ships composite `transition.*` tokens (pre-combining duration + easing) as the expected authoring API. The CSS output is `--motion-transition-hover: var(--motion-duration-micro) var(--motion-easing-hover)`. Component authors pick a transition token, not a duration + easing pair. The underlying scalars exist but are positioned as implementation detail, not consumer API.

This is the depth-3 composite as a first-class citizen. Other systems leave the composition to component authors — each team assembles duration + easing at point of use.

### 5. No system has documented stagger or orchestration as tokens

IBM Carbon acknowledges stagger (20ms interval, 500ms cap) in its motion guidelines. Microsoft Fluent 2 describes stagger as a design principle. But no system in this benchmark ships stagger as a token — a named, referenceable value in a token file. The behavior is specified in documentation; the implementation is left to individual teams. This is the depth-4 gap.

### 6. DTCG coverage is incomplete for every system

No system can express its complete motion model in current DTCG token types (`duration`, `cubicBezier`, `transition`). Apple is the most extreme case — its entire system is spring-based, and no Apple spring token fits a `cubicBezier` or `transition` type. Material Design 3's emphasized easing cannot be stored as a single cubic-bezier. IBM Carbon's intent-parameterized system has no DTCG representation. Polaris's keyframe tokens have no DTCG type. Every system has found its own workaround (custom types, plain CSS strings, documentation-only specifications).

---

## Per-system summary

| System | Depth ceiling | Naming axis | Spring handling | Notable decision |
|---|---|---|---|---|
| Material Design 3 | Depth 2 (Android only) | Semantic scale + sub-index (`short1`, `long3`) | 6 spring configs on Android; tween on web | Spatial vs. effects spring distinction — different damping for position vs. opacity |
| Shopify Polaris | Depth 3 (keyframe objects) | Raw ms value (`duration-200`) | None | Tokenizes complete `@keyframes` animations; usage notes co-located with token definition |
| IBM Carbon | Depth 1 (scalars only) | Speed band + ordinal (`fast01`) | None | Intent declared structurally at point of use via `motion(type, mode)` function |
| Microsoft Fluent 2 | Depth 1 | Speed superlative + character outlier (`durationGentle`) | None | `durationGentle` breaks the speed logic — "gentle" is character, not speed |
| Apple HIG | Depth 2 | Perceptual character (`.smooth`, `.snappy`, `.bouncy`) | Spring-first, `response` not `duration` | Bounce only when gesture has momentum — conditional use encoded in guidance |
| Adobe Spectrum | Depth 1 | Abstract index decoupled from value (`–100` ≠ `100ms`) | None | Directional semantics: horizontal = progress, diagonal = disruption, rotational = waiting |
| GitHub Primer | Depth 3 (composite transitions) | Intent + trajectory (`enter`, `exit`, `move`, `hover`) | None | LLM usage metadata embedded in token definitions; composite transitions as primary API |
| eBay Skin | Depth 1 | Tier + ordinal (`short.1`) + direction in name (`quick.enter`) | None | `instant = 17ms` = one frame at 60fps; `bounce` via cubic-bezier overshoot (Y2 = 1.5) |
| Uber Base | Depth 1 | Weight rank, not ms value (`timing100 = 250ms`) | None | Documented revision after production testing: snackbar duration revised for being too slow |

---

## What is not documented

**Wise** has a motion token architecture visible in its design documentation. Duration tokens in 50ms increments, named transition patterns (Upwards, Sideways, Modal), a 60fps hard constraint, and a "light-weight material" easing philosophy are documented. The token values themselves live in Figma library files and are not in any public JSON or repository.

**Spotify Encore** lists motion as a Foundation category alongside color and typography. A music-driven motion philosophy is described publicly ("pulses, flourishes, glow"), and Lottie-first delivery for Wrapped has been used since at least 2023. No public token values, token names, or file exports have been found. The architecture and tooling are internal.

Both systems are included in the benchmark scope because their approaches are known to be distinctive — the Wise physical easing philosophy and the Spotify music-driven motion model are each different from anything in the nine fully benchmarked systems. The absence of public data is noted accurately, not as a criticism.
