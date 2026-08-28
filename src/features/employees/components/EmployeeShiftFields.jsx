import { CirclePlus, CircleMinus } from 'lucide-react';

import { Button, IconButton, Input, Select } from '@/components/ui';
import { WEEKDAYS, emptyShift } from '../employee-fields';

const DAY_OPTIONS = WEEKDAYS.map((day) => ({ value: day, label: day }));

/**
 * Optional starting shifts for a new employee.
 *
 * Each row is all-or-nothing — a half-filled row is rejected on submit rather
 * than silently dropped, which is what the original did.
 */
export function EmployeeShiftFields({ shifts, onChange, error }) {
  const update = (index, field, value) => {
    onChange(shifts.map((shift, i) => (i === index ? { ...shift, [field]: value } : shift)));
  };

  const add = () => onChange([...shifts, emptyShift()]);

  const remove = (index) => onChange(shifts.filter((_, i) => i !== index));

  return (
    <fieldset>
      <legend className="text-sm font-bold text-ink dark:text-ink-dark">
        Starting shifts <span className="font-medium text-muted">(optional)</span>
      </legend>

      <div className="mt-3 flex flex-col gap-4">
        {shifts.map((shift, index) => (
          // Rows have no stable id until saved; the index is the identity here,
          // and rows are only ever appended or removed as a whole.
          <div
            key={index}
            className="rounded-panel border border-line p-3 dark:border-line-dark"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Select
                label="Day"
                placeholder="Select a day"
                value={shift.day}
                options={DAY_OPTIONS}
                onChange={(event) => update(index, 'day', event.target.value)}
              />
              <Input
                label="Date"
                type="date"
                value={shift.date}
                onChange={(event) => update(index, 'date', event.target.value)}
              />
              <Input
                label="Start time"
                type="time"
                value={shift.startTime}
                onChange={(event) => update(index, 'startTime', event.target.value)}
              />
              <Input
                label="End time"
                type="time"
                value={shift.endTime}
                onChange={(event) => update(index, 'endTime', event.target.value)}
              />
            </div>

            {shifts.length > 1 && (
              <div className="mt-2 flex justify-end">
                <IconButton
                  label={`Remove shift ${index + 1}`}
                  size="sm"
                  className="text-danger"
                  onClick={() => remove(index)}
                >
                  <CircleMinus aria-hidden="true" />
                </IconButton>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-danger">
          {error}
        </p>
      )}

      <Button
        variant="secondary"
        fullWidth
        className="mt-3"
        startIcon={<CirclePlus aria-hidden="true" className="size-4" />}
        onClick={add}
      >
        Add another shift
      </Button>
    </fieldset>
  );
}
