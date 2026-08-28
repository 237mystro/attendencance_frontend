import { ROUTES } from '@/constants/routes';
import { fetchEmployees } from '@/api/employees';
import { fetchPayrolls } from '@/api/payroll';
import { fetchSchedules } from '@/api/scheduling';
import { useApi } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/formatters';
import {
  EMPTY_LIST,
  fetchAllLeave,
  fetchAttendanceSummary,
  fetchPendingLateCount,
  fetchWeeklyAttendance,
  settle,
} from '@/api/dashboard';

/** Compact currency for the headline tile: `XAF 18.4M`, `XAF 940K`. */
const compactAmount = (total, currency = 'XAF') => {
  if (total >= 1_000_000) return `${currency} ${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1000) return `${currency} ${Math.round(total / 1000)}K`;
  return formatCurrency(total, currency);
};

const isToday = (value) => new Date(value).toDateString() === new Date().toDateString();

/**
 * Turns the day's numbers into a short list of things worth acting on, each
 * with somewhere to go. An empty queue is itself worth saying.
 */
const buildAlerts = ({ absent, late, pendingLeave, pendingLate }) => {
  const alerts = [];

  if (absent > 0) {
    alerts.push({
      tone: 'warn',
      message: `${absent} employee${absent === 1 ? ' is' : 's are'} absent today.`,
      actionLabel: 'Open attendance',
      to: ROUTES.admin.attendance,
    });
  }
  if (late > 0) {
    alerts.push({
      tone: 'info',
      message: `${late} employee${late === 1 ? '' : 's'} checked in late.`,
      actionLabel: 'Review attendance',
      to: ROUTES.admin.attendance,
    });
  }
  if (pendingLeave > 0) {
    alerts.push({
      tone: 'warn',
      message: `${pendingLeave} leave request${pendingLeave === 1 ? ' is' : 's are'} awaiting approval.`,
      actionLabel: 'Review leave',
      to: ROUTES.admin.leave,
    });
  }
  if (pendingLate > 0) {
    alerts.push({
      tone: 'info',
      message: `${pendingLate} late arrival request${pendingLate === 1 ? ' is' : 's are'} waiting for review.`,
      actionLabel: 'Review requests',
      to: ROUTES.admin.lateRequests,
    });
  }

  if (!alerts.length) {
    alerts.push({
      tone: 'success',
      message:
        'Nothing needs your attention right now. A good moment to check payroll readiness.',
      actionLabel: 'Open payroll',
      to: ROUTES.admin.payroll,
    });
  }
  return alerts;
};

/** Everything the admin and HR dashboard shows. */
export function useAdminDashboard() {
  const query = useApi(
    (signal) =>
      settle({
        employees: () => fetchEmployees(signal),
        schedules: () => fetchSchedules(signal),
        payrolls: () => fetchPayrolls(signal),
        attendance: () => fetchAttendanceSummary(signal),
        leave: () => fetchAllLeave(signal),
        lateCount: () => fetchPendingLateCount(signal),
        weekly: () => fetchWeeklyAttendance(signal),
      }),
    [],
  );

  const data = query.data || {};

  const employees = data.employees?.data || EMPTY_LIST;
  const activeEmployees = employees.filter(
    (employee) => employee.status !== 'inactive',
  );

  const attendance = data.attendance?.data || {};
  const present = attendance.present || 0;
  const late = attendance.late || 0;
  const absent = attendance.absent || 0;
  const headcount = Math.max(attendance.totalEmployees || activeEmployees.length, 1);

  const leaveRequests = data.leave?.requests || data.leave?.data || [];
  const pendingLeave = leaveRequests.filter(
    (leaveRequest) => leaveRequest.status === 'pending',
  ).length;
  const pendingLate = Number(data.lateCount?.count) || 0;

  const payrollTotal = (data.payrolls?.data || []).reduce(
    (total, payroll) => total + (payroll.totalAmount || 0),
    0,
  );

  return {
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,

    employees,
    departments: [
      ...new Set(employees.map((employee) => employee.department).filter(Boolean)),
    ],

    metrics: {
      activeEmployees: activeEmployees.length,
      attendanceRate: `${Math.round(((present + late) / headcount) * 100)}%`,
      todayShifts: (data.schedules?.data || []).filter((shift) => isToday(shift.date))
        .length,
      payrollVolume: compactAmount(payrollTotal),
    },

    mix: [
      { name: 'Present', value: present, color: 'var(--color-success)' },
      { name: 'Late', value: late, color: 'var(--color-warn)' },
      { name: 'Absent', value: absent, color: 'var(--color-danger)' },
    ],

    weekly: data.weekly?.data || EMPTY_LIST,
    queue: { pendingLeave, pendingLate, present, late, absent },
    alerts: buildAlerts({ absent, late, pendingLeave, pendingLate }),
  };
}
