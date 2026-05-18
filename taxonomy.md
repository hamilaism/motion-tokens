# Motion token taxonomy — a two-axis model

This document proposes a taxonomy for motion token systems. The standard token pyramid — developed primarily for color and typography — describes one dimension: how far a token is from a raw value. Motion requires a second dimension: how structurally complex the token's value is. This document names and formalizes both axes, defines the full classification of motion token types, and identifies several structural challenges that distinguish motion from color and typography.

---

## The two-axis model

### Why color is not sufficient as a mental model

The standard token pyramid was designed primarily with color (and secondarily typography) in mind. In color, the pyramid describes one dimension: semantic distance from raw value to named intent. A color primitive is `red-500: #EF4444` — a scalar. A color semantic alias is `color.action.danger: {red-500}` — also a scalar, just with a name that carries intent. A component token `button.danger.background: {color.action.danger}` — still a scalar, scoped more tightly.

The nature of the value — a color — never changes at any level of the pyramid. What changes is only the name and the layer of meaning attached to it.

Motion does not work this way. As you move up the pyramid, the *structure* of the value changes. A motion primitive can be a scalar (`duration: 200ms`), but also a complete physics recipe (`spring.config: {stiffness, damping, mass}`). A semantic motion token can be a scalar alias (`motion.duration.fast`) or a cross-domain composite (`motion.transition.enter: duration + easing`). An application token can encode a temporal relationship between multiple elements (`motion.stagger.list`). A frontier token can describe a platform-agnostic behavioral intent (`motion.appear.panel`) with no fixed value at all.

This means motion tokens have **two independent dimensions**:

1. **Abstraction level** — the semantic distance from raw value to usage context. Same as color and typography.
2. **Composition depth** — the structural complexity of the token's value. Unique to motion.

Understanding both dimensions is necessary to design a motion token system. The standard pyramid only describes axis 1.

---

### Axis 1 — Abstraction levels

The abstraction level describes *why* a token exists and *who decides its value.*

#### Primitive

**Nature:** A raw design decision with no semantic meaning. Exists to represent a value in the brand palette — a specific duration, a specific curve, a specific physics recipe. Primitive tokens do not express how or when something moves; they express what options the brand has defined.

**Who decides:** Brand or design system team. These are the variables of the brand's motion DNA.

**Characteristics:**
- Context-agnostic. `duration.200` does not know whether it will be used for a button or a modal.
- Stable across product surfaces. The same primitives apply to the entire product.
- Variable across brands. Brand A might define `duration.200 = 200ms`; Brand B might remap the same token to `160ms` for a faster-feeling product.

**Why it exists:** The primitive layer is where brand variance is encoded. It is the token layer that changes when a brand changes its visual tempo, its physics personality, or its motion character. Without it, brand changes require finding and replacing values across the entire codebase.

**Examples:**
- `duration.100 = 100ms` — a point on the duration scale
- `easing.standard = cubic-bezier(0.4, 0, 0.2, 1)` — a named curve
- `spring.config.gentle = { stiffness: 200, damping: 20, mass: 1 }` — a physics recipe

---

#### Semantic

**Nature:** A named alias that references a primitive and adds intent. The semantic layer answers the question: *what is this motion for?* Not what it looks like, but what role it plays in the experience.

**Who decides:** Design system team. Semantic tokens represent the shared motion vocabulary — the agreed-upon language for describing motion intent.

**Characteristics:**
- Intent-bearing. `motion.duration.fast` communicates "this is the speed for micro-interactions" without hardcoding a value.
- Stable across product surfaces, but may vary across brands (a luxury brand and a playful brand may both have `motion.spring.bouncy` but point it at different spring configs).
- Referenced by components and application tokens — never by raw values.

**Why it exists:** The semantic layer is where design decisions are documented as intent. It is also where organizational motion vocabulary lives — the named intents that designers and developers share. When a designer says "use the entrance easing," that is a semantic token. When a developer implements reduced motion, they are switching semantic token resolutions.

