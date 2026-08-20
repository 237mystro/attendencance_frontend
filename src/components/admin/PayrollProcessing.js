import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  FormControl, IconButton, InputLabel, LinearProgress, MenuItem, Paper,
  Select, Skeleton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Calculate, CheckCircle, Close, Download, HourglassEmpty,
  Payment, Refresh, Send, Share, CreditScore
} from '@mui/icons-material';
import { apiFetch, apiRequest } from '../../utils/api';
import { getStoredUser } from '../../utils/authSession';
import { DashboardHero, DashboardPage } from '../common/dashboardUi';

const fmt = (n) => Number(n || 0).toLocaleString();

const statusColor = (s) => {
  if (s === 'paid')             return 'success';
  if (s === 'processed')        return 'warning';
  if (s === 'pending_approval') return 'info';
  return 'default';
};

const statusLabel = (s) => {
  if (s === 'pending_approval') return 'Pending Approval';
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
};

const downloadPayrollCSV = (payroll) => {
  const header = 'Employee,Position,Shifts,Gross Amount,Total Deductions,Net Amount';
  const rows   = (payroll.employees || []).map((e) =>
    `"${e.name || ''}","${e.position || ''}",${e.shifts || 0},${e.grossAmount || e.totalAmount || 0},${e.deductions?.totalDeductions || 0},${e.netAmount || e.totalAmount || 0}`
  );
  const summary = `\n"TOTAL","","",${payroll.grossTotalAmount || payroll.totalAmount || 0},${payroll.totalDeductionsAmount || 0},${payroll.totalAmount || 0}`;
  const csv  = [header, ...rows, summary].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Payroll-${(payroll.period || 'report').replace(/\s+/g, '-')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// ─── Deduction detail tooltip ───────────────────────────────────────────────
const DeductionDetail = ({ d = {}, currency = 'XAF' }) => (
  <Box sx={{ fontSize: 12, lineHeight: 1.8 }}>
    {d.taxRate > 0     && <div>PAYE {d.taxRate}%: {fmt(d.taxAmount)} {currency}</div>}
    {d.pensionRate > 0 && <div>Pension {d.pensionRate}%: {fmt(d.pensionAmount)} {currency}</div>}
    {d.otherAmount > 0 && <div>Other: {fmt(d.otherAmount)} {currency}</div>}
    {d.notes           && <div style={{ color: '#94a3b8', marginTop: 4 }}>{d.notes}</div>}
  </Box>
);

const PayrollProcessing = () => {
  const theme       = useTheme();
  const isMobile    = useMediaQuery(theme.breakpoints.down('sm'));
  const currentUser = getStoredUser() || {};
  const isAdmin     = ['admin', 'hr'].includes(currentUser.role);

  const [payrolls, setPayrolls]     = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [error,    setError]        = useState('');
  const [snack,    setSnack]        = useState('');

  const [detailOpen,   setDetailOpen]   = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [processing,   setProcessing]   = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [approving,    setApproving]    = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  // Per-employee payment state
  const [payStatus,      setPayStatus]      = useState({});   // { [employeeId]: { paid, paidAt, transactionId } }
  const [payErrors,      setPayErrors]      = useState({});   // { [employeeId]: errorMsg }
  const [payingId,       setPayingId]       = useState('');   // employee being paid individually
  const [payAllRunning,  setPayAllRunning]  = useState(false);
  const [payAllProgress, setPayAllProgress] = useState({ current: 0, total: 0 });

  const [employees,    setEmployees]   = useState([]);
  const [calcOpen,     setCalcOpen]    = useState(false);
  const [calcForm,     setCalcForm]    = useState({ employeeId: '', startDate: '', endDate: '' });
  const [calcResult,   setCalcResult]  = useState(null);
  const [calcLoading,  setCalcLoading] = useState(false);
  const [calcError,    setCalcError]   = useState('');
  const [pdfLoading,   setPdfLoading]  = useState(false);
  const [shareOpen,    setShareOpen]   = useState(false);
  const [shareEmail,   setShareEmail]  = useState('');
  const [shareSending, setShareSending] = useState(false);
  const [shareMsg,     setShareMsg]    = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/payrolls');
      if (data?.success) setPayrolls(data.data || []);
      else setError(data?.message || 'Failed to load payrolls.');
    } catch {
      setError('Network error while loading payrolls.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    apiRequest('/employees').then(data => {
      if (data?.success) setEmployees(data.data || []);
    }).catch(() => {});
  }, []);

  // ── Load payment status when opening a processed/paid payroll ────────────
  const loadPaymentStatus = useCallback(async (payrollId) => {
    try {
      const data = await apiRequest(`/payrolls/${payrollId}/payment-status`);
      if (data?.success) setPayStatus(data.data || {});
    } catch { /* non-fatal */ }
  }, []);

  const handleReview = (payroll) => {
    setSelected(payroll);
    setDetailOpen(true);
    setPayStatus({});
    setPayErrors({});
    setPayAllProgress({ current: 0, total: 0 });
    if (['processed', 'paid'].includes(payroll.status)) {
      loadPaymentStatus(payroll._id);
    }
  };

  const handleDetailClose = () => {
    if (payAllRunning) return; // prevent closing mid-Pay-All
    setDetailOpen(false);
    setSelected(null);
  };

  // ── Core single-employee pay ─────────────────────────────────────────────
  const _doPayOne = async (payrollId, employeeId) => {
    const data = await apiRequest(`/payrolls/${payrollId}/disburse-single`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ employeeId })
    });

    if (data?.success) {
      setPayStatus((prev) => ({
        ...prev,
        [employeeId]: { paid: true, paidAt: data.data?.paidAt || new Date().toISOString(), transactionId: data.data?.transactionId }
      }));
      return true;
    } else {
      setPayErrors((prev) => ({ ...prev, [employeeId]: data?.message || 'Payment failed' }));
      return false;
    }
  };

  const handlePayEmployee = async (employeeId) => {
    setPayingId(employeeId);
    setPayErrors((prev) => { const n = { ...prev }; delete n[employeeId]; return n; });
    try {
      await _doPayOne(selected._id, employeeId);
    } finally {
      setPayingId('');
      // Refresh payroll list so top-level status updates if all paid
      load();
    }
  };

  const handlePayAll = async () => {
    const unpaid = (selected?.employees || []).filter((e) => !payStatus[e.employeeId]);
    if (!unpaid.length) { setSnack('All employees in this payroll have already been paid.'); return; }
    setPayAllRunning(true);
    setPayErrors({});
    let successCount = 0;
    for (let i = 0; i < unpaid.length; i++) {
      setPayAllProgress({ current: i + 1, total: unpaid.length });
      const ok = await _doPayOne(selected._id, unpaid[i].employeeId);
      if (ok) successCount++;
    }
    setPayAllRunning(false);
    setPayAllProgress({ current: unpaid.length, total: unpaid.length });
    setSnack(`Pay All complete — ${successCount} of ${unpaid.length} payment(s) succeeded.`);
    load();
  };

  // ── Approval workflow ─────────────────────────────────────────────────────
  const handleSubmitForApproval = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      const data = await apiRequest(`/payrolls/${selected._id}/submit`, { method: 'PUT' });
      if (data?.success) { setSnack('Payroll submitted for approval.'); handleDetailClose(); load(); }
      else setSnack(data?.message || 'Failed to submit.');
    } finally { setSubmitting(false); }
  };

  const handleApprove = async () => {
    if (!selected) return;
    try {
      setApproving(true);
      const data = await apiRequest(`/payrolls/${selected._id}/approve`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ note: approvalNote })
      });
      if (data?.success) { setSnack('Payroll approved and ready for disbursement.'); setApprovalNote(''); handleDetailClose(); load(); }
      else setSnack(data?.message || 'Failed to approve.');
    } finally { setApproving(false); }
  };

  const handleProcess = async () => {
    if (!selected) return;
    try {
      setProcessing(true);
      const data = await apiRequest(`/payrolls/${selected._id}/process`, { method: 'PUT' });
      if (data?.success) { setSnack('Payroll marked as processed.'); handleDetailClose(); load(); }
      else setSnack(data?.message || 'Failed to process.');
    } finally { setProcessing(false); }
  };

  // ── Download pay preview as PDF ───────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!calcResult) return;
    setPdfLoading(true);
    try {
      const response = await apiFetch('/payrolls/preview-pdf', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          employeeId: calcForm.employeeId,
          startDate:  calcForm.startDate,
          endDate:    calcForm.endDate
        })
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${String(calcResult.employee.name || 'employee').replace(/\s+/g, '-')}-pay-preview.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setSnack(err.message || 'Failed to download PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Send pay preview via email ─────────────────────────────────────────────
  const handleShare = async () => {
    if (!shareEmail.trim()) { setShareMsg('Please enter a recipient email address.'); return; }
    setShareSending(true);
    setShareMsg('');
    try {
      const data = await apiRequest('/payrolls/share-preview', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          employeeId:     calcForm.employeeId,
          startDate:      calcForm.startDate,
          endDate:        calcForm.endDate,
          recipientEmail: shareEmail.trim()
        })
      });
      if (data?.success) {
        setShareOpen(false);
        setShareMsg('');
        setSnack(`Pay preview emailed to ${shareEmail.trim()}`);
      } else {
        setShareMsg(data?.message || 'Failed to send. Check that email is configured on the server.');
      }
    } catch (err) { setShareMsg(err.message || 'Network error. Please try again.'); }
    finally   { setShareSending(false); }
  };

  // ── Calculate employee pay (preview — no DB write) ────────────────────────
  const handleCalculate = async () => {
    const { employeeId, startDate, endDate } = calcForm;
    if (!employeeId || !startDate || !endDate) {
      setCalcError('Please select an employee and specify a date range.');
      return;
    }
    setCalcLoading(true);
    setCalcError('');
    setCalcResult(null);
    try {
      const data = await apiRequest('/payrolls/calculate-employee', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ employeeId, startDate, endDate })
      });
      if (data?.success) { setCalcResult(data.data); }
      else { setCalcError(data?.message || 'Calculation failed.'); }
    } catch (err) { setCalcError(err.message || 'Network error. Please try again.'); }
    finally   { setCalcLoading(false); }
  };

  const handleDownloadPayslip = async (payrollId, employeeId, employeeName) => {
    try {
      const response = await apiFetch(`/payrolls/${payrollId}/payslip?employeeId=${employeeId}`);
      if (!response.ok) throw new Error('Unable to download payslip.');
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${String(employeeName || 'employee').replace(/\s+/g, '-')}-payslip.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { setSnack(err.message || 'Unable to download payslip.'); }
  };

  // ── Derived values for the detail dialog ──────────────────────────────────
  const isProcessed      = selected?.status === 'processed';
  const paidCount        = Object.values(payStatus).filter((v) => v?.paid).length;
  const totalCount       = selected?.employees?.length || 0;
  const allAlreadyPaid   = isProcessed && totalCount > 0 && paidCount === totalCount;

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Payroll Processing"
        title="Generate and approve payroll runs."
        subtitle="Create payroll periods, review attendance-based calculations, and disburse payments to employees."
        gradient="linear-gradient(135deg, #0f172a 0%, #0f766e 60%, #0d9488 100%)"
        actions={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              size="small"
              startIcon={<Refresh />}
              onClick={load}
              disabled={loading}
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.3)',
                borderRadius: 999,
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Calculate />}
              onClick={() => {
                setCalcOpen(true);
                setCalcResult(null);
                setCalcError('');
                setCalcForm({ employeeId: '', startDate: '', endDate: '' });
              }}
              sx={{
                borderRadius: 999,
                fontWeight: 800,
                bgcolor: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.22)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' }
              }}
            >
              Calculate Employee Pay
            </Button>
          </Box>
        }
      />

      {snack && <Alert severity="info" onClose={() => setSnack('')} sx={{ mb: 2.5 }}>{snack}</Alert>}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Payroll Records</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[1, 2, 3].map((i) => <Skeleton key={i} height={52} sx={{ borderRadius: 1 }} />)}
            </Box>
          ) : payrolls.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No payrolls yet. Use "Calculate Employee Pay" to preview pay, or generate a payroll run.
            </Typography>
          ) : (
            <>
              {/* Mobile card list */}
              <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', gap: 1.5 }}>
                {payrolls.map((payroll) => (
                  <Paper key={payroll._id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>{payroll.period}</Typography>
                      <Chip label={statusLabel(payroll.status)} color={statusColor(payroll.status)} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">{payroll.totalEmployees} employee{payroll.totalEmployees !== 1 ? 's' : ''}</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ my: 0.5 }}>
                      Net: {fmt(payroll.totalAmount)} {payroll.currency || 'XAF'}
                    </Typography>
                    {(payroll.totalDeductionsAmount || 0) > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Gross {fmt(payroll.grossTotalAmount)} · Deductions {fmt(payroll.totalDeductionsAmount)}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                      <Button size="small" variant="outlined" onClick={() => handleReview(payroll)} fullWidth>Review</Button>
                      <Button size="small" startIcon={<Download sx={{ fontSize: 14 }} />} onClick={() => downloadPayrollCSV(payroll)} fullWidth>CSV</Button>
                    </Box>
                  </Paper>
                ))}
              </Box>

              {/* Desktop table */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 560 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Period</TableCell>
                        <TableCell align="center">Employees</TableCell>
                        <TableCell align="right">Net Amount</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payrolls.map((payroll) => (
                        <TableRow key={payroll._id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{payroll.period}</TableCell>
                          <TableCell align="center">{payroll.totalEmployees}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {fmt(payroll.totalAmount)} {payroll.currency || 'XAF'}
                            {(payroll.totalDeductionsAmount || 0) > 0 && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                Gross {fmt(payroll.grossTotalAmount)} • Deductions {fmt(payroll.totalDeductionsAmount)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={statusLabel(payroll.status)} color={statusColor(payroll.status)} size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                              <Button size="small" onClick={() => handleReview(payroll)} sx={{ fontSize: 12 }}>Review</Button>
                              <Button size="small" startIcon={<Download sx={{ fontSize: 15 }} />} onClick={() => downloadPayrollCSV(payroll)} sx={{ fontSize: 12 }}>CSV</Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* ─── Detail / disbursement dialog ─────────────────────────────────── */}
      <Dialog open={detailOpen} onClose={handleDetailClose} maxWidth="xl" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            Payroll — {selected?.period}
            <Chip label={statusLabel(selected?.status)} color={statusColor(selected?.status)} size="small" />
          </Box>
          <IconButton size="small" onClick={handleDetailClose} disabled={payAllRunning}><Close /></IconButton>
        </DialogTitle>

        <DialogContent>
          {/* ── Pay All section (only when processed) ── */}
          {isProcessed && (
            <Box sx={{ mb: 3, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  CamPay Disbursement
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {allAlreadyPaid
                    ? `All ${totalCount} employees have been paid.`
                    : `${paidCount} of ${totalCount} employees paid.`}
                </Typography>
                {payAllRunning && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress variant="determinate" value={(payAllProgress.current / payAllProgress.total) * 100} sx={{ borderRadius: 1, height: 6 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Processing {payAllProgress.current} of {payAllProgress.total}…
                    </Typography>
                  </Box>
                )}
              </Box>
              <Tooltip title={allAlreadyPaid ? 'All employees already paid' : 'Pay every unpaid employee via CamPay (MTN + Orange)'}>
                <span>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={payAllRunning ? <CircularProgress size={16} color="inherit" /> : <CreditScore />}
                    onClick={handlePayAll}
                    disabled={payAllRunning || allAlreadyPaid}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {payAllRunning
                      ? `Paying ${payAllProgress.current}/${payAllProgress.total}…`
                      : allAlreadyPaid ? 'All Paid' : 'Pay All'}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          )}

          {/* ── Employee list ── */}
          {/* Mobile cards */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', gap: 1.5, mb: 2 }}>
            {(selected?.employees || []).map((emp, idx) => {
              const paid   = payStatus[emp.employeeId]?.paid;
              const paidAt = payStatus[emp.employeeId]?.paidAt;
              const txId   = payStatus[emp.employeeId]?.transactionId;
              const payErr = payErrors[emp.employeeId];
              const isBusy = payingId === emp.employeeId || (payAllRunning && !paid);
              const cur    = selected?.currency || 'XAF';
              return (
                <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>{emp.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{emp.position || '—'}</Typography>
                    </Box>
                    {paid ? (
                      <Chip label="Paid" color="success" size="small" icon={<CheckCircle sx={{ fontSize: 13 }} />} />
                    ) : payErr ? (
                      <Tooltip title={payErr}><Chip label="Failed" color="error" size="small" /></Tooltip>
                    ) : (
                      <Chip label="Pending" size="small" />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1, mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Shifts: <strong>{emp.shifts}</strong></Typography>
                    <Typography variant="body2" color="text.secondary">Gross: <strong>{fmt(emp.grossAmount || emp.totalAmount)} {cur}</strong></Typography>
                    <Typography variant="body2" color="text.secondary">Deductions: <strong>{fmt(emp.deductions?.totalDeductions || 0)} {cur}</strong></Typography>
                    <Typography variant="body2">Net: <strong>{fmt(emp.netAmount || emp.totalAmount)} {cur}</strong></Typography>
                  </Box>
                  {paid && paidAt && (
                    <Typography variant="caption" color="text.secondary">
                      Paid {new Date(paidAt).toLocaleDateString('en-GB')}{txId ? ` · Ref: ${txId}` : ''}
                    </Typography>
                  )}
                  {payErr && <Typography variant="caption" color="error.main">{payErr}</Typography>}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                    {isProcessed && !paid && (
                      <Button
                        size="small" variant="outlined" color="success" fullWidth
                        startIcon={isBusy ? <CircularProgress size={12} color="inherit" /> : <Payment sx={{ fontSize: 14 }} />}
                        onClick={() => handlePayEmployee(emp.employeeId)}
                        disabled={!!payingId || payAllRunning}
                      >
                        {isBusy ? 'Paying…' : 'Pay'}
                      </Button>
                    )}
                    <Button
                      size="small" fullWidth
                      startIcon={<Download sx={{ fontSize: 14 }} />}
                      onClick={() => handleDownloadPayslip(selected._id, emp.employeeId, emp.name)}
                    >
                      Payslip PDF
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>

          {/* Desktop table */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 820 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell align="center">Shifts</TableCell>
                    <TableCell align="right">Gross</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Hover a row to see deduction breakdown">
                        <span>Deductions</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">Net Pay</TableCell>
                    <TableCell align="center">Payment</TableCell>
                    {isProcessed && <TableCell align="center">Pay</TableCell>}
                    <TableCell align="center">Payslip</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(selected?.employees || []).map((emp, idx) => {
                    const paid   = payStatus[emp.employeeId]?.paid;
                    const paidAt = payStatus[emp.employeeId]?.paidAt;
                    const txId   = payStatus[emp.employeeId]?.transactionId;
                    const payErr = payErrors[emp.employeeId];
                    const isBusy = payingId === emp.employeeId || (payAllRunning && !paid);
                    const cur    = selected?.currency || 'XAF';
                    return (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{emp.name}</TableCell>
                        <TableCell>{emp.position || '—'}</TableCell>
                        <TableCell align="center">{emp.shifts}</TableCell>
                        <TableCell align="right">{fmt(emp.grossAmount || emp.totalAmount)} {cur}</TableCell>
                        <TableCell align="right">
                          <Tooltip title={<DeductionDetail d={emp.deductions} currency={cur} />} placement="left" arrow>
                            <span style={{ cursor: 'default', textDecoration: 'underline dotted' }}>
                              {fmt(emp.deductions?.totalDeductions || 0)} {cur}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {fmt(emp.netAmount || emp.totalAmount)} {cur}
                        </TableCell>
                        <TableCell align="center">
                          {paid ? (
                            <Tooltip title={txId ? `Ref: ${txId}` : ''}>
                              <Box>
                                <Chip label="Paid" color="success" size="small" icon={<CheckCircle sx={{ fontSize: 14 }} />} />
                                {paidAt && (
                                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.25 }}>
                                    {new Date(paidAt).toLocaleDateString('en-GB')}
                                  </Typography>
                                )}
                              </Box>
                            </Tooltip>
                          ) : payErr ? (
                            <Tooltip title={payErr}><Chip label="Failed" color="error" size="small" /></Tooltip>
                          ) : (
                            <Chip label="Pending" size="small" />
                          )}
                        </TableCell>
                        {isProcessed && (
                          <TableCell align="center">
                            {paid ? (
                              <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                            ) : (
                              <Button
                                size="small" variant="outlined" color="success"
                                startIcon={isBusy ? <CircularProgress size={12} color="inherit" /> : <Payment sx={{ fontSize: 14 }} />}
                                onClick={() => handlePayEmployee(emp.employeeId)}
                                disabled={!!payingId || payAllRunning}
                                sx={{ fontSize: 11, px: 1.2, py: 0.4 }}
                              >
                                {isBusy ? '…' : 'Pay'}
                              </Button>
                            )}
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<Download sx={{ fontSize: 14 }} />}
                            onClick={() => handleDownloadPayslip(selected._id, emp.employeeId, emp.name)}
                            sx={{ fontSize: 11 }}
                          >
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* ── Summary footer ── */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2"><strong>Employees:</strong> {selected?.totalEmployees}</Typography>
            <Typography variant="body2"><strong>Gross:</strong> {fmt(selected?.grossTotalAmount || selected?.totalAmount)} {selected?.currency || 'XAF'}</Typography>
            <Typography variant="body2"><strong>Deductions:</strong> {fmt(selected?.totalDeductionsAmount || 0)} {selected?.currency || 'XAF'}</Typography>
            <Typography variant="body2" fontWeight={700}><strong>Net:</strong> {fmt(selected?.totalAmount)} {selected?.currency || 'XAF'}</Typography>
          </Box>

          {/* ── Approval note field ── */}
          {selected?.status === 'pending_approval' && isAdmin && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Approval note (optional)"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                fullWidth size="small"
                placeholder="Add a note for the record…"
              />
            </Box>
          )}

          {/* ── Audit trail ── */}
          {(selected?.submittedAt || selected?.approvedAt) && (
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1.5, lineHeight: 2 }}>
              {selected?.submittedAt && <>Submitted: {new Date(selected.submittedAt).toLocaleString()}<br /></>}
              {selected?.approvedAt  && <>Approved: {new Date(selected.approvedAt).toLocaleString()}{selected?.approvalNote ? ` — "${selected.approvalNote}"` : ''}</>}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
          <Button onClick={handleDetailClose} variant="outlined" disabled={payAllRunning} sx={{ flex: { xs: 1, sm: 'none' } }}>Close</Button>

          {selected?.status === 'draft' && (
            <Tooltip title="Send to admin/HR for review before disbursement">
              <Button
                onClick={handleSubmitForApproval}
                variant="outlined" color="info"
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Send />}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit for Approval'}
              </Button>
            </Tooltip>
          )}

          {selected?.status === 'draft' && isAdmin && (
            <Button
              onClick={handleProcess}
              variant="contained"
              startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
              disabled={processing}
            >
              {processing ? 'Processing…' : 'Approve & Process'}
            </Button>
          )}

          {selected?.status === 'pending_approval' && isAdmin && (
            <Button
              onClick={handleApprove}
              variant="contained" color="success"
              startIcon={approving ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
              disabled={approving}
            >
              {approving ? 'Approving…' : 'Approve Payroll'}
            </Button>
          )}

          {selected?.status === 'pending_approval' && !isAdmin && (
            <Chip icon={<HourglassEmpty />} label="Awaiting admin approval" color="info" />
          )}
        </DialogActions>
      </Dialog>

      {/* ─── Calculate Employee Pay dialog ───────────────────────────────── */}
      <Dialog
        open={calcOpen}
        onClose={() => { if (!calcLoading) { setCalcOpen(false); setCalcResult(null); } }}
        maxWidth="sm" fullWidth fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calculate color="primary" fontSize="small" />
            <Typography variant="h6" fontWeight={700}>
              {calcResult ? 'Pay Breakdown' : 'Calculate Employee Pay'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => { setCalcOpen(false); setCalcResult(null); }} disabled={calcLoading}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* ── Input form ── */}
          {!calcResult && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              {calcError && <Alert severity="error" onClose={() => setCalcError('')}>{calcError}</Alert>}

              <FormControl fullWidth required>
                <InputLabel>Select Employee</InputLabel>
                <Select
                  value={calcForm.employeeId}
                  label="Select Employee"
                  onChange={(e) => setCalcForm((p) => ({ ...p, employeeId: e.target.value }))}
                >
                  {employees.length === 0 && (
                    <MenuItem disabled value="">No active employees found</MenuItem>
                  )}
                  {employees.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {emp.name} — {emp.position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Start Date" type="date" required
                  value={calcForm.startDate}
                  onChange={(e) => setCalcForm((p) => ({ ...p, startDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }} fullWidth
                />
                <TextField
                  label="End Date" type="date" required
                  value={calcForm.endDate}
                  onChange={(e) => setCalcForm((p) => ({ ...p, endDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }} fullWidth
                />
              </Box>

            </Box>
          )}

          {/* ── Breakdown result ── */}
          {calcResult && (() => {
            const { employee: emp, period, currency, shifts, breakdown: bd } = calcResult;
            const hasDeductions = bd.deductions.totalDeductions > 0;
            return (
              <Box sx={{ pt: 0.5 }}>
                {/* Employee info header */}
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2.5 }}>
                  <Typography variant="subtitle1" fontWeight={700}>{emp.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{emp.position}{emp.department ? ` · ${emp.department}` : ''}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(period.startDate).toLocaleDateString('en-GB')} — {new Date(period.endDate).toLocaleDateString('en-GB')}
                  </Typography>
                </Paper>

                {shifts.count === 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    No completed shifts found in this period. Earnings will be 0.
                  </Alert>
                )}

                {/* Shift earnings */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">Completed Shifts</Typography>
                  <Typography variant="body2" fontWeight={600}>{shifts.count} shift{shifts.count !== 1 ? 's' : ''}{shifts.totalHours > 0 ? ` (${fmt(shifts.totalHours)} hrs)` : ''}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">Pay Per Shift</Typography>
                  <Typography variant="body2" fontWeight={600}>{fmt(bd.payPerShift)} {currency}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                  <Typography variant="body2">Shift Earnings ({shifts.count} × {fmt(bd.payPerShift)})</Typography>
                  <Typography variant="body2" fontWeight={700}>{fmt(bd.shiftEarnings)} {currency}</Typography>
                </Box>

                {/* Statutory deductions */}
                {hasDeductions && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    {bd.deductions.taxRate > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">PAYE Tax ({bd.deductions.taxRate}%)</Typography>
                        <Typography variant="body2" color="error.main">− {fmt(bd.deductions.taxAmount)} {currency}</Typography>
                      </Box>
                    )}
                    {bd.deductions.pensionRate > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Pension ({bd.deductions.pensionRate}%)</Typography>
                        <Typography variant="body2" color="error.main">− {fmt(bd.deductions.pensionAmount)} {currency}</Typography>
                      </Box>
                    )}
                    {bd.deductions.otherAmount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Other ({bd.deductions.otherDeductionRate}%)</Typography>
                        <Typography variant="body2" color="error.main">− {fmt(bd.deductions.otherAmount)} {currency}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                      <Typography variant="body2">Net After Deductions</Typography>
                      <Typography variant="body2" fontWeight={700}>{fmt(bd.netAfterDeductions)} {currency}</Typography>
                    </Box>
                  </>
                )}

                {/* Bonuses (auto-fetched from system) */}
                {(bd.bonusTotal > 0 || bd.debtTotal > 0) && <Divider sx={{ my: 1.5 }} />}
                {bd.bonusTotal > 0 && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" color="success.dark" fontWeight={600}>
                        + Bonuses ({bd.bonusItems?.length || 0})
                      </Typography>
                      <Typography variant="body2" color="success.dark" fontWeight={700}>
                        + {fmt(bd.bonusTotal)} {currency}
                      </Typography>
                    </Box>
                    {(bd.bonusItems || []).map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', pl: 2, py: 0.2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {(item.reason || item.type || 'bonus').replace(/_/g, ' ')} · {new Date(item.date).toLocaleDateString('en-GB')}
                        </Typography>
                        <Typography variant="caption" color="success.main">+{fmt(item.amount)}</Typography>
                      </Box>
                    ))}
                  </>
                )}

                {/* Late deductions (auto-fetched from system) */}
                {bd.debtTotal > 0 && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" color="error.main" fontWeight={600}>
                        − Late Deductions ({bd.debtItems?.length || 0})
                      </Typography>
                      <Typography variant="body2" color="error.main" fontWeight={700}>
                        − {fmt(bd.debtTotal)} {currency}
                      </Typography>
                    </Box>
                    {(bd.debtItems || []).map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', pl: 2, py: 0.2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.date).toLocaleDateString('en-GB')} · {item.lateMinutes} min late
                        </Typography>
                        <Typography variant="caption" color="error.main">−{fmt(item.amount)}</Typography>
                      </Box>
                    ))}
                  </>
                )}

                {/* Total */}
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} color="inherit">Total Due</Typography>
                  <Typography variant="h6" fontWeight={800} color="inherit">{fmt(bd.totalDue)} {currency}</Typography>
                </Box>
              </Box>
            );
          })()}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
          {!calcResult ? (
            <>
              <Button onClick={() => setCalcOpen(false)} variant="outlined" disabled={calcLoading} sx={{ flex: { xs: 1, sm: 'none' } }}>Cancel</Button>
              <Button
                onClick={handleCalculate}
                variant="contained"
                disabled={calcLoading}
                startIcon={calcLoading ? <CircularProgress size={16} color="inherit" /> : <Calculate />}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                {calcLoading ? 'Calculating…' : 'Calculate'}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => { setCalcResult(null); setCalcError(''); }}
                variant="outlined"
                startIcon={<Refresh />}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                Recalculate
              </Button>
              <Button
                onClick={handleDownloadPdf}
                variant="outlined"
                color="primary"
                startIcon={pdfLoading ? <CircularProgress size={15} color="inherit" /> : <Download />}
                disabled={pdfLoading}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                {pdfLoading ? 'Generating…' : 'PDF'}
              </Button>
              <Button
                onClick={() => { setShareEmail(calcResult?.employee?.email || ''); setShareMsg(''); setShareOpen(true); }}
                variant="outlined"
                color="secondary"
                startIcon={<Share />}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                Share
              </Button>
              <Button onClick={() => { setCalcOpen(false); setCalcResult(null); }} variant="contained" sx={{ flex: { xs: 1, sm: 'none' } }}>
                Done
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      {/* ─── Share Pay Preview dialog ─────────────────────────────────── */}
      <Dialog open={shareOpen} onClose={() => { if (!shareSending) setShareOpen(false); }} maxWidth="xs" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Share color="secondary" fontSize="small" />
            <Typography variant="h6" fontWeight={700}>Share Pay Preview</Typography>
          </Box>
          <IconButton size="small" onClick={() => setShareOpen(false)} disabled={shareSending}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            Send this pay breakdown by email. The employee's registered address is pre-filled — you can change it to any recipient.
          </Typography>
          {shareMsg && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setShareMsg('')}>{shareMsg}</Alert>
          )}
          <TextField
            label="Recipient Email" type="email" fullWidth
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder="employee@example.com"
            helperText="The full pay breakdown will be emailed to this address"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setShareOpen(false)} variant="outlined" disabled={shareSending}>Cancel</Button>
          <Button
            onClick={handleShare}
            variant="contained"
            disabled={shareSending}
            startIcon={shareSending ? <CircularProgress size={16} color="inherit" /> : <Send />}
          >
            {shareSending ? 'Sending…' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>

    </DashboardPage>
  );
};

export default PayrollProcessing;
