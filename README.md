# Motion tokens — research artifact

This repository documents a two-axis taxonomy for motion token systems, a benchmark of nine production design systems, and a set of open questions that the existing literature has not resolved. It is not a finished specification or a recommended implementation. It is an invitation: if you have designed or shipped a motion token system in production, the questions in this repo are the ones we have not been able to answer from public data alone.

---

## The two-axis model

The standard token pyramid was designed primarily for color. In color, the pyramid describes one dimension: semantic distance from raw value to named intent. A color primitive (`red-500`) and a semantic alias (`color.action.danger`) are both scalars — what changes across levels is the name and the meaning, never the structure of the value.

Motion does not work this way. As you move up the abstraction hierarchy, the **structure** of the value changes. A motion primitive can be a single number (`duration: 200ms`) or a complete physics recipe (`spring.config: {stiffness, damping, mass}`). A semantic composite combines tokens from different domains (`motion.transition.enter: duration + easing`). An orchestration token describes a timing relationship between multiple elements — something color never needed.

This means motion tokens have two independent dimensions:

**Axis 1 — Abstraction level** (vertical): the semantic distance from raw value to usage context. The same axis color and typography use.

| Level | What it expresses | Who decides |
|---|---|---|
| Primitive | Raw brand values — duration scales, easing curves, spring configs | Brand / design system team |
| Semantic | Named intents — `motion.duration.fast`, `motion.spring.bouncy` | Design system team |
| Application | Named patterns tied to a UI role — `motion.appear`, `motion.stagger.list` | Design system + product teams |
| Component | Motion scoped to a specific component | Component team |

**Axis 2 — Composition depth** (horizontal): the structural complexity of the token's value. Unique to motion.

| Depth | What the value is | Example |
|---|---|---|
| 1 — Scalar | A single value | `duration.200 = 200ms` |
| 2 — Recipe | Multiple params from the same physical domain | `spring.config.gentle = {stiffness: 200, damping: 20, mass: 1}` |
| 3 — Composite | Values from different domains combined | `motion.transition.enter = {duration.slow + easing.enter}` |
| 4 — Orchestration | Timing relationships between elements | `motion.stagger.list = {interval: 20ms, from: start, cap: 500ms}` |
| 5 — Intent object | Platform-agnostic behavioral description, resolved by a build pipeline | `motion.emerge.panel = {behavior: "spring", direction: "from-below", ...}` |

**The full matrix:**

| | Depth 1 — Scalar | Depth 2 — Recipe | Depth 3 — Composite | Depth 4 — Orchestration | Depth 5 — Intent object |
|---|---|---|---|---|---|
| **Primitive** | `duration.200`, `easing.standard` | `spring.config.gentle` | — | — | — |
| **Semantic** | `motion.duration.fast`, `motion.easing.enter` | `motion.spring.bouncy` | `motion.transition.enter` | — | — |
| **Application** | — | — | `motion.appear` | `motion.stagger.list` | `motion.emerge.panel` *(frontier)* |
| **Component** | — | — | `component.button.press` | `component.toast.sequence` | — |

Empty cells reflect where current practice has landed, not architectural constraints. In color, the entire matrix collapses to a single column — depth 1, all levels. In motion, the matrix is populated across both dimensions.

**Aliasing vs. composition — the central distinction:**

- Aliasing is renaming: `motion.duration.fast → {duration.100}`. The consumer receives `100ms`. The token is a pointer.
- Composition is aggregation: `motion.transition.enter → {duration.400 + easing.enter}`. The consumer receives a two-parameter object. Neither source token expresses this alone.

Aliasing is familiar — it is the core mechanism of semantic tokens in color. Composition is the new operation that motion introduces. Each step from depth 1 to depth 5 is a composition operation, not a renaming.

---

## What we benchmarked

Nine design systems, analyzed for what they tokenize, how they name it, and how far along the composition depth axis they reach.

