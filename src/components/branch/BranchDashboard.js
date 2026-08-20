import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Avatar, Menu, MenuItem, Badge, Tooltip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon, Dashboard, People, Schedule, Assignment,
  Payment, Chat, Notifications, Brightness4, Brightness7,
  ExitToApp, EventNote, MyLocation, QrCode2, RemoveCircle,
  AccessTime, AccountBalance,
  Store, AccountCircleOutlined, SettingsOutlined
} from '@mui/icons-material';
import { apiRequest, parseUnreadCount } from '../../utils/api';
import { clearSession, getStoredToken, getStoredUser } from '../../utils/authSession';
import { useSocket } from '../../contexts/SocketContext';
import InstallPWA from '../common/InstallPWA';

const DRAWER_WIDTH = 280;

const NAV_ITEMS = [
  { text: 'Dashboard',      icon: <Dashboard />,   path: '/branch/dashboard',       color: '#42a5f5' },
  { text: 'Employees',      icon: <People />,       path: '/branch/employees',       color: '#66bb6a' },
  { text: 'Scheduling',     icon: <Schedule />,     path: '/branch/scheduling',      color: '#ab47bc' },
  { text: 'Attendance',     icon: <Assignment />,   path: '/branch/attendance',      color: '#ffa726' },
  { text: 'Leave',          icon: <EventNote />,    path: '/branch/leave',           color: '#ef5350' },
  { text: 'Late Requests',  icon: <AccessTime />,   path: '/branch/late-requests',   color: '#f59e0b', badge: 'late' },
  { text: 'Events',         icon: <EventNote />,    path: '/branch/events',          color: '#ff9800' },
  { text: 'Payroll',        icon: <Payment />,      path: '/branch/payroll',         color: '#26a69a' },
  { text: 'Messaging',      icon: <Chat />,         path: '/branch/messaging',       color: '#7c4dff' },
  { text: 'Geofence',       icon: <MyLocation />,   path: '/branch/geofence',        color: '#00acc1' },
  { text: 'Branch QR',      icon: <QrCode2 />,      path: '/branch/branch-qr',       color: '#43a047' },
  { text: 'Late Deductions', icon: <RemoveCircle />,   path: '/branch/late-deductions', color: '#e53935' },
  { text: 'Salary Advances', icon: <AccountBalance />, path: '/branch/salary-advances', color: '#0ea5e9' },
];

