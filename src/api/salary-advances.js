import { buildQuery, request } from '@/api/client';

/** Salary advances: employee requests, approver decisions, repayment. */

/** Every request, optionally narrowed to one status. */
export const fetchAdvances = (status, signal) =>
  request(`/salary-advances${buildQuery({ status })}`, { signal });

/** The signed-in employee's own requests. */
export const fetchMyAdvances = (signal) => request('/salary-advances/my', { signal });

export const requestAdvance = ({ amount, reason, deductionPeriod }) =>
  request('/salary-advances', {
    method: 'POST',
    json: { amount: Number(amount), reason, deductionPeriod },
  });

/** `action` is 'approve' or 'reject'. */
export const reviewAdvance = (advanceId, action, { note, deductionPeriod }) =>
  request(`/salary-advances/${advanceId}/${action}`, {
    method: 'PUT',
    json: { note, deductionPeriod },
  });

/** Closes out an advance once it has been recovered from payroll. */
export const markAdvanceRepaid = (advanceId) =>
  request(`/salary-advances/${advanceId}/repaid`, { method: 'PUT' });