| System | Notable decision | Depth ceiling reached |
|---|---|---|
| Material Design 3 | Spring tokens on Android (spatial vs. effects — critical damping distinction). Web uses tween only. | Depth 2 (Android spring configs) |
| Shopify Polaris | Tokenizes complete `@keyframes` animations, not just parameters. | Depth 3 (keyframe objects) |
| IBM Carbon | `motion("standard", "productive")` — intent declared as a structural constraint at point of use, not optional documentation. | Depth 1 (scalars only, intent via function call) |
| Microsoft Fluent 2 | `durationGentle` breaks the speed logic of the scale — "gentle" is a character word, not a speed word. | Depth 1 |
| Apple HIG | Spring-first, uses "response" (perceived duration) not "duration" — deliberately avoids implying a fixed endpoint. | Depth 2 (spring recipes) |
| Adobe Spectrum 2 | Abstract index decoupled from value: token name `–100` does not correspond to `100ms`. | Depth 1 |
| GitHub Primer | Composite `transition` tokens as the primary authoring API — authors pick a transition, not a duration + easing pair. LLM usage metadata embedded in token definitions. | Depth 3 (composite transitions) |
| eBay Skin | 17ms "instant" anchored to one video frame at 60fps. Directional encoding in the token name (`quick.enter`, `soft.exit`). | Depth 1 |
| Uber Base | Non-literal weight scale: `timing100 = 250ms`. Numbers are relative rank, not millisecond values. | Depth 1 |

---

## What we built

- **A DTCG-formatted baseline token set** covering maturity levels 1–3: duration scale, semantic easings, semantic duration aliases, composite transitions, and spring configs with a custom type pending DTCG extension. See [`tokens/motion.baseline.json`](tokens/motion.baseline.json).
- **A spring resolver** (`tokens/spring-resolver.js`) that converts spring physics parameters (stiffness, damping, mass) into CSS `linear()` approximations. Supports three input parameterizations: raw physics, damping-ratio notation (Material Design 3), and Apple response/dampingFraction notation. Includes validation against M3 and Apple spring presets.
- **A Storybook prototype** demonstrating token-driven motion at levels 1–3: [Storybook →](https://hamilaism.github.io/motion-tokens)

---

## Open questions

1. **Is `prefers-reduced-motion` a mode or a condition?** Dark mode swaps values for other values. Reduced motion can eliminate entire categories: spring becomes tween, stagger becomes synchronous, orchestration becomes instant. This is not a value substitution — it is a structural reduction. How should the token system represent it?

2. **Is spring config the right minimum tokenizable unit?** The current position is that `stiffness`, `damping`, and `mass` are not independently tokenizable — they are parameters of a physics system, analogous to RGB channels in a color. But some teams expose stiffness independently. Is there a use case where varying a single parameter is the right authoring surface?

3. **How do teams segment motion intent in practice?** Carbon uses productive/expressive. Polaris prohibits expressive motion entirely. Other organizations split core/signature, UI/brand, or default/celebratory. We have not found evidence that any one vocabulary generalizes. What does intent segmentation look like at organizations that have maintained a token system for two or more years — and has the vocabulary changed?

4. **Does depth-5 (animation as object) exist in any production system today?** LottieFiles exports computed keyframe data (platform-agnostic, resolved by the player), which is the closest analog we found. But Lottie is a dump of resolved keyframes, not an abstract behavioral description resolved at build time. Is there a system that stores animated intent and resolves it per platform?

5. **What should a DTCG Motion module contain?** The October 2025 stable spec defines `duration`, `cubicBezier`, and `transition`. Spring configs, stagger tokens, orchestration relationships, and animation objects are absent. A Motion module is on the DTCG roadmap. This research proposes that the module needs at minimum: a `spring` composite type, a `stagger` type, and a mechanism for encoding platform-agnostic animated intent. What else is required, and what should be left out?

---

## How to engage

Open an issue, comment on the [`taxonomy.md`](taxonomy.md) file directly, or reach out to the authors. This research is feeding a chapter of *The Design Tokens Book* — if you have implemented a motion token system in production, we want to hear from you. Particularly useful: examples of intent segmentation that have remained stable across system iterations, evidence of depth-4 or depth-5 tokens in production, and any DTCG extension proposals for motion types.
