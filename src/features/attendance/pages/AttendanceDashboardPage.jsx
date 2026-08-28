import { ChartNoAxesCombined, CircleX, Clock, CircleCheckBig, Users } from 'lucide-react';
import { useState } from 'react';

import {
  DataTable,
  ErrorState,
  LoadingState,
  MetricCard,
  PageHero,
  PageWrapper,
  Panel,
  TabPanel,
  Tabs,
} from '@/components/ui';
import { formatTime } from '@/lib/formatters';
import { AttendanceMethodBadge, AttendanceStatusBadge } from '../components/AttendanceBadges';
import { FlaggedDeviceReview } from '../components/FlaggedDeviceReview';
import { useAttendanceDashboard } from '../hooks/useAttendanceDashboard';
import { AttendanceInsightsPanel } from './AttendanceInsightsPanel';

const TABS = [
  { id: 'today', label: "Today's attendance" },
  { id: 'insights', label: 'Analytics & insights' },
];

/** Admin and branch view of who is present, late, or absent today. */
export function AttendanceDashboardPage() {
  const [tab, setTab] = useState('today');
  const dashboard = useAttendanceDashboard();

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      primary: true,
      render: (record) => (
        <span className="flex items-center gap-2">
          {record.deviceFlagged && (
            <span
              title="Checked in from an unknown device"
              className="inline-flex size-2 shrink-0 rounded-full bg-warn"
            />
          )}
          <span className="font-semibold">{record.employeeId?.name || 'Unknown'}</span>
        </span>
      ),
    },
    {
      key: 'position',
      header: 'Position',
      render: (record) => record.employeeId?.position || 'Unknown',
    },
    {
      key: 'checkInTime',
      header: 'Check-in time',
      render: (record) => formatTime(record.checkInTime),
    },
    {
      key: 'method',
      header: 'Method',
      render: (record) => <AttendanceMethodBadge record={record} /> ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (record) => <AttendanceStatusBadge status={record.status} />,
    },
  ];

  const { summary } = dashboard;

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Attendance"
        title="Attendance dashboard"
        subtitle="Monitor who is present, late, or absent across your workforce today."
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} idPrefix="attendance" />

      <TabPanel id="today" value={tab} idPrefix="attendance">
        {dashboard.loading ? (
          <LoadingState label="Loading today's attendance…" />
        ) : dashboard.error ? (
          <ErrorState message={dashboard.error} onRetry={dashboard.refetch} />
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricCard
                label="Total employees"
                value={summary.totalEmployees}
                icon={<Users className="size-5" />}
                accent="text-brand-500"
              />
              <MetricCard
                label="Present"
                value={summary.present}
                icon={<CircleCheckBig className="size-5" />}
                accent="text-success"
              />
              <MetricCard
                label="Late"
                value={summary.late}
                icon={<Clock className="size-5" />}
                accent="text-warn"
              />
              <MetricCard
                label="Absent"
                value={summary.absent}
                icon={<CircleX className="size-5" />}
                accent="text-danger"
              />
            </div>

            <FlaggedDeviceReview
              records={dashboard.flagged}
              onReview={dashboard.review}
              reviewing={dashboard.reviewing}
            />

            <Panel title="Today's attendance" interactive={false}>
              <DataTable
                columns={columns}
                rows={dashboard.records}
                caption="Attendance records for today"
                emptyTitle="No attendance records yet"
                emptyDescription="Records appear here as employees check in."
                emptyIcon={<ChartNoAxesCombined aria-hidden="true" className="size-6" />}
              />
            </Panel>
          </>
        )}
      </TabPanel>

      <TabPanel id="insights" value={tab} idPrefix="attendance">
        <AttendanceInsightsPanel />
      </TabPanel>
    </PageWrapper>
  );
}
