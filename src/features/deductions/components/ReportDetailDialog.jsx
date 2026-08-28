import { CircleCheckBig, Download, Send } from 'lucide-react';

import {
  Badge,
  Button,
  DataTable,
  ErrorState,
  LoadingState,
  Modal,
} from '@/components/ui';
import { toneFor } from '@/constants/status';
import { useApi } from '@/hooks/useApi';
import { downloadCsv, toFileStem } from '@/lib/download';
import { formatCurrency } from '@/lib/formatters';
import { fetchReportDetail } from '@/api/deductions';
import { REPORT_STATUS_LABELS } from '../deduction-fields';

const columns = [
  {
    key: 'name',
    header: 'Employee',
    primary: true,
    render: (line) => (
      <span>
        <span className="block font-semibold">{line.name}</span>
        <span className="block text-xs text-muted dark:text-muted-soft">
          {line.position || 'No position'}
        </span>
      </span>
    ),
  },
  {
    key: 'totalLateMinutes',
    header: 'Late minutes',
    align: 'center',
    render: (line) => <Badge tone="warn">{line.totalLateMinutes}</Badge>,
  },
  {
    key: 'baseSalary',
    header: 'Base salary',
    align: 'right',
    render: (line) => formatCurrency(line.baseSalary),
  },
  {
    key: 'deductionAmount',
    header: 'Deduction',
    align: 'right',
    render: (line) => (
      <span className="font-bold text-danger">
        − {formatCurrency(line.deductionAmount)}
      </span>
    ),
  },
  {
    key: 'finalSalary',
    header: 'Net salary',
    align: 'right',
    render: (line) => (
      <span className="font-bold">{formatCurrency(line.finalSalary)}</span>
    ),
  },
];

/** One deduction report: who was affected, by how much, and what happens next. */
export function ReportDetailDialog({ report, working, onClose, onApprove, onPayAndSend }) {
  const query = useApi((signal) => fetchReportDetail(report._id, signal), [report._id]);
  const detail = query.data?.data;
  const lines = detail?.employees || [];

  const exportCsv = () => {
    downloadCsv(
      `deductions-${toFileStem(detail?.period, 'report')}.csv`,
      ['Employee', 'Position', 'Late minutes', 'Deduction', 'Base salary', 'Net salary'],
      lines.map((line) => [
        line.name,
        line.position,
        line.totalLateMinutes,
        line.deductionAmount,
        line.baseSalary,
        line.finalSalary,
      ]),
    );
  };

  return (
    <Modal
      open
      onClose={working ? undefined : onClose}
      closeOnBackdrop={!working}
      size="xl"
      title={report.period}
      description={`${lines.length} employee${lines.length === 1 ? '' : 's'} affected`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={Boolean(working)}>
            Close
          </Button>

          {report.status === 'draft' && (
            <Button
              variant="success"
              loading={working === 'approve'}
              startIcon={<CircleCheckBig aria-hidden="true" className="size-4" />}
              onClick={() => onApprove(report)}
            >
              Approve
            </Button>
          )}

          {report.status === 'approved' && (
            <Button
              loading={working === 'pay'}
              startIcon={<Send aria-hidden="true" className="size-4" />}
              onClick={() => onPayAndSend(report)}
            >
              Pay &amp; send
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={toneFor(report.status)}>
            {REPORT_STATUS_LABELS[report.status] || report.status}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            disabled={!lines.length}
            startIcon={<Download aria-hidden="true" className="size-4" />}
            onClick={exportCsv}
          >
            Export CSV
          </Button>
        </div>

        {query.loading ? (
          <LoadingState label="Loading the breakdown…" />
        ) : query.error ? (
          <ErrorState message={query.error} onRetry={query.refetch} />
        ) : (
          <DataTable
            columns={columns}
            rows={lines}
            getRowKey={(line) => line.employeeId || line.name}
            caption={`Deduction breakdown for ${report.period}`}
            emptyTitle="Nobody was deducted"
            emptyDescription="No employee exceeded the grace period in this month."
          />
        )}
      </div>
    </Modal>
  );
}
