# Open questions

Five questions this research has not resolved. Each is stated with the current working position and what kind of evidence would move it.

---

**Question 1 — Is `prefers-reduced-motion` a mode or a structural condition?**

Dark mode works as a mode: it swaps values for other values. The semantic token persists; only its resolution changes. `prefers-reduced-motion` may not work the same way. It can eliminate entire token categories — spring becomes tween, stagger becomes synchronous, orchestration becomes instant. That is not a value substitution; it is a structural reduction of the system. The current position is that `prefers-reduced-motion` is a condition, not a mode, and should activate a pre-defined motion-safe subset of tokens rather than override individual values. What would resolve this: examples from teams who have implemented reduced-motion handling at the token architecture level, not just as CSS fallbacks, and whether that handling required structural changes to their token set.

---

**Question 2 — Is spring config the right minimum tokenizable unit?**

The current position is that `stiffness`, `damping`, and `mass` are not independently tokenizable. They are parameters of a physics system — analogous to RGB channels in a color, which are also not individually tokenizable. `stiffness: 300` has no usable meaning in isolation; you need the full config to produce any output. The minimum tokenizable unit is therefore the complete spring config at depth 2. However, some teams in practice expose spring parameters independently, particularly in tools like React Spring where `config.stiffness` can be overridden per animation. If there is a genuine use case where varying a single spring parameter — with the others held constant — is the right authoring surface, that would challenge the current position. Confirmation from teams using physics-based animation in production at scale would resolve this.

---

**Question 3 — How do teams segment motion intent in practice, and how stable is that segmentation over time?**

The benchmark found five or six distinct approaches to the functional/expressive distinction: structural encoding (Carbon), two-track curve system (M3), conditional use (Apple), volume taxonomy (eBay), prohibition (Polaris), and absent (Primer, Uber). The current position is that intent segmentation is organizational — no vocabulary generalizes, and each team should define their own based on context. What is not known is whether the segmentation that teams define at the start of a system remains stable as the system matures, or whether it gets revised. Teams that have operated a motion token system for two or more years, and that have changed or reconsidered their intent vocabulary, would provide the most useful input here. Three or four concrete examples would be sufficient to ground the claim.

---

**Question 4 — Does depth-5 (animation as object) exist in any production system today?**

The current position is no. LottieFiles is the closest known example: it takes After Effects keyframe data and delivers a platform-agnostic JSON file that a player resolves on web, iOS, and Android. But Lottie exports computed keyframes — a dump of resolved animation data, not an abstract behavioral intent. Depth-5 as defined here would mean a source token that describes *what something does* (behavior, direction, physics personality) in a format with no direct platform equivalent, resolved by a build pipeline into platform-specific code. The distinction: Lottie gives you the keyframes; depth-5 would give you the intent from which the keyframes are generated. Any team at LottieFiles, Rive, or a similar platform working on the authoring-side abstraction (above keyframe resolution) would be the right input here. If a production system has implemented anything resembling this, we have not found it in public documentation.

---

**Question 5 — What should a DTCG Motion module contain?**

The October 2025 stable spec defines three types relevant to motion: `duration`, `cubicBezier`, and `transition`. A Motion module is on the DTCG roadmap but has not been specified. This research proposes that the module needs at minimum: a `spring` composite type (with at minimum stiffness/damping/mass, and ideally the Apple response/dampingFraction parameterization as an alternate form), a `stagger` type (interval, from, cap), and a mechanism for encoding animated intent that resolves to platform-specific output. What the spec should explicitly exclude is equally important — scope decisions made at this stage will constrain what tokens can express for years. Input from teams who have built workarounds for the current spec gaps (custom types, extension blocks, separate JSON schemas) would directly inform what the module needs to cover and what it does not.
