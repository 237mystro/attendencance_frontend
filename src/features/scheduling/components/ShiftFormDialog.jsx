import { Alert, Button, Input, Modal, Select } from '@/components/ui';
import { firstError, rules, useForm } from '@/hooks/useForm';
import { EMPTY_SHIFT, validateShiftTimes, weekdayFromIso } from '../shift-fields';

/** Assign or edit a single shift. */
export function ShiftFormDialog({ shift, employees, onClose, onSave, saving }) {
  const isEditing = Boolean(shift);

  const form = useForm({
    initialValues: shift
      ? {
          employeeId: shift.employeeId?._id || shift.employeeId || '',
          date: shift.date ? shift.date.slice(0, 10) : '',
          startTime: shift.startTime || '',
          endTime: shift.endTime || '',
        }
      : EMPTY_SHIFT,
    validate: (values) => ({
      employeeId: rules.required(values.employeeId, 'An employee'),
      date: rules.required(values.date, 'Date'),
      endTime: firstError(
        rules.required(values.endTime, 'End time'),
        validateShiftTimes(values),
      ),
      startTime: rules.required(values.startTime, 'Start time'),
    }),
    onSubmit: async (values) => {
      const saved = await onSave(values, shift?._id);
      if (saved) onClose();
    },
  });

  const employeeOptions = employees.map((employee) => ({
    value: employee._id,
    label: `${employee.name} · ${employee.position || 'No position'}`,
  }));

  const weekday = weekdayFromIso(form.values.date);

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      closeOnBackdrop={!saving}
      title={isEditing ? 'Edit shift' : 'Assign a shift'}
      description={
        isEditing
          ? undefined
          : 'The employee is notified and must accept before it joins their schedule.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button form="shift-form" type="submit" loading={saving}>
            {isEditing ? 'Save changes' : 'Assign shift'}
          </Button>
        </>
      }
    >
      <form
        id="shift-form"
        onSubmit={form.handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        {form.submitError && <Alert tone="danger">{form.submitError}</Alert>}

        <Select
          label="Employee"
          required
          placeholder="Select an employee"
          options={employeeOptions}
          {...form.field('employeeId')}
        />

        <Input
          label="Date"
          type="date"
          required
          hint={weekday ? `Falls on a ${weekday}.` : undefined}
          {...form.field('date')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Start time" type="time" required {...form.field('startTime')} />
          <Input label="End time" type="time" required {...form.field('endTime')} />
        </div>
      </form>
    </Modal>
  );
}
