import { request } from '@/api/client';

/** Every `/branches` call, in one place. */

export const fetchBranches = (signal) => request('/branches', { signal });

export const createBranch = (payload) =>
  request('/branches', { method: 'POST', json: payload });

export const updateBranch = (branchId, payload) =>
  request(`/branches/${branchId}`, { method: 'PUT', json: payload });

export const deleteBranch = (branchId) =>
  request(`/branches/${branchId}`, { method: 'DELETE' });

/** Promotes an employee to branch manager or branch HR. */
export const assignBranchRole = (branchId, { userId, role }) =>
  request(`/branches/${branchId}/assign`, { method: 'POST', json: { userId, role } });

export const fetchBranchGeofence = (branchId, signal) =>
  request(`/branches/${branchId}/geofence`, { signal });

export const saveBranchGeofence = (branchId, payload) =>
  request(`/branches/${branchId}/geofence`, { method: 'POST', json: payload });
