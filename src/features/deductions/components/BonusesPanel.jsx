import { Gift, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  IconButton,
  Input,
  Panel,
  Select,
  Textarea,
} from '@/components/ui';
import { fetchEmployees } from '@/api/employees';
import { useApi } from '@/hooks/useApi';
import { firstError, rules, useForm } from '@/hooks/useForm';
import { formatCurrency } from '@/lib/formatters';
import { BONUS_TONES, BONUS_TYPES, BONUS_TYPE_OPTIONS } from '../deduction-fields';
import { useBonuses } from '../hooks/useDeductions';
import { PeriodPicker } from './PeriodPicker';

/** Discretionary bonuses awarded within a month. */
export function BonusesPanel() {
  const bonuses = useBonuses();
  const employeeQuery = useApi((signal) => fetchEmployees(signal), []);
  const [pendingDelete, setPendingDelete] = useState(null);

  const form = useForm({
    initialValues: { employeeId: '', type: 'overtime', reason: '', amount: '' },
    validate: (values) => ({
      employeeId: rules.required(values.employeeId, 'An employee'),
      amount: firstError(
        rules.required(values.amount, 'An amount'),
        rules.positiveNumber(values.amount, 'The amount'),
      ),
    }),
    onSubmit: async (values) => {
      const added = await bonuses.add({ ...values, amount: Number(values.amount) });
      if (added) form.reset();
    },
  });

  const employeeOptions = (employeeQuery.data?.data || []).map((employee) => ({
    value: employee._id,
    label: `${employee.name} · ${employee.position || 'No position'}`,
  }));

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      primary: true,
      render: (bonus) => bonus.employeeId?.name || 'Unknown',
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
    {
      key: 'reason',
      header: 'Reason',
      render: (bonus) => bonus.reason || '—',
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (bonus) => (
        <span className="font-bold text-success">+ {formatCurrency(bonus.amount)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (bonus) => (
        <IconButton
          label={`Remove bonus for ${bonus.employeeId?.name || 'employee'}`}
          size="sm"
          className="text-danger"
          onClick={() => setPendingDelete(bonus)}
        >
          <Trash2 aria-hidden="true" />
        </IconButton>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Panel title="Award a bonus" interactive={false}>
        <form
          onSubmit={form.handleSubmit}
          noValidate
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        >
          <Select
            label="Employee"
            required
            placeholder="Select an employee"
            options={employeeOptions}
            {...form.field('employeeId')}
          />
          <Select label="Type" options={BONUS_TYPE_OPTIONS} {...form.field('type')} />
          <Input
            label="Amount"
            type="number"
            min={0}
            required
            {...form.field('amount')}
          />
          <Button
            type="submit"
            loading={bonuses.saving}
            startIcon={<Plus aria-hidden="true" className="size-4" />}
          >
            Add bonus
          </Button>

          <Textarea
            label="Reason"
            rows={2}
            wrapperClassName="sm:col-span-2 lg:col-span-4"
            placeholder="What is this bonus for?"
            {...form.field('reason')}
          />
        </form>
      </Panel>

      <Panel
        title="Bonuses this period"
        interactive={false}
        action={<PeriodPicker period={bonuses.period} onChange={bonuses.setPeriod} />}
      >
        <DataTable
          columns={columns}
          rows={bonuses.bonuses}
          loading={bonuses.loading}
          error={bonuses.error}
          onRetry={bonuses.refetch}
          caption="Bonuses awarded this period"
          emptyIcon={<Gift aria-hidden="true" className="size-6" />}
          emptyTitle="No bonuses yet"
          emptyDescription="Bonuses awarded in this month appear here."
        />
      </Panel>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Remove this bonus?"
        confirmLabel="Remove"
        onConfirm={async () => {
          await bonuses.remove(pendingDelete);
          setPendingDelete(null);
        }}
      >
        <p className="text-sm leading-relaxed text-muted dark:text-muted-soft">
          The {formatCurrency(pendingDelete?.amount)} bonus for{' '}
          <strong>{pendingDelete?.employeeId?.name}</strong> will be removed and no
          longer counted in this period&rsquo;s payroll.
        </p>
      </ConfirmDialog>
    </div>
  );
}
