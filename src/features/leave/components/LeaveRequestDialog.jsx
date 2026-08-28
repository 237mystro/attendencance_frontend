import { Alert, Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { useForm } from '@/hooks/useForm';
import {
  EMPTY_LEAVE_REQUEST,
  LEAVE_TYPE_OPTIONS,
  formatLeaveDuration,
  validateLeaveRequest,
} from '../leave-fields';

/** Submit a new leave request. */
export function LeaveRequestDialog({ onClose, onSubmit, submitting }) {
  const form = useForm({
    initialValues: EMPTY_LEAVE_REQUEST,
    validate: validateLeaveRequest,
    onSubmit: async (values) => {
      const sent = await onSubmit({ ...values, reason: values.reason.trim() });
      if (sent) onClose();
    },
  });

  const duration = formatLeaveDuration(form.values.startDate, form.values.endDate);

  return (
    <Modal
      open
      onClose={submitting ? undefined : onClose}
      closeOnBackdrop={!submitting}
      title="Request leave"
      description="Your manager reviews this and you will be notified of the decision."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button form="leave-form" type="submit" loading={submitting}>
            Submit request
          </Button>
        </>
      }
    >
      <form
        id="leave-form"
        onSubmit={form.handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        {form.submitError && <Alert tone="danger">{form.submitError}</Alert>}

        <Select
          label="Leave type"
          required
          placeholder="Select a type"
          options={LEAVE_TYPE_OPTIONS}
          {...form.field('leaveType')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Start date" type="date" required {...form.field('startDate')} />
          <Input
            label="End date"
            type="date"
            required
            min={form.values.startDate || undefined}
            {...form.field('endDate')}
          />
        </div>

        {duration !== '—' && (
          <p className="text-sm text-muted dark:text-muted-soft">
            That is <strong className="text-ink dark:text-ink-dark">{duration}</strong> of
            leave.
          </p>
        )}

        <Textarea
          label="Reason"
          rows={3}
          required
          placeholder="Briefly explain why you need this time off."
          {...form.field('reason')}
        />
      </form>
    </Modal>
  );
}
