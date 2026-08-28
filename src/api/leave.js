import { request } from '@/api/client';

/** Leave requests, from both sides. */

/** Every request in the company (or branch), for approvers. */
export const fetchAllLeaveRequests = (signal) => request('/leave/all', { signal });

/** The signed-in employee's own requests. */
export const fetchMyLeaveRequests = (signal) =>
  request('/leave/my-requests', { signal });

export const submitLeaveRequest = (payload) =>
  request('/leave/request', { method: 'POST', json: payload });

/** `action` is 'approve' or 'deny'; the note is shown to the employee. */
export const reviewLeaveRequest = (requestId, action, adminNote) =>
  request(`/leave/${requestId}/${action}`, { method: 'PATCH', json: { adminNote } });
