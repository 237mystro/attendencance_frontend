import { useState } from 'react';

import { Alert, Button, Input, Modal, Textarea } from '@/components/ui';
import { LATE_PERMISSION_STATUS } from '@/constants/status';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/formatters';
import {
  DECISION_OPTIONS,
  MAX_EXTRA_MINUTES,
  MIN_EXTRA_MINUTES,
} from '../late-permission-fields';

const DEFAULT_EXTRA_MINUTES = 15;

const TONE_RING = {
  success: 'border-success ring-1 ring-success',
  brand: 'border-brand-500 ring-1 ring-brand-500',
  danger: 'border-danger ring-1 ring-danger',
};

/**
 * Records a decision on a late-arrival request.
 *
 * The three outcomes are radio buttons rather than three submit buttons, so the
 * approver can see all the options and their consequences before committing.
 */
export function LateReviewDialog({ request, onClose, onConfirm, loading }) {
  const [status, setStatus] = useState(LATE_PERMISSION_STATUS.APPROVED_FULL);
  const [extraMinutes, setExtraMinutes] = useState(DEFAULT_EXTRA_MINUTES);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const needsMinutes = status === LATE_PERMISSION_STATUS.APPROVED_EXTENSION;

  const confirm = () => {
    if (needsMinutes) {
      const value = Number(extraMinutes);
      if (!Number.isFinite(value) || value < MIN_EXTRA_MINUTES || value > MAX_EXTRA_MINUTES) {
        setError(`Extra minutes must be between ${MIN_EXTRA_MINUTES} and ${MAX_EXTRA_MINUTES}.`);
        return;
      }
    }
    setError('');
    onConfirm({ status, extraMinutes: Number(extraMinutes), adminNote: note.trim() });
  };

  return (
    <Modal
      open
      onClose={loading ? undefined : onClose}
      closeOnBackdrop={!loading}
      title={`Review ${request.employeeId?.name || 'this request'}`}
      description={
        request.estimatedArrival
          ? `Expects to arrive at ${formatDateTime(request.estimatedArrival)}.`
          : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button loading={loading} onClick={confirm}>
            Record decision
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <Alert tone="danger">{error}</Alert>}

        {request.reason && (
          <blockquote className="rounded-panel border border-line bg-canvas p-4 text-sm leading-relaxed dark:border-line-dark dark:bg-white/5">
            {request.reason}
          </blockquote>
        )}

        <fieldset>
          <legend className="text-sm font-bold text-ink dark:text-ink-dark">
            Decision
          </legend>

          <div className="mt-2 flex flex-col gap-2">
            {DECISION_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-panel border p-3 transition-colors',
                  status === option.id
                    ? TONE_RING[option.tone]
                    : 'border-line hover:border-brand-500/40 dark:border-line-dark',
                )}
              >
                <input
                  type="radio"
                  name="late-decision"
                  value={option.id}
                  checked={status === option.id}
                  onChange={() => setStatus(option.id)}
                  className="mt-0.5 size-5 shrink-0 accent-brand-500"
                />
                <span>
                  <span className="block text-sm font-bold text-ink dark:text-ink-dark">
                    {option.title}
                  </span>
                  <span className="block text-xs text-muted dark:text-muted-soft">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {needsMinutes && (
          <Input
            label="Extra minutes"
            type="number"
            min={MIN_EXTRA_MINUTES}
            max={MAX_EXTRA_MINUTES}
            value={extraMinutes}
            onChange={(event) => setExtraMinutes(event.target.value)}
            hint={`Between ${MIN_EXTRA_MINUTES} and ${MAX_EXTRA_MINUTES} minutes.`}
          />
        )}

        <Textarea
          label="Note to the employee"
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          hint="Optional. Sent with the decision."
        />
      </div>
    </Modal>
  );
}
