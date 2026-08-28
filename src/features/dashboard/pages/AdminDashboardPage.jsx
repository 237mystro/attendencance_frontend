import { CalendarClock, ClipboardCheck, Users, Wallet } from 'lucide-react';
import { useState } from 'react';

import {
  DataTable,
  ErrorState,
  LoadingState,
  MetricCard,
  PageHero,
  PageWrapper,
  Panel,
  SearchInput,
  Select,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/auth-context';
import { useTableControls } from '@/hooks/useTableControls';
import {
  AttendanceMixChart,
  WeeklyAttendanceChart,
} from '../components/DashboardCharts';
import { AlertList, DailyFocusCard, DecisionQueue } from '../components/DashboardPanels';
import { getDailyQuote, greeting } from '../daily-quote';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

/** Hoisted so `useTableControls` sees a stable reference across renders. */
const DIRECTORY_SEARCH_KEYS = ['name', 'position', 'department', 'email'];

const directoryColumns = [
  {
    key: 'name',
    header: 'Employee',
    primary: true,
    render: (employee) => (
      <span>
        <span className="block font-semibold">{employee.name}</span>
        <span className="block text-xs text-muted dark:text-muted-soft">
          {employee.email}
        </span>
      </span>
    ),
  },
  { key: 'position', header: 'Position' },
  {
    key: 'department',
    header: 'Department',
    render: (employee) => employee.department || '—',
  },
];

/** The admin and HR overview: today's numbers, trends, and what needs doing. */
export function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const dashboard = useAdminDashboard();
  const [department, setDepartment] = useState('all');

  const search = useTableControls(dashboard.employees, {
    searchKeys: DIRECTORY_SEARCH_KEYS,
    pageSize: 5,
  });

  const rows =
    department === 'all'
      ? search.rows
      : search.rows.filter((employee) => employee.department === department);

  const quote = getDailyQuote('leader');

  return (
    <PageWrapper>
      <PageHero
        eyebrow={`${greeting()}, ${currentUser?.name?.split(' ')[0] || 'there'}`}
        title="Your workforce at a glance"
        subtitle="Today's attendance, payroll readiness, and the approvals waiting on you."
        aside={<DailyFocusCard quote={quote} />}
      />

      {dashboard.loading ? (
        <LoadingState label="Gathering today's numbers…" />
      ) : dashboard.error ? (
        <ErrorState message={dashboard.error} onRetry={dashboard.refetch} />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Active employees"
              value={dashboard.metrics.activeEmployees}
              icon={<Users className="size-5" />}
              accent="text-brand-500"
            />
            <MetricCard
              label="Attendance rate"
              value={dashboard.metrics.attendanceRate}
              icon={<ClipboardCheck className="size-5" />}
              accent="text-success"
            />
            <MetricCard
              label="Shifts today"
              value={dashboard.metrics.todayShifts}
              icon={<CalendarClock className="size-5" />}
              accent="text-warn"
            />
            <MetricCard
              label="Payroll volume"
              value={dashboard.metrics.payrollVolume}
              icon={<Wallet className="size-5" />}
              accent="text-accent-500"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
            <WeeklyAttendanceChart data={dashboard.weekly} />
            <AttendanceMixChart mix={dashboard.mix} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <DecisionQueue
              items={[
                {
                  label: 'Leave awaiting review',
                  value: dashboard.queue.pendingLeave,
                  to: ROUTES.admin.leave,
                  accent: 'border-brand-500/15 bg-brand-50/50 dark:bg-brand-500/10',
                },
                {
                  label: 'Late requests awaiting review',
                  value: dashboard.queue.pendingLate,
                  to: ROUTES.admin.lateRequests,
                  accent: 'border-accent-500/15 bg-accent-500/5 dark:bg-accent-500/10',
                },
                {
                  label: 'Attendance watch',
                  value: dashboard.queue.absent,
                  detail: `${dashboard.queue.absent} absent · ${dashboard.queue.late} late · ${dashboard.queue.present} present`,
                  to: ROUTES.admin.attendance,
                  accent: 'border-warn/15 bg-warn-soft/40 dark:bg-warn/10',
                },
              ]}
            />

            <AlertList alerts={dashboard.alerts} />
          </div>

          <Panel
            title="Workforce search"
            subtitle="Find anyone by name, role, department, or email."
            interactive={false}
            action={
              <div className="flex flex-wrap gap-2">
                <SearchInput
                  value={search.search}
                  onChange={search.setSearch}
                  placeholder="Search employees…"
                  label="Search employees"
                  className="sm:w-64"
                />
                <Select
                  label="Department"
                  wrapperClassName="w-44"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  options={[
                    { value: 'all', label: 'All departments' },
                    ...dashboard.departments.map((name) => ({
                      value: name,
                      label: name,
                    })),
                  ]}
                />
              </div>
            }
          >
            <DataTable
              columns={directoryColumns}
              rows={rows}
              caption="Workforce directory"
              emptyIcon={<Users aria-hidden="true" className="size-6" />}
              emptyTitle="Nobody matches"
              emptyDescription="Try a different name, role, or department."
            />
          </Panel>
        </div>
      )}
    </PageWrapper>
  );
}
