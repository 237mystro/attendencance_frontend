import { Button, StatusBadge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/formatters';

/** The detail columns shared by both advance tables. */
const sharedColumns = [
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (advance) => (
      <span className="font-bold">
        {formatCurrency(advance.amount, advance.currency)}
      </span>
    ),
  },
  {
    key: 'reason',
    header: 'Reason',
    render: (advance) => (
      <span className="block max-w-60 truncate" title={advance.reason}>
        {advance.reason || '—'}
      </span>
    ),
  },
  {
    key: 'deductionPeriod',
    header: 'Recovered from',
    render: (advance) => advance.deductionPeriod || 'Not set',
  },
  {
    key: 'createdAt',
    header: 'Requested',
    render: (advance) => formatDate(advance.createdAt),
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (advance) => <StatusBadge status={advance.status} />,
  },
];

/**
 * The approver's table.
 *
 * Pending rows offer a review; approved rows offer "mark repaid", which is how
 * an advance is closed out once payroll has recovered it.
 */
export const advanceReviewColumns = ({ onReview, onMarkRepaid, working }) => [
  {
    key: 'employee',
    header: 'Employee',
    primary: true,
    render: (advance) => (
      <span>
        <span className="block font-semibold">
          {advance.employeeId?.name || 'Unknown'}
        </span>
        <span className="block text-xs text-muted dark:text-muted-soft">
          {advance.employeeId?.position || 'No position'}
        </span>
      </span>
    ),
  },
  ...sharedColumns,
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (advance) => {
      if (advance.status === 'pending') {
        return (
          <Button size="sm" onClick={() => onReview(advance)}>
            Review
          </Button>
        );
      }
      if (advance.status === 'approved') {
        return (
          <Button
            size="sm"
            variant="secondary"
            disabled={working}
            onClick={() => onMarkRepaid(advance)}
          >
            Mark repaid
          </Button>
        );
      }
      return <span className="text-xs text-muted">—</span>;
    },
  },
];

/** The employee's own table — no identity column, no actions. */
export const myAdvanceColumns = [
  { ...sharedColumns[0], primary: true },
  ...sharedColumns.slice(1),
  {
    key: 'note',
    header: 'Reviewer note',
    render: (advance) => advance.note || advance.adminNote || '—',
  },
];
