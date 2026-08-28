import { downloadCsv, toFileStem } from '@/lib/download';

/**
 * Payroll run lifecycle.
 *
 * `pending_approval` is the only value the API sends in snake_case, so the
 * shared status helpers would humanise it as "Pending approval" — close enough
 * everywhere except here, where the label is worth stating deliberately.
 */
export const PAYROLL_STATUS_LABELS = {
  draft: 'Draft',
  pending_approval: 'Pending approval',
  approved: 'Approved',
  processed: 'Processed',
  paid: 'Paid',
};

export const PAYROLL_STATUS_TONES = {
  draft: 'neutral',
  pending_approval: 'info',
  approved: 'brand',
  processed: 'warn',
  paid: 'success',
};

/** The run's gross, deductions, and net, tolerating older payload shapes. */
export const payrollTotals = (payroll) => ({
  gross: payroll?.grossTotalAmount ?? payroll?.totalAmount ?? 0,
  deductions: payroll?.totalDeductionsAmount ?? 0,
  net: payroll?.totalAmount ?? 0,
  currency: payroll?.currency || 'XAF',
  employees: payroll?.totalEmployees ?? payroll?.employees?.length ?? 0,
});

/** One employee's line within a run, tolerating the same shape drift. */
export const employeeLine = (line) => ({
  gross: line?.grossAmount ?? line?.totalAmount ?? 0,
  deductions: line?.deductions?.totalDeductions ?? 0,
  net: line?.netAmount ?? line?.totalAmount ?? 0,
});

/** Exports a run as CSV, with a totals row at the bottom. */
export const exportPayrollCsv = (payroll) => {
  const totals = payrollTotals(payroll);

  const rows = (payroll.employees || []).map((line) => {
    const amounts = employeeLine(line);
    return [
      line.name || '',
      line.position || '',
      line.shifts || 0,
      amounts.gross,
      amounts.deductions,
      amounts.net,
    ];
  });

  rows.push(['TOTAL', '', '', totals.gross, totals.deductions, totals.net]);

  downloadCsv(
    `Payroll-${toFileStem(payroll.period, 'report')}.csv`,
    ['Employee', 'Position', 'Shifts', 'Gross amount', 'Total deductions', 'Net amount'],
    rows,
  );
};

/** Lines in a run that have not been paid yet. */
export const unpaidLines = (payroll, paymentStatus) =>
  (payroll?.employees || []).filter((line) => !paymentStatus[line.employeeId]?.paid);

/** A readable breakdown of one employee's statutory deductions. */
export const describeDeductions = (deductions = {}, currency = 'XAF') => {
  const parts = [];
  if (deductions.taxRate > 0) {
    parts.push(`PAYE ${deductions.taxRate}%: ${deductions.taxAmount} ${currency}`);
  }
  if (deductions.pensionRate > 0) {
    parts.push(`Pension ${deductions.pensionRate}%: ${deductions.pensionAmount} ${currency}`);
  }
  if (deductions.otherAmount > 0) {
    parts.push(`Other: ${deductions.otherAmount} ${currency}`);
  }
  if (deductions.notes) parts.push(deductions.notes);
  return parts.join(' · ');
};
