import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  AccessTimeRounded,
  AssignmentTurnedInRounded,
  CheckCircleRounded,
  EventBusyRounded,
  GroupsRounded,
  QrCode2Rounded
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { apiRequest } from '../../utils/api';
import { getStoredUser } from '../../utils/authSession';
import {
  DashboardHero,
  DashboardMetricCard,
  DashboardPage,
  DashboardPanel,
  getDailyWorkQuote
} from '../common/dashboardUi';

const BranchDashboardOverview = () => {
  const theme = useTheme();
  const [attendance, setAttendance] = useState(null);
  const [branch, setBranch] = useState(null);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [pendingLateCount, setPendingLateCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getStoredUser() || {};
  const navigate = useNavigate();
  const dailyQuote = getDailyWorkQuote('branch');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [attendanceRes, branchRes, leaveRes, lateRes] = await Promise.all([
        apiRequest('/attendance/admin-dashboard'),
        apiRequest('/branches/mine'),
        apiRequest('/leave/all'),
        apiRequest('/late-permissions/pending-count')
      ]);

      if (attendanceRes?.success) {
        setAttendance(attendanceRes.data);
      }

      if (branchRes?.success) {
        setBranch(branchRes.data);
      }

      if (leaveRes?.success) {
        const leaveRequests = leaveRes.requests || leaveRes.data || [];
        setPendingLeaveCount(leaveRequests.filter((request) => request.status === 'pending').length);
      }

      if (lateRes?.success) {
        setPendingLateCount(Number(lateRes.count) || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading && !attendance && !branch) {
    return (
      <DashboardPage>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow={`${branch?.name || 'Branch'} • ${user.role === 'branch_manager' ? 'Manager view' : 'HR view'}`}
        title="Run branch operations from one clear and accountable workspace."
        subtitle={`${today}. Stay on top of attendance, people movement, branch setup, and the approval queue without losing operational focus.`}
        chips={[
          `${attendance?.totalEmployees || 0} employees`,
          `${pendingLeaveCount} leave pending`,
          `${pendingLateCount} late requests`,
          branch?.qrToken ? 'QR active' : 'QR not ready'
        ]}
        gradient="linear-gradient(135deg, #10291e 0%, #14532d 55%, #15803d 100%)"
        quote={dailyQuote}
        actions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
            <Button
              variant="contained"
              startIcon={<AssignmentTurnedInRounded />}
              onClick={() => navigate('/branch/late-requests')}
              sx={{
                py: 1.15,
                px: 2.1,
                borderRadius: 3,
                fontWeight: 700,
                bgcolor: 'rgba(255,255,255,0.16)',
                boxShadow: 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.24)', boxShadow: 'none' }
              }}
            >
              Review Late Requests
            </Button>
            <Button
              variant="outlined"
              startIcon={<QrCode2Rounded />}
              onClick={() => navigate('/branch/branch-qr')}
              sx={{
                py: 1.15,
                px: 2.1,
                borderRadius: 3,
                fontWeight: 700,
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.28)',
                '&:hover': {
                  borderColor: '#ffffff',
                  bgcolor: 'rgba(255,255,255,0.08)'
                }
              }}
            >
              Open Branch QR
            </Button>
          </Stack>
        }
      />

      {loading ? <LinearProgress sx={{ mb: 2, borderRadius: 999 }} /> : null}
      {error ? <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert> : null}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} xl={3}>
          <DashboardMetricCard
            label="Employees in Branch"
            value={attendance?.totalEmployees || 0}
            icon={<GroupsRounded sx={{ fontSize: 24 }} />}
            accent="#155eef"
            helper="The total number of employees assigned here."
          />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <DashboardMetricCard
            label="Present Today"
            value={attendance?.present || 0}
            icon={<CheckCircleRounded sx={{ fontSize: 24 }} />}
            accent="#15803d"
            secondaryValue={attendance?.totalEmployees ? `${Math.round(((attendance.present || 0) / attendance.totalEmployees) * 100)}% attendance` : undefined}
            helper="Employees who have already checked in."
          />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <DashboardMetricCard
            label="Late Today"
            value={attendance?.late || 0}
            icon={<AccessTimeRounded sx={{ fontSize: 24 }} />}
            accent="#c2410c"
            helper="Staff who arrived after their scheduled time."
          />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <DashboardMetricCard
            label="Absent Today"
            value={attendance?.absent || 0}
            icon={<EventBusyRounded sx={{ fontSize: 24 }} />}
            accent="#dc2626"
            helper="No attendance record has been captured yet."
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <DashboardPanel
            title="Branch Readiness"
            subtitle="A cleaner view of what is configured and what still needs action."
          >
            <Stack spacing={1.2}>
              <Box sx={{ p: 1.6, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? alpha('#155eef', 0.10) : '#f8fbff', border: `1px solid ${theme.palette.mode === 'dark' ? alpha('#155eef', 0.22) : 'rgba(21,94,239,0.08)'}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13.3 }}>Geofence</Typography>
                    <Typography sx={{ mt: 0.35, fontWeight: 800, fontSize: 17 }}>
                      {branch?.geofence?.latitude ? `Configured • ${branch.geofence.radius}m radius` : 'Not configured'}
                    </Typography>
                  </Box>
                  <Chip
                    label={branch?.geofence?.latitude ? 'Ready' : 'Action needed'}
                    color={branch?.geofence?.latitude ? 'success' : 'warning'}
                  />
                </Stack>
              </Box>

              <Box sx={{ p: 1.6, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? alpha('#0f766e', 0.10) : '#f8fffb', border: `1px solid ${theme.palette.mode === 'dark' ? alpha('#0f766e', 0.22) : 'rgba(21,128,61,0.08)'}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13.3 }}>Branch QR</Typography>
                    <Typography sx={{ mt: 0.35, fontWeight: 800, fontSize: 17 }}>
                      {branch?.qrToken ? 'Generated and active' : 'Not generated'}
                    </Typography>
                  </Box>
                  <Chip
                    label={branch?.qrToken ? 'Ready' : 'Action needed'}
                    color={branch?.qrToken ? 'success' : 'warning'}
                  />
                </Stack>
              </Box>

              <Box sx={{ p: 1.6, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? alpha('#c2410c', 0.10) : '#fffaf5', border: `1px solid ${theme.palette.mode === 'dark' ? alpha('#c2410c', 0.22) : 'rgba(194,65,12,0.08)'}` }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 13.3 }}>Address</Typography>
                <Typography sx={{ mt: 0.35, fontWeight: 700, fontSize: 15.5 }}>
                  {branch?.address || 'No address on file yet.'}
                </Typography>
              </Box>
            </Stack>
          </DashboardPanel>
        </Grid>

        <Grid item xs={12} lg={6}>
          <DashboardPanel
            title="Operations Queue"
            subtitle="The branch items that deserve attention next."
          >
            <Stack spacing={1.25}>
              <Alert severity={pendingLeaveCount > 0 ? 'warning' : 'success'}>
                {pendingLeaveCount > 0
                  ? `${pendingLeaveCount} leave request${pendingLeaveCount !== 1 ? 's are' : ' is'} waiting for review.`
                  : 'No pending leave requests right now.'}
              </Alert>

              <Alert severity={pendingLateCount > 0 ? 'info' : 'success'}>
                {pendingLateCount > 0
                  ? `${pendingLateCount} late arrival request${pendingLateCount !== 1 ? 's are' : ' is'} waiting for action.`
                  : 'No pending late-arrival requests right now.'}
              </Alert>

              {!branch?.geofence?.latitude ? (
                <Alert severity="warning">
                  Geofence is not set. Employees will not be able to check in properly until this is configured.
                </Alert>
              ) : null}

              {!branch?.qrToken ? (
                <Alert severity="info">
                  Branch QR is not generated yet. Create it to enable check-in and check-out.
                </Alert>
              ) : null}
            </Stack>
          </DashboardPanel>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <DashboardPanel
            title="Branch Snapshot"
            subtitle="A concise read of the current attendance and approval landscape."
          >
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 1.75, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? alpha('#155eef', 0.10) : '#f8fbff', border: `1px solid ${theme.palette.mode === 'dark' ? alpha('#155eef', 0.22) : 'rgba(21,94,239,0.08)'}` }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 13.3 }}>Attendance pace</Typography>
                  <Typography sx={{ mt: 0.45, fontWeight: 800, fontSize: 24, color: '#155eef' }}>
                    {attendance?.totalEmployees ? Math.round((((attendance.present || 0) + (attendance.late || 0)) / attendance.totalEmployees) * 100) : 0}%
                  </Typography>
                  <Typography sx={{ mt: 0.55, color: 'text.secondary', fontSize: 13.2, lineHeight: 1.6 }}>
                    Present and late employees compared with total branch headcount.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 1.75, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? alpha('#0f766e', 0.10) : '#f8fffb', border: `1px solid ${theme.palette.mode === 'dark' ? alpha('#0f766e', 0.22) : 'rgba(21,128,61,0.08)'}` }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 13.3 }}>Approvals waiting</Typography>
                  <Typography sx={{ mt: 0.45, fontWeight: 800, fontSize: 24, color: '#15803d' }}>
                    {pendingLeaveCount + pendingLateCount}
                  </Typography>
                  <Typography sx={{ mt: 0.55, color: 'text.secondary', fontSize: 13.2, lineHeight: 1.6 }}>
                    Combined leave and late-request actions still open for branch review.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DashboardPanel>
        </Grid>

        <Grid item xs={12} lg={5}>
          <DashboardPanel
            title="Quick Actions"
            subtitle="Move straight into the branch workflows used most often."
          >
            <Stack spacing={1.15}>
              <Button fullWidth variant="contained" onClick={() => navigate('/branch/late-requests')} sx={{ justifyContent: 'flex-start', py: 1.2, borderRadius: 3, fontWeight: 700 }}>
                Review Late Requests
              </Button>
              <Button fullWidth variant="outlined" onClick={() => navigate('/branch/leave')} sx={{ justifyContent: 'flex-start', py: 1.2, borderRadius: 3, fontWeight: 700 }}>
                Review Leave Requests
              </Button>
              <Button fullWidth variant="outlined" onClick={() => navigate('/branch/attendance')} sx={{ justifyContent: 'flex-start', py: 1.2, borderRadius: 3, fontWeight: 700 }}>
                Open Attendance Dashboard
              </Button>
              <Button fullWidth variant="outlined" onClick={() => navigate('/branch/geofence')} sx={{ justifyContent: 'flex-start', py: 1.2, borderRadius: 3, fontWeight: 700 }}>
                Configure Geofence
              </Button>
              <Button fullWidth variant="outlined" onClick={() => navigate('/branch/branch-qr')} sx={{ justifyContent: 'flex-start', py: 1.2, borderRadius: 3, fontWeight: 700 }}>
                Open Branch QR
              </Button>
            </Stack>
          </DashboardPanel>
        </Grid>
      </Grid>
    </DashboardPage>
  );
};

export default BranchDashboardOverview;