**The aliasing/composition distinction:** semantic tokens can be pure aliases (one token pointing to one primitive) or composites (one token combining multiple primitives). This is where composition depth becomes significant — see Axis 2.

**Examples:**
- `motion.duration.fast → {duration.100}` — alias, pure aliasing
- `motion.easing.enter → {easing.decelerate}` — alias, pure aliasing
- `motion.spring.bouncy → {spring.config.bouncy}` — alias, behavioral primitive
- `motion.transition.enter → {duration.slow + easing.enter}` — composite, cross-domain

---

#### Application

**Nature:** A named animation pattern tied to a specific UI role or context. Application tokens combine semantic tokens with spatial or contextual information. They describe *what a specific thing does* in the interface — not how fast or how curved, but the complete choreography of a specific pattern.

**Who decides:** Design system team, in collaboration with product teams. Application tokens are the everyday currency for component authors.

**Characteristics:**
- Context-aware. `motion.appear` implies a specific spatial direction (from below), a specific timing (duration.slow), and a specific curve (easing.enter). It encodes a complete pattern.
- Reusable across components. Any component that needs to appear from below uses `motion.appear`.
- Not brand-variable at the token level — brand variance is inherited from the primitives and semantics referenced.

**Why it exists:** Application tokens prevent every component author from reinventing the same patterns. "Appear from below, slow, decelerating" is a recurring pattern. Without an application token, each component team decides the specifics independently — creating subtle inconsistencies. With the token, the decision is made once and shared.

**The relationship dimension:** some application tokens — stagger, orchestration — describe timing relationships between multiple elements, not properties of a single element. These are structurally different from all other token levels. See Axis 2.

**Examples:**
- `motion.appear → {transition.enter + from: below}` — appearance pattern
- `motion.dismiss → {transition.exit + to: below}` — dismissal pattern
- `motion.expand → {transition.expand + origin: top}` — accordion, panels
- `motion.stagger.list → {interval: 20ms, from: start, cap: 500ms}` — list entrance relationship

---

#### Component

**Nature:** A token scoped to a specific component that encodes the component's own motion polymorphism. Used when a component needs motion variants that cannot be expressed by application tokens alone.

**Who decides:** Component team, within the constraints set by the application layer.

**Characteristics:**
- Narrowly scoped. `component.modal.enter` is specific to the modal — not reusable elsewhere.
- Rarely needed. Most component animations can be covered by application tokens. Component-level motion tokens appear when a component has contextual motion behavior that cannot be generalized.
- Encodes polymorphism. A toast that needs to slide in from different directions depending on its position on screen requires component-level tokens.

**Why it exists:** The same reason component tokens exist for color — to handle cases that the semantic and application layers cannot generalize. The goal is to keep this layer thin.

**Examples:**
- `component.modal.enter → {motion.appear + overlay.fade}` — modal-specific entrance
- `component.toast.enter-left → {motion.slide-in.left}` — position-dependent variant
- `component.button.press → {motion.transition.feedback + scale: 0.97}` — tactile press effect

---

### Axis 2 — Composition depth

The composition depth describes *what type of thing the token's value is.* This is where motion fundamentally differs from color.

#### Depth 1 — Scalar

**Nature:** A single value of a single type. The token stores one number, one string, one unit. No internal structure.

**Why it matters:** This is the baseline. All color tokens are at this depth. Most duration and easing tokens are at this depth. A scalar token is the simplest possible unit — it resolves to a single CSS property value.

**Relationship to abstraction levels:** Scalars exist at all abstraction levels. `duration.200` (primitive) and `motion.duration.fast` (semantic alias) are both depth-1 scalars. The semantic alias does not add structural complexity — only meaning.

**Examples:**
- `duration.200 = 200ms`
- `easing.standard = cubic-bezier(0.4, 0, 0.2, 1)`
- `repeat = 3`
- `direction = alternate`

---

#### Depth 2 — Recipe

