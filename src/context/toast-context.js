import { createContext, useContext } from 'react';

/** Context object and consumer hooks for the toast queue. */
export const ToastContext = createContext(null);

/** Returns `{ show, success, error, warn, info }`. */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context.toast;
}

/** Internal — used by `<Toaster />` to render and dismiss queued toasts. */
export function useToastQueue() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToastQueue must be used inside a ToastProvider');
  return context;
}
