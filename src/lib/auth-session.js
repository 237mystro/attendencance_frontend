import { PERSISTENT_SESSION_DAYS } from '@/constants/config';

/**
 * Two-tier session storage, carried over from the original app:
 *
 *  - `sessionStorage` holds the live tab's session and clears on browser close.
 *  - `localStorage` optionally holds a "remember me" copy with an explicit
 *    expiry, which rehydrates `sessionStorage` when a new tab opens.
 */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const PERSIST_TOKEN_KEY = 'autopayroll-persist-token';
const PERSIST_USER_KEY = 'autopayroll-persist-user';
const PERSIST_EXPIRY_KEY = 'autopayroll-persist-expiry';

/** Storage access throws in some privacy modes; never let that break a render. */
const safeRead = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const safeWrite = (storage, key, value) => {
  try {
    storage.setItem(key, value);
  } catch {
    /* Quota or privacy mode — the in-memory session still works. */
  }
};

const safeRemove = (storage, key) => {
  try {
    storage.removeItem(key);
  } catch {
    /* Nothing to do. */
  }
};

const clearPersistentSession = () => {
  safeRemove(localStorage, PERSIST_TOKEN_KEY);
  safeRemove(localStorage, PERSIST_USER_KEY);
  safeRemove(localStorage, PERSIST_EXPIRY_KEY);
};

const isPersistentValid = () => {
  const expiry = safeRead(localStorage, PERSIST_EXPIRY_KEY);
  if (!expiry) return false;
  if (Date.now() > Number(expiry)) {
    clearPersistentSession();
    return false;
  }
  return true;
};

/** Stores a session that survives browser restarts for `days`. */
export const storePersistentSession = (token, user, days = PERSISTENT_SESSION_DAYS) => {
  const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
  safeWrite(localStorage, PERSIST_TOKEN_KEY, token);
  safeWrite(localStorage, PERSIST_USER_KEY, JSON.stringify(user));
  safeWrite(localStorage, PERSIST_EXPIRY_KEY, String(expiry));
  // Mirror into sessionStorage so the current tab works immediately.
  storeSession(token, user);
};

/** Stores a session scoped to the current tab. */
export const storeSession = (token, user) => {
  safeWrite(sessionStorage, TOKEN_KEY, token);
  safeWrite(sessionStorage, USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  safeRemove(sessionStorage, TOKEN_KEY);
  safeRemove(sessionStorage, USER_KEY);
  clearPersistentSession();
};

export const getStoredToken = () => {
  const sessionToken = safeRead(sessionStorage, TOKEN_KEY);
  if (sessionToken) return sessionToken;

  if (!isPersistentValid()) return null;

  const token = safeRead(localStorage, PERSIST_TOKEN_KEY);
  if (token) {
    // Hydrate the tab so subsequent reads skip the localStorage round-trip.
    safeWrite(sessionStorage, TOKEN_KEY, token);
    const user = safeRead(localStorage, PERSIST_USER_KEY);
    if (user) safeWrite(sessionStorage, USER_KEY, user);
  }
  return token;
};

export const getStoredUser = () => {
  const raw = safeRead(sessionStorage, USER_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      clearSession();
      return null;
    }
  }

  if (!isPersistentValid()) return null;

  const persisted = safeRead(localStorage, PERSIST_USER_KEY);
  if (!persisted) return null;
  try {
    return JSON.parse(persisted);
  } catch {
    clearPersistentSession();
    return null;
  }
};

/** Decodes the JWT `exp` claim. Treats an unparseable token as still valid. */
export const isTokenExpired = (token) => {
  if (!token) return true;
  const [, payload] = token.split('.');
  if (!payload) return false;
  try {
    const decoded = JSON.parse(
      window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    );
    return decoded.exp ? decoded.exp * 1000 <= Date.now() : false;
  } catch {
    return false;
  }
};

/** Returns `{ token, user }`, or null after clearing an invalid session. */
export const getSession = () => {
  const token = getStoredToken();
  const user = getStoredUser();
  if (!token || !user || isTokenExpired(token)) {
    clearSession();
    return null;
  }
  return { token, user };
};

/** Updates the stored user in whichever tier currently holds the session. */
export const updateStoredUser = (user) => {
  if (safeRead(sessionStorage, USER_KEY)) {
    safeWrite(sessionStorage, USER_KEY, JSON.stringify(user));
  }
  if (isPersistentValid()) {
    safeWrite(localStorage, PERSIST_USER_KEY, JSON.stringify(user));
  }
};
