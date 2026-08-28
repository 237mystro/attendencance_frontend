import { useCallback, useState } from 'react';

import { getUserLocation } from '@/lib/geolocation';
import { fetchBranchGeofence, fetchCompanyGeofence } from '@/api/geofence';
import { fetchMyGeofence } from '@/api/attendance';
import {
  describeGeofenceFailure,
  evaluateGeofence,
  normalizeGeofence,
} from '../geofence-rules';

/**
 * Owns location capture and the geofence check that gates every check-in.
 *
 * Status moves `idle → locating → located → verified`, or to `failed` at any
 * point. Both the QR and biometric paths share it, so the boundary rules are
 * applied identically no matter how the employee identifies themselves.
 */
export function useCheckInLocation() {
  const [status, setStatus] = useState('idle');
  const [location, setLocation] = useState(null);
  const [geofence, setGeofence] = useState(null);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setStatus('idle');
    setLocation(null);
    setGeofence(null);
    setDistance(null);
    setError('');
  }, []);

  /** Step one: capture a position, without checking any boundary yet. */
  const capture = useCallback(async () => {
    setStatus('locating');
    setError('');
    setGeofence(null);
    setDistance(null);

    try {
      const position = await getUserLocation();
      setLocation(position);
      setStatus('located');
      return position;
    } catch (caught) {
      setStatus('failed');
      setError(caught?.message || 'Failed to capture your location.');
      return null;
    }
  }, []);

  /**
   * Step two: load the applicable boundary and compare the position to it.
   *
   * @param {object} options
   * @param {'qr'|'biometric'} options.source  Which endpoint supplies the boundary.
   * @param {string} [options.branchId]        Branch encoded in a scanned QR.
   * @param {string} options.actionLabel       Used in the refusal message.
   * @returns {{location: object, geofence: object}|null} Null when refused.
   */
  const verifyAgainstGeofence = useCallback(
    async ({ source, branchId, actionLabel }) => {
      setStatus('locating');
      setError('');

      try {
        const position = location || (await getUserLocation());

        const response = branchId
          ? await fetchBranchGeofence(branchId)
          : source === 'biometric'
            ? await fetchMyGeofence()
            : await fetchCompanyGeofence();

        const boundary = response?.success ? normalizeGeofence(response.geofence) : null;

        if (!boundary) {
          setLocation(position);
          setStatus('failed');
          setError(
            source === 'biometric'
              ? 'No geofence is configured for your account. Please contact your administrator.'
              : 'No geofence is configured for this QR code. Please contact your administrator.',
          );
          return null;
        }

        const check = evaluateGeofence(position, boundary);

        setLocation(position);
        setGeofence(boundary);
        setDistance(check.distance);

        if (!check.isWithinRange) {
          setStatus('failed');
          setError(describeGeofenceFailure(check, actionLabel));
          return null;
        }

        setStatus('verified');
        return { location: position, geofence: boundary };
      } catch (caught) {
        setStatus('failed');
        setError(caught?.message || 'Failed to verify your location.');
        return null;
      }
    },
    [location],
  );

  return {
    status,
    location,
    geofence,
    distance,
    error,
    setError,
    capture,
    verifyAgainstGeofence,
    reset,
  };
}
