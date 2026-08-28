import { Camera, RotateCcw } from 'lucide-react';
import { useCallback, useRef } from 'react';
import Webcam from 'react-webcam';

import { Button } from '@/components/ui';

/**
 * Front-camera selfie step that proves a person, not just a phone, was present.
 * Shows the captured frame for review with a retake before it is submitted.
 */
export function SelfieCapture({ image, onCapture, onRetake }) {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const shot = webcamRef.current?.getScreenshot();
    if (shot) onCapture(shot);
  }, [onCapture]);

  if (image) {
    return (
      <div>
        <img
          src={image}
          alt="The selfie you just captured"
          className="max-h-64 w-full rounded-panel border-2 border-line object-cover dark:border-line-dark"
        />
        <Button
          variant="secondary"
          fullWidth
          className="mt-3"
          startIcon={<RotateCcw aria-hidden="true" className="size-4" />}
          onClick={onRetake}
        >
          Retake
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-4/3 w-full overflow-hidden rounded-panel border border-line dark:border-line-dark">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: 'user' }}
          mirrored
          className="size-full object-cover"
        />
      </div>

      <p className="mt-3 text-center text-sm text-muted dark:text-muted-soft">
        Look straight at the camera, then capture your selfie.
      </p>

      <Button
        fullWidth
        className="mt-3"
        startIcon={<Camera aria-hidden="true" className="size-4" />}
        onClick={capture}
      >
        Capture selfie
      </Button>
    </div>
  );
}
