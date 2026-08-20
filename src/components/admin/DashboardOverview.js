import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  AssignmentRounded,
  ClearRounded,
  GroupsRounded,
  InfoRounded,
  PaymentsRounded,
  SearchRounded,
  TrendingUpRounded,
  WarningAmberRounded
} from '@mui/icons-material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { getStoredUser } from '../../utils/authSession';
import { apiRequest } from '../../utils/api';
import {
  DashboardMetricCard,
  DashboardPage,
  DashboardPanel,
  getDailyWorkQuote
} from '../common/dashboardUi';

const AVATAR_COLORS = ['#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2', '#0288d1', '#c2185b', '#00796b'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const greet = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [allEmployees, setAllEmployees] = useState([]);
  const [todayShifts, setTodayShifts] = useState(0);
  const [payrollTotal, setPayrollTotal] = useState('XAF 0');
  const [attendanceRate, setAttendanceRate] = useState('0%');
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState(0);
  const [pendingLateRequests, setPendingLateRequests] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [pieData, setPieData] = useState([
    { name: 'Present', value: 0, color: '#22c55e' },
    { name: 'Late', value: 0, color: '#f59e0b' },
    { name: 'Absent', value: 0, color: '#ef4444' }
  ]);
  const [alerts, setAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const navigate = useNavigate();
  const user = getStoredUser() || {};
  const dailyQuote = getDailyWorkQuote('leader');
  const theme = useTheme();

  useEffect(() => {
    const load = async () => {
      const nextAlerts = [];

      try {
        const employeesRes = await apiRequest('/employees');
        if (employeesRes.success) {
          const all = employeesRes.data || [];
          const activeEmployees = all.filter((employee) => employee.status === 'active');
          setAllEmployees(all);
          setEmployeeCount(activeEmployees.length);
        }
      } catch {}

      try {
        const schedulesRes = await apiRequest('/schedules');
        if (schedulesRes.success) {
          const todayLabel = new Date().toDateString();
          const shiftCount = (schedulesRes.data || []).filter((shift) => new Date(shift.date).toDateString() === todayLabel).length;
          setTodayShifts(shiftCount);
        }
      } catch {}

      try {
        const payrollRes = await apiRequest('/payrolls');
        if (payrollRes.success && (payrollRes.data || []).length > 0) {
          const total = payrollRes.data.reduce((sum, payroll) => sum + (payroll.totalAmount || 0), 0);
          setPayrollTotal(total >= 1000000 ? `XAF ${(total / 1000000).toFixed(1)}M` : `XAF ${Math.round(total / 1000)}K`);
        }
      } catch {}

      try {
        const attendanceRes = await apiRequest('/attendance/admin-dashboard');
        if (attendanceRes.success) {
          const { totalEmployees = 1, present = 0, late = 0, absent = 0 } = attendanceRes.data;
          const rate = Math.round(((present + late) / Math.max(totalEmployees, 1)) * 100);
          setAttendanceRate(`${rate}%`);
          setPresentCount(present);
          setLateCount(late);
          setAbsentCount(absent);
          setPieData([
            { name: 'Present', value: present, color: '#22c55e' },
            { name: 'Late', value: late, color: '#f59e0b' },
            { name: 'Absent', value: absent, color: '#ef4444' }
          ]);

          if (absent > 0) {
            nextAlerts.push({
              message: `${absent} employee${absent > 1 ? 's are' : ' is'} absent today.`,
              severity: 'warning',
              actionLabel: 'Open Attendance',
              actionUrl: '/admin/attendance'
            });
          }

          if (late > 0) {
            nextAlerts.push({
              message: `${late} employee${late > 1 ? 's checked in' : ' checked in'} late.`,
              severity: 'info',
              actionLabel: 'Review Attendance',
              actionUrl: '/admin/attendance'
            });
          }
        }
      } catch {}

      try {
        const leaveRes = await apiRequest('/leave/all');
        const leaveRequests = leaveRes.requests || leaveRes.data || [];
        const pending = leaveRequests.filter((leave) => leave.status === 'pending').length;
        setPendingLeaveRequests(pending);

        if (pending > 0) {
          nextAlerts.push({
            message: `${pending} leave request${pending > 1 ? 's are' : ' is'} awaiting approval.`,
            severity: 'warning',
            actionLabel: 'Review Leaves',
            actionUrl: '/admin/leave'
          });
        }
      } catch {}

      try {
        const lateRes = await apiRequest('/late-permissions/pending-count');
        const pending = Number(lateRes.count) || 0;
        setPendingLateRequests(pending);

        if (pending > 0) {
          nextAlerts.push({
            message: `${pending} late arrival request${pending > 1 ? 's are' : ' is'} waiting for review.`,
            severity: 'info',
            actionLabel: 'Review Late Requests',
            actionUrl: '/admin/late-requests'
          });
        }
      } catch {}

      try {
        const weeklyRes = await apiRequest('/attendance/weekly');
        if (weeklyRes.success) {
          setWeeklyAttendanceData(weeklyRes.data || []);
        }
      } catch {}

      if (nextAlerts.length === 0) {
        nextAlerts.push({
          message: 'Operations are running smoothly. This is a good moment to review payroll readiness.',
          severity: 'info',
          actionLabel: 'Open Payroll',
          actionUrl: '/admin/payroll'
        });
      }

      setAlerts(nextAlerts);
      setLoading(false);
    };

    load();
  }, []);

  const departments = Array.from(new Set(allEmployees.map((employee) => employee.department).filter(Boolean)));

  const filteredEmployees = allEmployees.filter((employee) => {
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    if (!searchQuery.trim()) return matchesDepartment;

    const q = searchQuery.toLowerCase();
    return matchesDepartment && (
      (employee.name || '').toLowerCase().includes(q)
      || (employee.position || '').toLowerCase().includes(q)
      || (employee.department || '').toLowerCase().includes(q)
      || (employee.email || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: avatarColor(user.name),
              fontWeight: 800,
              fontSize: 22,
              border: '3px solid rgba(255,255,255,0.2)'
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, lineHeight: 1.05 }}>
              {greet()}, {user.name?.split(' ')[0] || 'Admin'}
            </Typography>
            <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.7 }}>
              {user.position || 'Administrator'} for {user.company || 'your company'}. Focus on workforce visibility, attendance quality, and payroll readiness.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DashboardPanel
        title="Workforce Search"
        subtitle="Search employees by name, role, department, or email, then jump into employee management."
        sx={{ mb: 2.5 }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            placeholder="Search employees"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearRounded />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
          <TextField
            select
            fullWidth
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            sx={{ maxWidth: { lg: 240 } }}
          >
            <MenuItem value="all">All departments</MenuItem>
            {departments.map((department) => (
              <MenuItem key={department} value={department}>
                {department}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {searchQuery || selectedDepartment !== 'all' ? (
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              borderRadius: 3,
              border: '1px solid rgba(15,23,42,0.08)',
              overflow: 'hidden'
            }}
          >
            {filteredEmployees.length > 0 ? (
              filteredEmployees.slice(0, 6).map((employee, index) => (
                <Box
                  key={employee._id || `${employee.email}-${index}`}
                  onClick={() => navigate('/admin/employees')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.35,
                    cursor: 'pointer',
                    borderBottom: index < Math.min(filteredEmployees.length, 6) - 1 ? '1px solid rgba(15,23,42,0.06)' : 'none',
                    '&:hover': { bgcolor: theme.palette.action.hover }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor: avatarColor(employee.name),
                      fontWeight: 700
                    }}
                  >
                    {employee.name?.charAt(0)?.toUpperCase() || '?'}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>
                      {employee.name}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13.2 }}>
                      {[employee.position, employee.department].filter(Boolean).join(' • ')}
                    </Typography>
                  </Box>
                  <Chip
                    label={employee.status || 'active'}
                    size="small"
                    color={employee.status === 'inactive' ? 'default' : 'success'}
                    sx={{ ml: 'auto', textTransform: 'capitalize' }}
                  />
                </Box>
              ))
            ) : (
              <Box sx={{ px: 2, py: 2.2 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                  No employees match the current search.
                </Typography>
              </Box>
            )}
          </Paper>
        ) : null}
      </DashboardPanel>

      <Grid container spacing={2.2} sx={{ mb: 2.8 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardMetricCard
            label="Active Employees"
            value={employeeCount}
            icon={<GroupsRounded sx={{ fontSize: 24 }} />}
            accent="#155eef"
      
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardMetricCard
            label="Attendance Rate"
            value={attendanceRate}
            icon={<TrendingUpRounded sx={{ fontSize: 24 }} />}
            accent="#7c3aed"
            
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardMetricCard
            label="Today's Shift"
            value={todayShifts}
            icon={<AssignmentRounded sx={{ fontSize: 24 }} />}
            accent="#0f766e"
            
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardMetricCard
            label="Payroll Volume"
            value={payrollTotal}
            icon={<PaymentsRounded sx={{ fontSize: 24 }} />}
            accent="#c2410c"
            
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.8 }}>
        <Grid item xs={12} lg={6}>
          <DashboardPanel
            title="Weekly Attendance Pattern"
            subtitle="Track present versus absent trends to spot staffing pressure before it affects payroll or service delivery."
            action={<Chip label="This week" sx={{ bgcolor: '#e8f0ff', color: '#155eef', fontWeight: 700 }} />}
          >
            <Box sx={{ height: { xs: 260, md: 340 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAttendanceData} margin={{ top: 5, right: 10, left: -18, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#7b8aa1' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#7b8aa1' }} />
                  <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e5edf7', boxShadow: '0 18px 34px rgba(15, 23, 42, 0.12)' }} />
                  <Bar dataKey="present" fill="#155eef" name="Present" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </DashboardPanel>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <DashboardPanel
            title="Today's Attendance Mix"
            subtitle="The present, late, and absent split for today."
          >
            <Box sx={{ height: { xs: 260, md: 340 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => (value > 0 ? `${name} ${value}` : '')}
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </DashboardPanel>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <DashboardPanel
            title="Decision Queue"
            subtitle="The approvals and actions that matter most right now."
          >
            <Stack spacing={1.2}>
              <Box sx={{ p: 1.65, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? alpha('#155eef', 0.10) : '#f8fbff', border: `1px solid ${theme.palette.mode === 'dark' ? alpha('#155eef', 0.22) : 'rgba(21,94,239,0.08)'}` }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 13.2 }}>
                  Pending Leave Reviews
                </Typography>
                <Typography sx={{ mt: 0.45, fontWeight: 800, fontSize: 26, color: '#155eef' }}>
                  {pendingLeaveRequests}
                </Typography>
              </Box>
              <Box sx={{ p: 1.65, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? alpha('#0f766e', 0.10) : '#f8fffb', border: `1px solid ${theme.palette.mode === 'dark' ? alpha('#0f766e', 0.22) : 'rgba(15,118,110,0.08)'}` }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 13.2 }}>
                  Pending Late Requests
                </Typography>
                <Typography sx={{ mt: 0.45, fontWeight: 800, fontSize: 26, color: '#0f766e' }}>
                  {pendingLateRequests}
                </Typography>
              </Box>
              <Box sx={{ p: 1.65, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? alpha('#c2410c', 0.10) : '#fffaf5', border: `1px solid ${theme.palette.mode === 'dark' ? alpha('#c2410c', 0.22) : 'rgba(194,65,12,0.08)'}` }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 13.2 }}>
                  Attendance Watch
                </Typography>
                <Typography sx={{ mt: 0.45, fontWeight: 800, fontSize: 18, color: '#c2410c' }}>
                  {absentCount} absent, {lateCount} late, {presentCount} present
                </Typography>
              </Box>
            </Stack>
          </DashboardPanel>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.8 }}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 900 }}>
            <DashboardPanel
              title="Operational Alerts"
              subtitle="Prioritize what needs attention and route quickly into the right workflow."
            >
              <List disablePadding>
                {alerts.map((alert, index) => (
                  <ListItem
                    key={`${alert.message}-${index}`}
                    disableGutters
                    sx={{
                      py: 1.1,
                      px: 1.35,
                      mb: index < alerts.length - 1 ? 1.1 : 0,
                      borderRadius: 3,
                      borderBottom: 'none',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha('#ffffff', 0.07)
                        : '#f8fbff'
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 42 }}>
                      {alert.severity === 'warning'
                        ? <WarningAmberRounded sx={{ color: '#f59e0b', fontSize: 21 }} />
                        : <InfoRounded sx={{ color: '#155eef', fontSize: 21 }} />}
                    </ListItemAvatar>
                    <ListItemText
                      primary={(
                        <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: 'text.primary' }}>
                          {alert.message}
                        </Typography>
                      )}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: 2.5,
                        fontWeight: 700,
                        flexShrink: 0,
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.mode === 'dark'
                          ? alpha('#ffffff', 0.24)
                          : alpha('#155eef', 0.24),
                        '&:hover': {
                          borderColor: theme.palette.mode === 'dark'
                            ? alpha('#ffffff', 0.4)
                            : alpha('#155eef', 0.42),
                          bgcolor: theme.palette.mode === 'dark'
                            ? alpha('#ffffff', 0.06)
                            : alpha('#155eef', 0.04)
                        }
                      }}
                      onClick={() => alert.actionUrl && navigate(alert.actionUrl)}
                    >
                      {alert.actionLabel || 'View'}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </DashboardPanel>
          </Box>
        </Grid>
      </Grid>

      <DashboardPanel
        title="Daily Focus"
        subtitle={`Inspired by timeless wisdom about diligence, fairness, and steady work. ${dailyQuote.focus}.`}
      >
        <Box
          sx={{
            p: 2.4,
            borderRadius: 3.5,
            background: `linear-gradient(135deg, ${alpha('#155eef', 0.08)} 0%, ${alpha('#0f766e', 0.08)} 100%)`,
            border: '1px solid rgba(21,94,239,0.08)'
          }}
        >
          <Typography sx={{ color: 'text.primary', fontWeight: 800, fontSize: { xs: 18, md: 22 }, lineHeight: 1.6 }}>
            "{dailyQuote.text}"
          </Typography>
        </Box>
      </DashboardPanel>
    </DashboardPage>
  );
};

export default DashboardOverview;
