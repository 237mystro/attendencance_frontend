import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useToast } from '@/context/toast-context';
import { generateDeviceFingerprint } from '@/lib/device';
import { submitQrCheckIn } from '@/api/attendance';
import { useBiometricCheckIn } from './useBiometricCheckIn';
import { useCheckInLocation } from './useCheckInLocation';
import { describeQrTarget, parseQrPayload, useQrScanner } from './useQrScanner';

const SUCCESS_REDIRECT_MS = 3000;

/**
 * Sequences the whole check-in journey.
 *
 * Position, camera, and WebAuthn each have their own hook; this one decides
 * what happens in which order and holds the state the screen renders, so the
 * page component stays pure composition.
 */
export function useCheckInFlow() {
  const navigate = useNavigate();
  const toast = useToast();

  const [method, setMethod] = useState(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [qrPayload, setQrPayload] = useState(null);
  const [qrTarget, setQrTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selfieStep, setSelfieStep] = useState(false);
  const [selfie, setSelfie] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [biometricOpen, setBiometricOpen] = useState(false);

  const redirectTimer = useRef(null);
  // The position approved before a prompt opened, so a device that moves
  // mid-ceremony cannot submit against a stale fix.
  const approvedRef = useRef(null);

  const geo = useCheckInLocation();

  useEffect(() => {
    generateDeviceFingerprint().then(setDeviceFingerprint);
    return () => clearTimeout(redirectTimer.current);
  }, []);

  const finish = useCallback(
    (payload) => {
      setResult(payload);
      toast.success(payload?.message || 'Attendance recorded.');
      redirectTimer.current = setTimeout(
        () => navigate(ROUTES.employee.dashboard),
        SUCCESS_REDIRECT_MS,
      );
    },
    [navigate, toast],
  );

  const biometric = useBiometricCheckIn({
    deviceFingerprint,
    onSuccess: (payload) => {
      setBiometricOpen(false);
      finish(payload);
    },
  });

  const handleDecode = useCallback(
    async (raw) => {
      const payload = parseQrPayload(raw);
      if (!payload) {
        geo.setError('Invalid QR code format. Please scan a valid attendance QR code.');
        setMethod(null);
        return;
      }

      const verified = await geo.verifyAgainstGeofence({
        source: 'qr',
        branchId: payload.branchId,
        actionLabel: 'continue',
      });
      if (!verified) {
        setMethod(null);
        return;
      }

      setQrPayload(raw);
      setQrTarget(describeQrTarget(payload));
      setConfirmOpen(true);
    },
    [geo],
  );

  const scanner = useQrScanner({
    onDecode: handleDecode,
    onCameraError: (message) => {
      geo.setError(message);
      setMethod(null);
    },
  });

  /** Returns the screen to its starting state, cancelling anything in flight. */
  const reset = useCallback(() => {
    scanner.stop();
    geo.reset();
    biometric.reset();
    setMethod(null);
    setQrPayload(null);
    setQrTarget(null);
    setConfirmOpen(false);
    setSelfieStep(false);
    setSelfie(null);
    setBiometricOpen(false);
    approvedRef.current = null;
  }, [scanner, geo, biometric]);

  const chooseQr = useCallback(() => {
    setMethod('qr');
    geo.setError('');
    scanner.start();
  }, [geo, scanner]);

  const chooseBiometric = useCallback(async () => {
    setMethod('biometric');
    geo.setError('');
    biometric.reset();

    const verified = await geo.verifyAgainstGeofence({
      source: 'biometric',
      actionLabel: 'use biometrics',
    });
    if (!verified) {
      setMethod(null);
      return;
    }

    approvedRef.current = verified;

    try {
      await biometric.loadStatus();
      setBiometricOpen(true);
    } catch (caught) {
      geo.setError(caught?.message || 'Failed to check biometric status.');
      setMethod(null);
    }
  }, [geo, biometric]);

  const confirmQrCheckIn = useCallback(async () => {
    if (!selfie) return;
    setSubmitting(true);
    try {
      const data = await submitQrCheckIn({
        qrData: qrPayload,
        userLocation: geo.location,
        selfieBase64: selfie,
        deviceFingerprint,
      });
      if (!data.success) throw new Error(data.message || 'Check-in failed.');

      setConfirmOpen(false);
      finish(data);
    } catch (caught) {
      setConfirmOpen(false);
      geo.setError(caught?.message || 'Check-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selfie, qrPayload, geo, deviceFingerprint, finish]);

  return {
    geo,
    scanner,
    biometric,
    result,
    submitting,
    confirmOpen,
    biometricOpen,
    qrTarget,
    selfie,
    selfieStep,
    approvedRef,
    showMethodChoice: geo.status === 'located' && !scanner.scanning && !method,
    chooseQr,
    chooseBiometric,
    confirmQrCheckIn,
    advanceToSelfie: () => setSelfieStep(true),
    captureSelfie: setSelfie,
    retakeSelfie: () => setSelfie(null),
    reset,
  };
}
