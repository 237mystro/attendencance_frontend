import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  AlternateEmailRounded,
  LockOutlined,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../utils/api';
import AuthLayout from './AuthLayout';

const Login = () => {
  const [email, setEmail] = useState(() => window.localStorage.getItem('autopayroll-last-email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await apiRequest('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        auth: false,
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim()
        })
      });

      if (!data.success) {
        setError(data.message || 'Invalid email or password.');
        return;
      }

      setSession(data.token, data.user, rememberMe);

      if (rememberMe) {
        window.localStorage.setItem('autopayroll-last-email', email.trim().toLowerCase());
      } else {
        window.localStorage.removeItem('autopayroll-last-email');
      }

      const role = data.user?.role;
      if (role === 'employee') navigate('/employee/dashboard');
      else if (role === 'branch_manager' || role === 'branch_hr') navigate('/branch/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        setError('Server Loaded. Please wait a minute');
      } else {
        setError(err.message || 'Unable to sign in right now.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
     
    >
      <Stack spacing={3.25} component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Work email"
          fullWidth
          autoFocus
          autoComplete="email"
          value={email}
          placeholder="name@company.com"
          onChange={(event) => setEmail(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AlternateEmailRounded sx={{ color: '#94a3b8', fontSize: 20 }} />
              </InputAdornment>
            )
          }}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          autoComplete="current-password"
          value={password}
          placeholder="Enter your password"
          onChange={(event) => setPassword(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
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

        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                sx={{
                  color: '#94a3b8',
                  '&.Mui-checked': {
                    color: '#155eef'
                  }
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#0f172a', lineHeight: 1.2 }}>
                  Remember my email
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Stay signed in for 30 days
                </Typography>
              </Box>
            }
          />

          <Typography
            component={Link}
            to="/forgot-password"
            sx={{
              color: '#155eef',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 14.5
            }}
          >
            Forgot password?
          </Typography>
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
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
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In to Workspace'}
        </Button>

       
        <Divider flexItem sx={{ borderColor: 'rgba(15,23,42,0.08)' }} />

        <Box
          sx={{
            p: 2.25,
            borderRadius: 3.5,
            bgcolor: '#f8fafc',
            border: '1px solid rgba(15,23,42,0.08)'
          }}
        >
          <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: 14.5 }}>
            New business?
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: 14, lineHeight: 1.65, mt: 0.5, mb: 1.25 }}>
            Launch your payroll workspace, onboard your team, and start managing attendance in minutes.
          </Typography>
          <Typography
            component={Link}
            to="/register"
            sx={{
              color: '#155eef',
              textAlign:"center",
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: 14.5
              
            }}
          >
            Create a business account
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center' }}>
          By signing in you agree to our{' '}
          <Typography
            component={Link}
            to="/terms"
            variant="caption"
            sx={{ color: '#155eef', textDecoration: 'none', fontWeight: 700 }}
          >
            Terms &amp; Conditions
          </Typography>
        </Typography>
      </Stack>
    </AuthLayout>
  );
};

export default Login;
