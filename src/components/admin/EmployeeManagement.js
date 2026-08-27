// src/components/admin/EmployeeManagement.js
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert as MuiAlert,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/GridLegacy';
import { Add, Edit, Delete, ExpandMore, AddCircle, RemoveCircle, ContentCopy, Search, Clear } from '@mui/icons-material';
import { apiRequest } from '../../utils/api';
import {
  DEFAULT_COUNTRY_CODE,
  getCountryConfig,
  getPhoneHelperText,
  isValidPhoneForCountry,
  normalizeNationalNumber,
  SUPPORTED_COUNTRIES
} from '../../utils/countryConfig';
import { DashboardHero, DashboardPage } from '../common/dashboardUi';

const EmployeeManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [tempCredentials, setTempCredentials] = useState({ email: '', password: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: DEFAULT_COUNTRY_CODE,
    phone: '',
    momoNumber: '',
    position: '',
    department: '',
    salary: '',
    payPerShift: '',
    shifts: [{ day: '', date: '', startTime: '', endTime: '' }]
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/employees');
      if (data.success) {
        setEmployees(data.data);
      } else {
        setError(data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleInputChange = (e) => {
    if (e.target.name === 'countryCode') {
      const nextCountryCode = e.target.value;
      setFormData({
        ...formData,
        countryCode: nextCountryCode,
        phone: normalizeNationalNumber(formData.phone, nextCountryCode),
        momoNumber: normalizeNationalNumber(formData.momoNumber, nextCountryCode)
      });
      return;
    }
    if (e.target.name === 'phone' || e.target.name === 'momoNumber') {
      setFormData({ ...formData, [e.target.name]: normalizeNationalNumber(e.target.value, formData.countryCode) });
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShiftChange = (index, field, value) => {
    const newShifts = [...formData.shifts];
    newShifts[index][field] = value;
    setFormData({ ...formData, shifts: newShifts });
  };

  const addShift = () => {
    setFormData({ ...formData, shifts: [...formData.shifts, { day: '', date: '', startTime: '', endTime: '' }] });
  };

  const removeShift = (index) => {
    if (formData.shifts.length > 1) {
      setFormData({ ...formData, shifts: formData.shifts.filter((_, i) => i !== index) });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (!formData.name || !formData.email || !formData.phone ||
          !formData.momoNumber || !formData.position || !formData.salary ||
          !formData.payPerShift) {
        setError('Please fill in all required fields');
        return;
      }
      if (!isValidPhoneForCountry(formData.phone, formData.countryCode)) {
        setError(`Phone number must match ${getCountryConfig(formData.countryCode).name} format: ${getPhoneHelperText(formData.countryCode)}.`);
        return;
      }
      if (!isValidPhoneForCountry(formData.momoNumber, formData.countryCode)) {
        setError(`Mobile money number must match ${getCountryConfig(formData.countryCode).name} format: ${getPhoneHelperText(formData.countryCode)}.`);
        return;
      }
      for (let shift of formData.shifts) {
        if ((shift.day || shift.date || shift.startTime || shift.endTime) &&
            (!shift.day || !shift.date || !shift.startTime || !shift.endTime)) {
          setError('Please complete all shift fields or leave them empty');
          return;
        }
      }
      const validShifts = formData.shifts.filter(s => s.day && s.date && s.startTime && s.endTime);
      const submitData = { ...formData, salary: Number(formData.salary), payPerShift: Number(formData.payPerShift), shifts: validShifts };
      const url = editingEmployee ? `/employees/${editingEmployee._id}` : '/employees';
      const method = editingEmployee ? 'PUT' : 'POST';
      const data = await apiRequest(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(submitData) });
      if (data.success) {
        if (!editingEmployee && data.data.temporaryPassword) {
          setTempPassword(data.data.temporaryPassword);
          setTempCredentials({ email: submitData.email, password: data.data.temporaryPassword });
          setShowTempPassword(true);
        }
        setOpen(false);
        setEditingEmployee(null);
        setFormData({ name: '', email: '', countryCode: DEFAULT_COUNTRY_CODE, phone: '', momoNumber: '', position: '', department: '', salary: '', payPerShift: '', shifts: [{ day: '', date: '', startTime: '', endTime: '' }] });
        fetchEmployees();
        setSuccess(editingEmployee ? 'Employee updated successfully!' : 'Employee created successfully!');
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      countryCode: employee.countryCode || DEFAULT_COUNTRY_CODE,
      phone: normalizeNationalNumber(employee.phone, employee.countryCode || DEFAULT_COUNTRY_CODE),
      momoNumber: normalizeNationalNumber(employee.momoNumber, employee.countryCode || DEFAULT_COUNTRY_CODE),
      position: employee.position,
      department: employee.department || '',
      salary: employee.salary,
      payPerShift: employee.payPerShift,
      shifts: [{ day: '', date: '', startTime: '', endTime: '' }]
    });
    setOpen(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const data = await apiRequest(`/employees/${employeeId}`, { method: 'DELETE' });
        if (data.success) {
          fetchEmployees();
          setSuccess('Employee deleted successfully!');
        } else {
          setError(data.message || 'Failed to delete employee');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      }
    }
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setFormData({ name: '', email: '', countryCode: DEFAULT_COUNTRY_CODE, phone: '', momoNumber: '', position: '', department: '', salary: '', payPerShift: '', shifts: [{ day: '', date: '', startTime: '', endTime: '' }] });
    setOpen(true);
    setShowTempPassword(false);
    setTempPassword('');
    setTempCredentials({ email: '', password: '' });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingEmployee(null);
    setError('');
    setShowTempPassword(false);
    setTempPassword('');
    setTempCredentials({ email: '', password: '' });
  };

  const handleCloseSnackbar = () => { setError(''); setSuccess(''); };

  const filteredEmployees = employees.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (e.name||'').toLowerCase().includes(q) || (e.email||'').toLowerCase().includes(q) || (e.position||'').toLowerCase().includes(q) || (e.department||'').toLowerCase().includes(q);
  });

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Employee Management"
        title="Your workforce directory."
        subtitle="Add, edit, and manage employee records. Configure salaries, departments, schedules, and access roles."
        gradient="linear-gradient(135deg, #0f172a 0%, #163a6b 58%, #1d4ed8 100%)"
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddNew}
            sx={{ borderRadius: 999, fontWeight: 800, px: 3, py: 1.1, bgcolor: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.22)', '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}
          >
            Add Employee
          </Button>
        }
      />

      {/* Search bar */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name, email or position…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}><Clear fontSize="small" /></IconButton>
              </InputAdornment>
            ) : null
          }}
          sx={{ width: { xs: '100%', sm: 360 } }}
        />
        {searchQuery && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {filteredEmployees.length} result(s)
          </Typography>
        )}
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>{error}</MuiAlert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>{success}</MuiAlert>
      </Snackbar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <>
          {/* ── Mobile card list (xs only) ─────────────────────────────────── */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', gap: 1.5 }}>
            {filteredEmployees.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={4}>No employees found.</Typography>
            )}
            {filteredEmployees.map(emp => (
              <Paper key={emp._id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>{emp.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">{emp.email}</Typography>
                  </Box>
                  <Chip label={emp.position} size="small" variant="outlined" color="primary" sx={{ flexShrink: 0 }} />
                </Box>
                {emp.department && (
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    {emp.department}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    Salary: <strong>{emp.salary?.toLocaleString()} FCFA</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    /Shift: <strong>{emp.payPerShift?.toLocaleString()} FCFA</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label={`${emp.shifts || 0} shifts`} size="small" color="primary" variant="outlined" />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleEdit(emp)} color="primary" sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 1.5 }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(emp._id)} color="error" sx={{ border: '1px solid', borderColor: 'error.main', borderRadius: 1.5 }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* ── Desktop table (sm+) ──────────────────────────────────────────── */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Salary (FCFA)</TableCell>
                    <TableCell>Pay/Shift (FCFA)</TableCell>
                    <TableCell>Shifts</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.map(employee => (
                    <TableRow key={employee._id}>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.salary?.toLocaleString()}</TableCell>
                      <TableCell>{employee.payPerShift?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={`${employee.shifts || 0} shifts`} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(employee)} sx={{ mr: 1 }}>Edit</Button>
                        <Button size="small" startIcon={<Delete />} color="error" onClick={() => handleDelete(employee._id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}

      {/* ── Employee Form Dialog ─────────────────────────────────────────── */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth fullScreen={isMobile}
        PaperProps={{ sx: isMobile ? {} : { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {(() => {
              const selectedCountry = getCountryConfig(formData.countryCode);
              return (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField required fullWidth label="Full Name" name="name" value={formData.name} onChange={handleInputChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField required fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Country</InputLabel>
                      <Select label="Country" name="countryCode" value={formData.countryCode} onChange={handleInputChange}>
                        {SUPPORTED_COUNTRIES.map(c => (
                          <MenuItem key={c.code} value={c.code}>{c.name} ({c.dialCode})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField required fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange}
                      helperText={getPhoneHelperText(formData.countryCode)}
                      InputProps={{ startAdornment: <InputAdornment position="start">{selectedCountry.dialCode}</InputAdornment> }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField required fullWidth label="Mobile Money Number" name="momoNumber" value={formData.momoNumber} onChange={handleInputChange}
                      helperText={getPhoneHelperText(formData.countryCode)}
                      InputProps={{ startAdornment: <InputAdornment position="start">{selectedCountry.dialCode}</InputAdornment> }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField required fullWidth label="Position" name="position" value={formData.position} onChange={handleInputChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Department" name="department" value={formData.department} onChange={handleInputChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField required fullWidth label={`Monthly Salary (${selectedCountry.currency})`} name="salary" type="number" value={formData.salary} onChange={handleInputChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField required fullWidth label={`Pay per Shift (${selectedCountry.currency})`} name="payPerShift" type="number" value={formData.payPerShift} onChange={handleInputChange} />
                  </Grid>
                </Grid>
              );
            })()}

            <Accordion sx={{ mt: 3 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Employee Shifts</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {formData.shifts.map((shift, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                          <InputLabel>Day</InputLabel>
                          <Select value={shift.day} label="Day" onChange={(e) => handleShiftChange(index, 'day', e.target.value)}>
                            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                              <MenuItem key={d} value={d}>{d}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={shift.date} onChange={(e) => handleShiftChange(index, 'date', e.target.value)} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField fullWidth label="Start Time" type="time" InputLabelProps={{ shrink: true }} value={shift.startTime} onChange={(e) => handleShiftChange(index, 'startTime', e.target.value)} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField fullWidth label="End Time" type="time" InputLabelProps={{ shrink: true }} value={shift.endTime} onChange={(e) => handleShiftChange(index, 'endTime', e.target.value)} />
                      </Grid>
                    </Grid>
                    {formData.shifts.length > 1 && (
                      <Box sx={{ mt: 1, textAlign: 'right' }}>
                        <IconButton onClick={() => removeShift(index)} color="error"><RemoveCircle /></IconButton>
                      </Box>
                    )}
                  </Box>
                ))}
                <Button startIcon={<AddCircle />} onClick={addShift} variant="outlined" fullWidth>Add Another Shift</Button>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} fullWidth={isMobile} variant={isMobile ? 'outlined' : 'text'}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" fullWidth={isMobile}>
            {editingEmployee ? 'Update Employee' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Temporary Password Dialog ──────────────────────────────────────── */}
      <Dialog open={showTempPassword} onClose={() => setShowTempPassword(false)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>Employee Created Successfully</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>Share these credentials with the employee:</Alert>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 2 }}>
            <Typography variant="body1"><strong>Email:</strong> {tempCredentials.email}</Typography>
            <Typography variant="body1"><strong>Temp Password:</strong> {tempCredentials.password || tempPassword}</Typography>
          </Box>
          <Button
            startIcon={<ContentCopy />}
            onClick={() => copyToClipboard(`Email: ${tempCredentials.email}\nTemporary Password: ${tempCredentials.password || tempPassword}`)}
            variant="outlined" fullWidth
          >
            Copy Credentials
          </Button>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">Employee must change password on first login</Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTempPassword(false)} variant="contained" fullWidth>Done</Button>
        </DialogActions>
      </Dialog>
    </DashboardPage>
  );
};

export default EmployeeManagement;
