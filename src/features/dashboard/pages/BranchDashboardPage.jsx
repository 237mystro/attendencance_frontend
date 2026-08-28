import { CircleX, Clock, CircleCheckBig, MapPin, Users } from 'lucide-react';

import {
  Alert,
  ErrorState,
  LoadingState,
  MetricCard,
  PageHero,
  PageWrapper,
  Panel,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/auth-context';
import { formatDate } from '@/lib/formatters';
import { AttendanceMixChart } from '../components/DashboardCharts';
import { DailyFocusCard, DecisionQueue } from '../components/DashboardPanels';
import { getDailyQuote, greeting } from '../daily-quote';
import { useBranchDashboard } from '../hooks/useBranchDashboard';

/** The branch manager and branch HR overview. */
export function BranchDashboardPage() {
  const { currentUser } = useAuth();
  const dashboard = useBranchDashboard();
  const quote = getDailyQuote('branch');

  return (
    <PageWrapper>
      <PageHero
        eyebrow={`${greeting()}, ${currentUser?.name?.split(' ')[0] || 'there'}`}
        title={dashboard.branch?.name || 'Your branch today'}
        subtitle="Who is in, what is pending, and where attention is needed."
        chips={[formatDate(new Date())]}
        aside={<DailyFocusCard quote={quote} />}
      />

      {dashboard.loading ? (
        <LoadingState label="Loading your branch…" />
      ) : dashboard.error ? (
        <ErrorState message={dashboard.error} onRetry={dashboard.refetch} />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Branch headcount"
              value={dashboard.metrics.headcount}
              icon={<Users className="size-5" />}
              accent="text-brand-500"
            />
            <MetricCard
              label="Present"
              value={dashboard.metrics.present}
              secondaryValue={dashboard.metrics.attendanceRate}
              icon={<CircleCheckBig className="size-5" />}
              accent="text-success"
            />
            <MetricCard
              label="Late"
              value={dashboard.metrics.late}
              icon={<Clock className="size-5" />}
              accent="text-warn"
            />
            <MetricCard
              label="Absent"
              value={dashboard.metrics.absent}
              icon={<CircleX className="size-5" />}
              accent="text-danger"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <AttendanceMixChart mix={dashboard.mix} />

            <DecisionQueue
              items={[
                {
                  label: 'Leave awaiting review',
                  value: dashboard.pendingLeave,
                  to: ROUTES.branch.leave,
                  accent: 'border-brand-500/15 bg-brand-50/50 dark:bg-brand-500/10',
                },
                {
                  label: 'Late requests awaiting review',
                  value: dashboard.pendingLate,
                  to: ROUTES.branch.lateRequests,
                  accent: 'border-accent-500/15 bg-accent-500/5 dark:bg-accent-500/10',
                },
                {
                  label: 'Attendance today',
                  value: dashboard.metrics.absent,
                  detail: `${dashboard.metrics.absent} absent · ${dashboard.metrics.late} late`,
                  to: ROUTES.branch.attendance,
                  accent: 'border-warn/15 bg-warn-soft/40 dark:bg-warn/10',
                },
              ]}
            />
          </div>

          <Panel title="Branch details" interactive={false}>
            {dashboard.branch ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  ['Branch', dashboard.branch.name],
                  ['Address', dashboard.branch.address || 'Not set'],
                  [
                    'Geofence',
                    dashboard.branch.geofence?.latitude
                      ? `${dashboard.branch.geofence.radius ?? 100} m radius`
                      : 'Not configured',
                  ],
                  ['Manager', dashboard.branch.managerId?.name || 'Unassigned'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted dark:text-muted-soft">{label}</dt>
                    <dd className="font-semibold text-ink dark:text-ink-dark">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <Alert tone="warn">
                No branch is assigned to your account yet. Ask an administrator to
                assign you to one.
              </Alert>
            )}

            {dashboard.branch && !dashboard.branch.geofence?.latitude && (
              <Alert tone="warn" className="mt-4">
                <MapPin aria-hidden="true" className="mr-1.5 inline size-4" />
                This branch has no geofence, so staff cannot clock in here yet.
              </Alert>
            )}
          </Panel>
        </div>
      )}
    </PageWrapper>
  );
}
