import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { useCallback, useEffect, useState } from 'react';

import {
  fetchBiometricStatus,
  finishBiometricRegistration,
  startBiometricAuth,
  startBiometricRegistration,
  submitBiometricCheckIn,
} from '@/api/attendance';

/** Whether this device has a built-in authenticator we can use. */
export const isBiometricSupported = async () => {
  if (!window.PublicKeyCredential) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

/** A cancelled prompt is the common case and deserves its own wording. */
const describeWebAuthnError = (error, fallback) =>
  error?.name === 'NotAllowedError'
    ? 'Biometric prompt was cancelled. Please try again.'
    : error?.message || fallback;

/**
 * Owns the WebAuthn registration and authentication flow.
 *
 * Step moves `idle → registering | authenticating → success | error`. The
 * location approved before the prompt opened is passed back in, so a device
 * that moved between verification and the fingerprint touch cannot check in
 * against a stale position.
 */
export function useBiometricCheckIn({ deviceFingerprint, onSuccess }) {
  const [supported, setSupported] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [step, setStep] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    isBiometricSupported().then((result) => {
      if (active) setSupported(result);
    });
    return () => {
      active = false;
    };
  }, []);

  /** Asks the server whether this account already has an authenticator. */
  const loadStatus = useCallback(async () => {
    const status = await fetchBiometricStatus();
    setNeedsRegistration(!status.registered);
    return status;
  }, []);

  const authenticate = useCallback(
    async ({ location, geofence }) => {
      setStep('authenticating');
      setError('');

      try {
        if (!location || !geofence) {
          throw new Error('Please verify your location again before using biometrics.');
        }

        const challenge = await startBiometricAuth();
        const assertion = await startAuthentication(challenge.options);

        const result = await submitBiometricCheckIn({
          assertion,
          userLocation: location,
          deviceFingerprint,
        });

        // A checkout response reports success without `biometricVerified`.
        const confirmed = result.biometricVerified || result.action === 'checkout';
        if (!result.success || !confirmed) {
          throw new Error(
            result.message || 'Biometric verification was not accepted by the server.',
          );
        }

        setStep('success');
        onSuccess?.(result);
        return result;
      } catch (caught) {
        setStep('error');
        setError(describeWebAuthnError(caught, 'Authentication failed. Please try again.'));
        return null;
      }
    },
    [deviceFingerprint, onSuccess],
  );

  const register = useCallback(
    async (context) => {
      setStep('registering');
      setError('');

      try {
        const options = await startBiometricRegistration();
        const attestation = await startRegistration(options.options);
        await finishBiometricRegistration(attestation);

        setNeedsRegistration(false);
        // Registration and check-in are one action to the employee, so go
        // straight on to authenticating rather than making them tap again.
        return authenticate(context);
      } catch (caught) {
        setStep('error');
        setError(describeWebAuthnError(caught, 'Registration failed. Please try again.'));
        return null;
      }
    },
    [authenticate],
  );

  const reset = useCallback(() => {
    setStep('idle');
    setError('');
  }, []);

  const busy = step === 'registering' || step === 'authenticating';

  return {
    supported,
    needsRegistration,
    step,
    error,
    busy,
    loadStatus,
    register,
    authenticate,
    reset,
  };
}
