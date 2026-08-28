import { useCallback, useEffect, useMemo, useState } from 'react';

import { SESSION_EXPIRED_EVENT, request } from '@/api/client';
import {
  clearSession,
  getSession,
  storePersistentSession,
  storeSession,
  updateStoredUser,
} from '@/lib/auth-session';
import { AuthContext } from './auth-context';

/**
 * Owns the signed-in user.
 *
 * The stored session is read synchronously in the state initialiser rather than
 * in an effect, so route guards never see a transient "logged out" state on a
 * hard refresh and bounce the user to the login screen by mistake.
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getSession()?.user || null);

  // The API client fires this when the server rejects our token.
  useEffect(() => {
    const handleExpiry = () => setCurrentUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpiry);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpiry);
  }, []);

  const setSession = useCallback((token, user, persistent = false) => {
    if (persistent) {
      storePersistentSession(token, user);
    } else {
      storeSession(token, user);
    }
    setCurrentUser(user);
  }, []);

  const login = useCallback(
    async (email, password, { remember = false } = {}) => {
      const data = await request('/auth/login', {
        method: 'POST',
        auth: false,
        json: { email: email.trim().toLowerCase(), password },
      });

      if (!data?.token) {
        throw new Error(data?.message || 'Invalid email or password.');
      }

      setSession(data.token, data.user, remember);
      return data;
    },
    [setSession],
  );

  const signup = useCallback(
    async (payload) => {
      const data = await request('/auth/register-business', {
        method: 'POST',
        auth: false,
        json: { role: 'admin', ...payload },
      });

      if (!data?.token) {
        throw new Error(data?.message || 'Could not create your account.');
      }

      setSession(data.token, data.user);
      return data;
    },
    [setSession],
  );

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
  }, []);

  /** Merges changes into the stored user after a profile or settings save. */
  const patchUser = useCallback((changes) => {
    setCurrentUser((current) => {
      if (!current) return current;
      const next = { ...current, ...changes };
      updateStoredUser(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      role: currentUser?.role || null,
      setSession,
      login,
      signup,
      logout,
      patchUser,
    }),
    [currentUser, setSession, login, signup, logout, patchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
