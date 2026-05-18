---
word-count: ~4500
---

# How motion token systems break — and what they require instead

A research essay on the structural differences between color and motion token design, what nine production systems reveal about the state of the art, and what remains unresolved.

---

## Part 1 — Where the color model stops working

A design systems team at a mid-size SaaS product decided in late 2024 to extend their token infrastructure to motion. They had color tokens, typography tokens, spacing tokens. The extension seemed straightforward: duration would work like a color scale, easing like a font-weight scale, and semantic aliases like `motion.duration.fast` would point to primitives like `duration.100`, exactly as `color.action.danger` pointed to `red-500`. They built it in a week and shipped it as a minor release.

Three months later, their senior engineer was looking at a pull request for a new panel component that needed a spring-based entrance. She opened the token file. `duration.300` was a single number. `easing.enter` was four numbers representing one curve. A spring config was three numbers representing a physics system where none of the three numbers meant anything independently. The existing structure had no place for it.

This friction is not incidental. It is structural.

The reason the color mental model transfers so cleanly to its own domain is that color tokens are, without exception, scalars. A color primitive (`red-500: #EF4444`) is a scalar. Its semantic alias (`color.action.danger: {red-500}`) is a scalar at one remove. Its component token (`button.danger.background: {color.action.danger}`) is a scalar at two removes. What changes across levels is the name and the meaning attached to it. The thing itself -- a single color value -- never changes its type.

Motion works differently. Across the abstraction hierarchy, the structure of the value changes. A duration token is a scalar: one number, one unit. A spring config is a recipe: three physics parameters that must exist together to mean anything. A transition token is a composite: a duration and an easing from entirely different domains, combined into something neither can express alone. A stagger token is an orchestration: not a property of any single element, but a rule governing timing relationships between a collection of elements.

A motion token system spans four distinct value types across its hierarchy. A color system spans one. This is not a failure of the tooling or the spec. It is evidence that motion occupies a larger design space than color -- and that a mental model built for color describes only part of it.

The gap becomes visible exactly at the moment the team above encountered it: when the system needs to handle physics-based motion. That is the moment when the single-axis color model, which had worked perfectly for durations and cubic-bezier easings, runs into the second axis it had never needed to account for.

---

## Part 2 — Two axes, not one

The taxonomy in this repository emerges from a specific question that the benchmark forced. Looking at GitHub Primer's token system alongside, say, eBay Skin's, a difference became apparent that the standard "primitive/semantic/component" model could not explain.

`motion.duration.slow` and `motion.transition.enter` are both positioned at the semantic level. Both carry intent. Both reference primitive values. But they behave differently. One resolves to a single value; the other resolves to an object with two fields from different domains. Calling them both "semantic tokens" is correct, but it treats structurally different things as the same kind of thing.

The question: what is the actual difference? Not where they sit in the hierarchy, but what they are.

The answer is what the taxonomy calls composition depth -- the structural complexity of the token's value. And it turns out this axis is entirely independent of the abstraction level axis. A token's depth does not determine its level; its level does not determine its depth.

### Depth 1 -- Scalar

The baseline. One value, one type, no internal structure. `duration.200 = 200ms`. `easing.standard = cubic-bezier(0.4, 0, 0.2, 1)`. Every color token ever written is at this depth.

A scalar token is the simplest possible unit: it resolves to a single CSS property value. Its semantic alias (`motion.duration.fast → {duration.100}`) adds meaning but does not change this. The consumer still receives `100ms`. The aliasing operation is a renaming, not a structural transformation.

### Depth 2 -- Recipe

A recipe bundles multiple values from the same physical domain that must exist together to be meaningful.

`spring.config.gentle = { stiffness: 200, damping: 20, mass: 1 }` is a recipe. `stiffness: 200` alone is not a token; it has no usable meaning without `damping` and `mass`. The three parameters belong to a single physics system. You cannot tokenize one without the others -- they are not independently addressable values.