const AVATAR_COLORS = ['#1976d2','#388e3c','#d32f2f','#f57c00','#7b1fa2','#0288d1','#c2185b','#00796b'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const PAGE_SUMMARIES = {
  Dashboard: 'Branch operations and attendance priorities',
  Employees: 'People management for this branch',
  Scheduling: 'Shift coverage and coordination',
  Attendance: 'Live branch attendance visibility',
  Leave: 'Leave review for branch staff',
  'Late Requests': 'Late-arrival approvals and follow-up',
  Events: 'Branch event coordination',
  Payroll: 'Branch payroll review workspace',
  Messaging: 'Messages and branch-wide updates',
  Geofence: 'Location settings for attendance rules',
  'Branch QR': 'QR access for branch check-in flow',
  'Late Deductions': 'Deduction policy and branch summaries'
};

const BranchDashboard = ({ toggleDarkMode, darkMode }) => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen]               = useState(false);
  const [anchorEl, setAnchorEl]                   = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { pendingLateCount, setPendingLateCount } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser() || {});

  const handleDrawerToggle = () => setMobileOpen(o => !o);
  const handleMenu  = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => { clearSession(); navigate('/login'); handleClose(); };

  const fetchNotifications = async () => {
    try {
      const token = getStoredToken();
      if (!token) return;
      const data = await apiRequest('/messages/unread-count');
      if (data?.success) setUnreadNotifications(parseUnreadCount(data));
    } catch { setUnreadNotifications(0); }
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    apiRequest('/late-permissions/pending-count')
      .then((data) => {
        if (data?.success) {
          setPendingLateCount(Number(data.count) || 0);
        }
      })
      .catch(() => {});
  }, [setPendingLateCount]);

  useEffect(() => {
    const onNew = () => setUnreadNotifications(prev => prev + 1);
    window.addEventListener('newAnnouncementReceived', onNew);
    window.addEventListener('newMessageReceived', onNew);
    return () => {
      window.removeEventListener('newAnnouncementReceived', onNew);
      window.removeEventListener('newMessageReceived', onNew);
    };
  }, []);

  useEffect(() => {
    const onProfileUpdated = (e) => setUser(e.detail || getStoredUser() || {});
    window.addEventListener('profileUpdated', onProfileUpdated);
    return () => window.removeEventListener('profileUpdated', onProfileUpdated);
  }, []);

  const currentPage = NAV_ITEMS.find(n =>
    location.pathname === n.path || location.pathname.startsWith(n.path + '/')
  )?.text || 'Dashboard';
  const currentSummary = PAGE_SUMMARIES[currentPage] || 'Organized branch operations workspace';
  const topBarColor = darkMode ? alpha('#081120', 0.92) : alpha('#ffffff', 0.92);
  const pageColor = theme.palette.background.default;
  const borderColor = theme.palette.divider;
  const drawerGradient = darkMode
    ? 'linear-gradient(180deg,#071911 0%,#0e2e1e 60%,#113d28 100%)'
    : 'linear-gradient(180deg,#0e2218 0%,#122d20 60%,#163a28 100%)';
  const drawerBorder = darkMode ? 'rgba(148,163,184,0.14)' : 'rgba(255,255,255,0.08)';

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: drawerGradient }}>
      {/* Logo */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${drawerBorder}` }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg,#43a047,#66bb6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Store sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'white', lineHeight: 1.2 }}>AutoPayroll</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>Branch Portal</Typography>
        </Box>
      </Box>

      {/* Nav Items */}
      <List sx={{ flex: 1, px: 1.5, py: 2, overflowY: 'auto', overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.18)', borderRadius: 999 }
      }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link} to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2, py: 1.05,
                  bgcolor: active ? 'rgba(255,255,255,0.16)' : 'transparent',
                  borderLeft: active ? `3px solid ${item.color}` : '3px solid transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.09)' },
                  transition: 'all 0.18s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: active ? item.color : 'rgba(255,255,255,0.68)' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: active ? 700 : 500, color: active ? 'white' : 'rgba(255,255,255,0.88)', fontSize: 13.5 }}
                />
                {item.text === 'Messaging' && unreadNotifications > 0 && (
                  <Box sx={{ bgcolor: '#ef5350', color: 'white', borderRadius: '50%', minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.5 }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700 }}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Typography>
                  </Box>
                )}
                {item.text === 'Late Requests' && pendingLateCount > 0 && (
                  <Box sx={{ bgcolor: '#f59e0b', color: 'white', borderRadius: '50%', minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.5 }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700 }}>{pendingLateCount > 9 ? '9+' : pendingLateCount}</Typography>
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User profile footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${drawerBorder}` }}>
        <Box
          onClick={handleMenu}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' } }}
        >
          <Avatar src={user.avatarUrl || undefined} sx={{ width: 36, height: 36, bgcolor: avatarColor(user.name), fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
            {user.name?.charAt(0)?.toUpperCase() || 'M'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'Manager'}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.42)', fontSize: 10 }}>
              {user.role === 'branch_manager' ? 'Branch Manager' : 'Branch HR'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" elevation={0}
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: topBarColor,
          backdropFilter: 'blur(18px)',
          borderBottom: `1px solid ${borderColor}`,
          color: theme.palette.text.primary
        }}>
        <Toolbar>
          <IconButton edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' }, color: theme.palette.text.secondary }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} sx={{ flexGrow: 1, color: theme.palette.text.primary, lineHeight: 1.1 }}>
              {currentPage}
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: 13, mt: 0.25, display: { xs: 'none', md: 'block' } }}>
              {currentSummary}
            </Typography>
          </Box>

          <InstallPWA sx={{ color: theme.palette.text.secondary }} />

          <Tooltip title="Toggle theme">
            <IconButton onClick={toggleDarkMode} sx={{ color: theme.palette.text.secondary }}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Messages">
            <IconButton onClick={() => navigate('/branch/messaging')} sx={{ color: theme.palette.text.secondary }}>
              <Badge badgeContent={unreadNotifications} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <IconButton onClick={handleMenu} sx={{ ml: 0.5 }}>
            <Avatar key={user.avatarUrl} src={user.avatarUrl || undefined} sx={{ width: 36, height: 36, bgcolor: avatarColor(user.name), fontWeight: 700, fontSize: 15 }}>
              {user.name?.charAt(0)?.toUpperCase() || 'M'}
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } }}>
            <MenuItem onClick={() => { navigate('/branch/profile'); handleClose(); }}>
              <AccountCircleOutlined sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} /> Profile
            </MenuItem>
            <MenuItem onClick={() => { navigate('/branch/settings'); handleClose(); }}>
              <SettingsOutlined sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
              <ExitToApp sx={{ mr: 1.5, fontSize: 18 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' } }}
          open>
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: pageColor,
          color: theme.palette.text.primary,
          backgroundImage: darkMode
            ? 'radial-gradient(circle at top left, rgba(21, 128, 61, 0.16), transparent 18%), linear-gradient(180deg, #08130d 0%, #0f172a 100%)'
            : 'radial-gradient(circle at top left, rgba(21, 128, 61, 0.08), transparent 18%), linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default BranchDashboard;
