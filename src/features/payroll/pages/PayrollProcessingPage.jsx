import { Calculator, RefreshCw, Wallet } from 'lucide-react';
import { useState } from 'react';

import {
  Badge,
  Button,
  DataTable,
  IconButton,
  PageHero,
  PageWrapper,
  Panel,
} from '@/components/ui';
import { fetchEmployees } from '@/api/employees';
import { useApi } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/formatters';
import { PayCalculatorDialog } from '../components/PayCalculatorDialog';
import { PayrollDetailDialog } from '../components/PayrollDetailDialog';
import { usePayrollRuns } from '../hooks/usePayrollRuns';
import {
  PAYROLL_STATUS_LABELS,
  PAYROLL_STATUS_TONES,
  payrollTotals,
} from '../payroll-fields';

/** Payroll runs: review, approve, and disburse. */
export function PayrollProcessingPage() {
  const runs = usePayrollRuns();
  const employeeQuery = useApi((signal) => fetchEmployees(signal), []);

  const [selected, setSelected] = useState(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  const columns = [
    { key: 'period', header: 'Period', primary: true },
    {
      key: 'totalEmployees',
      header: 'Employees',
      align: 'center',
      render: (payroll) => payrollTotals(payroll).employees,
    },
    {
      key: 'net',
      header: 'Net amount',
      align: 'right',
      render: (payroll) => {
        const totals = payrollTotals(payroll);
        return (
          <span className="font-bold">
            {formatCurrency(totals.net, totals.currency)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (payroll) => (
        <Badge tone={PAYROLL_STATUS_TONES[payroll.status] || 'neutral'}>
          {PAYROLL_STATUS_LABELS[payroll.status] || payroll.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (payroll) => (
        <Button size="sm" variant="secondary" onClick={() => setSelected(payroll)}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Payroll"
        title="Generate and approve payroll runs"
        subtitle="Review attendance-based calculations, approve each run, and disburse payments."
        actions={
          <Button
            variant="secondary"
            className="border-white/20 bg-white/15 text-white hover:bg-white/25"
            startIcon={<Calculator aria-hidden="true" className="size-4" />}
            onClick={() => setCalculatorOpen(true)}
          >
            Calculate pay
          </Button>
        }
      />

      <Panel
        title="Payroll runs"
        subtitle={`${runs.payrolls.length} period${runs.payrolls.length === 1 ? '' : 's'}`}
        interactive={false}
        action={
          <IconButton label="Refresh payroll runs" onClick={runs.refetch}>
            <RefreshCw aria-hidden="true" />
          </IconButton>
        }
      >
        <DataTable
          columns={columns}
          rows={runs.payrolls}
          loading={runs.loading}
          error={runs.error}
          onRetry={runs.refetch}
          caption="Payroll runs"
          emptyIcon={<Wallet aria-hidden="true" className="size-6" />}
          emptyTitle="No payroll runs yet"
          emptyDescription="Runs appear here once a pay period has been generated."
        />
      </Panel>

      {selected && (
        <PayrollDetailDialog
          key={selected._id}
          payroll={runs.payrolls.find((item) => item._id === selected._id) || selected}
          runs={runs}
          onClose={() => setSelected(null)}
        />
      )}

      {calculatorOpen && (
        <PayCalculatorDialog
          employees={employeeQuery.data?.data || []}
          onClose={() => setCalculatorOpen(false)}
        />
      )}
    </PageWrapper>
  );
}
