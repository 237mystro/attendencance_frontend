import { useCallback, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { fetchEmployees } from '@/api/employees';
import { APP_EVENTS, useAppEvent } from '@/hooks/useAppEvent';
import { useApi } from '@/hooks/useApi';
import { useTableControls } from '@/hooks/useTableControls';
import {
  createRecurringShifts,
  createShift,
  deleteShift,
  fetchSchedules,
  updateShift,
} from '@/api/scheduling';
import { weekdayFromIso } from '../shift-fields';

/**
 * The admin and branch view of the roster: every shift, plus create, edit,
 * delete, and bulk recurrence.
 *
 * Refreshes itself when an employee accepts or declines somewhere else, so the
 * board does not go stale while it is open.
 */
export function useShiftScheduling() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const shiftQuery = useApi((signal) => fetchSchedules(signal), []);
  const employeeQuery = useApi((signal) => fetchEmployees(signal), []);

  const shifts = shiftQuery.data?.data || [];
  const employees = employeeQuery.data?.data || [];

  const table = useTableControls(shifts, {
    searchKeys: ['employeeId.name', 'employeeId.position', 'day'],
    pageSize: 15,
    initialSort: 'date',
    initialDirection: 'desc',
  });

  useAppEvent(APP_EVENTS.shiftResponse, (detail) => {
    shiftQuery.refetch();
    if (detail?.employeeName && detail?.assignmentStatus) {
      toast.info(`${detail.employeeName} has ${detail.assignmentStatus} their shift.`);
    }
  });

  const save = useCallback(
    async (values, editingId) => {
      setSaving(true);
      try {
        // The API stores the weekday name alongside the date; derive it here so
        // the two can never disagree.
        const payload = { ...values, day: weekdayFromIso(values.date) };

        const data = editingId
          ? await updateShift(editingId, payload)
          : await createShift(payload);

        if (!data?.success) throw new Error(data?.message || 'Save failed.');

        shiftQuery.refetch();
        toast.success(
          editingId ? 'Shift updated.' : 'Shift assigned — the employee has been notified.',
        );
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not save the shift.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [shiftQuery, toast],
  );

  const saveRecurring = useCallback(
    async (values) => {
      setSaving(true);
      try {
        const data = await createRecurringShifts({
          employeeId: values.employeeId,
          days: values.weekdays,
          startTime: values.startTime,
          endTime: values.endTime,
          startDate: values.startDate,
          endDate: values.endDate,
        });
        if (!data?.success) throw new Error(data?.message || 'Save failed.');

        shiftQuery.refetch();
        toast.success(
          `${data.count} shift${data.count === 1 ? '' : 's'} created — the employee has been notified.`,
        );
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not create the shifts.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [shiftQuery, toast],
  );

  const remove = useCallback(
    async (shift) => {
      setDeleting(true);
      try {
        const data = await deleteShift(shift._id);
        if (!data?.success) throw new Error(data?.message || 'Delete failed.');

        shiftQuery.refetch();
        toast.success('Shift deleted.');
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not delete the shift.');
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [shiftQuery, toast],
  );

  return {
    ...table,
    employees,
    total: shifts.length,
    matching: table.total,
    pendingCount: shifts.filter((shift) => shift.assignmentStatus === 'pending').length,
    loading: shiftQuery.loading,
    error: shiftQuery.error,
    refetch: shiftQuery.refetch,
    save,
    saveRecurring,
    saving,
    remove,
    deleting,
  };
}
