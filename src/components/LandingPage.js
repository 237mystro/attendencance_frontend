import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import {
  AccessTimeRounded,
  ArrowForwardRounded,
  AutoGraphRounded,
  BusinessCenterRounded,
  CheckCircleRounded,
  CloseRounded,
  Groups2Rounded,
  LanguageRounded,
  LocationOnRounded,
  MenuRounded,
  PaymentsRounded,
  QrCode2Rounded,
  SecurityRounded,
  TaskAltRounded,
  VerifiedUserRounded
} from '@mui/icons-material';

/* ── Keyframes ─────────────────────────────────────────────────────── */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0);    }
`;

const float = keyframes`
  0%   { transform: translateY(0px);   }
  50%  { transform: translateY(-12px); }
  100% { transform: translateY(0px);   }
`;

const livePulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1);   box-shadow: 0 0 0 0   rgba(74,222,128,0.5); }
  60%       { opacity: 0.7; transform: scale(1.3); box-shadow: 0 0 0 8px rgba(74,222,128,0);   }
`;

const shimmerText = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.92) translateY(28px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
`;

const gradientOrb = keyframes`
  0%   { transform: translate(0,     0)     scale(1);    }
  33%  { transform: translate(40px,  -30px) scale(1.08); }
  66%  { transform: translate(-20px, 20px)  scale(0.96); }
  100% { transform: translate(0,     0)     scale(1);    }
`;

/* ── Counter hook ───────────────────────────────────────────────────── */
const useCountUp = (target, duration = 1600, delay = 0) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let frame = 0;
      const total = Math.round(duration / 16);
      const timer = setInterval(() => {
        frame++;
        const t = frame / total;
        const eased = 1 - Math.pow(1 - t, 3);
        setCount(Math.round(eased * target));
        if (frame >= total) { setCount(target); clearInterval(timer); }
      }, 16);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return count;
};

/* ── Static data ────────────────────────────────────────────────────── */
const trustPoints = [
  'Business-grade access control',
  'Real-time attendance visibility',
  'Payroll built for African teams'
];

const stats = [
  { value: '500+',   label: 'Businesses modernizing payroll' },
  { value: '12,000+', label: 'Employees managed across teams' },
  { value: 'XAF 2B+', label: 'Payroll value processed with confidence' },
  { value: '99.9%',  label: 'Operational uptime for daily workflows' }
];

const featureCards = [
  { icon: <QrCode2Rounded sx={{ fontSize: 28 }} />,      title: 'Attendance with proof',           description: 'Geo-aware QR check-ins create a dependable attendance stream that managers can trust in real time.', accent: '#155eef', tone: 'rgba(21,94,239,0.12)' },
  { icon: <PaymentsRounded sx={{ fontSize: 28 }} />,     title: 'Payroll that moves faster',        description: 'Turn attendance, shifts, and deduction rules into polished payroll runs with less spreadsheet work.',  accent: '#0f766e', tone: 'rgba(15,118,110,0.12)' },
  { icon: <Groups2Rounded sx={{ fontSize: 28 }} />,      title: 'One workspace for every role',     description: 'Admins, HR teams, branch operators, and employees each get a focused experience inside the same platform.', accent: '#b45309', tone: 'rgba(180,83,9,0.12)' },
  { icon: <LocationOnRounded sx={{ fontSize: 28 }} />,   title: 'Geofence-aware operations',        description: 'Define check-in boundaries and location logic to keep field teams and onsite staff accountable.',      accent: '#7c3aed', tone: 'rgba(124,58,237,0.12)' },
  { icon: <AutoGraphRounded sx={{ fontSize: 28 }} />,    title: 'Decisions backed by live data',    description: 'See staffing patterns, attendance trends, payout readiness, and deduction impact from one executive view.', accent: '#0891b2', tone: 'rgba(8,145,178,0.12)' },
  { icon: <SecurityRounded sx={{ fontSize: 28 }} />,     title: 'Designed for professional trust',  description: 'Secure access, role-based permissions, and a clean audit-friendly workflow support business-critical use.', accent: '#dc2626', tone: 'rgba(220,38,38,0.12)' }
];

const operatingLayers = [
  {
    title: 'For administrators', eyebrow: 'Leadership view',
    description: 'Oversee payroll readiness, attendance, staff setup, announcements, and business controls from one elevated workspace.',
    bullets: ['Payroll approvals', 'Branch oversight', 'Company settings', 'Executive reporting']
  },
  {
    title: 'For branch and HR teams', eyebrow: 'Operational view',
    description: 'Run local attendance, shift coordination, and employee actions without depending on fragmented tools.',
    bullets: ['Attendance dashboards', 'Shift scheduling', 'Leave and late requests', 'Local employee actions']
  },
  {
    title: 'For employees', eyebrow: 'Daily experience',
    description: 'Give staff a more modern experience for check-ins, schedules, requests, payments, and communication.',
    bullets: ['QR check-in', 'My schedule', 'Leave requests', 'Payment visibility']
  }
];

const rolloutSteps = [
  { label: '01', title: 'Create your workspace',      description: 'Set up your company account and establish the command center for payroll and attendance operations.' },
  { label: '02', title: 'Bring your team in',          description: 'Add employees, define roles, configure locations, and organize schedules without heavy onboarding friction.' },
  { label: '03', title: 'Run payroll with confidence', description: 'Turn check-ins and shift activity into payroll-ready data and complete pay runs with better clarity.' }
];

const securityItems = [
  'Role-based access for admins, branches, HR, and employees',
  'Location-aware QR attendance controls',
  'Clear operational history for approvals and payroll actions'
];

const weeklyBars = [
  ['Monday', 92], ['Tuesday', 95], ['Wednesday', 90], ['Thursday', 97], ['Friday', 94]
];

const valueTiles = [
  { label: 'Attendance stream',    value: 'Live sync',              icon: <QrCode2Rounded sx={{ color: '#155eef', fontSize: 22 }} /> },
  { label: 'Payroll processing',   value: 'Automated rules',        icon: <PaymentsRounded sx={{ color: '#0f766e', fontSize: 22 }} /> },
  { label: 'Team communication',   value: 'Announcements + chat',   icon: <LanguageRounded sx={{ color: '#b45309', fontSize: 22 }} /> },
  { label: 'Executive controls',   value: 'Permissions + oversight', icon: <BusinessCenterRounded sx={{ color: '#7c3aed', fontSize: 22 }} /> }
];

/* ── Section heading ────────────────────────────────────────────────── */
const SectionHeading = ({ eyebrow, title, description }) => (
  <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
    <Chip label={eyebrow} sx={{ mb: 2, px: 0.5, bgcolor: '#e8f0ff', color: '#155eef', fontWeight: 800, letterSpacing: 0.2 }} />
    <Typography variant="h3" sx={{ color: '#08172f', fontWeight: 800, letterSpacing: '-0.04em', fontSize: { xs: '2rem', md: '3rem' }, maxWidth: 760, mx: 'auto' }}>
      {title}
    </Typography>
    <Typography sx={{ color: '#5b6b82', lineHeight: 1.8, fontSize: { xs: 15, md: 17 }, maxWidth: 640, mx: 'auto', mt: 2 }}>
      {description}
    </Typography>
  </Box>
);

/* ── Nav links ──────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Why AutoPayroll', href: '#features' },
  { label: 'Who It Serves',   href: '#personas' },
  { label: 'Security',        href: '#security'  }
];

/* ═══════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [barsVisible,   setBarsVisible]   = useState(false);

  const empCount     = useCountUp(248, 1600, 900);
  const presentCount = useCountUp(231, 1600, 1050);
  const pendingCount = useCountUp(12,  1000, 800);

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 1300);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box sx={{ bgcolor: '#f5f8fe', color: '#08172f' }}>

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        PaperProps={{ sx: { width: 280, bgcolor: '#08172f', p: 2 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: 18 }}>AutoPayroll</Typography>
          <IconButton onClick={() => setMobileNavOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <CloseRounded />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1 }} />
        <List disablePadding>
          {NAV_LINKS.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton component="a" href={item.href} onClick={() => setMobileNavOpen(false)}
                sx={{ borderRadius: 2, py: 1.1, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                <ListItemText primary={item.label} primaryTypographyProps={{ color: '#e2e8f0', fontWeight: 700 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button component={Link} to="/login" fullWidth onClick={() => setMobileNavOpen(false)}
            sx={{ color: '#ffffff', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, py: 1.1 }}>
            Sign Ihtytn
          </Button>
          <Button component={Link} to="/register" fullWidth variant="contained" endIcon={<ArrowForwardRounded />}
            onClick={() => setMobileNavOpen(false)}
            sx={{ borderRadius: 999, fontWeight: 800, py: 1.1, background: 'linear-gradient(135deg, #0e2144 0%, #155eef 100%)' }}>
            Start Free
          </Button>
        </Box>
      </Drawer>

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <AppBar position="sticky" elevation={0}
        sx={{ bgcolor: 'rgba(245,248,254,0.72)', borderBottom: '1px solid rgba(8,23,47,0.08)', backdropFilter: 'blur(18px)' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 1.1, gap: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #08172f 0%, #155eef 100%)', boxShadow: '0 18px 36px rgba(21,94,239,0.18)' }}>
                <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: 18 }}>AP</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 19, color: '#0f172a' }}>AutoPayroll</Typography>
                <Typography sx={{ color: '#64748b', fontSize: 12.5, display: { xs: 'none', sm: 'block' } }}>
                  Workforce operations for ambitious businesses
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {NAV_LINKS.map((item) => (
                <Button key={item.label} component="a" href={item.href}
                  sx={{ color: '#516176', fontWeight: 700, px: 1.25, py: 0.8 }}>
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Button component={Link} to="/login" sx={{ color: '#0f274f', fontWeight: 700, display: { xs: 'none', sm: 'inline-flex' } }}>
              Sign In
            </Button>
            <Button component={Link} to="/register" variant="contained" endIcon={<ArrowForwardRounded />}
              sx={{ px: 2.4, py: 1.05, borderRadius: 999, fontWeight: 800, display: { xs: 'none', sm: 'inline-flex' },
                background: 'linear-gradient(135deg, #0e2144 0%, #155eef 100%)', boxShadow: '0 18px 36px rgba(21,94,239,0.22)' }}>
              Start Free
            </Button>

            <Button component={Link} to="/login"
              sx={{ color: '#0f274f', fontWeight: 700, display: { xs: 'inline-flex', sm: 'none' }, minWidth: 'auto', px: 1.2 }}>
              Sign In
            </Button>
            <IconButton onClick={() => setMobileNavOpen(true)} sx={{ display: { xs: 'flex', md: 'none' }, color: '#0f274f' }}>
              <MenuRounded />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ══════════════════════════════════════════════════════════════
          HERO  — fully centered, dynamic
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{
        position: 'relative', overflow: 'hidden',
        pt: { xs: 9, md: 13 }, pb: { xs: 10, md: 15 },
        background: `
          radial-gradient(ellipse 80% 55% at 50% -5%, rgba(21,94,239,0.18), transparent),
          radial-gradient(circle at 12% 70%, rgba(15,118,110,0.12), transparent 40%),
          radial-gradient(circle at 88% 70%, rgba(124,58,237,0.10), transparent 40%),
          linear-gradient(180deg, #f7faff 0%, #edf2fd 100%)
        `
      }}>
        {/* Animated grid */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: `
            linear-gradient(rgba(8,23,47,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(8,23,47,0.035) 1px, transparent 1px)
          `,
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0.9) 0%, transparent 100%)'
        }} />

        {/* Floating orbs */}
        <Box sx={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(21,94,239,0.10) 0%, transparent 70%)',
          top: -120, left: -100,
          animation: `${gradientOrb} 14s ease-in-out infinite`
        }} />
        <Box sx={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 70%)',
          bottom: -80, right: -80,
          animation: `${gradientOrb} 18s ease-in-out infinite reverse`
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>

          {/* ── Centered text block ─────────────────────────────── */}
          <Box sx={{ textAlign: 'center', maxWidth: 860, mx: 'auto' }}>
            <Chip
              label="The payroll operating system for modern African businesses"
              sx={{
                mb: 3.5, px: 1.5,
                bgcolor: alpha('#155eef', 0.08), color: '#155eef',
                fontWeight: 800, fontSize: 13, letterSpacing: 0.1,
                border: '1px solid rgba(21,94,239,0.15)',
                animation: `${fadeInUp} 0.65s 0s ease both`
              }}
            />

            <Typography variant="h1" sx={{
              animation: `${fadeInUp} 0.7s 0.1s ease both`,
              color: '#08172f', fontWeight: 800,
              letterSpacing: '-0.055em', lineHeight: 0.95,
              fontSize: { xs: '2.6rem', sm: '3.6rem', md: '5.2rem' }
            }}>
              Make payroll feel as{' '}
              <Box component="span" sx={{
                background: 'linear-gradient(135deg, #155eef 0%, #0891b2 45%, #0f766e 100%)',
                backgroundSize: '200% auto',
                animation: `${shimmerText} 3.5s linear infinite`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                premium
              </Box>{' '}
              as the business you are building.
            </Typography>

            <Typography sx={{
              animation: `${fadeInUp} 0.7s 0.2s ease both`,
              mt: 3.5, color: '#5b6b82',
              fontSize: { xs: 16, md: 19 }, lineHeight: 1.85,
              maxWidth: 680, mx: 'auto'
            }}>
              AutoPayroll unifies attendance, scheduling, deductions, employee coordination,
              and mobile-ready payroll workflows into one polished business workspace.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center"
              sx={{ mt: 4.5, animation: `${fadeInUp} 0.7s 0.3s ease both` }}>
              <Button component={Link} to="/register" variant="contained" size="large" endIcon={<ArrowForwardRounded />}
                sx={{
                  px: 3.8, py: 1.6, borderRadius: 999, fontWeight: 800, fontSize: 15.5,
                  background: 'linear-gradient(135deg, #0e2144 0%, #155eef 100%)',
                  boxShadow: '0 22px 44px rgba(21,94,239,0.28)',
                  transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 32px 56px rgba(21,94,239,0.36)' }
                }}>
                Build Your Workspace
              </Button>
              <Button component={Link} to="/login" size="large"
                sx={{
                  px: 3.4, py: 1.6, borderRadius: 999, fontWeight: 800,
                  color: '#0f274f', bgcolor: '#ffffff',
                  border: '1px solid rgba(15,39,79,0.10)',
                  boxShadow: '0 14px 28px rgba(8,23,47,0.08)',
                  transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 22px 40px rgba(8,23,47,0.12)' }
                }}>
                Access Existing Account
              </Button>
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap justifyContent="center"
              sx={{ mt: 3.5, animation: `${fadeInUp} 0.7s 0.4s ease both` }}>
              {trustPoints.map((item) => (
                <Stack key={item} direction="row" spacing={0.8} alignItems="center">
                  <CheckCircleRounded sx={{ color: '#16a34a', fontSize: 18 }} />
                  <Typography sx={{ color: '#4b5c74', fontSize: 14, fontWeight: 600 }}>{item}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* ── Centered dashboard card ──────────────────────────── */}
          <Box sx={{
            mt: { xs: 7, md: 9 },
            maxWidth: 860, mx: 'auto',
            position: 'relative',
            animation: `${scaleIn} 0.85s 0.55s ease both`
          }}>
            {/* Dark panel */}
            <Box sx={{
              position: 'relative', p: { xs: 2.5, md: 3.2 }, borderRadius: 7,
              bgcolor: 'rgba(7,18,42,0.97)',
              boxShadow: '0 60px 120px rgba(8,23,47,0.28), 0 0 0 1px rgba(255,255,255,0.05)',
              overflow: 'hidden'
            }}>
              {/* Inner glow */}
              <Box sx={{
                position: 'absolute', inset: 0,
                background: `
                  radial-gradient(circle at 85% 0%,   rgba(59,130,246,0.26), transparent 42%),
                  radial-gradient(circle at 15% 100%, rgba(20,184,166,0.18), transparent 40%)
                `
              }} />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* Card header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.8 }}>
                  <Box>
                    <Typography sx={{ color: '#e2e8f0', fontWeight: 800, fontSize: 17 }}>Operations Snapshot</Typography>
                    <Typography sx={{ color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>
                      {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </Typography>
                  </Box>
                  <Chip
                    icon={
                      <Box sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: '#4ade80',
                        animation: `${livePulse} 1.8s ease-in-out infinite`,
                        ml: '6px !important'
                      }} />
                    }
                    label="Payroll ready"
                    sx={{ bgcolor: 'rgba(74,222,128,0.10)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', fontWeight: 700 }}
                  />
                </Stack>

                {/* Stat tiles */}
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Employees',      value: empCount,     accent: '#93c5fd' },
                    { label: 'Present Today',   value: presentCount, accent: '#6ee7b7' },
                    { label: 'Pending Actions', value: pendingCount, accent: '#fde68a' }
                  ].map((item) => (
                    <Grid item xs={4} key={item.label}>
                      <Box sx={{ p: { xs: 1.4, md: 1.8 }, borderRadius: 3.5,
                        bgcolor: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography sx={{ color: item.accent, fontWeight: 800, fontSize: { xs: 22, md: 28 } }}>
                          {item.value}
                        </Typography>
                        <Typography sx={{ color: 'rgba(226,232,240,0.62)', fontSize: 12.5, lineHeight: 1.4 }}>
                          {item.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Weekly attendance bars */}
                <Box sx={{ mt: 2.4, p: { xs: 1.8, md: 2.2 }, borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.6 }}>
                    <Typography sx={{ color: '#ffffff', fontWeight: 700 }}>Weekly attendance consistency</Typography>
                    <Typography sx={{ color: '#93c5fd', fontWeight: 800 }}>94%</Typography>
                  </Stack>
                  {weeklyBars.map(([day, pct]) => (
                    <Box key={day} sx={{ mb: 1.1 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography sx={{ color: 'rgba(226,232,240,0.7)', fontSize: 12.5 }}>{day}</Typography>
                        <Typography sx={{ color: 'rgba(226,232,240,0.7)', fontSize: 12.5 }}>{pct}%</Typography>
                      </Stack>
                      <Box sx={{ height: 7, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                        <Box sx={{
                          width: barsVisible ? `${pct}%` : '0%',
                          height: '100%', borderRadius: 999,
                          background: 'linear-gradient(90deg, #38bdf8 0%, #155eef 100%)',
                          transition: `width 1.2s cubic-bezier(0.22,1,0.36,1) ${weeklyBars.findIndex(([d]) => d === day) * 80}ms`
                        }} />
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Payroll summary row */}
                <Box sx={{ mt: 2.4, p: { xs: 1.8, md: 2.2 }, borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Stack direction="row" spacing={1.4} alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: 'rgba(253,230,138,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <PaymentsRounded sx={{ color: '#fde68a', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ color: '#ffffff', fontWeight: 700 }}>Monthly payroll prepared</Typography>
                      <Typography sx={{ color: 'rgba(226,232,240,0.65)', fontSize: 13 }}>
                        248 staff records validated and ready for payout review.
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: { xs: 17, md: 20 }, flexShrink: 0 }}>
                      XAF 18.4M
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Box>

            {/* Floating badge — top right */}
            <Card sx={{
              position: 'absolute',
              top: { xs: -20, md: -30 }, right: { xs: 10, md: -24 },
              width: { xs: 178, md: 210 }, borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.94)',
              boxShadow: '0 24px 48px rgba(8,23,47,0.16)',
              animation: `${float} 5.8s ease-in-out infinite`,
              display: { xs: 'none', sm: 'block' }
            }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TaskAltRounded sx={{ color: '#16a34a', fontSize: 18 }} />
                  <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: 13.5 }}>Approval queue</Typography>
                </Stack>
                <Typography sx={{ color: '#08172f', fontWeight: 800, fontSize: 28, mt: 1 }}>12</Typography>
                <Typography sx={{ color: '#64748b', fontSize: 13, lineHeight: 1.55 }}>
                  Late requests, leave items, and payroll actions requiring review.
                </Typography>
              </CardContent>
            </Card>

            {/* Floating badge — bottom left */}
            <Card sx={{
              position: 'absolute',
              left: { xs: 8, md: -26 }, bottom: { xs: 14, md: 32 },
              width: { xs: 200, md: 248 }, borderRadius: 4,
              bgcolor: '#ffffff',
              boxShadow: '0 24px 48px rgba(8,23,47,0.14)',
              animation: `${float} 6.5s ease-in-out infinite`,
              display: { xs: 'none', sm: 'block' }
            }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <AccessTimeRounded sx={{ color: '#155eef', fontSize: 18 }} />
                  <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: 13.5 }}>Payroll momentum</Typography>
                </Stack>
                {[
                  ['Attendance sync',   'Complete', '#0f172a'],
                  ['Salary validation', 'In review', '#0f172a'],
                  ['Payout readiness',  '96%',       '#16a34a']
                ].map(([label, val, color]) => (
                  <Stack key={label} direction="row" justifyContent="space-between" sx={{ mb: 0.45 }}>
                    <Typography sx={{ color: '#64748b', fontSize: 13 }}>{label}</Typography>
                    <Typography sx={{ color, fontWeight: 700, fontSize: 13 }}>{val}</Typography>
                  </Stack>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 4.5, md: 5.5 }, borderTop: '1px solid rgba(8,23,47,0.06)', borderBottom: '1px solid rgba(8,23,47,0.06)', bgcolor: '#ffffff' }}>
        <Container maxWidth="xl">
          <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
            <Grid container spacing={0}>
              {stats.map((item, index) => (
                <Grid item xs={12} sm={6} lg={3} key={item.label}>
                  <Box sx={{
                    px: { xs: 0, sm: 2.5 }, py: 2.2,
                    textAlign: { xs: 'left', sm: 'center' },
                    borderRight: { lg: index < stats.length - 1 ? '1px solid rgba(8,23,47,0.08)' : 'none' }
                  }}>
                    <Typography sx={{ color: '#08172f', fontWeight: 800, fontSize: { xs: 30, md: 38 } }}>{item.value}</Typography>
                    <Typography sx={{ color: '#64748b', fontSize: 14.2, lineHeight: 1.6, maxWidth: 240, mx: { sm: 'auto' } }}>{item.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* ── Features ──────────────────────────────────────────────── */}
      <Container id="features" maxWidth="xl" sx={{ py: { xs: 8, md: 11 } }}>
        <SectionHeading
          eyebrow="Why AutoPayroll"
          title="Built to make business operations feel calmer, faster, and more credible."
          description="Every major workflow from attendance to payroll approval is designed to reduce manual effort while raising the quality of your operational experience."
        />
        <Grid container spacing={2.6} justifyContent="center" sx={{ maxWidth: 1180, mx: 'auto' }}>
          {featureCards.map((feature) => (
            <Grid item xs={12} sm={6} lg={4} key={feature.title} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card sx={{
                width: '100%', maxWidth: 360, height: '100%', borderRadius: 5,
                border: '1px solid rgba(8,23,47,0.08)', boxShadow: '0 18px 42px rgba(8,23,47,0.06)',
                transition: 'transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease',
                '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 26px 56px rgba(8,23,47,0.12)', borderColor: alpha(feature.accent, 0.2) }
              }}>
                <CardContent sx={{ p: 3.2 }}>
                  <Box sx={{ width: 58, height: 58, borderRadius: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.accent, bgcolor: feature.tone }}>
                    {feature.icon}
                  </Box>
                  <Typography sx={{ mt: 2.2, color: '#08172f', fontWeight: 800, fontSize: 22 }}>{feature.title}</Typography>
                  <Typography sx={{ mt: 1.15, color: '#64748b', fontSize: 15, lineHeight: 1.8 }}>{feature.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ══════════════════════════════════════════════════════════════
          BUSINESS VALUE — centralized
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 11 }, bgcolor: '#ffffff' }}>
        <Container maxWidth="xl">
          <SectionHeading
            eyebrow="Business Value"
            title="A single operating rhythm for payroll, attendance, and team coordination."
            description="When time tracking, deductions, approvals, communication, and pay runs live together, your business gains speed without sacrificing discipline."
          />

          {/* Benefit bullets — centered */}
          <Stack spacing={1.4} sx={{ maxWidth: 620, mx: 'auto', mb: 6, alignItems: 'center' }}>
            {[
              'Reduce manual payroll preparation and attendance disputes.',
              'Give leadership a clearer view of workforce readiness.',
              'Create a more professional employee experience from onboarding to payday.'
            ].map((item) => (
              <Stack key={item} direction="row" spacing={1.2} alignItems="flex-start">
                <VerifiedUserRounded sx={{ color: '#155eef', fontSize: 20, mt: 0.15, flexShrink: 0 }} />
                <Typography sx={{ color: '#475569', lineHeight: 1.7 }}>{item}</Typography>
              </Stack>
            ))}
          </Stack>

          {/* Value tiles grid — centered */}
          <Grid container spacing={2.4} justifyContent="center" sx={{ maxWidth: 780, mx: 'auto' }}>
            {valueTiles.map((item) => (
              <Grid item xs={12} sm={6} key={item.label}>
                <Box sx={{
                  height: '100%', p: 3, borderRadius: 4.5,
                  bgcolor: '#f8fbff', border: '1px solid rgba(8,23,47,0.08)',
                  boxShadow: '0 12px 32px rgba(8,23,47,0.06)',
                  transition: 'transform 0.24s ease, box-shadow 0.24s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 44px rgba(8,23,47,0.10)' }
                }}>
                  <Stack direction="row" spacing={1.8} alignItems="center">
                    <Box sx={{ width: 50, height: 50, borderRadius: 3, bgcolor: '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#64748b', fontSize: 12.5, mb: 0.2 }}>{item.label}</Typography>
                      <Typography sx={{ color: '#08172f', fontWeight: 800, fontSize: 20 }}>{item.value}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Personas ──────────────────────────────────────────────── */}
      <Container id="personas" maxWidth="xl" sx={{ py: { xs: 8, md: 11 } }}>
        <SectionHeading
          eyebrow="Who It Serves"
          title="A refined experience for every actor in the payroll cycle."
          description="The platform keeps leadership, operators, and employees aligned while still giving each role the right level of control."
        />
        <Grid container spacing={2.6} justifyContent="center" sx={{ maxWidth: 1180, mx: 'auto' }}>
          {operatingLayers.map((layer, index) => (
            <Grid item xs={12} lg={4} key={layer.title} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card sx={{
                width: '100%', maxWidth: 360, height: '100%', borderRadius: 5,
                bgcolor: index === 1 ? '#08172f' : '#ffffff',
                color: index === 1 ? '#ffffff' : '#08172f',
                border: index === 1 ? '1px solid rgba(8,23,47,0.1)' : '1px solid rgba(8,23,47,0.08)',
                boxShadow: '0 22px 46px rgba(8,23,47,0.08)'
              }}>
                <CardContent sx={{ p: 3.2 }}>
                  <Typography sx={{ color: index === 1 ? '#7dd3fc' : '#155eef', fontWeight: 800, fontSize: 13 }}>{layer.eyebrow}</Typography>
                  <Typography sx={{ mt: 1.1, fontWeight: 800, fontSize: 25, letterSpacing: '-0.03em' }}>{layer.title}</Typography>
                  <Typography sx={{ mt: 1.2, color: index === 1 ? 'rgba(226,232,240,0.78)' : '#64748b', lineHeight: 1.8, fontSize: 15 }}>
                    {layer.description}
                  </Typography>
                  <Divider sx={{ my: 2.2, borderColor: index === 1 ? 'rgba(255,255,255,0.08)' : 'rgba(8,23,47,0.08)' }} />
                  <Stack spacing={1.15}>
                    {layer.bullets.map((bullet) => (
                      <Stack key={bullet} direction="row" spacing={1} alignItems="center">
                        <CheckCircleRounded sx={{ color: index === 1 ? '#67e8f9' : '#155eef', fontSize: 18 }} />
                        <Typography sx={{ color: index === 1 ? '#e2e8f0' : '#334155', fontWeight: 600 }}>{bullet}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── Security + Rollout ────────────────────────────────────── */}
      <Box id="security" sx={{ py: { xs: 8, md: 11 }, bgcolor: '#ffffff' }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 5, md: 7 }} sx={{ maxWidth: 1180, mx: 'auto' }}>
            <Grid item xs={12} lg={5}>
              <Chip label="Security + Rollout" sx={{ mb: 2, bgcolor: '#fff7ed', color: '#b45309', fontWeight: 800 }} />
              <Typography variant="h3" sx={{ color: '#08172f', fontWeight: 800, letterSpacing: '-0.04em', fontSize: { xs: '2rem', md: '3rem' } }}>
                Professional enough for business leadership, simple enough for teams to adopt quickly.
              </Typography>
              <Typography sx={{ mt: 2, color: '#5b6b82', lineHeight: 1.85, fontSize: 16 }}>
                AutoPayroll is shaped to support real operational discipline while still feeling approachable during onboarding and daily use.
              </Typography>
              <Stack spacing={1.3} sx={{ mt: 3.4 }}>
                {securityItems.map((item) => (
                  <Stack key={item} direction="row" spacing={1.1} alignItems="flex-start">
                    <SecurityRounded sx={{ color: '#155eef', fontSize: 20, mt: 0.1, flexShrink: 0 }} />
                    <Typography sx={{ color: '#475569', lineHeight: 1.7 }}>{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} lg={7}>
              <Grid container spacing={2.2} justifyContent="center">
                {rolloutSteps.map((step) => (
                  <Grid item xs={12} md={4} key={step.label} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{ width: '100%', maxWidth: 360, height: '100%', borderRadius: 5, border: '1px solid rgba(8,23,47,0.08)', boxShadow: '0 18px 40px rgba(8,23,47,0.07)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 54, height: 54, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'linear-gradient(135deg, #0e2144 0%, #155eef 100%)', color: '#ffffff', fontWeight: 800, fontSize: 18 }}>
                          {step.label}
                        </Box>
                        <Typography sx={{ mt: 2, color: '#08172f', fontWeight: 800, fontSize: 21 }}>{step.title}</Typography>
                        <Typography sx={{ mt: 1.1, color: '#64748b', lineHeight: 1.8, fontSize: 14.5 }}>{step.description}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 10 }, background: 'linear-gradient(135deg, #071426 0%, #0e2144 42%, #155eef 100%)' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Chip label="Ready to elevate operations?" sx={{ color: '#ffffff', bgcolor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.12)' }} />
          <Typography variant="h3" sx={{ mt: 2.2, color: '#ffffff', fontWeight: 800, letterSpacing: '-0.04em', fontSize: { xs: '2rem', md: '3rem' } }}>
            Bring your payroll and workforce experience up to modern business standards.
          </Typography>
          <Typography sx={{ mt: 2, color: 'rgba(226,232,240,0.78)', lineHeight: 1.8, fontSize: { xs: 15, md: 17 } }}>
            Create your workspace today and give your team a more polished, dependable system for attendance, payroll, and daily operations.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mt: 4 }}>
            <Button component={Link} to="/register" variant="contained" size="large" endIcon={<ArrowForwardRounded />}
              sx={{ px: 3.8, py: 1.5, borderRadius: 999, fontWeight: 800, color: '#0e2144', bgcolor: '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.18)' }}>
              Create Business Account
            </Button>
            <Button component={Link} to="/login" size="large"
              sx={{ px: 3.2, py: 1.5, borderRadius: 999, fontWeight: 800, color: '#ffffff', border: '1px solid rgba(255,255,255,0.22)', bgcolor: 'rgba(255,255,255,0.08)' }}>
              Sign In
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <Box sx={{ py: 4.2, bgcolor: '#06101f' }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 38, height: 38, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #0e2144 0%, #155eef 100%)' }}>
                <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: 16 }}>AP</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: 17 }}>AutoPayroll</Typography>
                <Typography sx={{ color: 'rgba(226,232,240,0.54)', fontSize: 12.5 }}>Built for serious business operations</Typography>
              </Box>
            </Stack>
            <Typography sx={{ color: 'rgba(226,232,240,0.5)', fontSize: 13.5 }}>
              © {new Date().getFullYear()} AutoPayroll. Payroll and workforce operations, reimagined for modern teams.
            </Typography>
          </Stack>
        </Container>
      </Box>

    </Box>
  );
};

export default LandingPage;
