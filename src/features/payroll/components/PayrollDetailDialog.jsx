import { CircleCheckBig, Download, Send, Wallet } from 'lucide-react';
import { useState } from 'react';

import { Alert, Badge, Button, Input, Modal } from '@/components/ui';
import { useToast } from '@/context/toast-context';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { downloadPayslip } from '@/api/payroll';
import { useDisbursement } from '../hooks/useDisbursement';
import {
  PAYROLL_STATUS_LABELS,
  PAYROLL_STATUS_TONES,
  exportPayrollCsv,
  payrollTotals,
} from '../payroll-fields';
import { PayrollLinesTable } from './PayrollLinesTable';

/** One payroll run: its lines, its totals, and whatever comes next for it. */
export function PayrollDetailDialog({ payroll, runs, onClose }) {
  const toast = useToast();
  const [approvalNote, setApprovalNote] = useState('');

  const disbursement = useDisbursement(payroll, { onSettled: runs.refetch });
  const totals = payrollTotals(payroll);
  const { status } = payroll;

  const handleDownloadPayslip = async (line) => {
    try {
      await downloadPayslip(payroll._id, line.employeeId, line.name);
    } catch (caught) {
      toast.error(caught?.message || 'Could not download that payslip.');
    }
  };

  const closeAfter = async (action) => {
    const done = await action();
    if (done) onClose();
  };

  return (
    <Modal
      open
      // Never dismissable mid-batch: closing would hide which payments landed.
      onClose={disbursement.running ? undefined : onClose}
      closeOnBackdrop={!disbursement.running}
      size="full"
      title={payroll.period}
      description={`${totals.employees} employee${totals.employees === 1 ? '' : 's'} · ${formatCurrency(totals.net, totals.currency)} net`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={disbursement.running}>
            Close
          </Button>

          {status === 'draft' && (
            <Button
              variant="secondary"
              loading={runs.working === 'submit'}
              startIcon={<Send aria-hidden="true" className="size-4" />}
              onClick={() => closeAfter(() => runs.submitForApproval(payroll))}
            >
              Submit for approval
            </Button>
          )}

          {status === 'draft' && runs.canApprove && (
            <Button
              loading={runs.working === 'process'}
              startIcon={<CircleCheckBig aria-hidden="true" className="size-4" />}
              onClick={() => closeAfter(() => runs.process(payroll))}
            >
              Approve &amp; process
            </Button>
          )}

          {status === 'pending_approval' &&
            (runs.canApprove ? (
              <Button
                variant="success"
                loading={runs.working === 'approve'}
                startIcon={<CircleCheckBig aria-hidden="true" className="size-4" />}
                onClick={() => closeAfter(() => runs.approve(payroll, approvalNote))}
              >
                Approve payroll
              </Button>
            ) : (
              <Badge tone="info">Awaiting admin approval</Badge>
            ))}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={PAYROLL_STATUS_TONES[status] || 'neutral'}>
            {PAYROLL_STATUS_LABELS[status] || status}
          </Badge>

          <Button
            size="sm"
            variant="ghost"
            startIcon={<Download aria-hidden="true" className="size-4" />}
            onClick={() => exportPayrollCsv(payroll)}
          >
            Export CSV
          </Button>

          {disbursement.isPayable && !disbursement.allPaid && (
            <Button
              size="sm"
              className="ml-auto"
              loading={disbursement.running}
              startIcon={<Wallet aria-hidden="true" className="size-4" />}
              onClick={disbursement.payAll}
            >
              Pay everyone
            </Button>
          )}
        </div>

        {disbursement.running && (
          <Alert tone="info">
            <p aria-live="polite">
              Paying {disbursement.batch.current} of {disbursement.batch.total}. Please
              keep this dialog open until it finishes.
            </p>
          </Alert>
        )}

        {disbursement.isPayable && (
          <p className="text-sm text-muted dark:text-muted-soft">
            {disbursement.paidCount} of {disbursement.totalCount} paid.
          </p>
        )}

        <PayrollLinesTable
          payroll={payroll}
          disbursement={disbursement}
          onDownloadPayslip={handleDownloadPayslip}
        />

        <dl className="grid grid-cols-2 gap-3 rounded-panel border border-line bg-canvas p-4 text-sm sm:grid-cols-4 dark:border-line-dark dark:bg-white/5">
          {[
            ['Employees', totals.employees],
            ['Gross', formatCurrency(totals.gross, totals.currency)],
            ['Deductions', formatCurrency(totals.deductions, totals.currency)],
            ['Net', formatCurrency(totals.net, totals.currency)],
          ].map(([label, value], index) => (
            <div key={label}>
              <dt className="text-xs text-muted dark:text-muted-soft">{label}</dt>
              <dd
                className={
                  index === 3
                    ? 'font-extrabold text-ink dark:text-ink-dark'
                    : 'font-semibold text-ink dark:text-ink-dark'
                }
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {status === 'pending_approval' && runs.canApprove && (
          <Input
            label="Approval note"
            value={approvalNote}
            onChange={(event) => setApprovalNote(event.target.value)}
            placeholder="Add a note for the record…"
            hint="Optional. Kept with the payroll's audit trail."
          />
        )}

        {(payroll.submittedAt || payroll.approvedAt) && (
          <p className="text-xs text-muted dark:text-muted-soft">
            {payroll.submittedAt && <>Submitted {formatDateTime(payroll.submittedAt)}. </>}
            {payroll.approvedAt && (
              <>
                Approved {formatDateTime(payroll.approvedAt)}
                {payroll.approvalNote ? ` — “${payroll.approvalNote}”` : ''}.
              </>
            )}
          </p>
        )}
      </div>
    </Modal>
  );
}