This is analogous to a color defined in OKLCH: `L`, `C`, and `H` together describe one color. No one creates a `lightness` token, a `chroma` token, and a `hue` token and calls them color primitives. The channel values are parameters of a color space, not standalone tokens. Spring scalars are parameters of a physics engine, not standalone tokens. The minimum tokenizable unit is the complete recipe.

The recipe introduces a new primitive type that color never needed: the behavioral primitive. The brand's physics personality lives here. A crisp, tightly-damped spring versus a loose, bouncy one -- these are brand decisions, encoded at the primitive level, expressed as recipes rather than scalars.

### Depth 3 -- Composite

A composite combines values from different domains into a token that neither domain can express alone.

`motion.transition.enter = { duration: {duration.400}, easing: {easing.enter}, delay: 0 }` is a composite. It combines a value from the time domain (duration) with a value from the behavior domain (easing curve). Neither token references the other. Together, they describe a complete tween transition -- a thing that is not a duration and is not an easing.

GitHub Primer is the only system in the benchmark that makes the depth-3 composite the primary authoring surface. Primer defines four `transition.*` tokens (`hover`, `stateChange`, `enter`, `exit`) that pre-combine a duration and an easing. The CSS output for `motion.transition.hover` is `var(--motion-duration-micro) var(--motion-easing-hover)`. Component authors in Primer do not compose duration and easing at point of use -- they select a transition token by intent and receive the composition pre-built.

Every other system in the benchmark leaves this composition to component authors. Whether that is a matter of maturity or a deliberate theory of where the system's responsibility ends is not clear from public data. Primer's position is distinctive, and it is not obviously the result of being more advanced -- it is a different architectural decision about what the token system should own.

### Depth 4 -- Orchestration

Orchestration tokens describe timing relationships between multiple elements, not properties of any single element.

`motion.stagger.list = { interval: 20ms, from: start, cap: 500ms }` is not a duration, not a curve, not a transition. It is a rule: delay each element's entrance by 20ms relative to the previous, starting from the first, capping the total offset at 500ms. You cannot resolve this token without knowing how many elements are in the list. It requires context.

This is a categorically different type of value. Depths 1 through 3 all describe a property of one thing. Depth 4 describes how things relate to each other in time. It cannot map to a single CSS property because the CSS property does not know about element relationships. A resolver that knows the element count is required.

IBM Carbon acknowledges this behavior: its motion guidelines specify 20ms stagger intervals with a 500ms cap. Microsoft Fluent 2 describes stagger as a design principle. No system in the benchmark ships this as a token. The behavior exists in documentation and implementation; the shared vocabulary for encoding it as a referenceable, platform-agnostic value does not.

### Depth 5 -- Intent object (frontier)

Depth 5 does not yet exist in any production system. It is the logical endpoint of the axis: a platform-agnostic description of what an animation does, stored as a source token and resolved per platform by a build pipeline.

The distinction from depth 4: depths 1 through 4 all map to known CSS or WAAPI concepts, even if complex ones. A depth-5 intent object describes behavioral intent with no direct CSS equivalent. The platform-specific code is generated by a resolver, not read directly from the token.

```json
// Example intent object (not yet implemented in any system)
{
  "motion.emerge.panel": {
    "behavior": "spring",
    "direction": "from-below",
    "distance": "medium",
    "spring": { "ref": "motion.spring.gentle" },
    "delay": { "ref": "motion.delay.none" }
  }
}
```

The resolver transforms this description into: `@keyframes + linear()` for CSS, `.spring(duration:bounce:)` + `.offset(y:)` for SwiftUI, `spring(stiffness, damping) + offset` for Compose, computed keyframe JSON for Lottie.

LottieFiles is the closest analog, but Lottie exports computed keyframes -- a dump of resolved animation data. Depth-5 would be the abstraction one level above that: the source from which those keyframes are generated. No team has implemented this publicly. It is a potential direction for systems that need cross-platform motion consistency at a level of abstraction that current tooling does not support.

