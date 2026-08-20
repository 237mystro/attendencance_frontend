import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  AlternateEmailRounded,
  KeyRounded,
  LockResetRounded,
  MarkEmailReadRounded,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { apiRequest } from '../../utils/api';
import AuthLayout from './AuthLayout';

const initialForm = {
  email: '',
  otp: '',
  password: '',
  confirmPassword: ''
};

const steps = [
  { key: 'request', title: 'Request code' },
  { key: 'reset', title: 'Set new password' }
];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState('request');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email.trim()) {
      setError('Enter the email address linked to your account.');
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        auth: false,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim() })
      });

      setSuccess(data.message || 'If the email exists, a reset code has been sent.');
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Unable to send reset code right now.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.otp.trim() || !form.password || !form.confirmPassword) {
      setError('Enter the OTP and your new password.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest('/auth/reset-password', {
        method: 'POST',
        auth: false,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          otp: form.otp.trim(),
          password: form.password
        })
      });

      setSuccess(data.message || 'Password reset successful. You can now sign in.');
      setForm((prev) => ({ ...prev, otp: '', password: '', confirmPassword: '' }));
      setStep('done');
      window.setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const activeStepIndex = step === 'request' ? 0 : 1;

  return (
    <AuthLayout
      eyebrow="Password Recovery"
      subtitle="Request a one-time email code, then create a new password"
      
    >
      <Stack spacing={2.25} component="form" onSubmit={step === 'request' ? requestOtp : resetPassword}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1
          }}
        >
          {steps.map((item, index) => {
            const isActive = activeStepIndex >= index;
            return (
              <Box
                key={item.key}
                sx={{
                  p: 1.4,
                  borderRadius: 3,
                  border: isActive ? '1px solid rgba(21,94,239,0.18)' : '1px solid rgba(15,23,42,0.08)',
                  bgcolor: isActive ? '#f8fbff' : '#ffffff'
                }}
              >
                <Typography sx={{ color: isActive ? '#155eef' : '#94a3b8', fontSize: 12, fontWeight: 800 }}>
                  0{index + 1}
                </Typography>
                <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: 14, mt: 0.4 }}>
                  {item.title}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Box
          sx={{
            p: 2.15,
            borderRadius: 3.5,
            bgcolor: '#f8fbff',
            border: '1px solid rgba(21,94,239,0.1)'
          }}
        >
          <Stack direction="row" spacing={1.1} alignItems="center">
            <MarkEmailReadRounded sx={{ color: '#155eef', fontSize: 18 }} />
            <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: 14.5 }}>
              Recovery codes are delivered by email
            </Typography>
          </Stack>
          <Typography sx={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.65, mt: 0.65 }}>
            Enter the email tied to your workspace. When you receive the OTP, stay on this page to finish the reset.
          </Typography>
        </Box>

        <TextField
          label="Email address"
          value={form.email}
          onChange={handleChange('email')}
          fullWidth
          type="email"
          disabled={step !== 'request'}
          placeholder="name@company.com"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AlternateEmailRounded sx={{ color: '#94a3b8', fontSize: 20 }} />
              </InputAdornment>
            )
          }}
        />

        {step !== 'request' && (
          <>
            <TextField
              label="6-digit OTP"
              value={form.otp}
              onChange={handleChange('otp')}
              fullWidth
              inputProps={{ inputMode: 'numeric', maxLength: 6 }}
              placeholder="Enter the code sent to your email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyRounded sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="New password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange('password')}
              fullWidth
              placeholder="Choose a new password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockResetRounded sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
                      <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)} size="small">
                        {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="Confirm new password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              fullWidth
              placeholder="Repeat your new password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showConfirmPassword ? 'Hide password' : 'Show password'}>
                      <IconButton edge="end" onClick={() => setShowConfirmPassword((prev) => !prev)} size="small">
                        {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </>
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading || step === 'done'}
          sx={{
            py: 1.55,
            borderRadius: 3.5,
            fontWeight: 800,
            fontSize: 15.5,
            background: 'linear-gradient(135deg, #0e2144 0%, #155eef 100%)',
            boxShadow: '0 20px 40px rgba(21, 94, 239, 0.24)',
            '&:hover': {
              background: 'linear-gradient(135deg, #09162e 0%, #1047c7 100%)',
              boxShadow: '0 24px 46px rgba(21, 94, 239, 0.3)'
            }
          }}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : step === 'request' ? (
            'Send Recovery Code'
          ) : step === 'done' ? (
            'Password Updated'
          ) : (
            'Reset Password'
          )}
        </Button>

        {step === 'reset' && (
          <Button
            variant="text"
            disabled={loading}
            onClick={() => {
              setStep('request');
              setSuccess('');
            }}
            sx={{ alignSelf: 'flex-start', fontWeight: 700, color: '#155eef' }}
          >
            Use another email
          </Button>
        )}

        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            bgcolor: '#0f172a',
            color: '#ffffff'
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>
            Quick note
          </Typography>
          <Typography sx={{ color: 'rgba(226,232,240,0.78)', fontSize: 14, lineHeight: 1.7, mt: 0.6 }}>
            OTP codes are meant for immediate use. Complete the reset as soon as the email arrives for the smoothest recovery experience.
          </Typography>
        </Box>

        <Box sx={{ pt: 0.5 }}>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Remembered it?{' '}
            <Typography
              component={Link}
              to="/login"
              sx={{
                color: '#155eef',
                textDecoration: 'none',
                fontWeight: 800
              }}
            >
              Back to sign in
            </Typography>
          </Typography>
        </Box>
      </Stack>
    </AuthLayout>
  );
};

export default ForgotPassword;
