import { Alert, Button, Modal, Select, Textarea } from '@/components/ui';
import { rules, useForm } from '@/hooks/useForm';
import { formatDate } from '@/lib/formatters';

/** Offers one of your shifts to a colleague. */
export function TransferRequestDialog({ shift, candidates, onClose, onSubmit, submitting }) {
  const form = useForm({
    initialValues: { toEmployeeId: '', message: '' },
    validate: (values) => ({
      toEmployeeId: rules.required(values.toEmployeeId, 'A colleague'),
    }),
    onSubmit: async (values) => {
      const sent = await onSubmit({
        shiftId: shift._id,
        toEmployeeId: values.toEmployeeId,
        message: values.message.trim(),
      });
      if (sent) onClose();
    },
  });

  const options = candidates.map((employee) => ({
    value: employee._id,
    label: `${employee.name} · ${employee.position || 'No position'}`,
  }));

  return (
    <Modal
      open
      onClose={submitting ? undefined : onClose}
      closeOnBackdrop={!submitting}
      title="Transfer this shift"
      description={`${formatDate(shift.date)} · ${shift.startTime} – ${shift.endTime}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button form="transfer-form" type="submit" loading={submitting}>
            Send request
          </Button>
        </>
      }
    >
      <form
        id="transfer-form"
        onSubmit={form.handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        {form.submitError && <Alert tone="danger">{form.submitError}</Alert>}

        {options.length === 0 ? (
          <Alert tone="warn">
            There is nobody eligible to take this shift right now.
          </Alert>
        ) : (
          <>
            <Select
              label="Transfer to"
              required
              placeholder="Select a colleague"
              options={options}
              {...form.field('toEmployeeId')}
            />

            <Textarea
              label="Message"
              rows={3}
              placeholder="Let them know why, if you like."
              hint="Optional. Shown with the request."
              {...form.field('message')}
            />

            <Alert tone="info">
              The shift stays yours until they accept. You will be notified either way.
            </Alert>
          </>
        )}
      </form>
    </Modal>
  );
}
