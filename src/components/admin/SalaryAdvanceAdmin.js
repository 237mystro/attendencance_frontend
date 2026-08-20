import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Select, FormControl, InputLabel,
  Skeleton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { CheckCircle, Cancel, Refresh, AttachMoney } from '@mui/icons-material';
import { apiRequest } from '../../utils/api';

const fmt = (n) => Number(n || 0).toLocaleString();

const statusColor = (s) => {
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'error';
  if (s === 'repaid') return 'default';
  return 'warning';
};

const SalaryAdvanceAdmin = () => {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  const [reviewDialog, setReviewDialog] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewPeriod, setReviewPeriod] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : '';
      const data = await apiRequest(`/salary-advances${qs}`);
      if (data?.success) setAdvances(data.data || []);
      else setError(data?.message || 'Failed to load advance requests.');
    } catch {
      setError('Network error while loading advances.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleReview = async (action) => {
    if (!reviewDialog) return;
    setReviewLoading(true);
    try {
      const endpoint = `/salary-advances/${reviewDialog._id}/${action}`;
      const data = await apiRequest(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: reviewNote.trim(), deductionPeriod: reviewPeriod.trim() })
      });
      if (data?.success) {
        setSnack(`Advance request ${action}d successfully.`);
        setReviewDialog(null);
        setReviewNote('');
        setReviewPeriod('');
        load();
      } else {
        setSnack(data?.message || `Failed to ${action} request.`);
      }
    } catch (err) {
      setSnack(err.message || 'Network error.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleMarkRepaid = async (id) => {
    try {
      const data = await apiRequest(`/salary-advances/${id}/repaid`, { method: 'PUT' });
      if (data?.success) {
        setSnack('Advance marked as repaid.');
        load();
      } else {
        setSnack(data?.message || 'Failed to update.');
      }
    } catch (err) {
      setSnack(err.message || 'Network error.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {snack && (
        <Alert severity="info" onClose={() => setSnack('')} sx={{ mb: 2 }}>{snack}</Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight={700}>Salary Advance Requests</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter Status"
              onChange={e => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="repaid">Repaid</MenuItem>
            </Select>
          </FormControl>
          <Button size="small" startIcon={<Refresh />} onClick={load} disabled={loading} variant="outlined">
            Refresh
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} height={52} sx={{ borderRadius: 1 }} />)}
            </Box>
          ) : advances.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">No advance requests found.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 680 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Deduct Period</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {advances.map(adv => (
                    <TableRow key={adv._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {adv.employeeId?.name || '—'}
                      </TableCell>
                      <TableCell>{adv.employeeId?.position || '—'}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {new Date(adv.requestedAt).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {fmt(adv.amount)} {adv.currency || 'XAF'}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {adv.reason}
                      </TableCell>
                      <TableCell>{adv.deductionPeriod || '—'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={adv.status.charAt(0).toUpperCase() + adv.status.slice(1)}
                          color={statusColor(adv.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {adv.status === 'pending' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={() => { setReviewDialog(adv); setReviewPeriod(adv.deductionPeriod || ''); }}
                                sx={{ textTransform: 'none', fontSize: 12 }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={() => { setReviewDialog({ ...adv, _rejectMode: true }); }}
                                sx={{ textTransform: 'none', fontSize: 12 }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {adv.status === 'approved' && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleMarkRepaid(adv._id)}
                              sx={{ textTransform: 'none', fontSize: 12 }}
                            >
                              Mark Repaid
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!reviewDialog}
        onClose={() => { setReviewDialog(null); setReviewNote(''); setReviewPeriod(''); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reviewDialog?._rejectMode ? 'Reject Advance Request' : 'Approve Advance Request'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Employee:</strong> {reviewDialog?.employeeId?.name}<br />
              <strong>Amount:</strong> {fmt(reviewDialog?.amount)} {reviewDialog?.currency || 'XAF'}<br />
              <strong>Reason:</strong> {reviewDialog?.reason}
            </Typography>

            {!reviewDialog?._rejectMode && (
              <TextField
                label="Deduction period (e.g. July 2026)"
                value={reviewPeriod}
                onChange={e => setReviewPeriod(e.target.value)}
                fullWidth
                helperText="The payroll period this advance will be deducted from"
              />
            )}

            <TextField
              label={reviewDialog?._rejectMode ? 'Rejection reason (optional)' : 'Approval note (optional)'}
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setReviewDialog(null); setReviewNote(''); setReviewPeriod(''); }} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            color={reviewDialog?._rejectMode ? 'error' : 'success'}
            onClick={() => handleReview(reviewDialog?._rejectMode ? 'reject' : 'approve')}
            disabled={reviewLoading}
            startIcon={reviewLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {reviewLoading ? 'Processing...' : reviewDialog?._rejectMode ? 'Reject' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalaryAdvanceAdmin;