### What the axes reveal together

These two axes are independent. A token's position on one does not predict its position on the other. In color, the entire matrix collapses to a single column: depth 1, all levels. Every color token is a scalar, regardless of its abstraction level. In motion, the matrix is populated across both dimensions. This is not a matter of complexity for its own sake -- it is the shape of the design space that motion actually occupies.

Each boundary between depths is a type boundary, not a scale boundary. Moving from depth 1 to depth 2 is not adding more information to the same kind of thing. It is changing what kind of thing the value is.

---

## Part 3 -- What nine design systems revealed

A benchmark of nine production design systems -- Material Design 3, Shopify Polaris, IBM Carbon, Microsoft Fluent 2, Apple HIG, Adobe Spectrum, GitHub Primer, eBay Skin, Uber Base -- reveals patterns that desk research and spec reading alone could not have surfaced. What follows are six findings with evidence, each specific enough to be challenged by a counterexample.

### The settled layer is shallower than it looks

Duration scale plus semantically named cubic-beziers is the universal baseline. All nine systems, without exception, have it. The structure is shared -- but the philosophy inside the structure is not.

Three systems illustrate how differently teams can answer the same underlying question -- what should a token name communicate about its value?

eBay Skin anchors its minimum duration to hardware: `instant = 17ms` is one frame at 60fps (16.67ms, rounded). The name does not communicate the value; it communicates the category, and the value is derived from a physical constraint. Uber Base uses a non-literal weight scale: `timing100 = 250ms`. The suffix is a relative rank, not a millisecond value -- the same logic as font weight, where `400` is not 400 grams but a position in a scale. Adobe Spectrum decouples name and value entirely: `–100` does not correspond to `100ms`; the index is abstract.

These are three different positions on the question of how much meaning the token name should carry about the token value. Skin says: the name communicates category and the value derives from physics. Uber says: the name communicates rank and the value is implementation detail. Spectrum says: the name is an opaque identifier and the value is what it is.

None of these positions is more correct. They reflect different theories about who uses the token, what they already know, and what the name should teach them. The universal structure of duration scale + named curves conceals genuine philosophical differences.

### Spring tokens exist on native platforms; the web has been left without a solution

Apple's entire motion system is spring-first. There is no cubic-bezier easing library in Apple HIG; there are three named spring presets (`.smooth`, `.snappy`, `.bouncy`) and a parametric API based on `response` (perceived duration) and `dampingFraction` (oscillation behavior). Material Design 3 ships six spring configs for Android, segmented by component size and animated property type. Both systems treat springs as the primary motion primitive for native.

On the web, not one system in the benchmark publishes spring tokens. Not because springs are less desirable on the web -- Apple's springs and MD3's Android springs are considered the appropriate motion model for their platforms precisely because they feel right. But because CSS has no native spring primitive, and no team has shipped a resolver-based pipeline to web as part of a public token system.

The important clarification: this absence is a tooling decision, not a philosophical one. The barrier is not CSS's inability to express springs; it is the absence of a build-time transformation step in any public system's pipeline. The CSS `linear()` function, available in all modern browsers, can approximate any spring animation at sufficient precision. A spring config token transformed by a resolver at build time produces CSS output that is perceptually identical to a native spring. The spring-on-web problem is a resolver problem, not a CSS problem. Part 4 of this essay addresses this specifically.

### Intent segmentation is universal but never encoded the same way

Every organization that ships a motion token system eventually arrives at the same question: what kinds of motion are we allowed to use, and where? The answer -- some version of a productive/functional/utilitarian track alongside an expressive/decorative/immersive track -- appears in most systems. The mechanism for encoding that answer differs in every case.

IBM Carbon forces intent declaration as a structural parameter. The function call `motion("standard", "productive")` is not a guideline; it is the API. Every animation in a Carbon-based product must declare its intent at point of use. The token system does not permit an undeclared animation.

