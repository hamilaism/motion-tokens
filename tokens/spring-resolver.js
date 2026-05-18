/**
 * Spring resolver — generates CSS linear() approximation from spring physics parameters
 *
 * Converts a spring configuration (stiffness / damping / mass) into a CSS linear()
 * timing function. This resolves the "spring on the web" problem: CSS has no native
 * spring type, but linear() can approximate any curve at sufficient precision.
 *
 * The pipeline this enables:
 *   spring token (stiffness, damping, mass)
 *     → springToLinear()
 *     → CSS linear(...) string
 *     → usable in transition-timing-function or animation-timing-function
 *
 * Input parameterizations supported:
 *   1. Physics params: stiffness (k), damping coefficient (c), mass (m)
 *   2. Damping ratio: stiffness (k), dampingRatio (ζ), mass (m)
 *   3. Apple model: response (τ), dampingFraction (ζ) — converted to physics params
 *
 * References:
 *   - CSS linear(): https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/linear
 *   - Spring physics: Hooke's law + viscous damping
 *   - Apple SwiftUI spring: https://developer.apple.com/documentation/swiftui/spring
 */


// ---------------------------------------------------------------------------
// Core: spring position function
// ---------------------------------------------------------------------------

/**
 * Returns the position function x(t) for a spring starting at 0, targeting 1.
 * t is in seconds. x(t) ranges from 0 (start) to 1 (settled).
 *
 * @param {number} k - Stiffness (spring constant)
 * @param {number} c - Damping coefficient
 * @param {number} m - Mass
 * @returns {function(number): number}
 */
function springPosition(k, c, m) {
  const omega0 = Math.sqrt(k / m);           // natural frequency (rad/s)
  const zeta   = c / (2 * Math.sqrt(k * m)); // damping ratio

  if (Math.abs(zeta - 1) < 1e-6) {
    // Critically damped — fastest non-oscillatory settling
    return (t) => 1 - Math.exp(-omega0 * t) * (1 + omega0 * t);
  }

  if (zeta < 1) {
    // Underdamped — oscillates before settling (bounce behavior)
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    return (t) =>
      1 - Math.exp(-zeta * omega0 * t) *
          (Math.cos(omegaD * t) + (zeta * omega0 / omegaD) * Math.sin(omegaD * t));
  }

  // Overdamped — slow settling without oscillation
  const omegaD = omega0 * Math.sqrt(zeta * zeta - 1);
  return (t) =>
    1 - Math.exp(-zeta * omega0 * t) *
        (Math.cosh(omegaD * t) + (zeta * omega0 / omegaD) * Math.sinh(omegaD * t));
}


// ---------------------------------------------------------------------------
// Settlement time detection
// ---------------------------------------------------------------------------

/**
 * Finds the time (seconds) at which the spring has settled within `threshold`
 * of the target value (1), and is no longer changing significantly.
 *
 * @param {function} positionFn
 * @param {object} opts
 * @param {number} opts.threshold - Position threshold (default: 0.001)
 * @param {number} opts.maxDuration - Max search time in ms (default: 3000)
 * @param {number} opts.step - Search step in ms (default: 5)
 * @returns {number} Settlement time in seconds
 */
function findSettlementTime(positionFn, { threshold = 0.001, maxDuration = 3000, step = 5 } = {}) {
  const maxS = maxDuration / 1000;
  const stepS = step / 1000;
  let settlementTime = maxS;

  for (let t = stepS; t <= maxS; t += stepS) {
    if (Math.abs(positionFn(t) - 1) < threshold) {
      // Confirm it stays settled for the next few steps
      const t1 = t + stepS;
      const t2 = t + 2 * stepS;
      if (Math.abs(positionFn(t1) - 1) < threshold &&
          Math.abs(positionFn(t2) - 1) < threshold) {
        settlementTime = t;
        break;
      }
    }
  }

  return settlementTime;
}


// ---------------------------------------------------------------------------
// CSS linear() generator
// ---------------------------------------------------------------------------

/**
 * Main export: generates CSS linear() from spring physics parameters.
 *
 * @param {number} stiffness - Spring stiffness (k). Typical range: 50–2000.
 * @param {number} damping   - Damping coefficient (c). Typical range: 5–80.
 * @param {number} mass      - Mass (m). Typical range: 0.1–5. Default: 1.
 * @param {object} options
 * @param {number} options.precision   - Number of sample points (default: 100)
 * @param {number} options.threshold   - Settlement threshold (default: 0.001)
 * @param {number} options.maxDuration - Max duration in ms (default: 3000)
 * @returns {{ css: string, duration: number, dampingRatio: number }}
 */
function springToLinear(stiffness, damping, mass = 1, options = {}) {
  const { precision = 100, threshold = 0.001, maxDuration = 3000 } = options;

  const positionFn    = springPosition(stiffness, damping, mass);
  const settlementTime = findSettlementTime(positionFn, { threshold, maxDuration });

  // Sample the position at `precision` equally-spaced intervals
  const points = [];
  for (let i = 0; i <= precision; i++) {
    const t = (i / precision) * settlementTime;
    // Clamp to [0, 1] — overshooting springs can briefly exceed 1
    const p = Math.max(-0.5, Math.min(1.5, positionFn(t)));
    points.push({ pct: i / precision, value: p });
  }

  // Build linear() string
  // Format: linear(0, value pct%, ..., 1)
  // First (0) and last (1) are the anchor values — always explicit
  const inner = points
    .slice(1, -1)
    .map(({ pct, value }) => `${+value.toFixed(4)} ${+(pct * 100).toFixed(1)}%`)
    .join(', ');

  const css = `linear(0, ${inner}, 1)`;

  const omega0      = Math.sqrt(stiffness / mass);
  const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));

  return {
    css,
    duration: Math.round(settlementTime * 1000), // ms
    dampingRatio: +dampingRatio.toFixed(4),
  };
}


