import { Alert, Button, Input, Modal, Select } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useRecurrenceForm } from '../hooks/useRecurrenceForm';
import { DURATION_PRESETS, WEEKDAYS, WEEKDAY_SHORT } from '../shift-fields';

const PRESET_OPTIONS = DURATION_PRESETS.map((preset) => ({
  value: preset.id,
  label: preset.label,
}));

/**
 * Creates a repeating schedule across a date range.
 *
 * The count of shifts that will be created is shown before saving, because a
 * year of weekdays is 260 records and that is worth seeing first.
 */
export function RecurringShiftDialog({ employees, onClose, onSave, saving }) {
  const form = useRecurrenceForm();
  const { values, previewCount } = form;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const message = form.validate();
    if (message) {
      form.setError(message);
      return;
    }

    const saved = await onSave(values);
    if (saved) onClose();
  };

  const employeeOptions = employees.map((employee) => ({
    value: employee._id,
    label: `${employee.name} · ${employee.position || 'No position'}`,
  }));

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      closeOnBackdrop={!saving}
      size="lg"
      title="Recurring schedule"
      description="Create the same shift on chosen weekdays across a date range."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            form="recurring-form"
            type="submit"
            loading={saving}
            disabled={previewCount === 0}
          >
            Create {previewCount || 0} shift{previewCount === 1 ? '' : 's'}
          </Button>
        </>
      }
    >
      <form
        id="recurring-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        {form.error && <Alert tone="danger">{form.error}</Alert>}

        <Select
          label="Employee"
          required
          placeholder="Select an employee"
          options={employeeOptions}
          value={values.employeeId}
          onChange={(event) => form.patch({ employeeId: event.target.value })}
        />

        <fieldset>
          <legend className="text-sm font-bold text-ink dark:text-ink-dark">
            Days of the week
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {WEEKDAYS.map((day, index) => {
              const selected = values.weekdays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => form.toggleWeekday(day)}
                  className={cn(
                    'min-h-tap min-w-14 rounded-btn border px-3 text-sm font-bold transition-colors',
                    selected
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-line text-muted hover:border-brand-500/40 dark:border-line-dark dark:text-muted-soft',
                  )}
                >
                  {WEEKDAY_SHORT[index]}
                  <span className="sr-only"> {day}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start time"
            type="time"
            required
            value={values.startTime}
            onChange={(event) => form.patch({ startTime: event.target.value })}
          />
          <Input
            label="End time"
            type="time"
            required
            value={values.endTime}
            onChange={(event) => form.patch({ endTime: event.target.value })}
          />
        </div>

        <Select
          label="Duration"
          options={PRESET_OPTIONS}
          value={values.presetId}
          onChange={(event) => form.applyPreset(event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="From"
            type="date"
            required
            value={values.startDate}
            onChange={(event) => form.changeStartDate(event.target.value)}
          />
          <Input
            label="Until"
            type="date"
            required
            min={values.startDate}
            value={values.endDate}
            disabled={!form.isCustomDuration}
            hint={form.isCustomDuration ? undefined : 'Set by the duration above.'}
            onChange={(event) => form.patch({ endDate: event.target.value })}
          />
        </div>

        <Alert tone={previewCount > 0 ? 'info' : 'warn'}>
          {previewCount > 0 ? (
            <>
              This will create <strong>{previewCount}</strong> shift
              {previewCount === 1 ? '' : 's'}. The employee is notified and must accept
              each one.
            </>
          ) : (
            'No shifts match yet — pick at least one weekday and a valid date range.'
          )}
        </Alert>
      </form>
    </Modal>
  );
}
