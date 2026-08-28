import { useApi } from '@/hooks/useApi';
import {
  fetchAllLeave,
  fetchAttendanceSummary,
  fetchMyBranch,
  fetchPendingLateCount,
  settle,
} from '@/api/dashboard';

/**
 * The branch overview.
 *
 * Narrower than the admin one on purpose: a branch manager cares about who is
 * in today and what is waiting on them, not company-wide payroll volume.
 */
export function useBranchDashboard() {
  const query = useApi(
    (signal) =>
      settle({
        attendance: () => fetchAttendanceSummary(signal),
        branch: () => fetchMyBranch(signal),
        leave: () => fetchAllLeave(signal),
        lateCount: () => fetchPendingLateCount(signal),
      }),
    [],
  );

  const data = query.data || {};
  const attendance = data.attendance?.data || {};

  const present = attendance.present || 0;
  const late = attendance.late || 0;
  const absent = attendance.absent || 0;
  const headcount = Math.max(attendance.totalEmployees || 1, 1);

  const leaveRequests = data.leave?.requests || data.leave?.data || [];

  return {
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,

    branch: data.branch?.data || null,

    metrics: {
      headcount: attendance.totalEmployees || 0,
      present,
      late,
      absent,
      attendanceRate: `${Math.round(((present + late) / headcount) * 100)}%`,
    },

    mix: [
      { name: 'Present', value: present, color: 'var(--color-success)' },
      { name: 'Late', value: late, color: 'var(--color-warn)' },
      { name: 'Absent', value: absent, color: 'var(--color-danger)' },
    ],

    pendingLeave: leaveRequests.filter((request) => request.status === 'pending').length,
    pendingLate: Number(data.lateCount?.count) || 0,
  };
}
