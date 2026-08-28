import { Check, X } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, Input, Modal, Textarea } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/formatters';

/**
 * Approve or reject a salary advance.
 *
 * Approving asks which pay period will recover the money — without that, an
 * advance is a payment nobody has planned to claw back.
 */
export function AdvanceReviewDialog({ advance, onClose, onDecide, working }) {
  const [note, setNote] = useState('');
  const [deductionPeriod, setDeductionPeriod] = useState(advance.deductionPeriod || '');
  const [error, setError] = useState('');

  const decide = async (action) => {
    if (action === 'approve' && !deductionPeriod.trim()) {
      setError('Say which pay period this will be recovered from.');
      return;
    }
    setError('');
    await onDecide(advance, action, { note: note.trim(), deductionPeriod: deductionPeriod.trim() });
  };

  return (
    <Modal
      open
      onClose={working ? undefined : onClose}
      closeOnBackdrop={!working}
      title={`Review ${advance.employeeId?.name || 'this request'}`}
      description={`${formatCurrency(advance.amount, advance.currency)} requested on ${formatDate(advance.createdAt)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={working}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            className="text-danger"
            disabled={working}
            startIcon={<X aria-hidden="true" className="size-4" />}
            onClick={() => decide('reject')}
          >
            Reject
          </Button>
          <Button
            variant="success"
            loading={working}
            startIcon={<Check aria-hidden="true" className="size-4" />}
            onClick={() => decide('approve')}
          >
            Approve
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <Alert tone="danger">{error}</Alert>}

        {advance.reason && (
          <blockquote className="rounded-panel border border-line bg-canvas p-4 text-sm leading-relaxed dark:border-line-dark dark:bg-white/5">
            {advance.reason}
          </blockquote>
        )}

        <Input
          label="Recover from pay period"
          value={deductionPeriod}
          onChange={(event) => setDeductionPeriod(event.target.value)}
          placeholder="e.g. March 2026"
          hint="Required to approve. Shown to the employee and used at payroll time."
        />

        <Textarea
          label="Note to the employee"
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          hint="Optional, but a reason helps if you are rejecting."
        />
      </div>
    </Modal>
  );
}