**Nature:** Multiple values from the **same physical domain** that must appear together to be meaningful. The sub-values are not independently tokenizable — they are parameters of a single behavioral system.

**The distinction from scalar:** `duration: 200ms` is meaningful on its own — you can use it in a CSS `transition-duration`. `stiffness: 300` is not — it is a parameter of a spring physics system and means nothing without `damping` and `mass`. The recipe is the minimum exposable unit.

**Why it matters:** Recipes introduce a new primitive type that does not exist in color or typography: the *behavioral primitive*. The brand's physics personality lives here — a crisp, tightly-damped spring versus a loose, bouncy one. These are brand decisions, but they operate at the level of physics parameters, not semantic intents.

**Analogy:** A recipe is like a color defined in a color space that requires three channels (L, C, H in OKLCH) to be meaningful. You cannot tokenize L alone. But the recipe is not a composite in the compositional sense — the three channels belong to the same system.

**Examples:**
- `spring.config.gentle = { stiffness: 200, damping: 20, mass: 1 }` — a spring physics recipe
- `spring.response.soft = { response: 0.5, dampingFraction: 0.8 }` — Apple's parametric model
- `elastic.bounce = { amplitude: 1.2, period: 0.4 }` — parametric easing recipe

---

#### Depth 3 — Composite (cross-domain)

**Nature:** Multiple values from **different domains** combined into a single token. The combination creates something that neither domain can express alone.

**The distinction from recipe:** A recipe combines parameters from the same system (spring physics). A composite combines tokens from entirely different systems: a duration (time domain) with an easing (behavior domain). Neither encodes the other. Together, they describe a complete tween transition.

**Why it matters:** Composites are the everyday currency of motion design. When a designer says "use the entrance transition," they mean a specific combination of timing and curve — not a duration alone, not an easing alone. The composite token is what makes that intention expressible as a single reference.

**Relationship to DTCG:** The DTCG `transition` type is a composite at depth 3. It is the only composite type currently specified. Spring configs, elastic recipes, and other combinations are not yet in the spec.

**Examples:**
- `motion.transition.enter = { duration: {duration.400}, easing: {easing.enter}, delay: 0 }` — time + behavior
- `motion.transition.feedback = { duration: {duration.50}, easing: {easing.standard} }` — time + behavior
- `motion.appear = { transition: {motion.transition.enter}, transform: from-below }` — behavior + space

---

#### Depth 4 — Orchestration

**Nature:** A token that describes **timing relationships between multiple elements**, not properties of a single element. The value is a set of rules for sequencing a collection.

**The structural break:** all previous depths describe a property of *one thing*. Orchestration tokens describe *how things relate to each other in time*. This is a categorically different type of value — it cannot resolve to a CSS property because it requires knowing the number and layout of the elements involved.

**Why it matters:** Stagger and orchestration are among the most common motion patterns in UI — list entrances, grid appearances, cascading feedback. Without orchestration tokens, every component team implements stagger independently, with no shared language for describing the intent.

**Placement in the hierarchy:** orchestration tokens belong natively at the Application or Component level, where the element count and layout are known. They cannot live at the Primitive or Semantic level because they need context to resolve.

**Examples:**
- `motion.stagger.list = { interval: 20ms, from: start, cap: 500ms }` — vertical list entrance
- `motion.stagger.grid = { interval: 30ms, from: center }` — grid entrance from center out
- `motion.sequence.onboarding = [ step1: appear, step2: {delay: 300ms, move}, step3: ... ]` — orchestrated sequence

---

#### Depth 5 — Intent object (frontier)

**Nature:** A platform-agnostic behavioral description that encodes *what something does* rather than *how it is implemented*. An intent object is resolved by a build pipeline into platform-specific output — different code per platform, same intent.

**Why it is different from all other depths:** At depths 1–4, the token value maps to a known CSS or WAAPI concept (a number, a curve, a set of parameters, a sequence rule). At depth 5, the token value is an abstract behavioral description with no direct CSS equivalent. The platform-specific code is generated by a resolver.