Shopify Polaris prohibits expressive motion entirely. The philosophical position -- "motion is a tool, not an ornament" -- is encoded as policy. There is no expressive token category because there is no expressive motion in the product.

Apple HIG encodes the distinction conditionally: overshoot (bounce) is appropriate only when the originating gesture carries velocity. A swipe has momentum; a tap does not. Using a bouncy spring on a tap is physically unjustified -- the gesture did not produce the force that would explain the rebound. The distinction between utilitarian and expressive motion is physics-grounded, not category-based.

eBay Skin encodes it as a three-tier volume hierarchy: basic, utilitarian, immersive. The `bounce` curve exists in the system but belongs to the immersive track. The tier structure makes the escalation explicit.

GitHub Primer and Uber Base have no intent segmentation at all. Primer's naming axis is trajectory (enter/exit/move/hover), not intent volume. Uber's three generic curves carry no category distinction.

The finding is not that some of these approaches are better. It is that the vocabulary for intent segmentation has not generalized across organizations. Every team has to answer the question; no answer has transferred. The productive/expressive vocabulary from Carbon is the most widely discussed -- but adopting it without Carbon's organizational context produces token names that carry intent they cannot enforce. The vocabulary is always local.

### Depth-3 composites exist in exactly one system

GitHub Primer ships composite `transition.*` tokens as the primary authoring surface. `motion.transition.enter`, `motion.transition.exit`, `motion.transition.hover`, `motion.transition.stateChange` each pre-combine a duration and an easing. The individual duration and easing tokens exist in the system but are positioned as implementation detail. Component authors do not assemble them; they pick a transition.

The CSS output: `--motion-transition-hover: var(--motion-duration-micro) var(--motion-easing-hover)`. One line, one decision made upstream, no composition required at point of use.

Every other system in the benchmark leaves duration-easing composition to component authors. This is not a gap in the other systems -- it is a different theory of where the system's responsibility ends. A system that stops at depth 1 (scalars) is not a failing system; it has decided that composition is a component-author concern. Primer has decided it is a system concern. Both positions are coherent; they produce different authoring experiences and different maintenance implications.

### Stagger exists in documentation in several systems; it exists as a token in none

IBM Carbon specifies stagger: 20ms interval, 500ms total cap. The guideline is clear and concrete. Microsoft Fluent 2 describes stagger as a design principle. Neither system ships stagger as a referenceable token.

The reason is not that stagger is unimportant. The reason is that the token type does not fit the existing model. Every token type currently in the DTCG spec -- `duration`, `cubicBezier`, `transition` -- describes a property of a single element. Stagger describes a relationship between elements. It requires a resolver that knows the element count. The minimum data for a stagger token (`interval`, `from`, `cap`) does not map to any CSS property because CSS properties do not describe inter-element timing relationships.

This is the depth-4 gap: a genuine architectural need with documented organizational support and zero production implementations. The behavior is specified in documentation; the token infrastructure to encode and share it does not exist in any public system.

### DTCG coverage is incomplete for every system in the benchmark

The DTCG October 2025 stable spec defines three types relevant to motion: `duration`, `cubicBezier`, and `transition`. Every system in the benchmark has found at least one thing it cannot express in these types.

Apple HIG's spring model has no DTCG equivalent. The entire system operates in a parameterization (`response`, `dampingFraction`) that has no `cubicBezier` representation. Material Design 3's emphasized easing has an inflection point that cannot be expressed as a single cubic-bezier -- on Android it is stored as a path; on the web it is acknowledged as an approximation. IBM Carbon's intent-parameterized system -- where the easing depends on a declared intent parameter at call time -- has no DTCG representation. Shopify Polaris's keyframe tokens (complete `@keyframes` animations as token values) have no DTCG type.

