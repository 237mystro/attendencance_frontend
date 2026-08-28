import { Alert, Button, Input, Modal, Textarea } from '@/components/ui';
import { firstError, rules, useForm } from '@/hooks/useForm';

/** Request an advance against future salary. */
export function AdvanceRequestDialog({ onClose, onSubmit, submitting }) {
  const form = useForm({
    initialValues: { amount: '', reason: '', deductionPeriod: '' },
    validate: (values) => ({
      amount: firstError(
        rules.required(values.amount, 'An amount'),
        rules.positiveNumber(values.amount, 'The amount'),
      ),
      reason: rules.required(values.reason, 'A reason'),
    }),
    onSubmit: async (values) => {
      const sent = await onSubmit({
        amount: values.amount,
        reason: values.reason.trim(),
        deductionPeriod: values.deductionPeriod.trim(),
      });
      if (sent) onClose();
    },
  });

  return (
    <Modal
      open
      onClose={submitting ? undefined : onClose}
      closeOnBackdrop={!submitting}
      title="Request a salary advance"
      description="Your manager reviews this and decides which pay period recovers it."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button form="advance-form" type="submit" loading={submitting}>
            Submit request
          </Button>
        </>
      }
    >
      <form
        id="advance-form"
        onSubmit={form.handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        {form.submitError && <Alert tone="danger">{form.submitError}</Alert>}

        <Input
          label="Amount"
          type="number"
          min={0}
          required
          autoFocus
          placeholder="0"
          {...form.field('amount')}
        />

        <Textarea
          label="Reason"
          rows={3}
          required
          placeholder="Briefly explain what the advance is for."
          {...form.field('reason')}
        />

        <Input
          label="Preferred repayment period"
          placeholder="e.g. March 2026"
          hint="Optional. Your manager confirms the final period."
          {...form.field('deductionPeriod')}
        />

        <Alert tone="info">
          An approved advance is deducted from the pay period your manager sets.
        </Alert>
      </form>
    </Modal>
  );
}
