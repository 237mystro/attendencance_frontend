import { fetchMyEmployeeRecord } from '@/api/employees';
import { fetchMyPayHistory } from '@/api/payroll';
import { useApi } from '@/hooks/useApi';
import {
  EMPTY_LIST,
  fetchMyAttendance,
  fetchMyLeave,
  fetchMyShiftsFrom,
  settle,
  startOfThisMonth,
} from '@/api/dashboard';

/**
 * Annual leave entitlement.
 *
 * Hard-coded, as in the source — the API exposes no per-employee allowance, so
 * "days left" is an estimate against a company-wide default rather than a
 * figure anyone should rely on for planning.
 */
const ANNUAL_LEAVE_DAYS = 20;

const isToday = (value) => new Date(value).toDateString() === new Date().toDateString();

/** Inclusive day span of an approved leave request. */
const leaveDays = (request) =>
  Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / 86400000) + 1;

/** The employee's own overview. */
export function useEmployeeDashboard() {
  const query = useApi(
    (signal) =>
      settle({
        record: () => fetchMyEmployeeRecord(signal),
        shifts: () => fetchMyShiftsFrom(startOfThisMonth(), signal),
        attendance: () => fetchMyAttendance(signal),
        leave: () => fetchMyLeave(signal),
        payments: () => fetchMyPayHistory(signal),
      }),
    [],
  );

  const data = query.data || {};
  const record = data.record?.data || data.record?.employee || {};

  const shifts = data.shifts?.data || EMPTY_LIST;
  const attendanceRecords = data.attendance?.data || EMPTY_LIST;
  const leaveRequests = data.leave?.requests || data.leave?.data || [];
  const payments = data.payments?.data || EMPTY_LIST;

  const attended = attendanceRecords.filter(
    (item) => item.status === 'present' || item.status === 'late',
  ).length;

  const daysTaken = leaveRequests
    .filter((request) => request.status === 'approved')
    .reduce((total, request) => total + leaveDays(request), 0);

  return {
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,

    record,
    todaysShift: shifts.find((shift) => isToday(shift.date)) || null,

    metrics: {
      salary: record.salary,
      currency: record.currency || 'XAF',
      shiftsThisMonth: shifts.length,
      leaveDaysLeft: Math.max(0, ANNUAL_LEAVE_DAYS - daysTaken),
      attendanceRate: attendanceRecords.length
        ? `${Math.round((attended / attendanceRecords.length) * 100)}%`
        : '—',
    },

    recentPayments: payments.slice(0, 4),
    // Newest first, and only enough to glance at.
    recentLeave: leaveRequests.slice(0, 3),
  };
}
