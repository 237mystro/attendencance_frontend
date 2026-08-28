import { Download, Receipt, Wallet } from 'lucide-react';

import {
  Badge,
  Button,
  DataTable,
  MetricCard,
  PageHero,
  PageWrapper,
  Panel,
} from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useApi } from '@/hooks/useApi';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { downloadPayslip, fetchMyPayHistory } from '@/api/payroll';
import { PAYROLL_STATUS_LABELS, PAYROLL_STATUS_TONES } from '../payroll-fields';

/** The employee's own pay history and payslips. */
export function MyPaymentsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const query = useApi((signal) => fetchMyPayHistory(signal), []);
  const history = query.data?.data || [];

  const paid = history.filter((payroll) => payroll.status === 'paid');
  const lifetime = paid.reduce((total, payroll) => total + (payroll.amount || 0), 0);
  const currency = history[0]?.currency || 'XAF';

  const savePayslip = async (payroll) => {
    try {
      await downloadPayslip(payroll._id, undefined, currentUser?.name);
    } catch (caught) {
      toast.error(caught?.message || 'Could not download that payslip.');
    }
  };

  const columns = [
    { key: 'period', header: 'Period', primary: true },
    {
      key: 'shifts',
      header: 'Shifts',
      align: 'center',
      render: (payroll) => payroll.shifts ?? '—',
    },
    {
      key: 'amount',
      header: 'Net pay',
      align: 'right',
      render: (payroll) => (
        <span>
          <span className="block font-bold">
            {formatCurrency(payroll.amount, payroll.currency || currency)}
          </span>
          {payroll.deductions?.totalDeductions > 0 && (
            <span className="block text-xs text-muted dark:text-muted-soft">
              Gross {formatCurrency(payroll.grossAmount, payroll.currency || currency)} ·
              deductions {formatCurrency(payroll.deductions.totalDeductions, payroll.currency || currency)}
            </span>
          )}
        </span>
      ),
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
      key: 'paidAt',
      header: 'Paid on',
      render: (payroll) => formatDate(payroll.paidAt),
    },
    {
      key: 'payslip',
      header: 'Payslip',
      align: 'center',
      render: (payroll) => (
        <Button
          size="sm"
          variant="ghost"
          startIcon={<Download aria-hidden="true" className="size-4" />}
          onClick={() => savePayslip(payroll)}
        >
          PDF
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageHero
        eyebrow="My payments"
        title="Your salary and payslip history"
        subtitle="Review every pay period, download payslips, and track your earnings over time."
      />

      {history.length > 0 && (
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Pay periods"
            value={history.length}
            icon={<Receipt className="size-5" />}
            accent="text-brand-500"
          />
          <MetricCard
            label="Paid periods"
            value={paid.length}
            icon={<Wallet className="size-5" />}
            accent="text-success"
          />
          <MetricCard
            label="Lifetime earnings"
            value={formatCurrency(lifetime, currency)}
            icon={<Wallet className="size-5" />}
            accent="text-accent-500"
          />
        </div>
      )}

      <Panel
        title="Payment history"
        subtitle="Every payroll record associated with your account."
        interactive={false}
      >
        <DataTable
          columns={columns}
          rows={history}
          loading={query.loading}
          error={query.error}
          onRetry={query.refetch}
          caption="My payment history"
          emptyIcon={<Wallet aria-hidden="true" className="size-6" />}
          emptyTitle="No payments yet"
          emptyDescription="Pay periods appear here once payroll has been run for you."
        />
      </Panel>
    </PageWrapper>
  );
}
