import { useState } from 'react';

import { Button, Modal, Textarea } from '@/components/ui';
import { LEAVE_ACTIONS } from '@/constants/status';
import { formatDate } from '@/lib/formatters';
import { formatLeaveDuration } from '../leave-fields';

/**
 * Approve or deny a leave request, with an optional note.
 *
 * The note reaches the employee either way, so it is offered on both paths
 * rather than only on a denial.
 */
export function LeaveReviewDialog({ request, action, onClose, onConfirm, loading }) {
  const [note, setNote] = useState('');
  const isApprove = action === LEAVE_ACTIONS.APPROVE;

  return (
    <Modal
      open
      onClose={loading ? undefined : onClose}
      closeOnBackdrop={!loading}
      title={isApprove ? 'Approve this request?' : 'Deny this request?'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? 'success' : 'danger'}
            loading={loading}
            onClick={() => onConfirm(note.trim())}
          >
            {isApprove ? 'Approve' : 'Deny'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <dl className="rounded-panel border border-line bg-canvas p-4 text-sm dark:border-line-dark dark:bg-white/5">
          <div className="flex justify-between gap-3">
            <dt className="text-muted dark:text-muted-soft">Employee</dt>
            <dd className="font-semibold text-ink dark:text-ink-dark">
              {request.employeeId?.name || 'Unknown'}
            </dd>
          </div>
          <div className="mt-1.5 flex justify-between gap-3">
            <dt className="text-muted dark:text-muted-soft">Type</dt>
            <dd className="font-semibold text-ink dark:text-ink-dark">
              {request.leaveType}
            </dd>
          </div>
          <div className="mt-1.5 flex justify-between gap-3">
            <dt className="text-muted dark:text-muted-soft">Dates</dt>
            <dd className="text-right font-semibold text-ink dark:text-ink-dark">
              {formatDate(request.startDate)} – {formatDate(request.endDate)}
              <span className="block text-xs font-normal text-muted dark:text-muted-soft">
                {formatLeaveDuration(request.startDate, request.endDate)}
              </span>
            </dd>
          </div>
          {request.reason && (
            <div className="mt-3 border-t border-line pt-3 dark:border-line-dark">
              <dt className="text-muted dark:text-muted-soft">Reason</dt>
              <dd className="mt-1 leading-relaxed text-ink dark:text-ink-dark">
                {request.reason}
              </dd>
            </div>
          )}
        </dl>

        <Textarea
          label="Note to the employee"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          hint={
            isApprove
              ? 'Optional. Shown alongside the approval.'
              : 'Optional, but a reason helps them understand the decision.'
          }
        />
      </div>
    </Modal>
  );
}
