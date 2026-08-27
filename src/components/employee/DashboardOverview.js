import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Campaign,
  CheckCircle,
  EventNote,
  Info,
  Payment,
  QrCodeScanner,
  Schedule,
  Warning
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import { getStoredUser } from '../../utils/authSession';
import {
  DashboardHero,
  DashboardMetricCard,
  DashboardPage,
  DashboardPanel,
  getDailyWorkQuote
} from '../common/dashboardUi';

const AVATAR_COLORS = ['#1976d2','#388e3c','#d32f2f','#f57c00','#7b1fa2','#0288d1','#c2185b','#00796b'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const fmt = (n) => (n || 0).toLocaleString();

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState({});
  const [shiftsThisMonth, setShiftsThisMonth] = useState('—');
  const [todaysShift, setTodaysShift] = useState(null);
  const [attendanceRate, setAttendanceRate] = useState('—');
  const [recentPayments, setRecentPayments] = useState([]);
  const [leaveDaysLeft, setLeaveDaysLeft] = useState('—');
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const dailyQuote = getDailyWorkQuote('employee');

  useEffect(() => {
    const load = async () => {
      const user = getStoredUser() || {};
      const base = {
        name: user.name,
        email: user.email,
        position: user.position || 'Employee',
        company: user.company || 'Company',
        salary: null,
        payPerShift: null,
        department: 'Operations',
      };

      try {
        const res = await apiRequest('/employees/me');
        if (res.success) {
          base.salary = res.data.salary;
          base.payPerShift = res.data.payPerShift;
          base.department = res.data.department || 'Operations';
          base.startDate = res.data.startDate;
        }
      } catch {}

      setEmployeeData(base);

      try {
        const now = new Date();
        const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const res = await apiRequest(`/schedules/my-shifts?from=${from}`);
        if (res.success) {
          const shifts = res.data || [];
          setShiftsThisMonth(shifts.length);
          const todayStr = now.toDateString();
          const found = shifts.find(s => new Date(s.date).toDateString() === todayStr);
          setTodaysShift(found || null);
        }
      } catch {}

      try {
        const res = await apiRequest('/attendance');
        if (res.success) {
          const records = res.data || [];
          if (records.length > 0) {
            const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
            setAttendanceRate(`${Math.round((present / records.length) * 100)}%`);
          } else {
            setAttendanceRate('100%');
          }
        }
      } catch {}

      try {
        const res = await apiRequest('/leave/my-requests');
        if (res.success) {
          const yearStart = new Date(new Date().getFullYear(), 0, 1);
          const approved = (res.requests || []).filter(l =>
            l.status === 'approved' && new Date(l.startDate) >= yearStart
          );
          const daysTaken = approved.reduce((sum, l) => {
            return sum + Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / 86400000) + 1;
          }, 0);
          setLeaveDaysLeft(Math.max(0, 20 - daysTaken));

          const notifs = (res.requests || []).slice(0, 3).map(l => ({
            message: `Leave request (${l.leaveType}) — ${l.status}`,
            severity: l.status === 'approved' ? 'success' : l.status === 'denied' ? 'warning' : 'info',
            date: new Date(l.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
          }));
          setNotifications(notifs);
        }
      } catch {}

      try {
        const res = await apiRequest('/payrolls/my-history');
        if (res.success) setRecentPayments(res.data || []);
      } catch {}

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <DashboardPage>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </DashboardPage>
    );
  }

  const shiftStatusColor = { scheduled: 'primary', 'in-progress': 'warning', completed: 'success', missed: 'error' };

  const displayNotifs = notifications.length > 0 ? notifications : [
    { message: 'Remember to check in today on time', severity: 'info', date: 'Today' },
    { message: 'Keep your profile information up to date', severity: 'warning', date: '' },
  ];

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow={`${greet()}, ${employeeData.name?.split(' ')[0] || 'Employee'}`}
        title={`${employeeData.position} · ${employeeData.department}`}
        subtitle={`${employeeData.company}${
          employeeData.salary != null ? ` · Salary: ${fmt(employeeData.salary)} FCFA` : ''
        }${
          employeeData.payPerShift != null ? ` · Per Shift: ${fmt(employeeData.payPerShift)} FCFA` : ''
        }`}
        gradient="linear-gradient(135deg, #0d2137 0%, #0a3d62 60%, #1565c0 100%)"
        quote={dailyQuote}
        actions={
          <Button
            variant="contained"
            startIcon={<QrCodeScanner />}
            onClick={() => navigate('/employee/checkin')}
            sx={{
              borderRadius: 999,
              fontWeight: 800,
              px: 3,
              py: 1.1,
              background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
              boxShadow: '0 12px 28px rgba(46,125,50,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)' }
            }}
          >
            Check In Now
          </Button>
        }
      />

      <Grid container spacing={2.2} sx={{ mb: 2.8 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardMetricCard
            label="Monthly Salary"
            value={employeeData.salary != null ? `${Math.round(employeeData.salary / 1000)}K` : '—'}
            secondaryValue={employeeData.salary != null ? 'FCFA per month' : undefined}
            icon={<Payment sx={{ fontSize: 24 }} />}
            accent="#1565c0"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardMetricCard
            label="Shifts This Month"
            value={`${shiftsThisMonth}`}
            icon={<Schedule sx={{ fontSize: 24 }} />}
            accent="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardMetricCard
            label="Leave Days Left"
            value={`${leaveDaysLeft}`}
            icon={<EventNote sx={{ fontSize: 24 }} />}
            accent="#e65100"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardMetricCard
            label="Attendance Rate"
            value={attendanceRate}
            icon={<CheckCircle sx={{ fontSize: 24 }} />}
            accent="#7b1fa2"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={5}>
          <DashboardPanel
            title="Today's Shift"
            subtitle={new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            sx={{ height: '100%' }}
          >
            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5 }}>
                {todaysShift ? `${todaysShift.startTime} – ${todaysShift.endTime}` : 'No shift scheduled today'}
              </Typography>
              {todaysShift && (
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
                  <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">Main Office</Typography>
                </Stack>
              )}
              <Chip
                label={todaysShift?.status || 'no shift'}
                size="small"
                color={shiftStatusColor[todaysShift?.status] || 'default'}
                sx={{ fontWeight: 600, textTransform: 'capitalize' }}
              />
            </Box>
            <Button
              fullWidth
              variant="contained"
              startIcon={<QrCodeScanner />}
              onClick={() => navigate('/employee/checkin')}
              sx={{
                fontWeight: 700,
                borderRadius: 2.5,
                py: 1.2,
                background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
                boxShadow: '0 8px 20px rgba(46,125,50,0.28)',
                '&:hover': { background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)' }
              }}
            >
              Check In Now
            </Button>
          </DashboardPanel>
        </Grid>

        <Grid item xs={12} md={7}>
          <DashboardPanel
            title="Recent Payments"
            subtitle="Your latest payroll records."
            action={
              <Button size="small" sx={{ fontWeight: 700 }} onClick={() => navigate('/employee/payments')}>
                View All
              </Button>
            }
            sx={{ height: '100%' }}
          >
            {recentPayments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">No payment records yet.</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {recentPayments.slice(0, 3).map((p, i) => (
                  <React.Fragment key={p._id || i}>
                    <ListItem disableGutters sx={{ py: 1.25 }}>
                      <ListItemAvatar sx={{ minWidth: 46 }}>
                        <Avatar sx={{ bgcolor: 'action.hover', width: 38, height: 38 }}>
                          <Payment sx={{ color: '#1976d2', fontSize: 18 }} />
                        </Avatar>
                        <Avatar
                            sx={{
                              bgcolor: avatarColor(employeeData.name)
                            }}
                          >
                            {employeeData.name?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={600}>{p.period}</Typography>}
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {p.paidAt
                              ? `Paid ${new Date(p.paidAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
                              : p.status}
                          </Typography>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight={700} color="#2e7d32">{fmt(p.amount)} FCFA</Typography>
                        <Chip
                          label={p.status}
                          size="small"
                          color={p.status === 'paid' ? 'success' : 'warning'}
                          sx={{ fontWeight: 600, fontSize: 10, height: 18, mt: 0.25, textTransform: 'capitalize' }}
                        />
                      </Box>
                    </ListItem>
                    {i < Math.min(recentPayments.length, 3) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </DashboardPanel>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={8}>
          <DashboardPanel
            title="Notifications"
            subtitle="Recent updates on your leave requests and reminders."
            sx={{ height: '100%' }}
          >
            <List disablePadding>
              {displayNotifs.map((n, i) => (
                <React.Fragment key={i}>
                  <ListItem disableGutters sx={{ py: 1.25 }}>
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      {n.severity === 'warning'
                        ? <Warning sx={{ color: '#ffa726', fontSize: 20 }} />
                        : n.severity === 'success'
                          ? <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                          : <Info sx={{ color: '#42a5f5', fontSize: 20 }} />}
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={500}>{n.message}</Typography>}
                      secondary={n.date
                        ? <Typography variant="caption" color="text.disabled">{n.date}</Typography>
                        : null}
                    />
                  </ListItem>
                  {i < displayNotifs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </DashboardPanel>
        </Grid>

        <Grid item xs={12} md={4}>
          <DashboardPanel title="Quick Actions" sx={{ height: '100%' }}>
            <Stack spacing={1.25}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<QrCodeScanner sx={{ fontSize: 17 }} />}
                onClick={() => navigate('/employee/checkin')}
                sx={{
                  fontWeight: 700,
                  borderRadius: 2.5,
                  py: 1.1,
                  background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
                  boxShadow: '0 6px 16px rgba(46,125,50,0.25)'
                }}
              >
                Check In
              </Button>
              <Button fullWidth variant="outlined" onClick={() => navigate('/employee/schedule')} sx={{ fontWeight: 600, borderRadius: 2.5, py: 1.1 }}>
                View Schedule
              </Button>
              <Button fullWidth variant="outlined" onClick={() => navigate('/employee/payments')} sx={{ fontWeight: 600, borderRadius: 2.5, py: 1.1 }}>
                Payment History
              </Button>
              <Button fullWidth variant="outlined" onClick={() => navigate('/employee/leave')} sx={{ fontWeight: 600, borderRadius: 2.5, py: 1.1 }}>
                Request Leave
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Campaign sx={{ fontSize: 17 }} />}
                onClick={() => navigate('/employee/messaging')}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2.5,
                  py: 1.1,
                  borderColor: '#ffa726',
                  color: '#f57c00',
                  '&:hover': { bgcolor: 'rgba(255,167,38,0.06)', borderColor: '#f57c00' }
                }}
              >
                Announcements
              </Button>
            </Stack>
          </DashboardPanel>
        </Grid>
      </Grid>
    </DashboardPage>
  );
};

export default DashboardOverview;
