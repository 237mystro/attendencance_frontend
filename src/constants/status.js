/** Attendance record status. */
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
};

/** Leave request lifecycle. The API says `denied`, not `rejected`. */
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
};

/** Path segment for `PATCH /leave/:id/:action`. */
export const LEAVE_ACTIONS = {
  APPROVE: 'approve',
  DENY: 'deny',
};

/** Shift lifecycle, independent of whether the employee accepted it. */
export const SHIFT_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  MISSED: 'missed',
};

/** Late-permission request lifecycle. */
export const LATE_PERMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED_FULL: 'approved_full',
  APPROVED_EXTENSION: 'approved_extension',
  DENIED: 'denied',
};

/** Payroll run lifecycle. */
export const PAYROLL_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  PROCESSED: 'processed',
  PAID: 'paid',
};

/** Deduction report lifecycle. */
export const REPORT_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  PAID: 'paid',
};

/** Salary advance lifecycle. */
export const ADVANCE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REPAID: 'repaid',
};

/** Shift assignment response states. */
export const SHIFT_ASSIGNMENT_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
};

/**
 * Maps any status string to a Badge tone. Keeps colour decisions in one place
 * so a "pending" chip looks identical in payroll, leave, and advances.
 */
export const STATUS_TONE = {
  present: 'success',
  approved: 'success',
  approved_full: 'success',
  accepted: 'success',
  paid: 'success',
  processed: 'success',
  repaid: 'success',

  late: 'warn',
  pending: 'warn',
  submitted: 'warn',
  approved_extension: 'warn',

  absent: 'danger',
  rejected: 'danger',
  denied: 'danger',
  declined: 'danger',
  failed: 'danger',

  scheduled: 'brand',
  'in-progress': 'warn',
  completed: 'success',
  missed: 'danger',

  draft: 'neutral',
};

export const toneFor = (status) => STATUS_TONE[String(status).toLowerCase()] || 'neutral';

/** Turns `approved_extension` into `Approved extension` for display. */
export const humanizeStatus = (status) => {
  if (!status) return '—';
  const spaced = String(status).replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};
