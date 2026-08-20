import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  InputAdornment
} from '@mui/material';
import {
  DEFAULT_COUNTRY_CODE,
  getCountryConfig,
  getPhoneHelperText,
  normalizeNationalNumber,
  SUPPORTED_COUNTRIES
} from '../../utils/countryConfig';

const EmployeeOnboarding = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phone, setPhone] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { onboardEmployee } = useAuth();
  const selectedCountry = getCountryConfig(countryCode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await onboardEmployee(email, name, phone, momoNumber, position, countryCode);
      navigate('/employee/dashboard');
    } catch (err) {
      setError('Failed to onboard employee. Please check your information.');
    }
    
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
          Employee Onboarding
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="auth-employee-country-label">Country</InputLabel>
            <Select
              labelId="auth-employee-country-label"
              value={countryCode}
              label="Country"
              onChange={(e) => {
                const nextCountryCode = e.target.value;
                setCountryCode(nextCountryCode);
                setPhone(normalizeNationalNumber(phone, nextCountryCode));
                setMomoNumber(normalizeNationalNumber(momoNumber, nextCountryCode));
              }}
            >
              {SUPPORTED_COUNTRIES.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  {country.name} ({country.dialCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="phone"
            label="Phone Number"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(normalizeNationalNumber(e.target.value, countryCode))}
            helperText={getPhoneHelperText(countryCode)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {selectedCountry.dialCode}
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="momo"
            label="Mobile Money Number"
            name="momo"
            value={momoNumber}
            onChange={(e) => setMomoNumber(normalizeNationalNumber(e.target.value, countryCode))}
            helperText={getPhoneHelperText(countryCode)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {selectedCountry.dialCode}
                </InputAdornment>
              )
            }}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="position-label">Position</InputLabel>
            <Select
              labelId="position-label"
              id="position"
              value={position}
              label="Position"
              onChange={(e) => setPosition(e.target.value)}
            >
              <MenuItem value="cashier">Cashier</MenuItem>
              <MenuItem value="supervisor">Supervisor</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="clerk">Clerk</MenuItem>
              <MenuItem value="technician">Technician</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            Complete Onboarding
          </Button>
          
          <Box sx={{ textAlign: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Back to Login
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmployeeOnboarding;