Every system has a workaround: custom types, extension blocks, plain CSS strings in token values, documentation-only specifications. The spec is not wrong. It is incomplete for motion in a way it is not incomplete for color -- because motion requires types that color never needed. The gap between what the spec covers and what production systems need is larger for motion than for any other token category.

---

## Part 4 -- The spring problem on the web

The standard narrative in design systems conversations is that spring animation on the web is blocked on CSS. Teams defer spring tokens because there is no native CSS spring primitive. The implication is that the right moment to implement spring tokens for web is after the CSS working group adds springs to the spec.

This framing inverts the actual constraint. The gap is not in CSS's expressive capacity. It is in the build pipelines that no team has yet shipped publicly.

CSS `linear()` -- available in all modern browsers -- can encode any animation as a series of computed linear interpolation points. A spring animation resolved at 60fps to 40-60 keypoints, encoded as `linear(0, 0.03 2%, 0.12 4%, 0.25 7%, ...)`, is perceptually identical to a native spring in a browser that supports `linear()`. Writing this by hand is not practical. Generating it from a build step is.

The transformation pipeline works as follows. A spring config token (`{ stiffness: 200, damping: 20, mass: 1 }`) is the source. A resolver reads the token at build time, simulates the spring's motion curve using the spring differential equation, samples the trajectory at a target frame rate, and outputs the equivalent `linear()` function string. The component that uses the token references it by name; it receives platform-native CSS.

The resolver in this repository handles three input parameterizations: raw physics (`stiffness`, `damping`, `mass`), damping-ratio notation as used by Material Design 3 (`stiffness`, `dampingRatio`), and Apple's perceptual abstraction (`response`, `dampingFraction`). The same resolver accepts all three, which means it can serve as the bridge for cross-platform spring token delivery. A team working across web and iOS can store spring intent in one token file and resolve it appropriately per platform -- CSS `linear()` for web, `.spring(response:dampingFraction:)` for SwiftUI, `SpringSpec(stiffness, damping)` for Compose.

The role of this resolver is the same role Style Dictionary plays for color: the token stores intent in a source format, and the build step produces platform-specific output. The spring token answers one question -- what should this animation feel like? The `linear()` string answers a different question -- what code makes it feel that way in CSS? You cannot reverse the transformation. Many spring configs produce curves that are perceptually similar but parametrically distinct. The token is the source of truth; the platform output is derived from it.

Teams that are waiting for a CSS spring primitive before implementing spring tokens on web have made a deferral without a defined endpoint. The `linear()` approximation path is available today. The spring resolver is the new build step.

---

## Part 5 -- What this changes for how you build a motion token system

The practical consequences of the two-axis model are not about adding more tokens or creating more layers. They are about making explicit decisions that teams with a single-axis model often leave implicit.

**Decide what composition depth you are committing to before you add semantic tokens.** A system that operates at depth 1 -- scalars only, composition at point of use -- is not an incomplete system. It has made a deliberate decision: the token system provides raw materials, and component authors assemble them. A system that operates at depth 3 has made a different decision: the system pre-assembles the common combinations, and component authors consume intent. Both are coherent. The error is building a depth-1 system while assuming it will eventually expand to depth 3 without planning for it, because the structural changes required are not additive. A depth-3 layer added on top of a depth-1 foundation requires redefining what the semantic layer is for.

**Spring configs are a different type from scalar tokens. Treat them as one.** If your token system exposes `stiffness`, `damping`, and `mass` as separate tokens, the model is structurally wrong -- for the same reason that exposing R, G, and B as separate color primitives is structurally wrong. Individual spring parameters have no usable meaning in isolation. The minimum tokenizable unit is the complete spring config. Name the config by its perceived character (`spring.config.gentle`, `spring.config.snappy`, `spring.config.bouncy`), not by its parameter values. The parameters are fields of the token's value, not tokens themselves.

