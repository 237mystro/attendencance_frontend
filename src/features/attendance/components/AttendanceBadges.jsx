import { CircleX, Clock, CircleCheckBig, Fingerprint, QrCode, ScanFace } from 'lucide-react';

import { Badge } from '@/components/ui';

const STATUS_ICONS = {
  present: CircleCheckBig,
  late: Clock,
  absent: CircleX,
};

const STATUS_TONES = {
  present: 'success',
  late: 'warn',
  absent: 'danger',
};

/** Present / late / absent, with the icon the source paired with each. */
export function AttendanceStatusBadge({ status }) {
  const Icon = STATUS_ICONS[status];

  return (
    <Badge
      tone={STATUS_TONES[status] || 'neutral'}
      icon={Icon ? <Icon aria-hidden="true" className="size-3.5" /> : null}
    >
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
    </Badge>
  );
}

/**
 * How the check-in was identified. Returns null when the record predates
 * method tracking, matching the original's behaviour.
 */
export function AttendanceMethodBadge({ record }) {
  if (record.attendanceMethod === 'biometric') {
    const isFace = record.biometricType === 'faceId';
    const Icon = isFace ? ScanFace : Fingerprint;

    return (
      <Badge tone="brand" icon={<Icon aria-hidden="true" className="size-3.5" />}>
        {isFace ? 'Face ID' : 'Fingerprint'}
      </Badge>
    );
  }

  if (record.attendanceMethod === 'qr' || record.qrData) {
    return (
      <Badge tone="info" icon={<QrCode aria-hidden="true" className="size-3.5" />}>
        QR code
      </Badge>
    );
  }

  return null;
}
