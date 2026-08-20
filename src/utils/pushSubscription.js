import { apiRequest } from './api';

// Convert a URL-safe base64 VAPID public key to a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

let _subscribed = false;

export const subscribeToPush = async () => {
  if (_subscribed) return;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    // Get VAPID public key from backend
    const keyRes = await apiRequest('/notifications/vapid-key', { auth: false });
    if (!keyRes?.publicKey) return;

    // Wait for the service worker to be ready
    const registration = await navigator.serviceWorker.ready;

    // Check existing subscription — if still valid, just save it
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      // Request permission if not already granted
      const permission = await window.Notification.requestPermission();
      if (permission !== 'granted') return;

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyRes.publicKey)
      });
    }

    // Save subscription to server
    await apiRequest('/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription })
    });

    _subscribed = true;
  } catch (err) {
    // Non-fatal — push is optional
    console.warn('[Push] Could not subscribe:', err.message);
  }
};

export const unsubscribeFromPush = async () => {
  _subscribed = false;
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await apiRequest('/notifications/unsubscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint })
      });
    }
  } catch (err) {
    console.warn('[Push] Could not unsubscribe:', err.message);
  }
};
