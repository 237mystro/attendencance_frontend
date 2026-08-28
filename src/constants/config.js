/** Runtime configuration, read from Vite env vars (`VITE_*`). */

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/** Base URL for every REST call, without a trailing slash. */
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

/** Socket.io origin. Defaults to the API URL with the `/api/v1` suffix stripped. */
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/v1$/, '');

/** Fallback office coordinates when a company has no geofence configured. */
export const DEFAULT_OFFICE_COORDINATES = {
  latitude: Number(import.meta.env.VITE_OFFICE_LATITUDE) || 4.1025,
  longitude: Number(import.meta.env.VITE_OFFICE_LONGITUDE) || 9.3908,
};

/** Default geofence radius in metres. */
export const DEFAULT_VERIFICATION_RADIUS =
  Number(import.meta.env.VITE_VERIFICATION_RADIUS) || 20;

/** How often background badge counts are refreshed, in milliseconds. */
export const POLL_INTERVAL_MS = 30_000;

/** How long a "remember me" session survives, in days. */
export const PERSISTENT_SESSION_DAYS = 30;
