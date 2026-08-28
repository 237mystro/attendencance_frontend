import { buildQuery, request } from '@/api/client';
import { downloadDocument } from '@/lib/download';
import { toFileStem } from '@/lib/download';

/** Payroll runs, disbursement, and payslips. */

export const fetchPayrolls = (signal) => request('/payrolls', { signal });

/** The signed-in employee's own pay history. */
export const fetchMyPayHistory = (signal) =>
  request('/payrolls/my-history', { signal });

/** Per-employee paid/unpaid state for a processed run. */
export const fetchPaymentStatus = (payrollId, signal) =>
  request(`/payrolls/${payrollId}/payment-status`, { signal });

// ── Approval workflow: draft → pending_approval → approved → processed ─────

export const submitPayrollForApproval = (payrollId) =>
  request(`/payrolls/${payrollId}/submit`, { method: 'PUT' });

export const approvePayroll = (payrollId, note) =>
  request(`/payrolls/${payrollId}/approve`, { method: 'PUT', json: { note } });

export const processPayroll = (payrollId) =>
  request(`/payrolls/${payrollId}/process`, { method: 'PUT' });

/** Pays one employee within a processed run. */
export const disburseToEmployee = (payrollId, employeeId) =>
  request(`/payrolls/${payrollId}/disburse-single`, {
    method: 'POST',
    json: { employeeId },
  });

// ── Pay preview (no database write) ────────────────────────────────────────

export const calculateEmployeePay = ({ employeeId, startDate, endDate }) =>
  request('/payrolls/calculate-employee', {
    method: 'POST',
    json: { employeeId, startDate, endDate },
  });

export const emailPayPreview = ({ employeeId, startDate, endDate, recipientEmail }) =>
  request('/payrolls/share-preview', {
    method: 'POST',
    json: { employeeId, startDate, endDate, recipientEmail },
  });

export const downloadPayPreviewPdf = ({ employeeId, startDate, endDate }, employeeName) =>
  downloadDocument(
    '/payrolls/preview-pdf',
    `${toFileStem(employeeName, 'employee')}-pay-preview.pdf`,
    { method: 'POST', json: { employeeId, startDate, endDate } },
  );

/** Downloads a payslip. Omit `employeeId` for the signed-in employee's own. */
export const downloadPayslip = (payrollId, employeeId, employeeName) =>
  downloadDocument(
    `/payrolls/${payrollId}/payslip${buildQuery({ employeeId })}`,
    `${toFileStem(employeeName, 'employee')}-payslip.pdf`,
  );
