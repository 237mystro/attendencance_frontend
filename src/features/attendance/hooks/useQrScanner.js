import jsQR from 'jsqr';
import { useCallback, useEffect, useRef, useState } from 'react';

const SCAN_INTERVAL_MS = 500;
const VIDEO_READY = 4; // HTMLMediaElement.HAVE_ENOUGH_DATA

/**
 * Drives the QR camera loop: grabs a frame every half second, decodes it, and
 * calls `onDecode` with the payload the moment a code is recognised.
 *
 * Scanning stops on the first hit and on unmount, so the interval can never
 * outlive the view or fire twice for the same code.
 */
export function useQrScanner({ onDecode, onCameraError }) {
  const [scanning, setScanning] = useState(false);
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);

  // Held in refs so the interval callback always sees the current handlers.
  const decodeRef = useRef(onDecode);
  useEffect(() => {
    decodeRef.current = onDecode;
  });

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setScanning(false);
  }, []);

  const readFrame = useCallback(() => {
    const video = webcamRef.current?.video;
    if (!video || video.readyState !== VIDEO_READY) return;

    // One canvas, reused — allocating per frame churns memory on low-end phones.
    canvasRef.current ??= document.createElement('canvas');
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const frame = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(frame.data, frame.width, frame.height);

    if (code?.data) {
      stop();
      decodeRef.current?.(code.data);
    }
  }, [stop]);

  const start = useCallback(() => {
    stop();
    setScanning(true);
    intervalRef.current = setInterval(readFrame, SCAN_INTERVAL_MS);
  }, [stop, readFrame]);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const handleCameraError = useCallback(() => {
    stop();
    onCameraError?.(
      'Camera access failed. Please allow camera permissions and try again.',
    );
  }, [stop, onCameraError]);

  return { scanning, webcamRef, start, stop, handleCameraError };
}

/**
 * Reads the JSON payload a company or shift QR carries.
 * Returns null when the code is not one of ours.
 */
export const parseQrPayload = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/** Normalises a QR payload into the details shown on the confirmation step. */
export const describeQrTarget = (payload) => {
  const today = new Date().toISOString().slice(0, 10);

  if (payload.type === 'company_checkin') {
    return {
      isCompanyQr: true,
      date: today,
      location: payload.branchName || payload.company || 'Office',
    };
  }

  return {
    isCompanyQr: false,
    shiftId: payload.shiftId || '',
    date: payload.date || today,
    startTime: payload.startTime || '--:--',
    endTime: payload.endTime || '--:--',
    location: payload.location || 'Office',
  };
};
