import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tracks a CSS media query from JavaScript.
 *
 * Built on `useSyncExternalStore`, which is the API designed for reading from a
 * browser API that changes outside React — no effect, no synchronisation state,
 * and no flash of the wrong value on the first paint.
 *
 * Layout belongs in Tailwind classes; use this only where *behaviour* differs,
 * such as dismissing the mobile drawer once the sidebar docks.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia?.(query);
      if (!list) return () => {};

      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia?.(query).matches ?? false,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot);
}

/** True from Tailwind's `md` breakpoint (768px) up — where the sidebar docks. */
export const useIsDesktop = () => useMediaQuery('(min-width: 768px)');

/** True when the user has asked for reduced motion. */
export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)');
