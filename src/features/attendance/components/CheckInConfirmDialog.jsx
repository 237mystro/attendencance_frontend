import { CalendarDays, CircleCheckBig, Clock, MapPin } from 'lucide-react';

import { Alert, Badge, Button, Modal } from '@/components/ui';
import { formatDate, formatDistance } from '@/lib/formatters';
import { SelfieCapture } from './SelfieCapture';

/** One labelled row of scanned-code detail. */
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted dark:text-muted-soft">{label}</p>
        <p className="truncate text-sm font-semibold text-ink dark:text-ink-dark">
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * Two-step confirmation after a QR scan: review what was scanned, then take
 * the selfie that completes the check-in.
 */
export function CheckInConfirmDialog({
  open,
  onClose,
  target,
  distance,
  selfieStep,
  onAdvanceToSelfie,
  selfie,
  onCaptureSelfie,
  onRetakeSelfie,
  onConfirm,
  submitting,
}) {
  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      closeOnBackdrop={!submitting}
      title={selfieStep ? 'Take a selfie' : 'Confirm attendance'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>

          {selfieStep ? (
            <Button
              variant="success"
              onClick={onConfirm}
              loading={submitting}
              disabled={!selfie}
              startIcon={<CircleCheckBig aria-hidden="true" className="size-4" />}
            >
              {submitting ? 'Submitting…' : 'Confirm'}
            </Button>
          ) : (
            <Button onClick={onAdvanceToSelfie}>Next: take selfie</Button>
          )}
        </>
      }
    >
      {selfieStep ? (
        <SelfieCapture
          image={selfie}
          onCapture={onCaptureSelfie}
          onRetake={onRetakeSelfie}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {target && (
            <>
              <Badge tone="brand" className="self-start">
                QR code
              </Badge>

              <p className="text-sm font-bold text-ink dark:text-ink-dark">
                {target.isCompanyQr ? 'Attendance QR details' : 'Shift details'}
              </p>

              <div className="divide-y divide-line dark:divide-line-dark">
                <DetailRow
                  icon={CalendarDays}
                  label="Date"
                  value={formatDate(target.date)}
                />
                <DetailRow icon={MapPin} label="Location" value={target.location} />
                {!target.isCompanyQr && target.startTime && (
                  <DetailRow
                    icon={Clock}
                    label="Time"
                    value={`${target.startTime} – ${target.endTime}`}
                  />
                )}
              </div>
            </>
          )}

          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <CircleCheckBig aria-hidden="true" className="size-4 shrink-0" />
            You are inside the required geofence
            {distance != null ? ` (${formatDistance(distance)} from the pin).` : '.'}
          </p>

          <Alert tone="info">
            Next, take a quick selfie to complete your check-in.
          </Alert>
        </div>
      )}
    </Modal>
  );
}
