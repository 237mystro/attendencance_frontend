import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import {
  AccessTime,
  Block,
  Cancel,
  CheckCircle,
  DevicesOther,
  ExpandLess,
  ExpandMore,
  Fingerprint,
  FaceRetouchingNatural,
  Insights,
  People,
  QrCode,
  Warning
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { apiRequest } from '../../utils/api';
import { getDeviceLabel } from '../../utils/deviceFingerprint';
import { VITE_SOCKET_URL } from '../../utils/api';
import io from 'socket.io-client';
import { getStoredToken } from '../../utils/authSession';
import AttendanceInsights from './AttendanceInsights';
import { DashboardMetricCard, DashboardPage } from '../common/dashboardUi';

const AttendanceDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const [attendanceData, setAttendanceData]   = useState([]);
  const [summary, setSummary]                 = useState(null);
  const [flaggedRecords, setFlaggedRecords]   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [showFlagged, setShowFlagged]         = useState(true);
  const [newFlagAlert, setNewFlagAlert]       = useState(null);
  const [reviewDialog, setReviewDialog]       = useState(null); // { record, action }
  const [reviewLoading, setReviewLoading]     = useState(false);
  const [reviewResult, setReviewResult]       = useState(null); // { severity, message }

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashData, flagData] = await Promise.all([
        apiRequest('/attendance/admin-dashboard'),
        apiRequest('/attendance/flagged-devices')
      ]);

      if (dashData.success) {
        const payload = dashData.data || dashData;
        setAttendanceData(payload.attendance || []);
        setSummary({
          totalEmployees: payload.totalEmployees || 0,
          present:        payload.present        || 0,
          late:           payload.late           || 0,
          absent:         payload.absent         || 0
        });
      } else {
        setError(dashData.message || 'Failed to load attendance data');
      }

      if (flagData.success) {
        setFlaggedRecords(flagData.data || []);
      }
    } catch (err) {
      setError('Failed to fetch attendance data');
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Real-time socket listener for flagged-device events ──────────────────
  useEffect(() => {
    const socket = io(VITE_SOCKET_URL, { transports: ['websocket'] });
    const token  = getStoredToken();
    if (token) socket.emit('authenticate', token);

    socket.on('attendance:device_flagged', (event) => {
      setNewFlagAlert(event);
      // Refresh flagged list
      apiRequest('/attendance/flagged-devices').then(data => {
        if (data.success) setFlaggedRecords(data.data || []);
      });
    });

    return () => socket.disconnect();
  }, []);

  // ── Status chip ───────────────────────────────────────────────────────────
  const getStatusChip = (status) => {
    switch (status) {
      case 'present': return <Chip icon={<CheckCircle />}  label="Present" color="success" size="small" />;
      case 'late':    return <Chip icon={<AccessTime />}   label="Late"    color="warning" size="small" />;
      case 'absent':  return <Chip icon={<Cancel />}       label="Absent"  color="error"   size="small" />;
      default:        return <Chip label={status} variant="outlined" size="small" />;
    }
  };

  // ── Method chip ───────────────────────────────────────────────────────────
  const getMethodChip = (record) => {
    if (record.attendanceMethod === 'biometric') {
      const isFace = record.biometricType === 'faceId';
      return (
        <Chip
          icon={isFace ? <FaceRetouchingNatural /> : <Fingerprint />}
          label={isFace ? 'Face ID' : 'Fingerprint'}
          color="secondary"
          size="small"
          variant="outlined"
        />
      );
    }
    if (record.attendanceMethod === 'qr' || record.qrData) {
      return <Chip icon={<QrCode />} label="QR Code" color="primary" size="small" variant="outlined" />;
    }
    return null;
  };

  const handleReview = async () => {
    if (!reviewDialog) return;
    setReviewLoading(true);
    try {
      const data = await apiRequest(`/attendance/${reviewDialog.record._id}/review-device`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: reviewDialog.action })
      });
      setReviewResult({ severity: 'success', message: data.message });
      setFlaggedRecords(prev => prev.filter(r => r._id !== reviewDialog.record._id));
      fetchData();
    } catch (err) {
      setReviewResult({ severity: 'error', message: err.message });
    } finally {
      setReviewLoading(false);
      setReviewDialog(null);
    }
  };

  if (loading) {
    return (
      <DashboardPage>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </DashboardPage>
    );
  }

  if (error) return (
    <DashboardPage>
      <Alert severity="error">{error}</Alert>
    </DashboardPage>
  );

  return (
    <DashboardPage>
      <Box
        sx={{
          mb: 2.5,
          p: { xs: 2.2, md: 3 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0f172a 0%, #163a6b 58%, #1d4ed8 100%)',
          color: '#ffffff',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)'
        }}
      >
        <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, lineHeight: 1.05 }}>
          Attendance Dashboard
        </Typography>
        <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)', fontSize: 15 }}>
          Monitor who is present, late, or absent across your workforce today.
        </Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab label="Today's Attendance" />
        <Tab label="Analytics & Insights" icon={<Insights />} iconPosition="end" />
      </Tabs>

      {activeTab === 1 && <AttendanceInsights />}
      {activeTab === 0 && (<>

      {/* ── Summary cards ───────────────────────────────────────────────── */}
      {summary && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2.2, mb: 3 }}>
          <DashboardMetricCard
            label="Total Employees"
            value={summary.totalEmployees}
            icon={<People sx={{ fontSize: 24 }} />}
            accent="#155eef"
          />
          <DashboardMetricCard
            label="Present"
            value={summary.present}
            icon={<CheckCircle sx={{ fontSize: 24 }} />}
            accent="#16a34a"
          />
          <DashboardMetricCard
            label="Late"
            value={summary.late}
            icon={<AccessTime sx={{ fontSize: 24 }} />}
            accent="#d97706"
          />
          <DashboardMetricCard
            label="Absent"
            value={summary.absent}
            icon={<Cancel sx={{ fontSize: 24 }} />}
            accent="#dc2626"
          />
        </Box>
      )}

      {/* ── Flagged devices section ──────────────────────────────────────── */}
      {flaggedRecords.length > 0 && (
        <Card sx={{ mb: 3, border: '1px solid', borderColor: 'warning.main' }}>
          <CardContent sx={{ pb: '8px !important' }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => setShowFlagged(v => !v)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={flaggedRecords.length} color="warning">
                  <Warning color="warning" />
                </Badge>
                <Typography variant="h6" color="warning.main">
                  Unknown Device Alerts
                </Typography>
              </Box>
              <IconButton size="small">
                {showFlagged ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={showFlagged}>
              <Alert severity="warning" sx={{ mt: 1.5, mb: 1.5 }}>
                These employees checked in from an unrecognised device. <strong>Approve</strong> to accept the check-in, or <strong>Revoke</strong> to cancel it and mark the employee absent.
              </Alert>

              {reviewResult && (
                <Alert severity={reviewResult.severity} sx={{ mb: 1.5 }} onClose={() => setReviewResult(null)}>
                  {reviewResult.message}
                </Alert>
              )}

              {/* Mobile cards for flagged records */}
              <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', gap: 1.5, mt: 1.5 }}>
                {flaggedRecords.map((record) => (
                  <Paper key={record._id} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? alpha('#f59e0b', 0.08) : '#fffbeb', borderColor: 'warning.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <DevicesOther fontSize="small" color="warning" />
                      <Typography variant="subtitle2" fontWeight={700}>{record.employeeId?.name || 'Unknown'}</Typography>
                      <Box sx={{ ml: 'auto' }}>{getStatusChip(record.status)}</Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleString() : '-'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, my: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      {getMethodChip(record)}
                      <Typography variant="caption" fontFamily="monospace" color="text.secondary">{record.ipAddress || '-'}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ mb: 1.5 }}>
                      {getDeviceLabel(record.userAgent)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />} fullWidth
                        onClick={() => setReviewDialog({ record, action: 'approve' })} sx={{ fontWeight: 600 }}>
                        Approve
                      </Button>
                      <Button size="small" variant="outlined" color="error" startIcon={<Block />} fullWidth
                        onClick={() => setReviewDialog({ record, action: 'revoke' })} sx={{ fontWeight: 600 }}>
                        Revoke
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>

              {/* Desktop table for flagged records */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Date &amp; Time</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>IP Address</TableCell>
                        <TableCell>Device</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {flaggedRecords.map((record) => (
                        <TableRow key={record._id} sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha('#f59e0b', 0.10) : '#fffbeb' }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <DevicesOther fontSize="small" color="warning" />
                              <Typography variant="body2" fontWeight={600}>{record.employeeId?.name || 'Unknown'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{record.checkInTime ? new Date(record.checkInTime).toLocaleString() : '-'}</TableCell>
                          <TableCell>{getMethodChip(record)}</TableCell>
                          <TableCell><Typography variant="body2" fontFamily="monospace">{record.ipAddress || '-'}</Typography></TableCell>
                          <TableCell>
                            <Tooltip title={record.userAgent || 'Unknown'} arrow>
                              <Typography variant="body2" sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {getDeviceLabel(record.userAgent)}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{getStatusChip(record.status)}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />}
                                onClick={() => setReviewDialog({ record, action: 'approve' })} sx={{ textTransform: 'none', fontWeight: 600 }}>
                                Approve
                              </Button>
                              <Button size="small" variant="outlined" color="error" startIcon={<Block />}
                                onClick={() => setReviewDialog({ record, action: 'revoke' })} sx={{ textTransform: 'none', fontWeight: 600 }}>
                                Revoke
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* ── Today's attendance ───────────────────────────────────────────── */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Today's Attendance</Typography>

          {attendanceData.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No attendance records for today yet.
            </Typography>
          ) : (
            <>
              {/* Mobile cards */}
              <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', gap: 1.5 }}>
                {attendanceData.map((record) => (
                  <Paper key={record._id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {record.deviceFlagged && <Warning fontSize="small" color="warning" />}
                        <Typography variant="subtitle2" fontWeight={700}>{record.employeeId?.name || 'Unknown'}</Typography>
                      </Box>
                      {getStatusChip(record.status)}
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {record.employeeId?.position || 'Unknown'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                      </Typography>
                      {getMethodChip(record)}
                    </Box>
                  </Paper>
                ))}
              </Box>

              {/* Desktop table */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 560 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell>Check-In Time</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceData.map((record) => (
                        <TableRow key={record._id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {record.deviceFlagged && (
                                <Tooltip title="Unknown device" arrow>
                                  <Warning fontSize="small" color="warning" />
                                </Tooltip>
                              )}
                              {record.employeeId?.name || 'Unknown'}
                            </Box>
                          </TableCell>
                          <TableCell>{record.employeeId?.position || 'Unknown'}</TableCell>
                          <TableCell>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}</TableCell>
                          <TableCell>{getMethodChip(record) || '-'}</TableCell>
                          <TableCell>{getStatusChip(record.status)}</TableCell>
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

      {/* ── Review confirmation dialog ───────────────────────────────────── */}
      <Dialog open={!!reviewDialog} onClose={() => !reviewLoading && setReviewDialog(null)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {reviewDialog?.action === 'approve'
            ? <><CheckCircle color="success" /> Approve Check-in?</>
            : <><Block color="error" /> Revoke Check-in?</>}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {reviewDialog?.action === 'approve'
              ? <>Accept the check-in for <strong>{reviewDialog?.record?.employeeId?.name}</strong>? The attendance record will be kept and the device alert cleared.</>
              : <>Cancel the check-in for <strong>{reviewDialog?.record?.employeeId?.name}</strong>? Their attendance will be changed to <strong>Absent</strong> and the alert cleared. This cannot be undone.</>}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(null)} disabled={reviewLoading}>Cancel</Button>
          <Button
            variant="contained"
            color={reviewDialog?.action === 'approve' ? 'success' : 'error'}
            onClick={handleReview}
            disabled={reviewLoading}
            startIcon={reviewLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {reviewLoading ? 'Processing…' : reviewDialog?.action === 'approve' ? 'Approve' : 'Revoke'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Real-time toast for new flagged device ───────────────────────── */}
      <Snackbar
        open={!!newFlagAlert}
        autoHideDuration={8000}
        onClose={() => setNewFlagAlert(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity="warning"
          onClose={() => setNewFlagAlert(null)}
          icon={<Warning />}
          sx={{ width: '100%' }}
        >
          <strong>Unknown device detected!</strong><br />
          {newFlagAlert?.employeeName} checked in from an unrecognised device
          {newFlagAlert?.ipAddress ? ` (IP: ${newFlagAlert.ipAddress})` : ''}.
        </Alert>
      </Snackbar>
      </>)}
    </DashboardPage>
  );
};

export default AttendanceDashboard;
