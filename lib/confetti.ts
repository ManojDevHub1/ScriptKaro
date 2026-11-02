import confetti from 'canvas-confetti';

/**
 * Fires an energetic brand-colored confetti burst
 */
export function fireViralConfetti() {
  if (typeof window === 'undefined') return;

  // Check if reduced motion is requested
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const count = 100;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#FF7A1A', '#FF4D00', '#FFA154', '#FFD166', '#FFFFFF'],
    disableForReducedMotion: true,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    try {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    } catch (e) {
      // Ignore in environments where canvas isn't supported
    }
  }

  // Multi-stage burst
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Subtle micro confetti burst for single copy buttons
 */
export function fireMicroConfetti(x = 0.5, y = 0.5) {
  if (typeof window === 'undefined') return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  try {
    confetti({
      particleCount: 28,
      spread: 45,
      startVelocity: 22,
      origin: { x, y },
      colors: ['#FF7A1A', '#FFA154', '#10B981'],
      disableForReducedMotion: true,
      scalar: 0.7,
      ticks: 120,
    });
  } catch (e) {
    // Graceful fallback
  }
}
