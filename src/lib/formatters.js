/** Display formatting helpers. Every one is safe to call with null/undefined. */

const EM_DASH = '—';

/** Formats a number as currency. Defaults to XAF, the app's primary currency. */
export const formatCurrency = (amount, currency = 'XAF') => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${currency} 0`;
  return `${currency} ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

/** Formats a plain number with thousands separators. */
export const formatNumber = (value, fallback = '0') => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString('en-US') : fallback;
};

/** Rounds to a whole percent, e.g. `formatPercent(0.8342)` → `83%`. */
export const formatPercent = (ratio, fallback = EM_DASH) => {
  const value = Number(ratio);
  if (!Number.isFinite(value)) return fallback;
  return `${Math.round(value * 100)}%`;
};

const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** `12 Mar 2026` */
export const formatDate = (value, fallback = EM_DASH) => {
  const date = toDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/** `12 Mar 2026, 09:15` */
export const formatDateTime = (value, fallback = EM_DASH) => {
  const date = toDate(value);
  if (!date) return fallback;
  return `${formatDate(date)}, ${formatTime(date)}`;
};

/** `09:15` (24-hour, matching the shift-time inputs). */
export const formatTime = (value, fallback = EM_DASH) => {
  const date = toDate(value);
  if (!date) return fallback;
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/** `Thu` */
export const formatWeekday = (value, fallback = EM_DASH) => {
  const date = toDate(value);
  return date ? date.toLocaleDateString('en-GB', { weekday: 'short' }) : fallback;
};

/** `2026-03-12` — the value format `<input type="date">` expects. */
export const toDateInputValue = (value) => {
  const date = toDate(value);
  if (!date) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

/** `3 days ago`, `in 2 hours`, `just now`. */
export const formatRelativeTime = (value, fallback = EM_DASH) => {
  const date = toDate(value);
  if (!date) return fallback;

  const deltaSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absolute = Math.abs(deltaSeconds);
  if (absolute < 45) return 'just now';

  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, seconds] of units) {
    if (absolute >= seconds) {
      return formatter.format(Math.round(deltaSeconds / seconds), unit);
    }
  }
  return formatter.format(deltaSeconds, 'second');
};

/** `2 h 35 min` from a minute count. */
export const formatDuration = (minutes, fallback = EM_DASH) => {
  const total = Number(minutes);
  if (!Number.isFinite(total)) return fallback;
  if (total < 60) return `${Math.round(total)} min`;
  const hours = Math.floor(total / 60);
  const rest = Math.round(total % 60);
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
};

/** `450 m` / `1.20 km` — used by the geofence and check-in screens. */
export const formatDistance = (metres, fallback = EM_DASH) => {
  const value = Number(metres);
  if (!Number.isFinite(value)) return fallback;
  if (value < 1) return `${Math.round(value * 100)} cm`;
  if (value < 1000) return `${Math.round(value)} m`;
  return `${(value / 1000).toFixed(2)} km`;
};

/** `1.4 MB` */
export const formatFileSize = (bytes, fallback = EM_DASH) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return fallback;
  if (value < 1024) return `${value} B`;
  const units = ['KB', 'MB', 'GB'];
  let size = value / 1024;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(1)} ${units[index]}`;
};

/** `Ada Lovelace` → `AL`; used for avatar fallbacks. */
export const getInitials = (name, fallback = '?') => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/** Truncates to `max` characters, appending an ellipsis. */
export const truncate = (text, max = 80) => {
  const value = String(text || '');
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const monthName = (month) => MONTHS[Number(month) - 1] || EM_DASH;

/** The last `count` years, newest first — for month/year report filters. */
export const recentYears = (count = 5) => {
  const now = new Date().getFullYear();
  return Array.from({ length: count }, (_, index) => now - index);
};
