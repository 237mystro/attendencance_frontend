import { API_BASE_URL } from '@/constants/config';
import { clearSession, getStoredToken } from '@/lib/auth-session';

/**
 * Thin `fetch` wrapper around the AutoPayroll REST API.
 *
 * `request()` parses JSON and throws `ApiError` on a non-2xx response.
 * `rawRequest()` returns the untouched `Response` for blob/PDF downloads.
 */

/** Error carrying the HTTP status so callers can branch on it. */
export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Fired when the API rejects our token. `AuthProvider` listens for this and
 * bounces the user to /login — the original app had no such handling, so an
 * expired token surfaced as an unexplained error on whatever screen you were on.
 */
export const SESSION_EXPIRED_EVENT = 'autopayroll:session-expired';

const buildHeaders = (headers, auth, body) => {
  const result = { ...headers };

  // Let the browser set the multipart boundary itself for FormData bodies.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData && body !== undefined && !result['Content-Type']) {
    result['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getStoredToken();
    if (token) result.Authorization = `Bearer ${token}`;
  }

  return result;
};

const normalizePath = (path) => (path.startsWith('/') ? path : `/${path}`);

const parseBody = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    // Some error responses are plain text or HTML; surface them as a message.
    return { message: text };
  }
};

const handleUnauthorized = () => {
  clearSession();
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
};

/**
 * Performs a request and returns the parsed JSON body.
 *
 * @param {string} path      Path relative to the API base, e.g. `/employees`.
 * @param {object} [options] Standard `fetch` options, plus:
 * @param {boolean} [options.auth=true] Attach the bearer token.
 * @param {unknown} [options.json]      Body to JSON-encode.
 * @throws {ApiError}
 */
export const request = async (path, options = {}) => {
  const { headers, auth = true, json, body, signal, ...rest } = options;

  const payload = json !== undefined ? JSON.stringify(json) : body;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
      ...rest,
      signal,
      body: payload,
      headers: buildHeaders(headers, auth, payload),
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError(
      'Cannot reach the server. Check your connection and try again.',
      { status: 0 },
    );
  }

  const data = await parseBody(response);

  if (response.status === 401 && auth) {
    handleUnauthorized();
    throw new ApiError(data.message || 'Your session has expired. Please sign in again.', {
      status: 401,
      data,
    });
  }

  if (!response.ok) {
    throw new ApiError(
      data.message || data.error || `Request failed with status ${response.status}`,
      { status: response.status, data },
    );
  }

  return data;
};

/** Performs a request and returns the raw `Response` (for blobs and PDFs). */
export const rawRequest = async (path, options = {}) => {
  const { headers, auth = true, json, body, ...rest } = options;
  const payload = json !== undefined ? JSON.stringify(json) : body;

  const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
    ...rest,
    body: payload,
    headers: buildHeaders(headers, auth, payload),
  });

  if (response.status === 401 && auth) handleUnauthorized();

  return response;
};

/** Convenience verbs. */
export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, json, options) => request(path, { ...options, method: 'POST', json }),
  put: (path, json, options) => request(path, { ...options, method: 'PUT', json }),
  patch: (path, json, options) => request(path, { ...options, method: 'PATCH', json }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

/**
 * The unread-count endpoint has returned the number under four different keys
 * across API versions; check all of them rather than showing a stale zero.
 */
export const parseUnreadCount = (payload) => {
  const count =
    payload?.count ??
    payload?.data?.count ??
    payload?.unreadCount ??
    payload?.data?.unreadCount ??
    0;
  const parsed = Number(count);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Builds a query string, skipping empty values. Returns '' or '?a=1&b=2'. */
export const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};
