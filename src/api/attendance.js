import { buildQuery, request } from '@/api/client';

/** Every `/attendance` call, in one place. */

/** Today's roster plus the present/late/absent summary, for admins. */
export const fetchAdminDashboard = (signal) =>
  request('/attendance/admin-dashboard', { signal });

/** Check-ins made from a device the employee has not used before. */
export const fetchFlaggedDevices = (signal) =>
  request('/attendance/flagged-devices', { signal });

/** Accepts (`approve`) or cancels (`revoke`) a flagged check-in. */
export const reviewFlaggedDevice = (recordId, action) =>
  request(`/attendance/${recordId}/review-device`, {
    method: 'PUT',
    json: { action },
  });

/** Aggregated attendance analytics for a date range and optional employee. */
export const fetchInsights = (filters, signal) =>
  request(`/attendance/insights${buildQuery(filters)}`, { signal });

/** The employee's own attendance history. */
export const fetchMyAttendance = (signal) => request('/attendance', { signal });

/** The geofence that applies to the signed-in employee. */
export const fetchMyGeofence = () => request('/attendance/my-geofence');

/** Submits a QR check-in with the verified location and selfie. */
export const submitQrCheckIn = ({ qrData, userLocation, selfieBase64, deviceFingerprint }) =>
  request('/attendance/checkin', {
    method: 'POST',
    json: { qrData, userLocation, selfieBase64, deviceFingerprint },
  });

// ── WebAuthn (Face ID / fingerprint / Windows Hello) ───────────────────────

/** Whether this account has already registered a platform authenticator. */
export const fetchBiometricStatus = () => request('/attendance/biometric/status');

export const startBiometricRegistration = () =>
  request('/attendance/biometric/register-start', { method: 'POST' });

export const finishBiometricRegistration = (attestation) =>
  request('/attendance/biometric/register-finish', {
    method: 'POST',
    json: attestation,
  });

export const startBiometricAuth = () =>
  request('/attendance/biometric/auth-start', { method: 'POST' });

export const submitBiometricCheckIn = ({ assertion, userLocation, deviceFingerprint }) =>
  request('/attendance/biometric/checkin', {
    method: 'POST',
    json: { assertion, userLocation, deviceFingerprint },
  });
