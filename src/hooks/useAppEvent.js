import { useEffect, useRef } from 'react';

/**
 * Subscribes to a `window` CustomEvent for the lifetime of the component.
 *
 * The socket layer broadcasts realtime updates as window events so any screen
 * can react without threading callbacks through context. The handler is stored
 * in a ref — updated in its own effect, never during render — so passing an
 * inline arrow function does not tear down and re-add the listener each render.
 *
 * @param {string|string[]} eventName
 * @param {(detail: unknown, event: CustomEvent) => void} handler
 * @param {boolean} [enabled=true]
 */
export function useAppEvent(eventName, handler, enabled = true) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    const names = Array.isArray(eventName) ? eventName : [eventName];
    const listener = (event) => handlerRef.current?.(event.detail, event);

    names.forEach((name) => window.addEventListener(name, listener));
    return () => names.forEach((name) => window.removeEventListener(name, listener));
    // A new array literal each render would resubscribe; compare by contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [String(eventName), enabled]);
}

/** Fires a CustomEvent that `useAppEvent` listeners will receive. */
export const emitAppEvent = (name, detail) => {
  window.dispatchEvent(new CustomEvent(name, { detail }));
};

/** Every realtime event name the app broadcasts, in one place. */
export const APP_EVENTS = {
  newMessage: 'autopayroll:new-message',
  newAnnouncement: 'autopayroll:new-announcement',
  profileUpdated: 'autopayroll:profile-updated',
  typingStart: 'autopayroll:typing-start',
  typingStop: 'autopayroll:typing-stop',
  userOnline: 'autopayroll:user-online',
  shiftReminder: 'autopayroll:shift-reminder',
  shiftAssigned: 'autopayroll:shift-assigned',
  shiftResponse: 'autopayroll:shift-response',
  transferIncoming: 'autopayroll:transfer-incoming',
  transferAccepted: 'autopayroll:transfer-accepted',
  transferDeclined: 'autopayroll:transfer-declined',
  latePermissionNew: 'autopayroll:late-permission-new',
  latePermissionReviewed: 'autopayroll:late-permission-reviewed',
  deviceFlagged: 'autopayroll:device-flagged',
};
