import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { AutoAwesomeRounded } from '@mui/icons-material';

const GENERAL_QUOTES = [
  {
    focus: 'Steady Progress',
    text: 'Good work is rarely rushed. Quiet consistency builds results people can trust.'
  },
  {
    focus: 'Wise Leadership',
    text: 'Lead with clarity, act with fairness, and let your work speak before your words do.'
  },
  {
    focus: 'Teamwork',
    text: 'Strong teams move farther when each person carries their part with care.'
  },
  {
    focus: 'Discipline',
    text: 'Order creates room for excellence. Small habits shape dependable outcomes.'
  },
  {
    focus: 'Integrity',
    text: 'The most lasting systems are built on honesty, patience, and thoughtful decisions.'
  },
  {
    focus: 'Focus',
    text: 'Do the next right task well. Momentum grows from faithful attention to what matters.'
  },
  {
    focus: 'Service',
    text: 'Work gains meaning when it helps people move through the day with more peace and dignity.'
  }
];

const ROLE_QUOTES = {
  leader: [
    {
      focus: 'Clarity',
      text: 'When priorities are clear, teams spend less energy guessing and more energy delivering.'
    },
    {
      focus: 'Stewardship',
      text: 'Strong leadership is shown in the care given to people, process, and the details that sustain both.'
    },
    {
      focus: 'Judgment',
      text: 'Wise decisions rarely shout. They bring calm, direction, and a clearer next step.'
    },
    {
      focus: 'Responsibility',
      text: 'Good leaders make the work lighter for others by bringing order where confusion used to live.'
    }
  ],
  employee: [
    {
      focus: 'Consistency',
      text: 'A good day of work often begins with showing up well and doing the small things with care.'
    },
    {
      focus: 'Reliability',
      text: 'Trust is built little by little, through steady effort and work others can count on.'
    },
    {
      focus: 'Craft',
      text: 'Every task done thoughtfully adds value, even when it seems ordinary at first.'
    },
    {
      focus: 'Discipline',
      text: 'Progress grows when attention stays on what matters most, one faithful step at a time.'
    }
  ],
  branch: [
    {
      focus: 'Order',
      text: 'Well-run branches thrive when each action supports the whole team, not just the moment.'
    },
    {
      focus: 'Follow-through',
      text: 'Operations become dependable when important tasks are finished with care, not left half-done.'
    },
    {
      focus: 'Coordination',
      text: 'Teams work best when timing, communication, and responsibility move together.'
    },
    {
      focus: 'Readiness',
      text: 'Prepared teams handle pressure better because they have already built good habits in quieter moments.'
    }
  ]
};

const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
};

export const getDailyWorkQuote = (role = 'general', date = new Date()) => {
  const pool = ROLE_QUOTES[role] || GENERAL_QUOTES;
  const index = getDayOfYear(date) % pool.length;
  return pool[index];
};

export const DashboardPage = ({ children }) => (
  <Box sx={{ p: { xs: 2, md: 3 } }}>
    <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
      {children}
    </Box>
  </Box>
);

