import React, { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Skeleton,
  Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography
} from '@mui/material';
import { Download, PaymentsRounded, ReceiptLongRounded } from '@mui/icons-material';
import { apiFetch, apiRequest } from '../../utils/api';
import { getStoredUser } from '../../utils/authSession';
import {
  DashboardHero,
  DashboardMetricCard,
  DashboardPage,
  DashboardPanel
} from '../common/dashboardUi';

const fmt = (n) => Number(n || 0).toLocaleString();

const statusColor = (s) =>
  s === 'paid' ? 'success' : s === 'processed' ? 'warning' : 'default';

const Payments = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getStoredUser() || {};

  useEffect(() => {
    apiRequest('/payrolls/my-history')
      .then((data) => {
        if (data?.success) setHistory(data.data || []);
        else setError(data?.message || 'Failed to load payment history.');
      })
      .catch(() => setError('Network error while loading payments.'))
      .finally(() => setLoading(false));
  }, []);

  const downloadPayslip = async (payrollId) => {
    try {
      const response = await apiFetch(`/payrolls/${payrollId}/payslip`);
      if (!response.ok) throw new Error('Unable to download payslip right now.');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${(user.name || 'employee').replace(/\s+/g, '-')}-payslip.pdf`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Unable to download payslip.');
    }
  };

  const paidRecords = history.filter((p) => p.status === 'paid');
  const lifetimeEarnings = paidRecords.reduce((sum, p) => sum + (p.amount || 0), 0);
  const currency = history[0]?.currency || 'XAF';

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="My Payments"
        title="Your salary and payslip history."
        subtitle="Review every pay period, download payslips, and track your earnings over time."
        gradient="linear-gradient(135deg, #0a3d62 0%, #1565c0 60%, #1976d2 100%)"
      />

      {!loading && history.length > 0 && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.2} sx={{ mb: 2.8 }}>
          <Box sx={{ flex: 1 }}>
            <DashboardMetricCard
              label="Total Pay Periods"
              value={history.length}
              icon={<ReceiptLongRounded sx={{ fontSize: 24 }} />}
              accent="#1565c0"
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <DashboardMetricCard
              label="Paid Periods"
              value={paidRecords.length}
              icon={<PaymentsRounded sx={{ fontSize: 24 }} />}
              accent="#2e7d32"
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <DashboardMetricCard
              label="Lifetime Earnings"
              value={`${fmt(lifetimeEarnings)}`}
              secondaryValue={currency}
              icon={<PaymentsRounded sx={{ fontSize: 24 }} />}
              accent="#0f766e"
            />
          </Box>
        </Stack>
      )}

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <DashboardPanel
        title="Payment History"
        subtitle="All payroll records associated with your account."
      >
        {loading ? (
          <Stack spacing={1}>
            {[1, 2, 3].map((i) => <Skeleton key={i} height={52} sx={{ borderRadius: 2 }} />)}
          </Stack>
        ) : history.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <PaymentsRounded sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No payment records found yet.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 420 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell>Shifts</TableCell>
                  <TableCell>Net Pay</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Paid On</TableCell>
                  <TableCell align="center">Payslip</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((payroll) => (
                  <TableRow key={payroll._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{payroll.period}</TableCell>
                    <TableCell>{payroll.shifts ?? '—'}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>
                        {fmt(payroll.amount)} {payroll.currency || 'XAF'}
                      </Typography>
                      {payroll.deductions?.totalDeductions > 0 && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Gross {fmt(payroll.grossAmount)} · Deductions {fmt(payroll.deductions.totalDeductions)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payroll.status}
                        color={statusColor(payroll.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize', fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      {payroll.paidAt
                        ? new Date(payroll.paidAt).toLocaleDateString('en-GB')
                        : <Typography variant="caption" color="text.disabled">—</Typography>}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        startIcon={<Download sx={{ fontSize: 15 }} />}
                        onClick={() => downloadPayslip(payroll._id)}
                        disabled={payroll.status === 'draft'}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DashboardPanel>
    </DashboardPage>
  );
};

export default Payments;
