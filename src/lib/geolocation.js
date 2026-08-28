import { DEFAULT_OFFICE_COORDINATES, DEFAULT_VERIFICATION_RADIUS } from '@/constants/config';

/** Geolocation and geofence maths for the check-in flow. */

export const OFFICE_COORDINATES = DEFAULT_OFFICE_COORDINATES;
export const VERIFICATION_RADIUS = DEFAULT_VERIFICATION_RADIUS;

const ACCURACY_TARGET_METRES = 20;
const LOCATION_TIMEOUT_MS = 12_000;

/**
 * Watches the device position and resolves with the most accurate fix seen,
 * settling early once accuracy is good enough. A single `getCurrentPosition`
 * call is often 100 m+ out indoors, which fails a 20 m geofence.
 */
export const getUserLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    let bestPosition = null;
    let settled = false;
    let watchId = null;

    const finish = () => {
      if (settled) return;
      settled = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);

      if (!bestPosition) {
        reject(new Error('Location information is unavailable.'));
        return;
      }

      resolve({
        latitude: bestPosition.coords.latitude,
        longitude: bestPosition.coords.longitude,
        accuracy: bestPosition.coords.accuracy,
      });
    };

    const timer = setTimeout(finish, LOCATION_TIMEOUT_MS);

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }
        if (bestPosition.coords.accuracy <= ACCURACY_TARGET_METRES) {
          clearTimeout(timer);
          finish();
        }
      },
      (error) => {
        clearTimeout(timer);
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);

        const messages = {
          [error.PERMISSION_DENIED]:
            'Location access denied. Please enable location services.',
          [error.POSITION_UNAVAILABLE]: 'Location information is unavailable.',
          [error.TIMEOUT]: 'Location request timed out.',
        };
        reject(
          new Error(
            messages[error.code] ||
              'An unknown error occurred while retrieving location.',
          ),
        );
      },
      { enableHighAccuracy: true, timeout: LOCATION_TIMEOUT_MS, maximumAge: 0 },
    );
  });

/** Great-circle distance between two `{ latitude, longitude }` pairs, in metres. */
export const calculateDistance = (from, to) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusMetres = 6371e3;

  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const deltaLat = toRad(to.latitude - from.latitude);
  const deltaLng = toRad(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return earthRadiusMetres * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Checks a position against a geofence.
 *
 * @param {{latitude:number, longitude:number}} coords Where the user is.
 * @param {{latitude:number, longitude:number, radius:number}} [geofence]
 */
export const verifyLocation = (coords, geofence) => {
  const centre = geofence || OFFICE_COORDINATES;
  const maxDistance = geofence?.radius ?? VERIFICATION_RADIUS;
  const distance = calculateDistance(coords, centre);

  return {
    distance,
    maxDistance,
    isWithinRadius: distance <= maxDistance,
  };
};
