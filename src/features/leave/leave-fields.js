import { firstError, rules } from '@/hooks/useForm';

/** Leave types offered to employees. */
export const LEAVE_TYPES = [
  'Annual Leave',
  'Sick Leave',
  'Emergency Leave',
  'Unpaid Leave',
  'Other',
];

export const LEAVE_TYPE_OPTIONS = LEAVE_TYPES.map((type) => ({
  value: type,
  label: type,
}));

export const EMPTY_LEAVE_REQUEST = {
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
};

/**
 * Inclusive day count for a leave range — a single-day request counts as one,
 * not zero, which is why the difference is offset by one.
 */
export const leaveDayCount = (startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const days = Math.round((end - start) / 86400000) + 1;
  return days > 0 ? days : null;
};

/** `3 days`, `1 day`, or an em dash when the range is unusable. */
export const formatLeaveDuration = (startDate, endDate) => {
  const days = leaveDayCount(startDate, endDate);
  return days ? `${days} day${days === 1 ? '' : 's'}` : '—';
};

export const validateLeaveRequest = (values) => ({
  leaveType: rules.required(values.leaveType, 'Leave type'),
  startDate: rules.required(values.startDate, 'Start date'),
  endDate: firstError(
    rules.required(values.endDate, 'End date'),
    values.startDate && values.endDate && values.endDate < values.startDate
      ? 'The end date cannot be before the start date.'
      : undefined,
  ),
  reason: rules.required(values.reason, 'Reason'),
});
