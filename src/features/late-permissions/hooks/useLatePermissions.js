import { useCallback, useState } from 'react';

import { LATE_PERMISSION_STATUS } from '@/constants/status';
import { useSocket } from '@/context/socket-context';
import { useToast } from '@/context/toast-context';
import { APP_EVENTS, useAppEvent } from '@/hooks/useAppEvent';
import { useApi } from '@/hooks/useApi';
import {
  fetchLateRequestsForReview,
  fetchMyLateRequests,
  reviewLateRequest,
  submitLateRequest,
} from '@/api/late-permissions';
import { describeOutcome, isToday } from '../late-permission-fields';

/** The approver's queue, kept current as new requests arrive. */
export function useLateRequestReview() {
  const toast = useToast();
  const { refreshPendingLateCount } = useSocket();
  const [reviewing, setReviewing] = useState(false);

  const query = useApi((signal) => fetchLateRequestsForReview(signal), []);
  const requests = query.data?.data || [];

  useAppEvent(APP_EVENTS.latePermissionNew, () => query.refetch());

  const review = useCallback(
    async (lateRequest, decision) => {
      setReviewing(true);
      try {
        const data = await reviewLateRequest(lateRequest._id, decision);
        if (!data?.success) throw new Error(data?.message || 'Failed to review.');

        query.refetch();
        // The sidebar badge counts pending requests; one fewer now.
        refreshPendingLateCount();

        const name = lateRequest.employeeId?.name || 'The employee';
        toast.success(
          decision.status === LATE_PERMISSION_STATUS.DENIED
            ? `${name}'s request was denied.`
            : `${name}'s request was approved.`,
        );
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not record the decision.');
        return false;
      } finally {
        setReviewing(false);
      }
    },
    [query, toast, refreshPendingLateCount],
  );

  const pending = requests.filter(
    (item) => item.status === LATE_PERMISSION_STATUS.PENDING,
  );

  return {
    requests,
    pending,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    review,
    reviewing,
  };
}

/** The employee's own request for today, plus their history. */
export function useMyLateRequests() {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const query = useApi((signal) => fetchMyLateRequests(signal), []);
  const requests = query.data?.data || [];

  // A decision made elsewhere should update this screen and say what happened.
  useAppEvent(APP_EVENTS.latePermissionReviewed, (detail) => {
    query.refetch();
    toast.info(describeOutcome(detail || {}), { duration: 10000 });
  });

  const submit = useCallback(
    async (values) => {
      setSubmitting(true);
      try {
        const data = await submitLateRequest(values);
        if (!data?.success) throw new Error(data?.message || 'Failed to submit.');

        query.refetch();
        toast.success('Your request has been sent to your manager.');
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not send your request.');
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [query, toast],
  );

  return {
    today: requests.find((item) => isToday(item.date)) || null,
    history: requests.filter((item) => !isToday(item.date)),
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    submit,
    submitting,
  };
}