**Why it matters:** This is the motion equivalent of storing a color in a perceptual color space and generating platform-specific hex/P3/LCH values from it. The token describes intent in a format that is richer than any single platform's native representation. A resolver handles the transformation per target.

**Current status:** No production design system has implemented depth-5 tokens as described here. Lottie (After Effects to web/iOS/Android) is the closest analog, but it exports computed keyframe data — not an abstract behavioral intent. The intent object concept describes the token layer *above* what Lottie does — the source from which platform-specific output would be generated.

```json
// Example intent object (not yet implemented in any production system)
{
  "motion.emerge.panel": {
    "behavior": "spring",
    "direction": "from-below",
    "distance": "medium",
    "spring": { "$value": "{spring.config.gentle}" },
    "delay": { "$value": "{motion.delay.none}" }
  }
}

// Resolved by platform:
// CSS    → @keyframes + linear() spring approximation
// SwiftUI → .spring(response: 0.4, dampingFraction: 0.8) + .offset(y:)
// Compose → spring(stiffness=200, dampingRatio=0.8) + offset
// Lottie  → computed keyframe JSON
```

---

### The full matrix

These two axes are independent. A token's position on one axis does not determine its position on the other.

| | Depth 1 — Scalar | Depth 2 — Recipe | Depth 3 — Composite | Depth 4 — Orchestration | Depth 5 — Intent object |
|---|---|---|---|---|---|
| **Primitive** | `duration.200`, `easing.standard` | `spring.config.gentle` | — | — | — |
| **Semantic** | `motion.duration.fast`, `motion.easing.enter` | `motion.spring.bouncy` | `motion.transition.enter` | — | — |
| **Application** | — | — | `motion.appear` | `motion.stagger.list` | `motion.emerge.panel` *(frontier)* |
| **Component** | — | — | `component.button.press` | `component.toast.sequence` | — |

Empty cells are not architectural constraints — they are observations about where the current state of practice has landed. The matrix could be populated differently as the field evolves.

**Key observation:** in color, the entire matrix collapses to a single column — depth 1, all levels. In motion, the matrix is populated across both dimensions. This is what makes motion token design structurally more complex — not because it is inherently harder, but because it spans a larger design space.

---

### Aliasing vs. composition — the central distinction

Within the semantic level, two different operations are at work:

**Aliasing** is renaming. `motion.duration.fast → {duration.100}` adds a name with intent but does not change the value's nature or structure. The consumer receives `100ms`. The token is a pointer.

**Composition** is aggregation. `motion.transition.enter → {duration.400 + easing.enter}` creates something that neither source token can express. The consumer receives a two-parameter object. The token is a recipe built from other recipes.

Aliasing is familiar — it is the core mechanism of semantic tokens in color. Composition is the new operation that motion introduces. As you move from depth 1 to depth 5, each step is a composition operation, not just a renaming. This is why the standard "token = name + value" definition is insufficient for motion — at higher composition depths, "value" is itself a structured object.

---

## Full classification

### Primitives — scalar

Single value, no relationship to other parameters. Can exist on its own.

| Token | DTCG type | Example | Notes |
|---|---|---|---|
| `duration.*` | `duration` | `100ms`, `300ms` | Value scale |
| `delay.*` | `duration` | `50ms` | Same type as duration |
| `repeat-delay.*` | `duration` | `200ms` | |
| `end-delay.*` | `duration` | `100ms` | WAAPI only |
| `repeat` | number | `3`, `-1` (infinite) | |
| `direction` | enum | `normal`, `reverse`, `alternate` | |
| `frame-rate` | number | `24`, `60` | Lottie / video |

> **Note on spring scalars:** stiffness, damping, and mass are not standalone tokens. They are internal parameters of a spring config — analogous to R/G/B in a color, which are also not individually tokenizable. `stiffness: 300` has no meaning in isolation. The minimum tokenizable unit is the complete spring config at depth 2.

