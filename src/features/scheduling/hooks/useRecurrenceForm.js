import { useMemo, useState } from 'react';

import {
  DURATION_PRESETS,
  countRecurringShifts,
  emptyRecurrence,
  endDateForPreset,
  validateShiftTimes,
} from '../shift-fields';

/**
 * State and validation for the recurring-schedule form.
 *
 * Changing either the start date or the duration preset recomputes the end
 * date, unless the user has chosen "Custom" — in which case the end date is
 * theirs to set and must not be overwritten.
 */
export function useRecurrenceForm() {
  const [values, setValues] = useState(emptyRecurrence);
  const [error, setError] = useState('');

  const patch = (changes) => {
    setValues((current) => ({ ...current, ...changes }));
    setError('');
  };

  const presetFor = (id) => DURATION_PRESETS.find((preset) => preset.id === id);

  const toggleWeekday = (day) =>
    patch({
      weekdays: values.weekdays.includes(day)
        ? values.weekdays.filter((value) => value !== day)
        : [...values.weekdays, day],
    });

  const applyPreset = (presetId) => {
    const preset = presetFor(presetId);
    patch({
      presetId,
      endDate: preset.custom
        ? values.endDate
        : endDateForPreset(values.startDate, preset),
    });
  };

  const changeStartDate = (startDate) => {
    const preset = presetFor(values.presetId);
    patch({
      startDate,
      endDate: preset?.custom ? values.endDate : endDateForPreset(startDate, preset),
    });
  };

  const previewCount = useMemo(
    () => countRecurringShifts(values.weekdays, values.startDate, values.endDate),
    [values.weekdays, values.startDate, values.endDate],
  );

  /** Returns a message when the form is not ready, otherwise undefined. */
  const validate = () => {
    if (!values.employeeId) return 'Select an employee.';
    if (!values.weekdays.length) return 'Select at least one day of the week.';

    const timeError = validateShiftTimes(values);
    if (timeError) return timeError;

    if (!values.startDate || !values.endDate) {
      return 'Start and end dates are required.';
    }
    if (values.startDate > values.endDate) {
      return 'The start date must be before the end date.';
    }
    return undefined;
  };

  return {
    values,
    error,
    setError,
    patch,
    toggleWeekday,
    applyPreset,
    changeStartDate,
    previewCount,
    validate,
    isCustomDuration: values.presetId === 'custom',
  };
}
