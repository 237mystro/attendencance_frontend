import { useCallback, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { useApi } from '@/hooks/useApi';
import {
  fetchAdvances,
  fetchMyAdvances,
  markAdvanceRepaid,
  requestAdvance,
  reviewAdvance,
} from '@/api/salary-advances';

/** The approver's queue, filtered by status. */
export function useAdvanceReview() {
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [working, setWorking] = useState(false);

  const query = useApi((signal) => fetchAdvances(status, signal), [status]);
  const advances = query.data?.data || [];

  const review = useCallback(
    async (advance, action, values) => {
      setWorking(true);
      try {
        const data = await reviewAdvance(advance._id, action, values);
        if (!data?.success) throw new Error(data?.message || `Failed to ${action}.`);

        query.refetch();
        toast.success(
          `Advance ${action === 'approve' ? 'approved' : 'rejected'}. ${advance.employeeId?.name || 'The employee'} has been notified.`,
        );
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not record that decision.');
        return false;
      } finally {
        setWorking(false);
      }
    },
    [query, toast],
  );

  const markRepaid = useCallback(
    async (advance) => {
      setWorking(true);
      try {
        const data = await markAdvanceRepaid(advance._id);
        if (!data?.success) throw new Error(data?.message || 'Failed to update.');

        query.refetch();
        toast.success('Advance marked as repaid.');
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not mark it repaid.');
        return false;
      } finally {
        setWorking(false);
      }
    },
    [query, toast],
  );

  return {
    advances,
    status,
    setStatus,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    review,
    markRepaid,
    working,
  };
}

/** The employee's own advances, plus submitting a new request. */
export function useMyAdvances() {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const query = useApi((signal) => fetchMyAdvances(signal), []);
  const advances = query.data?.data || [];

  const submit = useCallback(
    async (values) => {
      setSubmitting(true);
      try {
        const data = await requestAdvance(values);
        if (!data?.success) throw new Error(data?.message || 'Failed to submit.');

        query.refetch();
        toast.success('Advance request submitted for review.');
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
    advances,
    // One open request at a time — the API rejects a second, so the button is
    // disabled rather than letting someone hit a server error.
    hasPending: advances.some((advance) => advance.status === 'pending'),
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    submit,
    submitting,
  };
}
