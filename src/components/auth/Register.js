import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  ApartmentRounded,
  AlternateEmailRounded,
  LockOutlined,
  PersonOutlined,
  TaskAltRounded,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../utils/api';
import AuthLayout from './AuthLayout';
import {
  DEFAULT_COUNTRY_CODE,
  getCountryConfig,
  getPhoneHelperText,
  isValidPhoneForCountry,
  normalizeNationalNumber,
  SUPPORTED_COUNTRIES
} from '../../utils/countryConfig';

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score: (score / 5) * 100, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score: (score / 5) * 100, label: 'Fair', color: '#f97316' };
  if (score <= 3) return { score: (score / 5) * 100, label: 'Good', color: '#eab308' };
  return { score: (score / 5) * 100, label: 'Strong', color: '#16a34a' };
};


const Register = () => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phone, setPhone] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const strength = getPasswordStrength(password);
  const selectedCountry = getCountryConfig(countryCode);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !company.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please complete every field before creating your workspace.');
      return;
    }

    if (!phone.trim() || !registrationNumber.trim()) {
      setError('Business phone number and registration number are required.');
      return;
    }

    if (!isValidPhoneForCountry(phone, countryCode)) {
      setError(`Business phone number must match ${selectedCountry.name} format: ${getPhoneHelperText(countryCode)}.`);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid business email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeToTerms) {
      setError('Please accept the terms to continue.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await apiRequest('/auth/register-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        auth: false,
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          countryCode,
          phone: normalizeNationalNumber(phone, countryCode),
          registrationNumber: registrationNumber.trim(),
          email: email.trim().toLowerCase(),
          password
        })
      });

      if (!data.success) {
        setError(data.message || 'Registration failed. Please try again.');
        return;
      }

      setSession(data.token, data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to create your account right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Workspace"
      
    >
      <Stack spacing={2.15} component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        <Box
          sx={{
            p: 2.15,
            borderRadius: 3.5,
            bgcolor: '#f8fbff',
            border: '1px solid rgba(21,94,239,0.1)'
          }}
        >
        
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.75
          }}
        >
          <TextField
            label="Full name"
            fullWidth
            autoFocus
            value={name}
            placeholder="Jane Doe"
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlined sx={{ fontSize: 20, color: '#94a3b8' }} />
                </InputAdornment>
              )
            }}
          />

          <TextField
            label="Company name"
            fullWidth
            value={company}
            placeholder="ThinkBig Multimedia"
            onChange={(e) => setCompany(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ApartmentRounded sx={{ fontSize: 20, color: '#94a3b8' }} />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.75
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="register-country-label">Country</InputLabel>
            <Select
              labelId="register-country-label"
              value={countryCode}
              label="Country"
              onChange={(e) => setCountryCode(e.target.value)}
            >
              {SUPPORTED_COUNTRIES.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  {country.name} ({country.dialCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Business phone"
            fullWidth
            value={phone}
            placeholder={getPhoneHelperText(countryCode)}
            onChange={(e) => setPhone(normalizeNationalNumber(e.target.value, countryCode))}
            helperText={`Format:${selectedCountry.phoneDigits} digits`}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: '#475569', fontWeight: 700 }}>
                    {selectedCountry.dialCode}
                  </Typography>
                </InputAdornment>
              )
            }}
          />
        </Box>

        <TextField
          label={selectedCountry.registrationLabel}
          fullWidth
          value={registrationNumber}
          placeholder="Enter your business registration identifier"
          onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
        />

        <TextField
          label="Business email"
          type="email"
          fullWidth
          value={email}
          placeholder="admin@company.com"
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AlternateEmailRounded sx={{ fontSize: 20, color: '#94a3b8' }} />
              </InputAdornment>
            )
          }}
        />

        <Box
          sx={{
            p: 2.15,
            borderRadius: 3.5,
            bgcolor: '#ffffff',
            border: '1px solid rgba(15,23,42,0.08)'
          }}
        >
          <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: 14.5, mb: 1.35 }}>
            Create secure access
          </Typography>
          <Stack spacing={1.75}>
            <Box>
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password}
                placeholder="Choose a strong password"
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ fontSize: 20, color: '#94a3b8' }} />
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
              {password && (
                <Box sx={{ mt: 1.15, px: 0.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={strength.score}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 999,
                        bgcolor: 'rgba(15,23,42,0.08)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: strength.color,
                          borderRadius: 999
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: strength.color, fontWeight: 700, minWidth: 46 }}>
                      {strength.label}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <TextField
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              fullWidth
              value={confirmPassword}
              placeholder="Repeat your password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword.length > 0 && password !== confirmPassword}
              helperText={confirmPassword.length > 0 && password !== confirmPassword ? "Passwords don't match" : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ fontSize: 20, color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showConfirm ? 'Hide password' : 'Show password'}>
                      <IconButton edge="end" onClick={() => setShowConfirm((prev) => !prev)} size="small">
                        {showConfirm ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2.15,
            borderRadius: 3.5,
            bgcolor: 'rgba(13,148,136,0.07)',
            border: '1px solid rgba(13,148,136,0.16)'
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                size="small"
                sx={{
                  color: '#0f766e',
                  '&.Mui-checked': { color: '#0f766e' }
                }}
              />
            }
            label={(
              <Typography variant="body2" sx={{ color: '#134e4a', lineHeight: 1.6 }}>
                I confirm this workspace is for my organization and I agree to the{' '}
                <Typography
                  component={Link}
                  to="/terms"
                  variant="body2"
                  sx={{ color: '#0f766e', fontWeight: 700, textDecoration: 'underline' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms &amp; Conditions
                </Typography>
                {' '}for secure business use.
              </Typography>
            )}
            sx={{ alignItems: 'flex-start', m: 0 }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            py: 1.6,
            borderRadius: 3.5,
            fontWeight: 800,
            fontSize: 15.5,
            background: 'linear-gradient(135deg, #0e2144 0%, #155eef 100%)',
            boxShadow: '0 20px 40px rgba(21, 94, 239, 0.24)',
            '&:hover': {
              background: 'linear-gradient(135deg, #09162e 0%, #1047c7 100%)',
              boxShadow: '0 24px 48px rgba(21, 94, 239, 0.3)'
            }
          }}
        >
          {loading
            ? <CircularProgress size={22} color="inherit" />
            : 'Create Business Workspace'}
        </Button>

        <Box
          sx={{
            p: 2.15,
            borderRadius: 3.5,
            bgcolor: '#0f172a',
            color: '#ffffff'
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.1 }}>
            <TaskAltRounded sx={{ color: '#67e8f9', fontSize: 18 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>
              What happens next
            </Typography>
          </Stack>
          <Typography sx={{ color: 'rgba(226,232,240,0.8)', fontSize: 14, lineHeight: 1.7 }}>
            After signup, you can add employees, configure payroll settings, define attendance rules, and start inviting your team immediately.
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: '#475569', textAlign: 'center' }}>
          Already have an account?{' '}
          <Typography
            component={Link}
            to="/login"
            sx={{ color: '#155eef', textDecoration: 'none', fontWeight: 800 }}
          >
            Sign in
          </Typography>
        </Typography>
      </Stack>
    </AuthLayout>
  );
};

export default Register;
