import { Calculator, Download, Mail } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, Input, Modal, Select } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';
import { usePayCalculator } from '../hooks/usePayCalculator';

/** The computed breakdown, shown once a calculation returns. */
function PayBreakdown({ result, onEmail, busy }) {
  const [recipient, setRecipient] = useState('');
  const currency = result.currency || 'XAF';

  const rows = [
    ['Shifts worked', result.shifts ?? 0],
    ['Gross pay', formatCurrency(result.grossAmount, currency)],
    ['Deductions', `− ${formatCurrency(result.deductions?.totalDeductions, currency)}`],
  ];

  return (
    <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5 dark:border-line-dark">
      <div>
        <p className="font-bold text-ink dark:text-ink-dark">{result.employee?.name}</p>
        <p className="text-sm text-muted dark:text-muted-soft">
          {result.employee?.position || 'No position'}
        </p>
      </div>

      <dl className="flex flex-col gap-2 rounded-panel border border-line bg-canvas p-4 text-sm dark:border-line-dark dark:bg-white/5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-muted dark:text-muted-soft">{label}</dt>
            <dd className="font-semibold text-ink dark:text-ink-dark">{value}</dd>
          </div>
        ))}

        <div className="flex justify-between gap-3 border-t border-line pt-2 dark:border-line-dark">
          <dt className="font-bold text-ink dark:text-ink-dark">Net pay</dt>
          <dd className="font-extrabold text-ink dark:text-ink-dark">
            {formatCurrency(result.netAmount, currency)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Input
          label="Email this preview to"
          type="email"
          placeholder="name@company.com"
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
          wrapperClassName="flex-1"
        />
        <Button
          variant="secondary"
          loading={busy === 'email'}
          startIcon={<Mail aria-hidden="true" className="size-4" />}
          onClick={async () => {
            const sent = await onEmail(recipient);
            if (sent) setRecipient('');
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

/**
 * Works out what an employee would be paid for a date range, without writing
 * anything. The result can be downloaded as a PDF or emailed on.
 */
export function PayCalculatorDialog({ employees, onClose }) {
  const calculator = usePayCalculator();
  const { form, result } = calculator;

  const employeeOptions = employees.map((employee) => ({
    value: employee._id,
    label: `${employee.name} · ${employee.position || 'No position'}`,
  }));

  return (
    <Modal
      open
      onClose={onClose}
      title={result ? 'Pay breakdown' : 'Calculate employee pay'}
      description="A preview only — nothing is saved or paid."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {result && (
            <Button
              variant="secondary"
              loading={calculator.busy === 'pdf'}
              startIcon={<Download aria-hidden="true" className="size-4" />}
              onClick={calculator.savePdf}
            >
              Download PDF
            </Button>
          )}
          <Button
            form="pay-calculator"
            type="submit"
            loading={calculator.calculating}
            startIcon={<Calculator aria-hidden="true" className="size-4" />}
          >
            {result ? 'Recalculate' : 'Calculate'}
          </Button>
        </>
      }
    >
      <form
        id="pay-calculator"
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          calculator.calculate();
        }}
      >
        {calculator.error && <Alert tone="danger">{calculator.error}</Alert>}

        <Select
          label="Employee"
          required
          placeholder="Select an employee"
          options={employeeOptions}
          value={form.employeeId}
          onChange={(event) => calculator.patch({ employeeId: event.target.value })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="From"
            type="date"
            required
            value={form.startDate}
            onChange={(event) => calculator.patch({ startDate: event.target.value })}
          />
          <Input
            label="To"
            type="date"
            required
            min={form.startDate || undefined}
            value={form.endDate}
            onChange={(event) => calculator.patch({ endDate: event.target.value })}
          />
        </div>
      </form>

      {result && (
        <PayBreakdown
          result={result}
          busy={calculator.busy}
          onEmail={calculator.sendEmail}
        />
      )}
    </Modal>
  );
}
