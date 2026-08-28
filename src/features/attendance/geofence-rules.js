import { calculateDistance } from '@/lib/geolocation';
import { formatDistance } from '@/lib/formatters';

/**
 * The rules that decide whether someone is close enough to clock in.
 *
 * Two allowances matter and both are deliberate:
 *
 *  - A floor on the radius, because a boundary tighter than 50 m cannot be
 *    satisfied reliably by consumer GPS and would lock people out of work.
 *  - A margin equal to the reading's own accuracy, capped, so a phone that
 *    reports "±80 m" is not treated as if it knew its position exactly.
 */

export const MIN_GEOFENCE_RADIUS_METRES = 50;
export const MAX_GPS_ACCURACY_ALLOWANCE_METRES = 200;

/** Never trusts a radius below the floor, whatever the server sent. */
export const effectiveRadius = (geofence) =>
  Math.max(Number(geofence?.radius) || 0, MIN_GEOFENCE_RADIUS_METRES);

/** The extra slack granted for this reading's own uncertainty. */
export const accuracyAllowance = (location) =>
  Math.min(
    Math.max(Number(location?.accuracy) || 0, 0),
    MAX_GPS_ACCURACY_ALLOWANCE_METRES,
  );

/** Normalises a geofence from the API, applying the radius floor. */
export const normalizeGeofence = (geofence) =>
  geofence?.latitude
    ? { ...geofence, radius: effectiveRadius(geofence) }
    : null;

/**
 * Compares a position against a boundary.
 *
 * @returns {{distance:number, radius:number, allowance:number, isWithinRange:boolean}}
 */
export const evaluateGeofence = (location, geofence) => {
  const distance = calculateDistance(
    { latitude: location.latitude, longitude: location.longitude },
    { latitude: geofence.latitude, longitude: geofence.longitude },
  );
  const radius = effectiveRadius(geofence);
  const allowance = accuracyAllowance(location);

  return {
    distance,
    radius,
    allowance,
    isWithinRange: distance <= radius + allowance,
  };
};

/** Explains a refusal in terms the employee can act on. */
export const describeGeofenceFailure = ({ distance, radius, allowance }, action) => {
  const accuracyNote =
    allowance > 0 ? ` Your GPS accuracy margin is ±${Math.round(allowance)} m.` : '';

  return `You are ${formatDistance(distance)} away. You must be within ${radius} m to ${action}.${accuracyNote}`;
};