---

### Primitives — easing

Easings are scalars. A cubic-bezier `[0.4, 0, 0.2, 1]` contains 4 numbers but expresses **a single concept** — a curve. No one tokenizes a single control point. The criterion is consumption, not internal structure.

> **Qualification rule:** a token is scalar if its sub-values are not individually tokenizable and have no meaning in isolation. A token is composite if its sub-values have independent existence and can be varied separately.

| Token | DTCG type | Example | Notes |
|---|---|---|---|
| `easing.linear` | `cubicBezier` | `[0, 0, 1, 1]` | One curve = one concept |
| `easing.standard` | `cubicBezier` | `[0.4, 0, 0.2, 1]` | |
| `easing.decelerate` | `cubicBezier` | `[0, 0, 0.2, 1]` | |
| `easing.accelerate` | `cubicBezier` | `[0.4, 0, 1, 1]` | |
| `easing.steps.*` | steps | `steps(5, end)` | |

---

### Primitives — recipe (depth 2)

Multiple parameters from the same physical domain. Form a complete recipe.

| Token | Parameters | Example | Notes |
|---|---|---|---|
| `spring.config.*` | stiffness + damping + mass | `{ s: 300, d: 20, m: 1 }` | Named physics recipe |
| `spring.response.*` | response + dampingFraction | `{ r: 0.3, df: 0.8 }` | Apple abstraction (SwiftUI) |
| `elastic.*` | amplitude + period | `{ a: 1, p: 0.3 }` | GSAP parametric easing |
| `inertia.*` | power + timeConstant | `{ p: 0.8, tc: 700 }` | Post-gesture deceleration |

> These composites are **behavioral primitives**: they encode the parameters of a physics engine, not a usage intent. The brand chooses its physics recipes here.

---

### Semantic — scalar aliases

Named aliases by intent. Reference primitives, carry usage meaning.

| Token | Reference | Intent |
|---|---|---|
| `motion.duration.instant` | `{duration.50}` | Imperceptible feedback |
| `motion.duration.fast` | `{duration.100}` | Micro-interactions |
| `motion.duration.default` | `{duration.200}` | Standard transitions |
| `motion.duration.slow` | `{duration.400}` | Appearances, modals |
| `motion.duration.deliberate` | `{duration.700}` | Onboarding, storytelling |
| `motion.easing.enter` | `{easing.decelerate}` | Element arriving on screen |
| `motion.easing.exit` | `{easing.accelerate}` | Element leaving screen |
| `motion.easing.move` | `{easing.standard}` | Movement within the screen |
| `motion.easing.emphasize` | `{easing.emphasize}` | Drawing attention |

---

### Semantic — recipe aliases (depth 2)

Spring config aliases with intent.

| Token | Reference | Intent |
|---|---|---|
| `motion.spring.crisp` | `{spring.config.crisp}` | Sharp response, no overshoot |
| `motion.spring.gentle` | `{spring.config.gentle}` | Soft transition |
| `motion.spring.bouncy` | `{spring.config.bouncy}` | Expressive / playful brand |
| `motion.spring.snappy` | `{spring.config.snappy}` | Fast gesture feedback |

---

### Semantic — composite (depth 3, cross-domain)

Combines parameters from different domains. The DTCG `transition` type is a native example.

| Token | Parameters | Notes |
|---|---|---|
| `motion.transition.enter` | duration.slow + easing.enter + delay.0 | Element entrance |
| `motion.transition.exit` | duration.fast + easing.exit | Element exit |
| `motion.transition.move` | duration.default + easing.move | Repositioning |
| `motion.transition.expand` | duration.default + easing.decelerate | Expansion |
| `motion.transition.feedback` | duration.instant + easing.standard | Response to an action |

> Depth-3 composites are the everyday currency for components. This is the level at which designers and developers consume motion day-to-day.

---

### Semantic — modes and preferences

