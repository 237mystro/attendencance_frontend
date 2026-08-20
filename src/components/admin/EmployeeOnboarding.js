import React, { useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, FormControl,
  InputAdornment, InputLabel, MenuItem, Paper,
  Select, Step, StepLabel, Stepper, TextField, Typography
} from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircle, PersonAdd } from '@mui/icons-material';
import { apiRequest } from '../../utils/api';
import {
  DEFAULT_COUNTRY_CODE,
  getCountryConfig,
  getPhoneHelperText,
  isValidPhoneForCountry,
  normalizeNationalNumber,
  SUPPORTED_COUNTRIES
} from '../../utils/countryConfig';

const POSITIONS = [
  'Accountant', 'Cashier', 'Clerk', 'Customer Service', 'Data Entry',
  'Driver', 'Engineer', 'Executive', 'Guard / Security', 'HR Officer',
  'Intern', 'IT Support', 'Logistics', 'Manager', 'Marketing',
  'Nurse / Medical', 'Operations', 'Receptionist', 'Sales Representative',
  'Supervisor', 'Technician', 'Warehouse Staff', 'Other'
];

const STEPS = ['Personal Info', 'Contact & Country', 'Role & Salary'];

const EMPTY_FORM = {
  name: '', email: '',
  countryCode: DEFAULT_COUNTRY_CODE,
  phone: '', momoNumber: '',
  position: '', department: '',
  salary: '', payPerShift: ''
};

const EmployeeOnboarding = ({ onEmployeeCreated }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');

  const country = getCountryConfig(form.countryCode);
  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!form.name.trim()) errs.name = 'Full name is required';
      if (!form.email.trim()) errs.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    }
    if (step === 1) {
      if (!isValidPhoneForCountry(form.phone, form.countryCode)) errs.phone = 'Enter a valid phone number';
      if (!isValidPhoneForCountry(form.momoNumber, form.countryCode)) errs.momoNumber = 'Enter a valid mobile money number';
    }
    if (step === 2) {
      if (!form.position) errs.position = 'Position is required';
      if (!form.salary || Number(form.salary) <= 0) errs.salary = 'Enter a valid monthly salary';
      if (!form.payPerShift || Number(form.payPerShift) <= 0) errs.payPerShift = 'Enter a valid pay per shift';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setApiError('');
    setSuccess('');
    try {
      const data = await apiRequest('/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          countryCode: form.countryCode,
          phone: form.phone,
          momoNumber: form.momoNumber,
          position: form.position,
          department: form.department.trim(),
          salary: Number(form.salary),
          payPerShift: Number(form.payPerShift)
        })
      });

      if (data.success) {
        setSuccess(`${form.name} has been added successfully. They will receive login instructions by email.`);
        setForm(EMPTY_FORM);
        setStep(0);
        if (onEmployeeCreated) onEmployeeCreated(data);
      } else {
        setApiError(data.message || 'Failed to create employee account');
      }
    } catch (err) {
      setApiError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <PersonAdd color="primary" />
        <Box>
          <Typography variant="h5" fontWeight={700}>Add New Employee</Typography>
          <Typography variant="body2" color="text.secondary">Create a workspace account for your employee</Typography>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError('')}>{apiError}</Alert>
      )}

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Stepper activeStep={step} sx={{ mb: 4 }} alternativeLabel>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0 — Personal Info */}
        {step === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name"
              value={form.name}
              onChange={set('name')}
              fullWidth
              required
              autoFocus
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Work Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              fullWidth
              required
              error={!!errors.email}
              helperText={errors.email || 'Login credentials will be sent to this address'}
            />
          </Box>
        )}

        {/* Step 1 — Contact & Country */}
        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Country</InputLabel>
              <Select
                value={form.countryCode}
                label="Country"
                onChange={(e) => {
                  const next = e.target.value;
                  setForm(p => ({
                    ...p,
                    countryCode: next,
                    phone: normalizeNationalNumber(p.phone, next),
                    momoNumber: normalizeNationalNumber(p.momoNumber, next)
                  }));
                }}
              >
                {SUPPORTED_COUNTRIES.map(c => (
                  <MenuItem key={c.code} value={c.code}>{c.name} ({c.dialCode})</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm(p => ({ ...p, phone: normalizeNationalNumber(e.target.value, form.countryCode) }))}
              fullWidth
              required
              error={!!errors.phone}
              helperText={errors.phone || getPhoneHelperText(form.countryCode)}
              InputProps={{
                startAdornment: <InputAdornment position="start">{country.dialCode}</InputAdornment>
              }}
            />

            <TextField
              label="Mobile Money Number"
              value={form.momoNumber}
              onChange={(e) => setForm(p => ({ ...p, momoNumber: normalizeNationalNumber(e.target.value, form.countryCode) }))}
              fullWidth
              required
              error={!!errors.momoNumber}
              helperText={errors.momoNumber || `Used for salary disbursement via MTN/Orange · ${getPhoneHelperText(form.countryCode)}`}
              InputProps={{
                startAdornment: <InputAdornment position="start">{country.dialCode}</InputAdornment>
              }}
            />
          </Box>
        )}

        {/* Step 2 — Role & Salary */}
        {step === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required error={!!errors.position}>
              <InputLabel>Position</InputLabel>
              <Select value={form.position} label="Position" onChange={set('position')}>
                {POSITIONS.map(p => <MenuItem key={p} value={p.toLowerCase().replace(/\s+/g, '_')}>{p}</MenuItem>)}
              </Select>
              {errors.position && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{errors.position}</Typography>
              )}
            </FormControl>

            <TextField
              label="Department (optional)"
              value={form.department}
              onChange={set('department')}
              fullWidth
              placeholder="e.g. Finance, Operations"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Monthly Salary"
                type="number"
                inputProps={{ min: 0 }}
                value={form.salary}
                onChange={set('salary')}
                fullWidth
                required
                error={!!errors.salary}
                helperText={errors.salary || `${country.currency}`}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{country.currency}</InputAdornment>
                }}
              />
              <TextField
                label="Pay Per Shift"
                type="number"
                inputProps={{ min: 0 }}
                value={form.payPerShift}
                onChange={set('payPerShift')}
                fullWidth
                required
                error={!!errors.payPerShift}
                helperText={errors.payPerShift || 'Used for payroll calculation'}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{country.currency}</InputAdornment>
                }}
              />
            </Box>

            <Alert severity="info" sx={{ mt: 1 }}>
              A temporary password will be generated and emailed to the employee. They must change it on first login.
            </Alert>
          </Box>
        )}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            startIcon={<ArrowBack />}
            disabled={step === 0}
            variant="outlined"
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              endIcon={<ArrowForward />}
              variant="contained"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
            >
              {loading ? 'Creating account...' : 'Create Employee'}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default EmployeeOnboarding;
