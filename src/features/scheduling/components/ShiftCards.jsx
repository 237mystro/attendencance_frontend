import { ArrowLeftRight, Check, X } from 'lucide-react';

import { Avatar, Button, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/formatters';

/** An accepted shift, with the option to hand it to a colleague. */
export function ShiftCard({ shift, onTransfer }) {
  // A shift that has already started cannot be handed over.
  const inPast = new Date(shift.date) < new Date() && shift.status === 'scheduled';

  return (
    <li className="surface-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-bold text-ink dark:text-ink-dark">{formatDate(shift.date)}</p>
        <p className="text-sm text-muted dark:text-muted-soft">
          {shift.startTime} – {shift.endTime}
        </p>
        <p className="text-xs text-muted-soft">{shift.day}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={shift.status || 'scheduled'} />
        {shift.status === 'scheduled' && !inPast && (
          <Button
            size="sm"
            variant="secondary"
            startIcon={<ArrowLeftRight aria-hidden="true" className="size-4" />}
            onClick={() => onTransfer(shift)}
          >
            Transfer
          </Button>
        )}
      </div>
    </li>
  );
}

/** A shift the admin assigned, awaiting accept or decline. */
export function InvitationCard({ shift, onAnswer, busy }) {
  return (
    <li className="surface-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-ink dark:text-ink-dark">{formatDate(shift.date)}</p>
          <p className="text-sm text-muted dark:text-muted-soft">
            {shift.startTime} – {shift.endTime} · {shift.day}
          </p>
        </div>
        <StatusBadge status="pending" />
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted dark:text-muted-soft">
        Your manager assigned you this shift. Accept to add it to your schedule.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button
          size="sm"
          variant="success"
          loading={busy}
          startIcon={<Check aria-hidden="true" className="size-4" />}
          onClick={() => onAnswer(shift, 'accept')}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="text-danger"
          disabled={busy}
          startIcon={<X aria-hidden="true" className="size-4" />}
          onClick={() => onAnswer(shift, 'decline')}
        >
          Decline
        </Button>
      </div>
    </li>
  );
}

/** A colleague asking you to take their shift. */
export function IncomingTransferCard({ transfer, onAnswer, busy }) {
  const shift = transfer.shiftId;

  return (
    <li className="surface-panel p-4">
      <div className="flex items-center gap-3">
        <Avatar name={transfer.fromEmployeeId?.name} size="sm" />
        <p className="min-w-0 text-sm text-ink dark:text-ink-dark">
          <strong>{transfer.fromEmployeeId?.name || 'A colleague'}</strong> wants you to
          take their shift
        </p>
      </div>

      <p className="mt-2 text-sm text-muted dark:text-muted-soft">
        {shift
          ? `${formatDate(shift.date)} · ${shift.startTime} – ${shift.endTime}`
          : 'Shift details unavailable'}
      </p>

      {transfer.message && (
        <blockquote className="mt-2 border-l-2 border-line pl-3 text-sm text-muted italic dark:border-line-dark dark:text-muted-soft">
          {transfer.message}
        </blockquote>
      )}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button
          size="sm"
          variant="success"
          loading={busy}
          startIcon={<Check aria-hidden="true" className="size-4" />}
          onClick={() => onAnswer(transfer, 'accept')}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="text-danger"
          disabled={busy}
          startIcon={<X aria-hidden="true" className="size-4" />}
          onClick={() => onAnswer(transfer, 'decline')}
        >
          Decline
        </Button>
      </div>
    </li>
  );
}

/** A transfer you offered, and where it stands. */
export function OutgoingTransferCard({ transfer }) {
  const shift = transfer.shiftId;

  return (
    <li className="surface-panel flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="text-sm text-ink dark:text-ink-dark">
          Offered to <strong>{transfer.toEmployeeId?.name || 'a colleague'}</strong>
        </p>
        <p className="text-xs text-muted dark:text-muted-soft">
          {shift
            ? `${formatDate(shift.date)} · ${shift.startTime} – ${shift.endTime}`
            : 'Shift details unavailable'}
        </p>
      </div>
      <StatusBadge status={transfer.status} />
    </li>
  );
}
