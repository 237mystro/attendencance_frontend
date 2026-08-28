/**
 * Free-text address lookup via OpenStreetMap's Nominatim service.
 *
 * Not routed through `./client` on purpose: this is a third-party endpoint,
 * so it must not receive our bearer token, and its failures are never a session
 * problem.
 */
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * @returns {Promise<{latitude:number, longitude:number, label:string}|null>}
 *   Null when the query matches nothing.
 * @throws when the lookup itself fails (offline, blocked, rate-limited).
 */
export const geocodeAddress = async (query) => {
  const params = new URLSearchParams({ q: query, format: 'json', limit: '1' });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'Accept-Language': 'en' },
  });
  if (!response.ok) throw new Error('Address lookup failed.');

  const [match] = await response.json();
  if (!match) return null;

  return {
    latitude: Number(match.lat),
    longitude: Number(match.lon),
    label: match.display_name,
  };
};
