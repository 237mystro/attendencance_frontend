import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  Typography
} from '@mui/material';
import {
  ArrowOutwardRounded,
  HomeRounded,
} from '@mui/icons-material';

const AuthLayout = ({
  eyebrow,
  title,
  subtitle,
  children,
  sideNote,
}) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: `
          radial-gradient(circle at top left, rgba(20, 91, 214, 0.16), transparent 26%),
          radial-gradient(circle at bottom right, rgba(13, 148, 136, 0.12), transparent 24%),
          linear-gradient(180deg, #f8fbff 0%, #edf3fb 100%)
        `,
        px: { xs: 2, sm: 3, md: 5 },
        pt: { xs: 1.25, sm: 1.75, md: 2.25 },
        pb: { xs: 2.5, sm: 3, md: 4 }
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 560 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f274f 0%, #1f5eff 100%)',
                boxShadow: '0 16px 32px rgba(21, 94, 239, 0.2)'
              }}
            >
              <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: 18 }}>
                AP
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: 17 }}>
                AutoPayroll
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: 12.5 }}>
                Business operations suite
              </Typography>
            </Box>
          </Stack>

          <Button
            component={RouterLink}
            to="/"
            startIcon={<HomeRounded />}
            endIcon={<ArrowOutwardRounded />}
            sx={{
              color: '#0f274f',
              px: 1.75,
              py: 0.9,
              borderRadius: 999,
              bgcolor: 'rgba(255,255,255,0.76)',
              border: '1px solid rgba(15,39,79,0.08)',
              backdropFilter: 'blur(16px)'
            }}
          >
            Back Home
          </Button>
        </Stack>

        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: { xs: 4, md: 5 },
            p: { xs: 3, sm: 4, md: 4.5 },
            bgcolor: 'rgba(255,255,255,0.78)',
            border: '1px solid rgba(255,255,255,0.72)',
            boxShadow: '0 28px 90px rgba(15, 23, 42, 0.12)',
            backdropFilter: 'blur(24px)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `
                radial-gradient(circle at top right, rgba(21, 94, 239, 0.08), transparent 24%),
                radial-gradient(circle at bottom left, rgba(13, 148, 136, 0.08), transparent 24%)
              `,
              pointerEvents: 'none'
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="overline"
              sx={{ color: '#155eef', letterSpacing: 2.2, fontWeight: 800 }}
            >
              {eyebrow}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                color: '#0f172a',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em'
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                mt: 0.75,
                color: '#475569',
                lineHeight: 1.65,
                fontSize: 15.5,
                textAlign: 'center'
              }}
            >
              {subtitle}
            </Typography>

            {sideNote && (
              <Box
                sx={{
                  mt: 2.5,
                  mb: 3,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: '#f8fbff',
                  border: '1px solid rgba(21, 94, 239, 0.1)'
                }}
              >
                <Typography sx={{ color: '#0f274f', fontWeight: 700, fontSize: 14 }}>
                  Why this matters
                </Typography>
                <Typography sx={{ color: '#52627a', fontSize: 14, lineHeight: 1.65, mt: 0.5 }}>
                  {sideNote}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                '& .MuiAlert-root': {
                  borderRadius: 3
                },
                '& .MuiFormLabel-root': {
                  color: '#475569',
                  fontSize: 15.5,
                  fontWeight: 700
                },
                '& .MuiFormLabel-root.Mui-focused': {
                  color: '#155eef'
                },
                '& .MuiFormLabel-root.MuiInputLabel-shrink': {
                  fontSize: 14.5
                },
                '& .MuiInputBase-root': {
                  color: '#0f172a',
                  bgcolor: '#ffffff',
                  borderRadius: 3.5,
                  minHeight: 66,
                  boxShadow: '0 1px 0 rgba(15,23,42,0.04)'
                },
                '& .MuiOutlinedInput-input': {
                  py: 1.75,
                  fontSize: 17,
                  fontWeight: 600
                },
                '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                  fontSize: 22
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(15,23,42,0.18)',
                  borderWidth: 1.5
                },
                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(21,94,239,0.46)'
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#155eef',
                  borderWidth: 2
                },
                '& .MuiFormHelperText-root': {
                  fontSize: 13.5,
                  fontWeight: 600,
                  marginLeft: 2,
                  marginTop: 0.75
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#7b8aa1',
                  opacity: 1
                },
                '& .MuiInputBase-input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 100px #ffffff inset',
                  WebkitTextFillColor: '#0f172a',
                  caretColor: '#0f172a',
                  borderRadius: 'inherit'
                }
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
