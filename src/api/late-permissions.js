import { request } from '@/api/client';

/** Requests to arrive late without incurring the usual penalty. */

/** The signed-in employee's own requests. */
export const fetchMyLateRequests = (signal) =>
  request('/late-permissions/my', { signal });

/** Every request an approver can act on. */
export const fetchLateRequestsForReview = (signal) =>
  request('/late-permissions/admin', { signal });

export const submitLateRequest = ({ reason, estimatedArrival }) =>
  request('/late-permissions', {
    method: 'POST',
    json: { reason, estimatedArrival: estimatedArrival || undefined },
  });

/**
 * Records a decision.
 *
 * `status` is one of `approved_full` (no penalty at all),
 * `approved_extension` (the buffer grows by `extraMinutes`), or `denied`.
 */
export const reviewLateRequest = (requestId, { status, extraMinutes, adminNote }) =>
  request(`/late-permissions/${requestId}/review`, {
    method: 'PUT',
    json: {
      status,
      extraMinutes: status === 'approved_extension' ? extraMinutes : 0,
      adminNote,
    },
  });