Not values, but contexts that modify the values of other tokens.

| Mode | What it affects | Behavior |
|---|---|---|
| `prefers-reduced-motion` | All durations, springs, staggers | Reduces or removes — see model challenges |
| `motion.intent.*` | Duration + easing + spring type | Org-defined intent segmentation |

> **Note on reduced-motion:** unlike dark mode (which swaps values), reduced-motion can eliminate entire categories (spring becomes tween, stagger becomes synchronous, orchestration becomes instant). It may be better treated as a system condition than a token mode.

> **Note on intent segmentation:** organizations define their own vocabulary at this level. IBM Carbon uses productive/expressive. Polaris prohibits expressive motion entirely. Other architectures: core/signature, standard/campaign, UI/brand, default/celebratory. The token system provides the mechanism; the organization defines the vocabulary.

> **On brand variance at the semantic level:** in color, the brand varies primitives and the semantic layer stays stable across brands. In motion, the animation type (tween vs. spring, and which spring personality) is itself a brand decision — but one that lands at the semantic level, not the primitive level. A luxury brand and a playful brand can share the same duration scale but diverge completely on `motion.spring.*`. Brand variance in motion operates at two levels simultaneously.

---

### Application — composite (depth 3–4)

Animations named by UI role. Combine semantic tokens and spatial context.

| Token | Parameters | Notes |
|---|---|---|
| `motion.appear` | transition.enter + from: below | Typical appearance |
| `motion.dismiss` | transition.exit + to: below | Disappearance |
| `motion.slide-in` | transition.enter + axis: x | Lateral entrance |
| `motion.expand` | transition.expand + origin: top | Accordion |
| `motion.fade` | duration.default + opacity only | Reduced-motion safe |

---

### Application — stagger (depth 4)

Stagger does not describe a property of an element but a **relationship between elements**. It belongs at this level because it requires context: how many elements, in what layout.

| Token | Parameters | Notes |
|---|---|---|
| `motion.stagger.list` | amount: 0.3s, from: start | Vertical lists |
| `motion.stagger.grid` | amount: 0.5s, from: center | Grids |
| `motion.stagger.cascade` | amount: 0.2s, from: start, ease: power2 | Pronounced cascade effect |

---

### Component — depth 4

Specific to a component. Combines application tokens and component semantic context.

| Token | Parameters | Notes |
|---|---|---|
| `component.modal.enter` | motion.appear + overlay.fade | |
| `component.toast.appear` | motion.slide-in + motion.stagger.list | |
| `component.accordion.expand` | motion.expand + component height | |
| `component.button.press` | motion.transition.feedback + scale | |

---

### Meta tokens

These tokens do not fit the standard primitive/semantic/component model. They condition the *relevance* of other tokens rather than their values.

| Token | What it declares | Impact |
|---|---|---|
| `motion.timeline-type` | `time` or `progress` | Makes `duration` relevant or not |
| `motion.intent-mode` | Org-defined vocabulary | Activates a named intent segment |
| `motion.engine` | `tween` or `spring` | Determines the composite type used |

---

## Motion metaphor taxonomy

Five types of metaphors emerged from analysis of production design systems.

### 1. Physical metaphor (Apple HIG)
Motion mimics the behavior of objects in the physical world: mass, elasticity, momentum, gravity. The spring is the embodiment of this metaphor. The goal is for the interface to stop "feeling like a computer."

### 2. Material metaphor (Material Design 3)
Surfaces have behavior, elevation, light. The standard/emphasized distinction encodes the "character" of the animated material. The emphasized curve is designed to be physically distinctive — not reproducible as a single cubic-bezier.

### 3. Character metaphor (IBM Carbon)
Productive vs. expressive: motion as an invisible tool (productive) vs. a moment marker (expressive). The metaphor is behavioral — motion signals whether the interface is serving the task or the experience.

### 4. Linguistic metaphor (Adobe Spectrum 2)
The tone of motion like the tone of text: formal, direct, casual, subtle. Movement direction carries semantics: horizontal means progress, diagonal means disruption, rotational means waiting.

