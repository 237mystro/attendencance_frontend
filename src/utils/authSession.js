const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const PERSIST_TOKEN_KEY = 'autopayroll-persist-token';
const PERSIST_USER_KEY  = 'autopayroll-persist-user';
const PERSIST_EXPIRY_KEY = 'autopayroll-persist-expiry';

// ── Persistent session (localStorage with expiry) ────────────────────────────

const isPersistentValid = () => {
  const expiry = localStorage.getItem(PERSIST_EXPIRY_KEY);
  if (!expiry) return false;
  if (Date.now() > Number(expiry)) {
    clearPersistentSession();
    return false;
  }
  return true;
};

const clearPersistentSession = () => {
  localStorage.removeItem(PERSIST_TOKEN_KEY);
  localStorage.removeItem(PERSIST_USER_KEY);
  localStorage.removeItem(PERSIST_EXPIRY_KEY);
};

export const storePersistentSession = (token, user, days = 30) => {
  const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(PERSIST_TOKEN_KEY, token);
  localStorage.setItem(PERSIST_USER_KEY, JSON.stringify(user));
  localStorage.setItem(PERSIST_EXPIRY_KEY, String(expiry));
  // Also mirror into sessionStorage so the current tab works immediately
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

// ── Standard session (sessionStorage, clears on browser close) ───────────────

export const storeSession = (token, user) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredToken = () => {
  // Prefer the live tab session
  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  if (sessionToken) return sessionToken;

  // Fall back to remembered persistent session
  if (isPersistentValid()) {
    const t = localStorage.getItem(PERSIST_TOKEN_KEY);
    if (t) {
      // Hydrate sessionStorage so this tab's subsequent calls are fast
      sessionStorage.setItem(TOKEN_KEY, t);
      const u = localStorage.getItem(PERSIST_USER_KEY);
      if (u) sessionStorage.setItem(USER_KEY, u);
    }
    return t;
  }

  return null;
};

export const clearSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  clearPersistentSession();
};

export const getStoredUser = () => {
  const raw = sessionStorage.getItem(USER_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { clearSession(); return null; }
  }

  if (isPersistentValid()) {
    const persistRaw = localStorage.getItem(PERSIST_USER_KEY);
    if (persistRaw) {
      try { return JSON.parse(persistRaw); } catch { clearPersistentSession(); return null; }
    }
  }

  return null;
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  const [, payload] = token.split('.');
  if (!payload) return false;
  try {
    const decoded = JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.exp ? decoded.exp * 1000 <= Date.now() : false;
  } catch {
    return false;
  }
};

export const getSession = () => {
  const token = getStoredToken();
  const user = getStoredUser();
  if (!token || !user || isTokenExpired(token)) {
    clearSession();
    return null;
  }
  return { token, user };
};
