import { isBranchRole } from '@/constants/roles';
import { request } from '@/api/client';

/**
 * Geofence endpoints.
 *
 * Branch managers edit their own branch's boundary; admins edit the company
 * one. Both use the same request shape, so the caller only supplies the role.
 */

export const geofenceEndpointFor = (role) =>
  isBranchRole(role) ? '/branches/mine/geofence' : '/locations/geofence';

export const fetchGeofence = (role, signal) =>
  request(geofenceEndpointFor(role), { signal });

export const saveGeofence = (role, payload) =>
  request(geofenceEndpointFor(role), { method: 'POST', json: payload });

/** The boundary attached to a specific branch, resolved from a scanned QR. */
export const fetchBranchGeofence = (branchId) =>
  request(`/branches/${branchId}/geofence`);

/** The company-wide boundary, used when a QR carries no branch. */
export const fetchCompanyGeofence = () => request('/locations/geofence');
