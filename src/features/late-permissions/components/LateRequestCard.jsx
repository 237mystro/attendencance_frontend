import { Clock } from 'lucide-react';

import { Avatar, Badge, Button } from '@/components/ui';
import { LATE_PERMISSION_STATUS, humanizeStatus, toneFor } from '@/constants/status';
import { formatDate, formatTime } from '@/lib/formatters';
import { OUTCOME_LABELS } from '../late-permission-fields';

/** Status pill using the request-specific wording rather than the raw value. */
export function LateStatusBadge({ status }) {
  return (
    <Badge tone={toneFor(status)}>
      {OUTCOME_LABELS[status] || humanizeStatus(status)}
    </Badge>
  );
}

/**
 * One late-arrival request in the approver's queue.
 *
 * Pending requests get a review button; decided ones state the outcome, so the
 * card reads the same way whether it is actionable or historical.
 */
export function LateRequestCard({ request, onReview }) {
  // Without a handler this is a read-only history card, not a review queue item.
  const canReview = Boolean(onReview) && request.status === LATE_PERMISSION_STATUS.PENDING;

  return (
    <li className="surface-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={request.employeeId?.name} size="sm" />
          <div className="min-w-0">
            <p className="font-bold text-ink dark:text-ink-dark">
              {request.employeeId?.name || 'Unknown'}
            </p>
            <p className="text-xs text-muted dark:text-muted-soft">
              {request.employeeId?.position || 'No position'} · {formatDate(request.date)}
            </p>
          </div>
        </div>

        <LateStatusBadge status={request.status} />
      </div>

      {request.reason && (
        <p className="mt-3 text-sm leading-relaxed text-ink dark:text-ink-dark">
          {request.reason}
        </p>
      )}

      {request.estimatedArrival && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted dark:text-muted-soft">
          <Clock aria-hidden="true" className="size-3.5" />
          Expects to arrive around {formatTime(request.estimatedArrival)}
        </p>
      )}

      {canReview ? (
        <Button size="sm" className="mt-3" onClick={() => onReview(request)}>
          Review request
        </Button>
      ) : (
        <p className="mt-3 rounded-btn bg-canvas px-3 py-2 text-xs text-muted dark:bg-white/5 dark:text-muted-soft">
          {request.status === LATE_PERMISSION_STATUS.APPROVED_FULL &&
            'Full exemption — no late penalty applied.'}
          {request.status === LATE_PERMISSION_STATUS.APPROVED_EXTENSION &&
            `${request.extraMinutes} extra minute${request.extraMinutes === 1 ? '' : 's'} granted.`}
          {request.status === LATE_PERMISSION_STATUS.DENIED &&
            'Denied — normal attendance rules applied.'}
          {request.adminNote ? ` Note: “${request.adminNote}”` : ''}
        </p>
      )}
    </li>
  );
}
