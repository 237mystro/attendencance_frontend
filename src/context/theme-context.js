import { createContext, useContext, useEffect } from 'react';

/** Context object and consumer hooks for light/dark mode. */
export const ThemeContext = createContext(null);

export const THEME_STORAGE_KEY = 'autopayroll-theme-mode';
export const THEME_EVENT = 'autopayroll:theme-change';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside a ThemeProvider');
  return context;
}

/**
 * Forces light mode for a subtree, restoring the user's choice on unmount.
 * The landing page uses this — its artwork assumes a light background, which is
 * why the source gave it a second, light-only MUI theme.
 */
export function useForceLightMode(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    const root = document.documentElement;
    const hadDark = root.classList.contains('dark');
    root.classList.remove('dark');

    return () => {
      if (hadDark) root.classList.add('dark');
    };
  }, [enabled]);
}
