import { FileText, Play } from 'lucide-react';
import { useState } from 'react';

import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Panel,
} from '@/components/ui';
import { toneFor } from '@/constants/status';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { REPORT_STATUS_LABELS } from '../deduction-fields';
import { useDeductionReports } from '../hooks/useDeductions';
import { PeriodPicker } from './PeriodPicker';
import { ReportDetailDialog } from './ReportDetailDialog';

/**
 * Monthly deduction reports.
 *
 * A report is generated for a period, approved, and then paid — at which point
 * every affected employee is emailed their own breakdown. Both of the latter
 * steps are irreversible, so each goes through a confirmation.
 */
export function ReportsPanel() {
  const reports = useDeductionReports();
  const [viewing, setViewing] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const columns = [
    { key: 'period', header: 'Period', primary: true },
    {
      key: 'employeeCount',
      header: 'Employees',
      align: 'center',
      render: (report) => report.employeeCount ?? report.employees?.length ?? 0,
    },
    {
      key: 'totalDeductions',
      header: 'Total deducted',
      align: 'right',
      render: (report) => (
        <span className="font-bold text-danger">
          − {formatCurrency(report.totalDeductions)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Generated',
      render: (report) => formatDate(report.createdAt),
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
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (report) => (
        <Button size="sm" variant="secondary" onClick={() => setViewing(report)}>
          Open
        </Button>
      ),
    },
  ];

  const isPay = confirming?.action === 'pay';

  return (
    <div className="flex flex-col gap-5">
      <Panel
        title="Generate a report"
        subtitle="Totals every late deduction in a month into one reviewable report."
        interactive={false}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <PeriodPicker period={reports.period} onChange={reports.setPeriod} />
          <Button
            loading={reports.working === 'generate'}
            startIcon={<Play aria-hidden="true" className="size-4" />}
            onClick={reports.generate}
          >
            Generate report
          </Button>
        </div>
      </Panel>

      <Panel title="Reports" interactive={false}>
        <DataTable
          columns={columns}
          rows={reports.reports}
          loading={reports.loading}
          error={reports.error}
          onRetry={reports.refetch}
          caption="Monthly deduction reports"
          emptyIcon={<FileText aria-hidden="true" className="size-6" />}
          emptyTitle="No reports yet"
          emptyDescription="Generate one for a period to see the deductions it contains."
        />
      </Panel>

      {viewing && (
        <ReportDetailDialog
          key={viewing._id}
          report={reports.reports.find((item) => item._id === viewing._id) || viewing}
          working={reports.working}
          onClose={() => setViewing(null)}
          onApprove={(report) => setConfirming({ report, action: 'approve' })}
          onPayAndSend={(report) => setConfirming({ report, action: 'pay' })}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        loading={Boolean(reports.working)}
        tone={isPay ? 'danger' : 'success'}
        title={isPay ? 'Mark paid and email everyone?' : 'Approve this report?'}
        confirmLabel={isPay ? 'Pay and send' : 'Approve'}
        onConfirm={async () => {
          const done = isPay
            ? await reports.payAndSend(confirming.report)
            : await reports.approve(confirming.report);
          if (done) setConfirming(null);
        }}
      >
        <p className="text-sm leading-relaxed text-muted dark:text-muted-soft">
          {isPay ? (
            <>
              This marks <strong>{confirming?.report?.period}</strong> as paid and
              emails every affected employee their own deduction breakdown. The
              emails cannot be recalled.
            </>
          ) : (
            <>
              Approving <strong>{confirming?.report?.period}</strong> locks the
              figures in so they can be applied to payroll.
            </>
          )}
        </p>
      </ConfirmDialog>
    </div>
  );
}
