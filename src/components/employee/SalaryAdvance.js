import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Skeleton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { Add, AttachMoney } from '@mui/icons-material';
import { apiRequest } from '../../utils/api';

const fmt = (n) => Number(n || 0).toLocaleString();

const statusColor = (s) => {
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'error';
  if (s === 'repaid') return 'default';
  return 'warning';
};

const SalaryAdvance = () => {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', reason: '', deductionPeriod: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/salary-advances/my');
      if (data?.success) setAdvances(data.data || []);
      else setError(data?.message || 'Failed to load advance requests.');
    } catch {
      setError('Network error while loading advances.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    setFormError('');
    if (!form.amount || Number(form.amount) <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }
    if (!form.reason.trim()) {
      setFormError('Please provide a reason for your request.');
      return;
    }
    try {
      setSubmitting(true);
      const data = await apiRequest('/salary-advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(form.amount),
          reason: form.reason.trim(),
          deductionPeriod: form.deductionPeriod.trim()
        })
      });
      if (data?.success) {
        setSnack('Advance request submitted successfully.');
        setOpen(false);
        setForm({ amount: '', reason: '', deductionPeriod: '' });
        load();
      } else {
        setFormError(data?.message || 'Failed to submit request.');
      }
    } catch (err) {
      setFormError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasPending = advances.some(a => a.status === 'pending');

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
      {snack && (
        <Alert severity="info" onClose={() => setSnack('')} sx={{ mb: 2 }}>{snack}</Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Salary Advance</Typography>
          <Typography variant="body2" color="text.secondary">Request an advance on your salary. Repayment is deducted from a future payroll.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          disabled={hasPending}
        >
          {hasPending ? 'Request Pending' : 'Request Advance'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>My Requests</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[1, 2].map(i => <Skeleton key={i} height={52} sx={{ borderRadius: 1 }} />)}
            </Box>
          ) : advances.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">No advance requests yet.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 480 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Deduct Period</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell>Note</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {advances.map(adv => (
                    <TableRow key={adv._id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {new Date(adv.requestedAt).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {fmt(adv.amount)} {adv.currency || 'XAF'}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>{adv.reason}</TableCell>
                      <TableCell>{adv.deductionPeriod || '—'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={adv.status.charAt(0).toUpperCase() + adv.status.slice(1)}
                          color={statusColor(adv.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>
                        {adv.reviewNote || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => { setOpen(false); setFormError(''); }} maxWidth="sm" fullWidth>
        <DialogTitle>Request a Salary Advance</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Amount"
              type="number"
              inputProps={{ min: 1 }}
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Reason"
              value={form.reason}
              onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              fullWidth
              required
              multiline
              rows={3}
              inputProps={{ maxLength: 500 }}
              helperText={`${form.reason.length}/500`}
            />
            <TextField
              label="Preferred deduction period (e.g. July 2026)"
              value={form.deductionPeriod}
              onChange={e => setForm(p => ({ ...p, deductionPeriod: e.target.value }))}
              fullWidth
              helperText="Optional — your manager will confirm the final deduction period"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setOpen(false); setFormError(''); }} variant="outlined">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Add />}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalaryAdvance;
