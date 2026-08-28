/** Shared shift constants and the date maths behind recurring schedules. */

export const WEEKDAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday',
];

export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Ready-made ranges for a recurring schedule. `custom` lets the user pick. */
export const DURATION_PRESETS = [
  { id: '1w', label: '1 week', days: 7 },
  { id: '1m', label: '1 month', months: 1 },
  { id: '3m', label: '3 months', months: 3 },
  { id: '6m', label: '6 months', months: 6 },
  { id: '1y', label: '1 year', months: 12 },
  { id: 'custom', label: 'Custom', custom: true },
];

export const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * The weekday name for a `YYYY-MM-DD` string.
 *
 * Parsed as local parts rather than `new Date(string)`, which would treat the
 * value as UTC and shift the day backwards for anyone west of Greenwich.
 */
export const weekdayFromIso = (iso) => {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  const jsDay = new Date(year, month - 1, day).getDay();
  // JS weeks start on Sunday; ours start on Monday.
  return WEEKDAYS[jsDay === 0 ? 6 : jsDay - 1];
};

/** The inclusive end date for a preset applied to `startIso`. */
export const endDateForPreset = (startIso, preset) => {
  if (!startIso || !preset || preset.custom) return '';

  const [year, month, day] = startIso.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (preset.months) {
    date.setMonth(date.getMonth() + preset.months);
    date.setDate(date.getDate() - 1); // Inclusive of the start day.
  } else {
    date.setDate(date.getDate() + preset.days - 1);
  }

  // Built from local parts, so format locally too rather than via toISOString.
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

/**
 * How many shifts a recurrence would create — shown before saving, because
 * "1 year × 5 days" is 260 records and that deserves a number in front of you.
 */
export const countRecurringShifts = (weekdays, startIso, endIso) => {
  if (!weekdays.length || !startIso || !endIso) return 0;

  const [sy, sm, sd] = startIso.split('-').map(Number);
  const [ey, em, ed] = endIso.split('-').map(Number);
  const cursor = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  if (cursor > end) return 0;

  const selected = new Set(weekdays);
  let count = 0;

  while (cursor <= end) {
    const jsDay = cursor.getDay();
    if (selected.has(WEEKDAYS[jsDay === 0 ? 6 : jsDay - 1])) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
};

/** Whether the assignment is still awaiting the employee's answer. */
export const isPendingInvitation = (shift) => shift.assignmentStatus === 'pending';

/** Shifts the employee has accepted (or that predate the accept/decline flow). */
export const isActiveShift = (shift) =>
  shift.assignmentStatus !== 'pending' && shift.assignmentStatus !== 'declined';

export const EMPTY_SHIFT = { employeeId: '', date: '', startTime: '', endTime: '' };

export const emptyRecurrence = () => ({
  employeeId: '',
  weekdays: [],
  startTime: '',
  endTime: '',
  startDate: todayIso(),
  endDate: endDateForPreset(todayIso(), DURATION_PRESETS[1]),
  presetId: '1m',
});

/** Shared rules for both the single and recurring forms. */
export const validateShiftTimes = ({ startTime, endTime }) => {
  if (!startTime || !endTime) return 'Start and end times are required.';
  if (startTime >= endTime) return 'Start time must be before end time.';
  return undefined;
};
