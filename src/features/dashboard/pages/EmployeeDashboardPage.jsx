import { CalendarDays, ClipboardCheck, Clock, Wallet } from 'lucide-react';

import {
  ErrorState,
  LoadingState,
  MetricCard,
  PageHero,
  PageWrapper,
} from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { formatCurrency } from '@/lib/formatters';
import { DailyFocusCard } from '../components/DashboardPanels';
import {
  RecentLeave,
  RecentPayments,
  TodaysShift,
} from '../components/EmployeePanels';
import { getDailyQuote, greeting } from '../daily-quote';
import { useEmployeeDashboard } from '../hooks/useEmployeeDashboard';

/** The employee's own overview: today's shift, pay, and open requests. */
export function EmployeeDashboardPage() {
  const { currentUser } = useAuth();
  const dashboard = useEmployeeDashboard();
  const quote = getDailyQuote('employee');
  const { metrics } = dashboard;

  return (
    <PageWrapper>
      <PageHero
        eyebrow={`${greeting()}, ${currentUser?.name?.split(' ')[0] || 'there'}`}
        title="Your day at a glance"
        subtitle="Your shift, your pay, and anything waiting on you."
        aside={<DailyFocusCard quote={quote} />}
      />

      {dashboard.loading ? (
        <LoadingState label="Loading your dashboard…" />
      ) : dashboard.error ? (
        <ErrorState message={dashboard.error} onRetry={dashboard.refetch} />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Monthly salary"
              value={
                metrics.salary ? formatCurrency(metrics.salary, metrics.currency) : '—'
              }
              icon={<Wallet className="size-5" />}
              accent="text-accent-500"
            />
            <MetricCard
              label="Shifts this month"
              value={metrics.shiftsThisMonth}
              icon={<CalendarDays className="size-5" />}
              accent="text-brand-500"
            />
            <MetricCard
              label="Leave days left"
              value={metrics.leaveDaysLeft}
              helper="Estimated against a 20-day year."
              icon={<Clock className="size-5" />}
              accent="text-warn"
            />
            <MetricCard
              label="Attendance rate"
              value={metrics.attendanceRate}
              icon={<ClipboardCheck className="size-5" />}
              accent="text-success"
            />
          </div>

          <TodaysShift shift={dashboard.todaysShift} />

          <div className="grid gap-5 lg:grid-cols-2">
            <RecentPayments payments={dashboard.recentPayments} />
            <RecentLeave requests={dashboard.recentLeave} />
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