**Organizational intent segmentation is an architectural decision, not a convention to adopt.** IBM Carbon's productive/expressive vocabulary is frequently described as a best practice for motion token systems. It is an architecture that reflects Carbon's organizational context: a B2B productivity tool with a specific theory about when motion should be invisible and when it should mark a moment. Adopting that vocabulary without that context produces tokens whose names carry intent they cannot enforce. The productive/expressive split is an answer to a question -- "what types of motion do we want to distinguish?" -- that every organization has to answer for itself. Define the vocabulary that matches the motion decisions your organization actually wants to make, rather than inheriting one that was defined for a different product and a different culture.

**The DTCG gap is real but not blocking.** No system can fully express its motion model in current DTCG types. Apple's springs, MD3's emphasized curve, Carbon's intent-parameterized system, Polaris's keyframe tokens -- all require workarounds. Building a custom type for `spring` and `stagger` with clear documentation of the schema is the right approach today. The DTCG will add motion types; the roadmap includes a Motion module. A system that waits for a `spring` DTCG type before implementing spring tokens has deferred indefinitely on a timeline no team controls. Custom types in token files, with documented schemas and resolvers that produce platform-native output, are a complete solution now.

**Stagger tokens require a resolver, not a convention.** If your system specifies stagger behavior in documentation but not in tokens, every component that staggers is implementing the same behavior independently with no shared reference. The token structure for stagger is not complicated -- `{ interval: 20ms, from: start, cap: 500ms }` is a complete description for a list entrance. The missing piece is a resolver that takes the token and the element count at runtime and computes per-element delays.

---

## Closing -- what remains unknown

Five questions in this research have not been resolved and will not be resolved by analysis of public documentation alone.

The first is whether `prefers-reduced-motion` is a mode or a structural condition. Dark mode swaps token values; reduced motion may need to eliminate entire token categories -- springs become tweens, staggers become synchronous, orchestrations become instant. Whether that requires a different architecture from value-swapping modes, or whether it can be handled as a particularly aggressive mode, has implications for how the token system is structured from the start.

The second is whether spring config is the right minimum tokenizable unit, or whether there are valid use cases for varying individual spring parameters at the token level. The current position is that individual spring parameters are not tokens -- but some production implementations in tools like React Spring override individual parameters per animation. Whether those overrides represent a genuine need for scalar spring tokens, or just a convenience in a specific runtime context, is not clear from public evidence.

The third is how intent segmentation vocabularies behave over time. The benchmark surfaces five or six distinct approaches. What is not visible in public documentation is whether those vocabularies remain stable as systems mature or get revised. The most useful data would come from teams that have operated a motion token system for two or more years and changed their intent vocabulary -- what prompted the change, and what they would have done differently initially.

The fourth is whether depth-5 (animation as object) exists in any production system. LottieFiles is the closest known analog but Lottie resolves at keyframe level, not at intent level. A team working on the authoring abstraction above keyframe export -- at LottieFiles, Rive, Jitter, or a tool not yet built -- is the most likely source of evidence here.

The fifth is what a DTCG Motion module should contain. The current spec covers a thin slice of what production systems need. The proposed minimum -- a `spring` composite type, a `stagger` type, a mechanism for animated intent -- is a starting position. What the module should explicitly exclude is as important as what it should include.

These questions are not rhetorical. They are the specific points where this research hits the boundary of what desk analysis can reach. The people best positioned to resolve them are motion designers who have shipped token systems in production and lived with them long enough to revise them; DTCG contributors who are actively working on a Motion module; and tool builders at LottieFiles, Rive, Jitter, and similar platforms who are working at the layer above keyframe resolution.

If you have evidence that changes or complicates any of these positions -- production implementations at depth 4 or 5, intent vocabularies that have generalized across organizations, spring resolver pipelines in public repos -- the research benefits from it directly. This material is feeding a chapter of *The Design Tokens Book*. The open questions are the ones that should be in the book as open questions, because presenting them as settled would be inaccurate.
