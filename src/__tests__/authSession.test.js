/**
 * Frontend Unit Tests — authSession.js utility
 * Tests: getStoredToken, getStoredUser, isTokenExpired, getSession, storeSession, clearSession
 */

import {
  getStoredToken,
  getStoredUser,
  isTokenExpired,
  getSession,
  storeSession,
  clearSession
} from '../utils/authSession';

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeJwt = (payload) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

const validToken = makeJwt({ id: 'user123', exp: Math.floor(Date.now() / 1000) + 3600 });
const expiredToken = makeJwt({ id: 'user123', exp: Math.floor(Date.now() / 1000) - 1 });

const mockUser = { id: 'user123', name: 'Test', role: 'admin', company: 'TestCo' };

// ── Setup / teardown ──────────────────────────────────────────────────────────
beforeEach(() => {
  sessionStorage.clear();
});

// ── getStoredToken ────────────────────────────────────────────────────────────
describe('getStoredToken', () => {
  test('returns null when no token stored', () => {
    expect(getStoredToken()).toBeNull();
  });

  test('returns stored token string', () => {
    sessionStorage.setItem('token', validToken);
    expect(getStoredToken()).toBe(validToken);
  });
});

// ── getStoredUser ─────────────────────────────────────────────────────────────
describe('getStoredUser', () => {
  test('returns null when no user stored', () => {
    expect(getStoredUser()).toBeNull();
  });

  test('returns parsed user object', () => {
    sessionStorage.setItem('user', JSON.stringify(mockUser));
    expect(getStoredUser()).toEqual(mockUser);
  });

  test('returns null and clears session when user JSON is corrupt', () => {
    sessionStorage.setItem('user', '{not-valid-json}');
    sessionStorage.setItem('token', validToken);
    expect(getStoredUser()).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull(); // session cleared
  });
});

// ── isTokenExpired ────────────────────────────────────────────────────────────
describe('isTokenExpired', () => {
  test('returns true for null/undefined token', () => {
    expect(isTokenExpired(null)).toBe(true);
    expect(isTokenExpired(undefined)).toBe(true);
    expect(isTokenExpired('')).toBe(true);
  });

  test('returns false for a valid (non-expired) token', () => {
    expect(isTokenExpired(validToken)).toBe(false);
  });

  test('returns true for an expired token', () => {
    expect(isTokenExpired(expiredToken)).toBe(true);
  });

  test('returns false when token has no exp claim', () => {
    const noExpToken = makeJwt({ id: 'user123' }); // no exp field
    expect(isTokenExpired(noExpToken)).toBe(false);
  });

  test('returns false for a malformed token (fail-safe)', () => {
    expect(isTokenExpired('not.a.valid')).toBe(false);
  });
});

// ── storeSession ──────────────────────────────────────────────────────────────
describe('storeSession', () => {
  test('persists token and user in sessionStorage', () => {
    storeSession(validToken, mockUser);
    expect(sessionStorage.getItem('token')).toBe(validToken);
    expect(JSON.parse(sessionStorage.getItem('user'))).toEqual(mockUser);
  });
});

// ── clearSession ──────────────────────────────────────────────────────────────
describe('clearSession', () => {
  test('removes token and user from sessionStorage', () => {
    storeSession(validToken, mockUser);
    clearSession();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
  });
});

// ── getSession ────────────────────────────────────────────────────────────────
describe('getSession', () => {
  test('returns null when nothing is stored', () => {
    expect(getSession()).toBeNull();
  });

  test('returns { token, user } when both are valid', () => {
    storeSession(validToken, mockUser);
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session.token).toBe(validToken);
    expect(session.user).toEqual(mockUser);
  });

  test('returns null and clears when token is expired', () => {
    storeSession(expiredToken, mockUser);
    expect(getSession()).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  test('returns null when user is missing even if token is valid', () => {
    sessionStorage.setItem('token', validToken);
    expect(getSession()).toBeNull();
  });
});
