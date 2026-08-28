import { useCallback, useState } from 'react';

import { LEAVE_STATUS } from '@/constants/status';
import { useToast } from '@/context/toast-context';
import { useApi } from '@/hooks/useApi';
import {
  fetchAllLeaveRequests,
  fetchMyLeaveRequests,
  reviewLeaveRequest,
  submitLeaveRequest,
} from '@/api/leave';

/** Counts by status, used for the tab labels. */
const countByStatus = (requests) => ({
  [LEAVE_STATUS.PENDING]: requests.filter((r) => r.status === LEAVE_STATUS.PENDING).length,
  [LEAVE_STATUS.APPROVED]: requests.filter((r) => r.status === LEAVE_STATUS.APPROVED).length,
  [LEAVE_STATUS.DENIED]: requests.filter((r) => r.status === LEAVE_STATUS.DENIED).length,
});

/** The approver's queue: every request, filtered by status, with review. */
export function useLeaveReview() {
  const toast = useToast();
  const [reviewing, setReviewing] = useState(false);

  const query = useApi((signal) => fetchAllLeaveRequests(signal), []);
  const requests = query.data?.requests || [];

  const review = useCallback(
    async (leaveRequest, action, adminNote) => {
      setReviewing(true);
      try {
        const data = await reviewLeaveRequest(leaveRequest._id, action, adminNote);
        if (!data?.success) throw new Error(data?.message || 'Action failed.');

        query.refetch();
        toast.success(
          `Request ${action === 'approve' ? 'approved' : 'denied'}. ${leaveRequest.employeeId?.name || 'The employee'} has been notified.`,
        );
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not complete the review.');
        return false;
      } finally {
        setReviewing(false);
      }
    },
    [query, toast],
  );

  return {
    requests,
    counts: countByStatus(requests),
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    review,
    reviewing,
  };
}

/** The employee's own requests, plus submitting a new one. */
export function useMyLeaveRequests() {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const query = useApi((signal) => fetchMyLeaveRequests(signal), []);
  const requests = query.data?.requests || [];

  const submit = useCallback(
    async (values) => {
      setSubmitting(true);
      try {
        const data = await submitLeaveRequest(values);
        if (!data?.success) throw new Error(data?.message || 'Submission failed.');

        query.refetch();
        toast.success('Leave request submitted for review.');
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not submit your request.');
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [query, toast],
  );

  return {
    requests,
    counts: countByStatus(requests),
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    submit,
    submitting,
  };
}
