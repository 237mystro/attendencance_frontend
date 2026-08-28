import { buildQuery, request } from '@/api/client';

/** Shift scheduling and peer-to-peer shift transfers. */

// ── Schedules (admin / branch) ─────────────────────────────────────────────

export const fetchSchedules = (signal) => request('/schedules', { signal });

export const createShift = (payload) =>
  request('/schedules', { method: 'POST', json: payload });

export const updateShift = (shiftId, payload) =>
  request(`/schedules/${shiftId}`, { method: 'PUT', json: payload });

export const deleteShift = (shiftId) =>
  request(`/schedules/${shiftId}`, { method: 'DELETE' });

/** Creates every matching shift in a date range in one call. */
export const createRecurringShifts = (payload) =>
  request('/schedules/bulk', { method: 'POST', json: payload });

// ── My shifts (employee) ───────────────────────────────────────────────────

export const fetchMyShifts = (params, signal) =>
  request(`/schedules/my-shifts${buildQuery(params)}`, { signal });

/** Accepts or declines a shift the admin assigned. */
export const respondToShift = (shiftId, action) =>
  request(`/schedules/${shiftId}/respond`, { method: 'PATCH', json: { action } });

// ── Shift transfers (employee to employee) ─────────────────────────────────

export const fetchMyTransfers = (signal) =>
  request('/shift-transfers/my-transfers', { signal });

/** Colleagues who may take a shift — the server filters by branch and role. */
export const fetchTransferCandidates = (signal) =>
  request('/shift-transfers/eligible-employees', { signal });

export const requestTransfer = ({ shiftId, toEmployeeId, message }) =>
  request('/shift-transfers/request', {
    method: 'POST',
    json: { shiftId, toEmployeeId, message },
  });

/** `action` is 'accept' or 'decline'. */
export const respondToTransfer = (transferId, action) =>
  request(`/shift-transfers/${transferId}/${action}`, { method: 'PATCH' });
