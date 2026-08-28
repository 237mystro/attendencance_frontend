import { LATE_PERMISSION_STATUS } from '@/constants/status';

/** Wording for each outcome, from the employee's point of view. */
export const OUTCOME_LABELS = {
  [LATE_PERMISSION_STATUS.PENDING]: 'Pending review',
  [LATE_PERMISSION_STATUS.APPROVED_FULL]: 'Fully approved',
  [LATE_PERMISSION_STATUS.APPROVED_EXTENSION]: 'Approved with extension',
  [LATE_PERMISSION_STATUS.DENIED]: 'Denied',
};

/** The options an approver picks between. */
export const DECISION_OPTIONS = [
  {
    id: LATE_PERMISSION_STATUS.APPROVED_FULL,
    title: 'Full exemption',
    description: 'No late penalty applies today.',
    tone: 'success',
  },
  {
    id: LATE_PERMISSION_STATUS.APPROVED_EXTENSION,
    title: 'Grant an extension',
    description: 'Add extra minutes to their allowance before lateness counts.',
    tone: 'brand',
  },
  {
    id: LATE_PERMISSION_STATUS.DENIED,
    title: 'Deny',
    description: 'Normal attendance rules apply.',
    tone: 'danger',
  },
];

export const MIN_EXTRA_MINUTES = 1;
export const MAX_EXTRA_MINUTES = 480;

/** One sentence explaining a decision to the employee who made the request. */
export const describeOutcome = ({ status, extraMinutes, adminNote }) => {
  const note = adminNote ? ` Note: “${adminNote}”` : '';

  if (status === LATE_PERMISSION_STATUS.APPROVED_FULL) {
    return `Fully approved — no late penalty today.${note}`;
  }
  if (status === LATE_PERMISSION_STATUS.APPROVED_EXTENSION) {
    const plural = extraMinutes === 1 ? '' : 's';
    return `Approved with ${extraMinutes} extra minute${plural} added to your allowance.${note}`;
  }
  return `Denied — normal attendance rules apply.${note}`;
};

/** Whether an ISO date falls on today, in the viewer's own timezone. */
export const isToday = (value) => {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};