// ---------------------------------------------------------------------------
// Convenience: convert other parameterizations to physics params
// ---------------------------------------------------------------------------

/**
 * Converts damping-ratio notation (used by Material Design 3) to damping coefficient.
 * M3 spring tokens use dampingRatio (ζ) + stiffness directly.
 *
 * @param {number} stiffness  - Spring stiffness
 * @param {number} dampingRatio - Damping ratio ζ (0–2 typical)
 * @param {number} mass       - Mass (default: 1)
 * @returns {{ stiffness, damping, mass }}
 */
function fromDampingRatio(stiffness, dampingRatio, mass = 1) {
  const damping = dampingRatio * 2 * Math.sqrt(stiffness * mass);
  return { stiffness, damping, mass };
}

/**
 * Converts Apple SwiftUI spring notation (response + dampingFraction) to physics params.
 * response ≈ perceived duration; dampingFraction = ζ.
 *
 * @param {number} response       - Perceived settling time in seconds
 * @param {number} dampingFraction - Damping ratio ζ (0–1 typical in Apple)
 * @param {number} mass           - Mass (default: 1)
 * @returns {{ stiffness, damping, mass }}
 */
function fromAppleSpring(response, dampingFraction, mass = 1) {
  // ω₀ ≈ 2π / response (Apple's approximation)
  const omega0    = (2 * Math.PI) / response;
  const stiffness = omega0 * omega0 * mass;
  const damping   = dampingFraction * 2 * Math.sqrt(stiffness * mass);
  return { stiffness, damping, mass };
}


// ---------------------------------------------------------------------------
// Validation: Material Design 3 spring tokens
// ---------------------------------------------------------------------------

/**
 * Validates the resolver against M3's documented spring tokens.
 * M3 uses dampingRatio notation. Expected settlement times are approximate
 * because M3 does not publish explicit durations for spring tokens.
 *
 * Results let us verify the resolver is producing physically correct output.
 */
function validateAgainstM3() {
  const m3Springs = [
    { name: 'motionSpringFastSpatial',    stiffness: 1400, dampingRatio: 0.9 },
    { name: 'motionSpringFastEffects',    stiffness: 3800, dampingRatio: 1.0 },
    { name: 'motionSpringDefaultSpatial', stiffness: 700,  dampingRatio: 0.9 },
    { name: 'motionSpringDefaultEffects', stiffness: 1600, dampingRatio: 1.0 },
    { name: 'motionSpringSlowSpatial',    stiffness: 300,  dampingRatio: 0.9 },
    { name: 'motionSpringSlowEffects',    stiffness: 800,  dampingRatio: 1.0 },
  ];

  console.log('M3 spring validation\n' + '='.repeat(60));

  m3Springs.forEach(({ name, stiffness, dampingRatio }) => {
    const { stiffness: k, damping: c, mass: m } = fromDampingRatio(stiffness, dampingRatio);
    const result = springToLinear(k, c, m);

    console.log(`${name}`);
    console.log(`  stiffness: ${stiffness}, dampingRatio: ${dampingRatio}`);
    console.log(`  → damping coefficient: ${c.toFixed(2)}`);
    console.log(`  → settlement: ${result.duration}ms`);
    console.log(`  → CSS: ${result.css.slice(0, 80)}...`);
    console.log('');
  });
}

/**
 * Validates the Apple spring preset approximations.
 * Apple's .smooth, .snappy, .bouncy are public presets.
 */
function validateAgainstApple() {
  const applePresets = [
    { name: '.smooth',  response: 0.55, dampingFraction: 1.0  },
    { name: '.snappy',  response: 0.3,  dampingFraction: 0.85 },
    { name: '.bouncy',  response: 0.5,  dampingFraction: 0.7  },
  ];

  console.log('Apple spring preset validation\n' + '='.repeat(60));

  applePresets.forEach(({ name, response, dampingFraction }) => {
    const { stiffness, damping, mass } = fromAppleSpring(response, dampingFraction);
    const result = springToLinear(stiffness, damping, mass);

    console.log(`${name} (response: ${response}s, dampingFraction: ${dampingFraction})`);
    console.log(`  → physics: stiffness=${stiffness.toFixed(1)}, damping=${damping.toFixed(1)}`);
    console.log(`  → settlement: ${result.duration}ms`);
    console.log(`  → CSS: ${result.css.slice(0, 80)}...`);
    console.log('');
  });
}


// ---------------------------------------------------------------------------
// Exports + CLI
// ---------------------------------------------------------------------------

module.exports = { springToLinear, fromDampingRatio, fromAppleSpring };

// Run validation when executed directly: node spring-resolver.js
if (require.main === module) {
  validateAgainstM3();
  validateAgainstApple();

  // Example: the three named configs from the baseline token set
  console.log('Baseline token set spring configs\n' + '='.repeat(60));

  const configs = [
    { name: 'spring.config.crisp',  stiffness: 500, damping: 45, mass: 1 },
    { name: 'spring.config.gentle', stiffness: 200, damping: 20, mass: 1 },
    { name: 'spring.config.bouncy', stiffness: 300, damping: 12, mass: 1 },
  ];

  configs.forEach(({ name, stiffness, damping, mass }) => {
    const result = springToLinear(stiffness, damping, mass);
    console.log(`${name}`);
    console.log(`  dampingRatio: ${result.dampingRatio}`);
    console.log(`  settlement: ${result.duration}ms`);
    console.log(`  CSS: ${result.css.slice(0, 100)}...`);
    console.log('');
  });
}
