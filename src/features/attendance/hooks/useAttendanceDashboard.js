import { useCallback, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { APP_EVENTS, useAppEvent } from '@/hooks/useAppEvent';
import { useApi } from '@/hooks/useApi';
import {
  fetchAdminDashboard,
  fetchFlaggedDevices,
  reviewFlaggedDevice,
} from '@/api/attendance';

/**
 * Loads today's attendance and the flagged-device queue together, and keeps
 * the queue current as new alerts arrive.
 *
 * The source opened a second socket connection just for this; here the shared
 * `SocketProvider` broadcasts the event and this hook listens, so the app holds
 * one connection no matter how many screens care about it.
 */
export function useAttendanceDashboard() {
  const toast = useToast();
  const [reviewing, setReviewing] = useState(false);

  const dashboard = useApi((signal) => fetchAdminDashboard(signal), []);
  const flaggedQuery = useApi((signal) => fetchFlaggedDevices(signal), []);

  // A new alert refreshes the queue and raises a toast, so an admin reading
  // another tab still notices.
  useAppEvent(APP_EVENTS.deviceFlagged, (detail) => {
    flaggedQuery.refetch();
    toast.warn(
      `${detail?.employeeName || 'An employee'} checked in from an unrecognised device` +
        (detail?.ipAddress ? ` (IP ${detail.ipAddress}).` : '.'),
      { duration: 8000 },
    );
  });

  const review = useCallback(
    async (record, action) => {
      setReviewing(true);
      try {
        const data = await reviewFlaggedDevice(record._id, action);

        // Drop the row straight away rather than waiting for a round trip.
        flaggedQuery.setData((current) => ({
          ...current,
          data: (current?.data || []).filter((item) => item._id !== record._id),
        }));
        dashboard.refetch();

        toast.success(
          data.message ||
            (action === 'approve' ? 'Check-in approved.' : 'Check-in revoked.'),
        );
      } catch (caught) {
        toast.error(caught?.message || 'Could not complete the review.');
      } finally {
        setReviewing(false);
      }
    },
    [dashboard, flaggedQuery, toast],
  );

  // The API has shipped both `{ data: {...} }` and a flat body; accept either.
  const payload = dashboard.data?.data || dashboard.data || {};

  return {
    loading: dashboard.loading,
    error: dashboard.error,
    refetch: dashboard.refetch,
    records: payload.attendance || [],
    summary: {
      totalEmployees: payload.totalEmployees || 0,
      present: payload.present || 0,
      late: payload.late || 0,
      absent: payload.absent || 0,
    },
    flagged: flaggedQuery.data?.data || [],
    review,
    reviewing,
  };
}
