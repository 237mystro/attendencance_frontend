import { CircleCheck, Download, TriangleAlert } from 'lucide-react';

import { Badge, Button, DataTable } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { describeDeductions, employeeLine } from '../payroll-fields';

/**
 * Per-employee lines inside a payroll run, with payment state.
 *
 * The Pay column only appears once the run is processed — paying against a
 * draft would be paying money that has not been approved.
 */
export function PayrollLinesTable({ payroll, disbursement, onDownloadPayslip }) {
  const currency = payroll?.currency || 'XAF';

  const columns = [
    {
      key: 'name',
      header: 'Employee',
      primary: true,
      render: (line) => (
        <span>
          <span className="block font-semibold">{line.name}</span>
          <span className="block text-xs text-muted dark:text-muted-soft">
            {line.position || '—'}
          </span>
        </span>
      ),
    },
    { key: 'shifts', header: 'Shifts', align: 'center' },
    {
      key: 'gross',
      header: 'Gross',
      align: 'right',
      render: (line) => formatCurrency(employeeLine(line).gross, currency),
    },
    {
      key: 'deductions',
      header: 'Deductions',
      align: 'right',
      render: (line) => {
        const amounts = employeeLine(line);
        const detail = describeDeductions(line.deductions, currency);
        return (
          <span title={detail || undefined}>
            {amounts.deductions > 0
              ? `− ${formatCurrency(amounts.deductions, currency)}`
              : '—'}
          </span>
        );
      },
    },
    {
      key: 'net',
      header: 'Net pay',
      align: 'right',
      render: (line) => (
        <span className="font-bold">
          {formatCurrency(employeeLine(line).net, currency)}
        </span>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      align: 'center',
      render: (line) => {
        const paid = disbursement.status[line.employeeId];
        const failure = disbursement.errors[line.employeeId];

        if (paid?.paid) {
          return (
            <Badge tone="success" icon={<CircleCheck aria-hidden="true" className="size-3.5" />}>
              <span title={paid.paidAt ? `Paid ${formatDateTime(paid.paidAt)}` : undefined}>
                Paid
              </span>
            </Badge>
          );
        }
        if (failure) {
          return (
            <Badge tone="danger" icon={<TriangleAlert aria-hidden="true" className="size-3.5" />}>
              <span title={failure}>Failed</span>
            </Badge>
          );
        }
        return <Badge tone="neutral">Pending</Badge>;
      },
    },
    ...(disbursement.isPayable
      ? [
          {
            key: 'pay',
            header: 'Pay',
            align: 'center',
            render: (line) => {
              const paid = disbursement.status[line.employeeId]?.paid;
              if (paid) return <span className="text-xs text-muted">—</span>;

              return (
                <Button
                  size="sm"
                  loading={disbursement.payingId === line.employeeId}
                  disabled={disbursement.running}
                  onClick={() => disbursement.payEmployee(line.employeeId)}
                >
                  Pay
                </Button>
              );
            },
          },
        ]
      : []),
    {
      key: 'payslip',
      header: 'Payslip',
      align: 'center',
      hideOnMobile: true,
      render: (line) => (
        <Button
          size="sm"
          variant="ghost"
          startIcon={<Download aria-hidden="true" className="size-4" />}
          onClick={() => onDownloadPayslip(line)}
        >
          PDF
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={payroll?.employees || []}
      getRowKey={(line) => line.employeeId}
      caption={`Employees in ${payroll?.period || 'this payroll run'}`}
      emptyTitle="No employees in this run"
    />
  );
}
