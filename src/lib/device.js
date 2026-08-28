/** Device identification helpers used by the attendance anti-spoofing checks. */

/**
 * Builds a stable SHA-256 fingerprint from immutable browser characteristics.
 * The same device and browser produce the same hash across sessions, which is
 * what the backend compares against to flag shared-device check-ins.
 */
export const generateDeviceFingerprint = async () => {
  const components = [
    navigator.userAgent,
    `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.platform,
    String(navigator.hardwareConcurrency || ''),
    String(new Date().getTimezoneOffset()),
  ].join('||');

  try {
    const encoded = new TextEncoder().encode(components);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    // `crypto.subtle` is unavailable over plain HTTP; fall back to a weaker hash.
    return btoa(components).replace(/[^a-zA-Z0-9]/g, '').slice(0, 64);
  }
};

/** Human-readable device name from a user-agent string. */
export const getDeviceLabel = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('windows')) return 'Windows PC';
  if (ua.includes('mac')) return 'Mac';
  if (ua.includes('linux')) return 'Linux';
  return 'Unknown device';
};

/** Which biometric prompt the user will most likely see on this device. */
export const getBiometricLabel = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad')) return 'Face ID / Touch ID';
  if (ua.includes('android')) return 'Fingerprint';
  if (ua.includes('windows')) return 'Windows Hello';
  return 'Biometric';
};