export const DashboardHero = ({
  eyebrow,
  title,
  subtitle,
  chips = [],
  actions,
  quote,
  gradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)',
  sx
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 5,
        p: { xs: 2.5, md: 3.5 },
        mb: 3,
        color: '#ffffff',
        background: gradient,
        boxShadow: '0 20px 44px rgba(15, 23, 42, 0.18)',
        ...sx
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 35%),
            radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.1) 0%, transparent 35%),
            radial-gradient(circle at 100% 100%, rgba(29, 78, 216, 0.15) 0%, transparent 35%),
            radial-gradient(circle at 0% 100%, rgba(30, 64, 175, 0.1) 0%, transparent 35%)
          `,
          pointerEvents: 'none'
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: quote ? 'minmax(0, 1.6fr) minmax(280px, 0.9fr)' : '1fr' },
          gap: 2.5,
          alignItems: 'stretch'
        }}
      >
        <Box>
          {eyebrow ? (
            <Chip
              label={eyebrow}
              sx={{
                mb: 1.5,
                color: '#ffffff',
                bgcolor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.14)',
                fontWeight: 700
              }}
            />
          ) : null}

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              maxWidth: 760
            }}
          >
            {title}
          </Typography>

          {subtitle ? (
            <Typography
              sx={{
                mt: 1.15,
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 500,
                lineHeight: 1.75,
                maxWidth: 760,
                fontSize: 15.5
              }}
            >
              {subtitle}
            </Typography>
          ) : null}

          {chips.length ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2.1 }}>
              {chips.map((chip) => (
                <Chip
                  key={chip}
                  label={chip}
                  sx={{
                    color: '#ffffff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontWeight: 600,
                    backdropFilter: 'blur(4px)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                />
              ))}
            </Stack>
          ) : null}

          {actions ? (
            <Box sx={{ mt: 2.4 }}>
              {actions}
            </Box>
          ) : null}
        </Box>

        {quote ? (
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: 'none',
              backdropFilter: 'blur(20px)'
            }}
          >
            <CardContent sx={{ p: 2.4 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.35 }}>
                <AutoAwesomeRounded sx={{ color: '#bfdbfe', fontSize: 18 }} />
                <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: 14.5 }}>
                  Daily Focus
                </Typography>
                <Chip
                  label={quote.focus}
                  size="small"
                  sx={{
                    ml: 'auto',
                    color: '#dbeafe',
                    bgcolor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)'
                  }}
                />
              </Stack>
              <Typography
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  lineHeight: 1.65,
                  fontSize: 16
                }}
              >
                "{quote.text}"
              </Typography>
              <Typography
                sx={{
                  mt: 1.15,
                  color: alpha(theme.palette.common.white, 0.74),
                  fontSize: 13.5,
                  lineHeight: 1.6
                }}
              >
                Inspired by timeless wisdom about diligence, fairness, and steady work.
              </Typography>
            </CardContent>
          </Card>
        ) : null}
      </Box>
    </Box>
  );
};

export const DashboardPanel = ({ title, subtitle, action, children, sx, contentSx }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 14px 34px rgba(2, 6, 23, 0.28)'
          : '0 16px 36px rgba(15, 23, 42, 0.07)',
        backgroundImage: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.2),
          transform: 'translateY(-2px)',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)'
        },
        ...sx
      }}
    >
      <CardContent sx={{ p: 3, ...contentSx }}>
        {(title || subtitle || action) ? (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 2.25 }}
          >
            <Box>
              {title ? (
                <Typography sx={{ fontWeight: 800, fontSize: 19, color: 'text.primary' }}>
                  {title}
                </Typography>
              ) : null}
              {subtitle ? (
                <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 13.8, lineHeight: 1.65 }}>
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
            {action}
          </Stack>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
};

export const DashboardMetricCard = ({ label, value, icon, accent = '#155eef', helper, secondaryValue }) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 4,
      border: `1px solid ${alpha(accent, 0.14)}`,
      boxShadow: `0 12px 24px ${alpha(accent, 0.06)}`,
      backgroundImage: 'none',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 20px 40px ${alpha(accent, 0.12)}`,
        borderColor: alpha(accent, 0.3)
      }
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography sx={{ color: 'text.secondary', fontSize: 13.5, fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography sx={{ mt: 0.75, color: 'text.primary', fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
            {value}
          </Typography>
          {secondaryValue ? (
            <Typography sx={{ mt: 0.55, color: accent, fontSize: 13.5, fontWeight: 700 }}>
              {secondaryValue}
            </Typography>
          ) : null}
          {helper ? (
            <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: 13.2, lineHeight: 1.6 }}>
              {helper}
            </Typography>
          ) : null}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(accent, 0.12),
            color: accent,
            flexShrink: 0
          }}
        >
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);
