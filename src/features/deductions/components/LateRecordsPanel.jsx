import { Clock } from 'lucide-react';

import { Badge, DataTable, Panel } from '@/components/ui';
import { formatCurrency, formatDate, formatTime } from '@/lib/formatters';
import { useLateRecords } from '../hooks/useDeductions';
import { PeriodPicker } from './PeriodPicker';

const columns = [
  {
    key: 'employee',
    header: 'Employee',
    primary: true,
    render: (record) => (
      <span>
        <span className="block font-semibold">
          {record.employeeId?.name || record.name || 'Unknown'}
        </span>
        <span className="block text-xs text-muted dark:text-muted-soft">
          {record.employeeId?.position || record.position || 'No position'}
        </span>
      </span>
    ),
  },
  { key: 'date', header: 'Date', render: (record) => formatDate(record.date) },
  {
    key: 'scheduledStart',
    header: 'Due in',
    render: (record) => record.scheduledStart || '—',
  },
  {
    key: 'actualCheckIn',
    header: 'Arrived',
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

/** Every late arrival in a month, with what it cost. */
export function LateRecordsPanel() {
  const late = useLateRecords();

  return (
    <Panel
      title="Late records"
      subtitle="Each late arrival in the selected month and the deduction it produced."
      interactive={false}
      action={<PeriodPicker period={late.period} onChange={late.setPeriod} />}
    >
      <DataTable
        columns={columns}
        rows={late.records}
        loading={late.loading}
        error={late.error}
        onRetry={late.refetch}
        caption="Late arrival records"
        emptyIcon={<Clock aria-hidden="true" className="size-6" />}
        emptyTitle="No late arrivals"
        emptyDescription="Nobody was late beyond the grace period in this month."
      />
    </Panel>
  );
}
