import { useCallback, useEffect, useMemo, useState } from 'react';

import { getStoredUser } from '@/lib/auth-session';
import { THEME_EVENT, THEME_STORAGE_KEY, ThemeContext } from './theme-context';

/**
 * Resolves the initial mode in the same precedence the source used: the user's
 * saved profile preference, then this browser's last choice, then the OS
 * setting.
 */
const resolveInitialMode = () => {
  const preference = getStoredUser()?.preferences?.theme;
  if (preference === 'dark' || preference === 'light') return preference;

  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    /* Privacy mode — fall through to the OS preference. */
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Light/dark mode. Toggles a `dark` class on `<html>`, which is what the
 * `@custom-variant dark` rule in `styles/index.css` keys off.
 *
 * Changes propagate through a custom event (this tab, e.g. the Settings screen)
 * and the `storage` event (other tabs), matching the original behaviour.
 */
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(resolveInitialMode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      /* Non-fatal. */
    }
  }, [mode]);

  useEffect(() => {
    const handleThemeEvent = (event) => {
      const next = event.detail?.mode;
      if (next === 'light' || next === 'dark') setMode(next);
    };
    const handleStorage = (event) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      if (event.newValue === 'light' || event.newValue === 'dark') {
        setMode(event.newValue);
      }
    };

    window.addEventListener(THEME_EVENT, handleThemeEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(THEME_EVENT, handleThemeEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setTheme = useCallback((next) => {
    setMode(next);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { mode: next } }));
  }, []);

  const toggleTheme = useCallback(
    () => setTheme(mode === 'dark' ? 'light' : 'dark'),
    [mode, setTheme],
  );

  const value = useMemo(
    () => ({ mode, isDark: mode === 'dark', setTheme, toggleTheme }),
    [mode, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
