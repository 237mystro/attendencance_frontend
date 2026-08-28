import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App.jsx';
import '@/styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register the PWA service worker that powers the offline shell and Web Push.
// Production only: in dev a service worker fights with hot module replacement,
// and some embedded browsers refuse to register one at all.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Not fatal — the app works without offline support or push.
    });
  });
}
