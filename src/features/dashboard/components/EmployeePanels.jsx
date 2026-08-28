import { CalendarCheck, ScanLine } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button, EmptyState, Panel, StatusBadge } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { formatCurrency, formatDate } from '@/lib/formatters';

/** Today's shift, or a nudge that there isn't one. */
export function TodaysShift({ shift }) {
  return (
    <Panel title="Today's shift" interactive={false}>
      {shift ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-2xl font-extrabold text-ink dark:text-ink-dark">
              {shift.startTime} – {shift.endTime}
            </p>
            <p className="mt-0.5 text-sm text-muted dark:text-muted-soft">
              {shift.day} · {formatDate(shift.date)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={shift.status || 'scheduled'} />
            <Button
              as={Link}
              to={ROUTES.employee.checkin}
              size="sm"
              startIcon={<ScanLine aria-hidden="true" className="size-4" />}
            >
              Check in
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<CalendarCheck aria-hidden="true" className="size-6" />}
          title="No shift scheduled today"
          description="Enjoy the day off, or check your schedule for what is coming up."
          action={
            <Button as={Link} to={ROUTES.employee.schedule} variant="secondary" size="sm">
              View my schedule
            </Button>
          }
        />
      )}
    </Panel>
  );
}

/** A "see all" link, shared by both summary panels below. */
const SeeAll = ({ to }) => (
  <Button as={Link} to={to} variant="ghost" size="sm">
    See all
  </Button>
);

/** One row of a summary list: a label and sub-label on the left, status right. */
const SummaryRow = ({ title, detail, trailing }) => (
  <li className="flex items-center justify-between gap-3 py-3">
    <span className="min-w-0">
      <span className="block font-semibold text-ink dark:text-ink-dark">{title}</span>
      <span className="block text-xs text-muted dark:text-muted-soft">{detail}</span>
    </span>
    <span className="flex shrink-0 items-center gap-2">{trailing}</span>
  </li>
);

const List = ({ children }) => (
  <ul className="divide-y divide-line dark:divide-line-dark">{children}</ul>
);

/** The employee's latest payroll records. */
export function RecentPayments({ payments }) {
  return (
    <Panel
      title="Recent payments"
      subtitle="Your latest payroll records."
      interactive={false}
      action={<SeeAll to={ROUTES.employee.payments} />}
    >
      {payments.length === 0 ? (
        <EmptyState
          title="No payments yet"
          description="Pay periods appear here once payroll has run for you."
        />
      ) : (
        <List>
          {payments.map((payment) => (
            <SummaryRow
              key={payment._id}
              title={payment.period}
              detail={`${payment.shifts ?? 0} shifts`}
              trailing={
                <>
                  <span className="font-bold text-ink dark:text-ink-dark">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                  <StatusBadge status={payment.status} />
                </>
              }
            />
          ))}
        </List>
      )}
    </Panel>
  );
}

/** Recent leave requests and where each one stands. */
export function RecentLeave({ requests }) {
  return (
    <Panel
      title="Your requests"
      subtitle="Recent leave requests and where they stand."
      interactive={false}
      action={<SeeAll to={ROUTES.employee.leave} />}
    >
      {requests.length === 0 ? (
        <EmptyState
          title="Nothing pending"
          description="Leave requests you send will show up here."
          action={
            <Button as={Link} to={ROUTES.employee.leave} variant="secondary" size="sm">
              Request leave
            </Button>
          }
        />
      ) : (
        <List>
          {requests.map((request) => (
            <SummaryRow
              key={request._id}
              title={request.leaveType}
              detail={`${formatDate(request.startDate)} – ${formatDate(request.endDate)}`}
              trailing={<StatusBadge status={request.status} />}
            />
          ))}
        </List>
      )}
    </Panel>
  );
}
