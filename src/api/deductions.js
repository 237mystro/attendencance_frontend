import { buildQuery, request } from '@/api/client';

/** Late deductions, monthly reports, and discretionary bonuses. */

// ── Grace period ───────────────────────────────────────────────────────────

/** Minutes an employee may be late before a deduction applies. */
export const fetchBufferMinutes = (signal) => request('/deductions/buffer', { signal });

export const saveBufferMinutes = (bufferMinutes) =>
  request('/deductions/buffer', { method: 'POST', json: { bufferMinutes } });

// ── Late records ───────────────────────────────────────────────────────────

export const fetchLateRecords = ({ month, year }, signal) =>
  request(`/deductions/records${buildQuery({ month, year })}`, { signal });

/** The signed-in employee's own late records. */
export const fetchMyLateRecords = (signal) =>
  request('/deductions/my-records', { signal });

// ── Monthly reports ────────────────────────────────────────────────────────

export const fetchReports = (signal) => request('/deductions/reports', { signal });

export const fetchReportDetail = (reportId, signal) =>
  request(`/deductions/reports/${reportId}`, { signal });

export const generateReport = ({ month, year }) =>
  request('/deductions/reports/generate', { method: 'POST', json: { month, year } });

export const approveReport = (reportId) =>
  request(`/deductions/reports/${reportId}/approve`, { method: 'PUT' });

/** Marks the report paid and emails each affected employee their breakdown. */
export const payAndSendReport = (reportId) =>
  request(`/deductions/reports/${reportId}/pay-and-send`, { method: 'POST' });

/** The signed-in employee's own reports. */
export const fetchMyReports = (signal) => request('/deductions/my-reports', { signal });

// ── Bonuses ────────────────────────────────────────────────────────────────

export const fetchBonuses = ({ month, year }, signal) =>
  request(`/deductions/bonuses${buildQuery({ month, year })}`, { signal });

export const createBonus = (payload) =>
  request('/deductions/bonuses', { method: 'POST', json: payload });

export const deleteBonus = (bonusId) =>
  request(`/deductions/bonuses/${bonusId}`, { method: 'DELETE' });

/** The signed-in employee's own bonuses. */
export const fetchMyBonuses = (signal) => request('/deductions/my-bonuses', { signal });