### 5. Affordance / behavioral metaphor
What the object "does" in the world — its physical response to interaction. A button sinks (pressure), floats (elevation), lightens (activation), bounces back (confirmation). This metaphor is closest to interaction design thinking and most useful for building semantic vocabulary with product teams.

This is where the motion token connects to product intent: tokens do not name parameters (`duration.fast`) or abstract intents (`motion.enter`) — they name perceived behaviors (`motion.press`, `motion.lift`, `motion.emerge`).

### Naming axes

Five possible naming axes for a motion token:
1. **Physics:** spring, tween, elastic, inertia
2. **Intent:** enter, exit, move, emphasize
3. **Speed:** fast, slow, instant, deliberate
4. **Context:** modal, tooltip, page-transition
5. **Affordance:** press, lift, emerge, dismiss, settle

The affordance axis is the richest semantically and the most aligned with how designers think about interactions. It can coexist with other axes depending on the level of abstraction.

---

## Conceptual shifts

### 1. The universal baseline is not duration + cubic-bezier

Duration + cubic-bezier is the CSS view of the problem. In a platform-agnostic posture, the universal baseline is:

- **Time:** duration, delay, rhythm — universal across platforms
- **Behavior:** the shape of change over time (curve, spring, steps, inertia) — universal, platform-specific resolution
- **Change:** what varies (position, opacity, color, shape, path) — universal
- **Sequence:** temporal relationships between multiple changes — universal
- **Playback context:** trigger, repeat, direction, loop — universal

CSS is one resolution target among many. After Effects, SwiftUI, Android Compose, GSAP, Rive — all respond to the same abstractions with different syntax.

### 2. Spring on the web is a transformation problem, not a gap

CSS with `@keyframes` can express any animation by breaking it into steps. This is what `linear()` does: it encodes an algorithmically computed spring as a series of points. If a script generates it (Style Dictionary transform, build pipeline), the machine handles all complexity.

The source token is parametric (spring config: stiffness, damping, mass). The resolved token is the platform output: `linear(...)` for CSS, `spring(duration:bounce:)` for SwiftUI, `SpringSpec(stiffness, damping)` for Compose. This is a **transformation** problem, not a limitation. Design tokens with build pipelines exist precisely to solve this kind of problem.

### 3. Functional vs. expressive — an organizational architecture, not a prescription

"Functional vs. expressive" is not a universal taxonomy. It is one example of how an organization might segment motion intent. IBM Carbon made that choice. Polaris made the opposite choice (expressiveness prohibited). Other organizations might split differently: UI vs. brand/marketing, productive vs. celebratory, core vs. signature, standard vs. campaign.

The contribution is not "use functional/expressive" but rather: a motion token system should support organizational intent segmentation at the semantic level. The primitives (duration scales, curve libraries, spring configs) remain shared. What differs between organizations is the semantic layer — which intents are named, what constraints apply to each, and how those intents map to primitive values.

### 4. Spring spatial vs. spring effects

Animated properties have different value domains:
- **Spatial properties** (position, size): can slightly overshoot their target without breaking anything. Like a physical object that goes past its stopping point before settling.
- **Effect properties** (opacity, color): cannot exceed their bounds — opacity above 100% produces visual artifacts; out-of-gamut colors are invalid. A spring that overshoots opacity to 110% breaks the interface.

Material Design 3 encodes this distinction directly in its spring tokens: spatial springs use a damping ratio of 0.9 (slight overshoot allowed), effects springs use 1.0 (critically damped, no overshoot).

### 5. Directionality of abstraction — one-way decomposition

The token hierarchy appears symmetrical but is not bidirectionally permeable.

**Top-down (abstract to concrete):** always possible when the abstraction is parameterized. Apple's `.smooth` preset decomposes to `{response: 0.5, dampingFraction: 1.0}`, which converts to `{stiffness: 157, damping: 25, mass: 1}` via physics formula. This is a lossless decomposition. Resolvers perform this transformation at build time.

