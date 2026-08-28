import { CircleCheckBig, Fingerprint, Loader2, ScanFace } from 'lucide-react';

import { Alert, Button, Modal } from '@/components/ui';
import { formatDistance } from '@/lib/formatters';

/**
 * Guides the employee through the device biometric prompt.
 *
 * First-time users register and check in as one action; afterwards it is a
 * single confirmation. The dialog cannot be dismissed while the platform
 * prompt is open, so a stray click cannot orphan an in-flight ceremony.
 */
export function BiometricDialog({
  open,
  onClose,
  label,
  step,
  error,
  busy,
  needsRegistration,
  distance,
  result,
  onRegister,
  onAuthenticate,
}) {
  const title =
    step === 'success'
      ? 'Attendance recorded'
      : needsRegistration
        ? 'Register biometric'
        : `${label} check-in`;

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      closeOnBackdrop={!busy}
      size="sm"
      title={title}
      footer={
        <>
          {step !== 'success' && (
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
          )}

          {step === 'idle' && needsRegistration && (
            <Button
              startIcon={<Fingerprint aria-hidden="true" className="size-4" />}
              onClick={onRegister}
            >
              Register &amp; check in
            </Button>
          )}

          {step === 'idle' && !needsRegistration && (
            <Button
              startIcon={<ScanFace aria-hidden="true" className="size-4" />}
              onClick={onAuthenticate}
            >
              Activate {label}
            </Button>
          )}

          {step === 'error' && (
            <Button onClick={needsRegistration ? onRegister : onAuthenticate}>
              Try again
            </Button>
          )}
        </>
      }
    >
      {step === 'idle' && needsRegistration && (
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-muted dark:text-muted-soft">
            You haven&rsquo;t registered your biometrics yet. Register once and you can
            use <strong className="text-ink dark:text-ink-dark">{label}</strong> to check
            in from this device from now on.
          </p>
          <Alert tone="info">
            Your device will prompt for <strong>{label}</strong> to confirm registration.
          </Alert>
        </div>
      )}

      {step === 'idle' && !needsRegistration && (
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-muted dark:text-muted-soft">
            Your device will prompt for <strong className="text-ink dark:text-ink-dark">{label}</strong>.
            Once confirmed, your attendance will be marked instantly.
          </p>
          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <CircleCheckBig aria-hidden="true" className="size-4 shrink-0" />
            You are inside the required geofence
            {distance != null ? ` (${formatDistance(distance)} from pin)` : ''}.
          </p>
        </div>
      )}

      {busy && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-3 py-6"
        >
          <Loader2 aria-hidden="true" className="size-10 animate-spin text-accent-500" />
          <p className="text-sm text-muted dark:text-muted-soft">
            {step === 'registering'
              ? 'Follow the biometric prompt on your device…'
              : 'Verify your biometric to check in…'}
          </p>
        </div>
      )}

      {step === 'success' && (
        <Alert tone="success">
          {result?.message ||
            `Attendance recorded at ${new Date().toLocaleTimeString()}.`}
        </Alert>
      )}

      {step === 'error' && <Alert tone="danger">{error}</Alert>}
    </Modal>
  );
}
