import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ToastContext } from './toast-context';

const DEFAULT_DURATION_MS = 5000;
const ERROR_DURATION_MS = 7000;

/**
 * App-wide toast notifications.
 *
 * Replaces the per-screen MUI `Snackbar` state the source repeated in a dozen
 * components. `<Toaster />` renders the queue; this only owns it.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  // Clear any pending timers if the provider itself unmounts.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, { tone = 'info', duration = DEFAULT_DURATION_MS, action } = {}) => {
      if (!message) return null;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, message, tone, action }]);

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      toasts,
      dismiss,
      toast: {
        show: push,
        success: (message, options) => push(message, { ...options, tone: 'success' }),
        error: (message, options) =>
          push(message, { duration: ERROR_DURATION_MS, ...options, tone: 'danger' }),
        warn: (message, options) => push(message, { ...options, tone: 'warn' }),
        info: (message, options) => push(message, { ...options, tone: 'info' }),
      },
    }),
    [toasts, dismiss, push],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
