import { CircleCheckBig } from 'lucide-react';

import { Alert, PageWrapper } from '@/components/ui';
import { getBiometricLabel } from '@/lib/device';
import { BiometricDialog } from '../components/BiometricDialog';
import { CheckInConfirmDialog } from '../components/CheckInConfirmDialog';
import { CheckInMethodChoice } from '../components/CheckInMethodChoice';
import { LocationStatusCard } from '../components/LocationStatusCard';
import { QrCameraView } from '../components/QrCameraView';
import { useCheckInFlow } from '../hooks/useCheckInFlow';

/**
 * Attendance check-in / check-out.
 *
 * Location is always verified first; only then may the employee identify
 * themselves by QR scan (plus a selfie) or by device biometrics. All of that
 * sequencing lives in `useCheckInFlow`, leaving this as composition.
 */
export function CheckInPage() {
  const flow = useCheckInFlow();
  const { geo, scanner, biometric } = flow;
  const biometricLabel = getBiometricLabel(navigator.userAgent);

  return (
    <PageWrapper className="max-w-2xl">
      <header className="mb-5">
        <h2 className="text-xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
          Attendance check-in / check-out
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted dark:text-muted-soft">
          Your location is verified first, then you can check in using the QR code or
          your device biometrics.
        </p>
      </header>

      <LocationStatusCard
        status={geo.status}
        location={geo.location}
        geofence={geo.geofence}
        distance={geo.distance}
        error={geo.error}
        onVerify={geo.capture}
        onReset={flow.reset}
      >
        {flow.showMethodChoice && (
          <CheckInMethodChoice
            biometricAvailable={biometric.supported}
            biometricLabel={biometricLabel}
            onChooseQr={flow.chooseQr}
            onChooseBiometric={flow.chooseBiometric}
          />
        )}

        {scanner.scanning && (
          <QrCameraView
            webcamRef={scanner.webcamRef}
            onCameraError={scanner.handleCameraError}
            onCancel={flow.reset}
          />
        )}
      </LocationStatusCard>

      {flow.result && (
        <Alert tone="success" className="mt-4">
          <p className="flex items-center gap-2 font-bold">
            <CircleCheckBig aria-hidden="true" className="size-4 shrink-0" />
            Success
          </p>
          <p className="mt-1">
            {flow.result.message ||
              `Your attendance has been recorded at ${new Date().toLocaleTimeString()}.`}
          </p>
        </Alert>
      )}

      <CheckInConfirmDialog
        open={flow.confirmOpen}
        onClose={flow.reset}
        target={flow.qrTarget}
        distance={geo.distance}
        selfieStep={flow.selfieStep}
        onAdvanceToSelfie={flow.advanceToSelfie}
        selfie={flow.selfie}
        onCaptureSelfie={flow.captureSelfie}
        onRetakeSelfie={flow.retakeSelfie}
        onConfirm={flow.confirmQrCheckIn}
        submitting={flow.submitting}
      />

      <BiometricDialog
        open={flow.biometricOpen}
        onClose={flow.reset}
        label={biometricLabel}
        step={biometric.step}
        error={biometric.error}
        busy={biometric.busy}
        needsRegistration={biometric.needsRegistration}
        distance={geo.distance}
        result={flow.result}
        onRegister={() => biometric.register(flow.approvedRef.current)}
        onAuthenticate={() => biometric.authenticate(flow.approvedRef.current)}
      />
    </PageWrapper>
  );
}
