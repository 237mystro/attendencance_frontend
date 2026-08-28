import { request } from '@/api/client';
import { getStoredUser } from './auth-session';

/** Native OS notifications and Web Push registration. */

export const canUseNotifications = () =>
  typeof window !== 'undefined' && 'Notification' in window;

export const getNotificationPermission = () =>
  canUseNotifications() ? window.Notification.permission : 'unsupported';

export const requestNotificationPermission = async () => {
  if (!canUseNotifications()) return 'unsupported';
  return window.Notification.requestPermission();
};

/** Respects the user's `notifications.push` preference from their profile. */
export const shouldNotifyUser = () => getStoredUser()?.notifications?.push !== false;

/** Shows an OS notification, preferring the service worker when registered. */
export const showDeviceNotification = async ({ title, body, tag, url, icon }) => {
  if (!canUseNotifications() || window.Notification.permission !== 'granted') {
    return false;
  }

  const payload = {
    body,
    tag,
    data: { url: url || '/login' },
    icon: icon || '/logo192.png',
    badge: '/logo192.png',
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, payload);
        return true;
      }
    }

    const notification = new window.Notification(title, payload);
    notification.onclick = () => {
      window.focus();
      if (url) window.location.href = url;
      notification.close();
    };
    return true;
  } catch {
    return false;
  }
};

/** Converts a URL-safe base64 VAPID key into the Uint8Array PushManager wants. */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
};

let hasSubscribed = false;

/** Registers this browser for Web Push. Silent no-op where unsupported. */
export const subscribeToPush = async () => {
  if (hasSubscribed) return;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    const keyResponse = await request('/notifications/vapid-key', { auth: false });
    if (!keyResponse?.publicKey) return;

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') return;

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyResponse.publicKey),
      });
    }

    await request('/notifications/subscribe', {
      method: 'POST',
      json: { subscription },
    });
    hasSubscribed = true;
  } catch {
    // Push is optional; never let it break sign-in.
  }
};

export const unsubscribeFromPush = async () => {
  hasSubscribed = false;
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const { endpoint } = subscription;
    await subscription.unsubscribe();
    await request('/notifications/unsubscribe', {
      method: 'DELETE',
      json: { endpoint },
    });
  } catch {
    /* Non-fatal. */
  }
};
