import { Badge } from '@/components/ui';
import { toneFor } from '@/constants/status';
import { formatCurrency, formatDate, formatTime } from '@/lib/formatters';
import { BONUS_TONES, BONUS_TYPES, REPORT_STATUS_LABELS } from './deduction-fields';

/** Columns for the employee's own deduction views. */

export const myRecordColumns = [
  {
    key: 'date',
    header: 'Date',
    primary: true,
    render: (record) => formatDate(record.date),
  },
  {
    key: 'scheduledStart',
    header: 'Due in',
    render: (record) => record.scheduledStart || '—',
  },
  {
    key: 'actualCheckIn',
    header: 'You arrived',
    render: (record) => formatTime(record.actualCheckIn),
  },
  {
    key: 'lateMinutes',
    header: 'Late by',
    align: 'center',
    render: (record) => <Badge tone="warn">{record.lateMinutes} min</Badge>,
  },
  {
    key: 'deductionAmount',
    header: 'Deduction',
    align: 'right',
    render: (record) => (
      <span className="font-bold text-danger">
        − {formatCurrency(record.deductionAmount)}
      </span>
    ),
  },
];

export const myReportColumns = [
  { key: 'period', header: 'Period', primary: true },
  {
    key: 'totalLateMinutes',
    header: 'Late minutes',
    align: 'center',
    render: (report) => report.totalLateMinutes ?? 0,
  },
  {
    key: 'deductionAmount',
    header: 'Deducted',
    align: 'right',
    render: (report) => (
      <span className="font-bold text-danger">
        − {formatCurrency(report.deductionAmount)}
      </span>
    ),
  },
  {
    key: 'finalSalary',
    header: 'Net salary',
    align: 'right',
    render: (report) => (
      <span className="font-bold">{formatCurrency(report.finalSalary)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (report) => (
      <Badge tone={toneFor(report.status)}>
        {REPORT_STATUS_LABELS[report.status] || report.status}
      </Badge>
    ),
  },
];

export const myBonusColumns = [
  {
    key: 'period',
    header: 'Period',
    primary: true,
    render: (bonus) => bonus.period || '—',
  },
  {
    key: 'type',
    header: 'Type',
    render: (bonus) => (
      <Badge tone={BONUS_TONES[bonus.type] || 'neutral'}>
        {BONUS_TYPES[bonus.type] || bonus.type}
      </Badge>
    ),
  },
  { key: 'reason', header: 'Reason', render: (bonus) => bonus.reason || '—' },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (bonus) => (
      <span className="font-bold text-success">+ {formatCurrency(bonus.amount)}</span>
    ),
  },
];
