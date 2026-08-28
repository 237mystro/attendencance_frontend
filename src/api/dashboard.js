import { buildQuery, request } from '@/api/client';

/**
 * Reads that feed the dashboards.
 *
 * A dashboard pulls from half a dozen unrelated endpoints, and one of them
 * being unavailable should dim a single tile rather than blank the page —
 * `settle` below is what makes that possible.
 */

export const fetchWeeklyAttendance = (signal) =>
  request('/attendance/weekly', { signal });

export const fetchAttendanceSummary = (signal) =>
  request('/attendance/admin-dashboard', { signal });

export const fetchMyAttendance = (signal) => request('/attendance', { signal });

export const fetchMyBranch = (signal) => request('/branches/mine', { signal });

export const fetchPendingLateCount = (signal) =>
  request('/late-permissions/pending-count', { signal });

export const fetchAllLeave = (signal) => request('/leave/all', { signal });

export const fetchMyLeave = (signal) => request('/leave/my-requests', { signal });

export const fetchMyShiftsFrom = (from, signal) =>
  request(`/schedules/my-shifts${buildQuery({ from })}`, { signal });

/**
 * Runs every request, returning `fallback` for any that fail.
 *
 * `Promise.allSettled` rather than `all`: a dashboard that goes blank because
 * one widget's endpoint is down is worse than a dashboard with one gap in it.
 */
export const settle = async (tasks) => {
  const entries = Object.entries(tasks);
  const results = await Promise.allSettled(entries.map(([, task]) => task()));

  return Object.fromEntries(
    entries.map(([key], index) => [
      key,
      results[index].status === 'fulfilled' ? results[index].value : null,
    ]),
  );
};

/**
 * A single frozen empty array, returned wherever a list is missing.
 *
 * `x?.data || []` would hand out a fresh array on every render, invalidating
 * every downstream `useMemo` that depends on it.
 */
export const EMPTY_LIST = Object.freeze([]);

/** The first day of the current month, as `YYYY-MM-DD`. */
export const startOfThisMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};
