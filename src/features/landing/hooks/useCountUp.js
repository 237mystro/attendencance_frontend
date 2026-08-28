import { useEffect, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

/**
 * Animates a number from zero up to `target` with an ease-out curve.
 *
 * Respects `prefers-reduced-motion` by returning the final value outright —
 * the source animated unconditionally, which is uncomfortable for users who
 * have asked the OS to limit motion.
 */
export function useCountUp(target, { duration = 1600, delay = 0 } = {}) {
  const reducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reducedMotion) return undefined;

    let frameId = null;
    let startTime = null;

    const startTimer = setTimeout(() => {
      const step = (timestamp) => {
        startTime ??= timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        // Cubic ease-out: fast at first, settling gently on the final number.
        const eased = 1 - (1 - progress) ** 3;

        setValue(Math.round(eased * target));
        if (progress < 1) frameId = requestAnimationFrame(step);
      };

      frameId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target, duration, delay, reducedMotion]);

  // Derived, not written from the effect: with reduced motion the animation
  // never runs and the final number is shown from the first paint.
  return reducedMotion ? target : value;
}
