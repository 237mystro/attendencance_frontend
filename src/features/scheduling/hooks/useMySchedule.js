import { useCallback, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { APP_EVENTS, useAppEvent } from '@/hooks/useAppEvent';
import { useApi } from '@/hooks/useApi';
import {
  fetchMyShifts,
  fetchMyTransfers,
  fetchTransferCandidates,
  requestTransfer,
  respondToShift,
  respondToTransfer,
} from '@/api/scheduling';
import { isActiveShift, isPendingInvitation } from '../shift-fields';

/**
 * The employee's own schedule: accepted shifts, invitations awaiting a reply,
 * and shift transfers in both directions.
 *
 * Every realtime event that touches any of those refetches the affected slice,
 * so the three tabs stay consistent with one another.
 */
export function useMySchedule() {
  const toast = useToast();
  const [responding, setResponding] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const shiftQuery = useApi((signal) => fetchMyShifts(undefined, signal), []);
  const transferQuery = useApi((signal) => fetchMyTransfers(signal), []);
  const candidateQuery = useApi((signal) => fetchTransferCandidates(signal), []);

  const shifts = shiftQuery.data?.data || [];
  const sent = transferQuery.data?.sent || [];
  const received = transferQuery.data?.received || [];

  useAppEvent(APP_EVENTS.shiftAssigned, () => {
    shiftQuery.refetch();
    toast.info('You have a new shift invitation — open Invitations to respond.');
  });

  useAppEvent(APP_EVENTS.shiftReminder, (detail) => {
    toast.info(
      `Your shift starts in about ${detail?.minutesBefore || 30} minutes${detail?.startTime ? `, at ${detail.startTime}` : ''}.`,
      { duration: 10000 },
    );
  });

  useAppEvent(APP_EVENTS.transferIncoming, () => {
    transferQuery.refetch();
    toast.info('Someone asked you to take one of their shifts.');
  });

  useAppEvent([APP_EVENTS.transferAccepted, APP_EVENTS.transferDeclined], () => {
    shiftQuery.refetch();
    transferQuery.refetch();
  });

  /** Accepts or declines an assigned shift. */
  const answerInvitation = useCallback(
    async (shift, action) => {
      setResponding(shift._id);
      try {
        const data = await respondToShift(shift._id, action);
        if (!data?.success) throw new Error(data?.message || 'Action failed.');

        shiftQuery.refetch();
        toast.success(
          action === 'accept'
            ? 'Shift accepted and added to your schedule.'
            : 'Shift declined.',
        );
      } catch (caught) {
        toast.error(caught?.message || 'Could not respond. Please try again.');
      } finally {
        setResponding(null);
      }
    },
    [shiftQuery, toast],
  );

  /** Offers one of my shifts to a colleague. */
  const offerTransfer = useCallback(
    async (values) => {
      setSubmitting(true);
      try {
        const data = await requestTransfer(values);
        if (!data?.success) throw new Error(data?.message || 'Request failed.');

        transferQuery.refetch();
        toast.success('Transfer request sent.');
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not send the transfer request.');
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [transferQuery, toast],
  );

  /** Accepts or declines a colleague's offer. */
  const answerTransfer = useCallback(
    async (transfer, action) => {
      setResponding(transfer._id);
      try {
        const data = await respondToTransfer(transfer._id, action);
        if (!data?.success) throw new Error(data?.message || 'Action failed.');

        shiftQuery.refetch();
        transferQuery.refetch();
        toast.success(`Transfer ${action === 'accept' ? 'accepted' : 'declined'}.`);
      } catch (caught) {
        toast.error(caught?.message || 'Could not respond. Please try again.');
      } finally {
        setResponding(null);
      }
    },
    [shiftQuery, transferQuery, toast],
  );

  const incoming = received.filter((transfer) => transfer.status === 'pending');

  return {
    myShifts: shifts.filter(isActiveShift),
    invitations: shifts.filter(isPendingInvitation),
    incoming,
    outgoing: sent,
    candidates: candidateQuery.data?.employees || [],
    loading: shiftQuery.loading,
    error: shiftQuery.error,
    refetch: shiftQuery.refetch,
    responding,
    submitting,
    answerInvitation,
    offerTransfer,
    answerTransfer,
  };
}
