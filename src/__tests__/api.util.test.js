/**
 * Frontend Unit Tests — api.js utility
 * Tests: API_BASE_URL derivation, REACT_APP_SOCKET_URL derivation, parseUnreadCount,
 *        authHeaders, parseJsonResponse, apiRequest (mocked fetch)
 */

// Mock authSession before importing api.js
jest.mock('../utils/authSession', () => ({
  getStoredToken: jest.fn()
}));

import { getStoredToken } from '../utils/authSession';
import {
  API_BASE_URL,
  REACT_APP_SOCKET_URL,
  authHeaders,
  parseUnreadCount,
  parseJsonResponse,
  apiRequest
} from '../utils/api';

// ── API_BASE_URL & REACT_APP_SOCKET_URL ─────────────────────────────────────────────────
describe('API_BASE_URL', () => {
  test('is defined and contains /api/v1', () => {
    expect(API_BASE_URL).toContain('/api/v1');
  });
});

describe('REACT_APP_SOCKET_URL', () => {
  test('is derived from API_BASE_URL without the /api/v1 suffix', () => {
    expect(REACT_APP_SOCKET_URL).not.toContain('/api/v1');
    expect(typeof REACT_APP_SOCKET_URL).toBe('string');
    expect(REACT_APP_SOCKET_URL.length).toBeGreaterThan(0);
  });
});

// ── authHeaders ───────────────────────────────────────────────────────────────
describe('authHeaders', () => {
  test('includes Authorization header when token is stored', () => {
    getStoredToken.mockReturnValue('my.jwt.token');
    const headers = authHeaders();
    expect(headers).toHaveProperty('Authorization', 'Bearer my.jwt.token');
  });

  test('returns headers unchanged when no token is stored', () => {
    getStoredToken.mockReturnValue(null);
    const headers = authHeaders({ 'Content-Type': 'application/json' });
    expect(headers).not.toHaveProperty('Authorization');
    expect(headers['Content-Type']).toBe('application/json');
  });

  test('merges extra headers with Authorization', () => {
    getStoredToken.mockReturnValue('tok');
    const headers = authHeaders({ 'X-Custom': 'val' });
    expect(headers['Authorization']).toBe('Bearer tok');
    expect(headers['X-Custom']).toBe('val');
  });
});

// ── parseUnreadCount ─────────────────────────────────────────────────────────
describe('parseUnreadCount', () => {
  test('returns count from payload.count', () => {
    expect(parseUnreadCount({ count: 5 })).toBe(5);
  });

  test('returns count from payload.data.count', () => {
    expect(parseUnreadCount({ data: { count: 3 } })).toBe(3);
  });

  test('returns count from payload.unreadCount', () => {
    expect(parseUnreadCount({ unreadCount: 7 })).toBe(7);
  });

  test('returns count from payload.data.unreadCount', () => {
    expect(parseUnreadCount({ data: { unreadCount: 2 } })).toBe(2);
  });

  test('returns 0 for null/undefined payload', () => {
    expect(parseUnreadCount(null)).toBe(0);
    expect(parseUnreadCount(undefined)).toBe(0);
    expect(parseUnreadCount({})).toBe(0);
  });

  test('returns 0 for non-finite count values', () => {
    expect(parseUnreadCount({ count: 'many' })).toBe(0);
    expect(parseUnreadCount({ count: NaN })).toBe(0);
    expect(parseUnreadCount({ count: Infinity })).toBe(0);
  });

  test('handles string number counts', () => {
    expect(parseUnreadCount({ count: '4' })).toBe(4);
  });
});

// ── parseJsonResponse ─────────────────────────────────────────────────────────
describe('parseJsonResponse', () => {
  test('returns empty object for empty response body', async () => {
    const mockResponse = { text: jest.fn().mockResolvedValue('') };
    const result = await parseJsonResponse(mockResponse);
    expect(result).toEqual({});
  });

  test('parses valid JSON response', async () => {
    const payload = { success: true, data: [1, 2, 3] };
    const mockResponse = { text: jest.fn().mockResolvedValue(JSON.stringify(payload)) };
    const result = await parseJsonResponse(mockResponse);
    expect(result).toEqual(payload);
  });

  test('throws on invalid JSON', async () => {
    const mockResponse = { text: jest.fn().mockResolvedValue('not-json{') };
    await expect(parseJsonResponse(mockResponse)).rejects.toThrow('Invalid JSON response from server');
  });
});

// ── apiRequest ────────────────────────────────────────────────────────────────
describe('apiRequest', () => {
  beforeEach(() => {
    getStoredToken.mockReturnValue('test.token.here');
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('calls fetch with correct URL and Authorization header', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify({ success: true }))
    });

    await apiRequest('/employees');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/employees'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test.token.here' })
      })
    );
  });

  test('returns parsed data on success', async () => {
    const payload = { success: true, data: { name: 'Alice' } };
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(payload))
    });

    const result = await apiRequest('/employees/me');
    expect(result).toEqual(payload);
  });

  test('throws error with server message on non-ok response', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: jest.fn().mockResolvedValue(JSON.stringify({ message: 'Not authorized' }))
    });

    await expect(apiRequest('/protected')).rejects.toThrow('Not authorized');
  });

  test('throws generic error when server returns no message', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue(JSON.stringify({}))
    });

    await expect(apiRequest('/broken')).rejects.toThrow(/500/);
  });

  test('skips auth header when auth=false', async () => {
    getStoredToken.mockReturnValue('tok');
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('{}')
    });

    await apiRequest('/public', { auth: false });

    const [, options] = global.fetch.mock.calls[0];
    expect(options?.headers?.Authorization).toBeUndefined();
  });

  test('normalizes path without leading slash', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('{}')
    });

    await apiRequest('employees'); // no leading /

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/employees'),
      expect.anything()
    );
  });
});