**Bottom-up (concrete to abstract):** not automatically possible. You cannot derive "gentle" from `stiffness: 300, damping: 20` — the semantic label encodes a *choice among all physically valid options*, and that choice is a brand decision. Many spring configs are physically valid for "gentle" behavior. The token system cannot pick one without editorial input.

**Implication for architecture:** definition always flows top-down (brand defines intent, build pipeline resolves to parameters). Validation can go bottom-up (verify that implemented parameters match declared intent). Generation of intent from parameters is not possible — that direction requires human judgment.

---

## Motion token maturity scale

Not every organization needs to implement the full model. The token system is additive — each level functions independently and adds sophistication without breaking what is below it.

| Level | What is tokenized | Who uses it | Technology needed |
|---|---|---|---|
| 1 — Duration + easing | Duration scale, named cubic-beziers | Any team starting with motion | DTCG `duration` + `cubicBezier` — CSS-native |
| 2 — Named semantics | Semantic aliases (motion.fast, motion.enter) | Teams wanting consistent motion vocabulary | DTCG reference tokens |
| 3 — Spring configs | Physics-based primitives and their semantic aliases | Brands with a physics-based identity | Custom composite type, resolver needed for web |
| 4 — Composite transitions | Duration + easing + spatial context combined | Design systems with formal motion guidelines | Custom composite token type |
| 5 — Orchestration / stagger | Relationship between elements, sequence rules | Systems animating list/grid entry/exit | Application-level tokens, resolver needed |
| 6 — Animation as object | Platform-agnostic animated intent, multi-target resolution | Organizations spanning web + native + marketing | Build pipeline with platform-specific resolvers |

Organizations entering at level 1 can move to level 2 without modifying existing tokens. Most production design systems today operate at levels 1–2. Levels 3–4 are present in the most advanced systems (Apple HIG, Material Design 3). Levels 5–6 have no documented production implementation.

---

## Model challenges

### 1. Spring introduces a new primitive type

In color, all primitives are standalone scalars (`red-500: #EF4444`). In motion, spring introduces a primitive that is not scalar: a `spring.config.*` is a complete recipe (stiffness + damping + mass) whose individual ingredients are not tokenizable independently. This expands the definition of "primitive" beyond the scalar case — it is not just "raw values" but "raw building blocks," some of which are scalars and some of which are recipes.

### 2. Brand variance leaks into the semantic level

Standard model: the brand varies primitives, the semantic layer stays stable. In motion, the animation type is a brand personality decision — a luxury brand uses slow, precise tweens; a tech brand uses crisp springs; a playful brand uses bouncy springs. This choice is not a primitive (it does not map to a single value) but it is also not pure intent (it encodes brand character). Brand variance in motion operates at two levels simultaneously: primitives (values) and semantic (nature of the animation).

### 3. `prefers-reduced-motion` is not a mode like dark mode

Dark mode swaps values for other values — the semantic token remains, its resolution changes. `prefers-reduced-motion` can eliminate entire categories: no spring (tween instead), no stagger (synchronous), no orchestration (instant). This is not a value substitution — it is a structural reduction of the system. One proposal: rather than overriding values, reduced-motion activates a subset of tokens — only those that are motion-safe (short durations, opacity only, no transforms). This remains an open question.

### 4. Stagger and orchestration are relationship tokens

They do not describe a property of an object but a relationship between objects. They require context (number of elements, layout) to resolve. They belong natively at the application/component level, not at primitive or semantic.

### 5. Meta tokens are a new category

`motion.timeline-type` (time vs. progress), `motion.intent-mode` (expressive vs. productive), `motion.engine` (tween vs. spring) are not values but context declarations that condition the semantics of all other tokens. Nothing equivalent exists in color or typography tokens. They could live at the semantic level but behave differently — they are not aliases, they are selectors.
