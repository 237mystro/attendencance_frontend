import { VideoOff } from 'lucide-react';
import Webcam from 'react-webcam';

import { Button } from '@/components/ui';

/**
 * Live rear-camera view with a framing reticle while a QR code is sought.
 *
 * The reticle is decorative and marked as such; the instruction below it is
 * the accessible description of what to do.
 */
export function QrCameraView({ webcamRef, onCameraError, onCancel }) {
  return (
    <div className="mt-5">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-panel border-2 border-dashed border-brand-500 sm:aspect-video">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: { ideal: 'environment' } }}
          onUserMediaError={onCameraError}
          className="size-full object-cover"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="size-40 rounded-panel border-4 border-white/70 shadow-[0_0_0_9999px_rgb(0_0_0/0.25)]" />
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-muted dark:text-muted-soft">
        Point your camera at the attendance QR code.
      </p>

      <Button
        variant="secondary"
        fullWidth
        className="mt-3"
        startIcon={<VideoOff aria-hidden="true" className="size-4" />}
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
}
