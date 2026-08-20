import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  FormControl, InputLabel, MenuItem, Select,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, TrendingDown, TrendingUp, People } from '@mui/icons-material';
import { apiRequest } from '../../utils/api';

const StatCard = ({ label, value, icon, color }) => (
  <Card>
    <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
      <Typography variant="h4" fontWeight={700}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </CardContent>
  </Card>
);

const AttendanceInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    employeeId: ''
  });

  useEffect(() => {
    apiRequest('/employees').then(d => {
      if (d?.success) setEmployees(d.data || []);
    }).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams();
      if (filters.startDate) qs.set('startDate', filters.startDate);
      if (filters.endDate) qs.set('endDate', filters.endDate);
      if (filters.employeeId) qs.set('employeeId', filters.employeeId);

      const res = await apiRequest(`/attendance/insights?${qs}`);
      if (res?.success) setData(res.data);
      else setError(res?.message || 'Failed to load insights.');
    } catch {
      setError('Network error while loading insights.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const chartData = (data?.monthlyTrend || []).map(m => ({
    month: m.month,
    Present: m.present,
    Late: m.late,
    Absent: m.absent
  }));

  return (
    <Box>
      {/* Filter bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Query Attendance Data</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <TextField
              label="From"
              type="date"
              size="small"
              value={filters.startDate}
              onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="To"
              type="date"
              size="small"
              value={filters.endDate}
              onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Employee (optional)</InputLabel>
              <Select
                value={filters.employeeId}
                label="Employee (optional)"
                onChange={e => setFilters(p => ({ ...p, employeeId: e.target.value }))}
              >
                <MenuItem value="">All Employees</MenuItem>
                {employees.map(emp => (
                  <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Search />}
              onClick={load}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Run Query'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {data && (
        <>
          {/* Summary cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            <StatCard label="Total Records" value={data.summary.totalRecords} icon={<People sx={{ fontSize: 36 }} />} color="primary.main" />
            <StatCard label="Present" value={data.summary.totalPresent} icon={<TrendingUp sx={{ fontSize: 36 }} />} color="success.main" />
            <StatCard label="Late" value={data.summary.totalLate} icon={<TrendingDown sx={{ fontSize: 36 }} />} color="warning.main" />
            <StatCard label="Absent" value={data.summary.totalAbsent} icon={<TrendingDown sx={{ fontSize: 36 }} />} color="error.main" />
          </Box>

          {/* Monthly trend chart */}
          {chartData.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Monthly Attendance Trend</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Present" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Absent" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Top late & absent */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Most Late Arrivals</Typography>
                {data.topLate.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">No late records in this period.</Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell align="center">Late</TableCell>
                          <TableCell align="center">Late %</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.topLate.map(emp => (
                          <TableRow key={emp.employeeId} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>{emp.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{emp.position}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={emp.late} color="warning" size="small" />
                            </TableCell>
                            <TableCell align="center">{emp.lateRate}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Most Absences</Typography>
                {data.topAbsent.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">No absence records in this period.</Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell align="center">Absent</TableCell>
                          <TableCell align="center">Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.topAbsent.map(emp => (
                          <TableRow key={emp.employeeId} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>{emp.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{emp.position}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={emp.absent} color="error" size="small" />
                            </TableCell>
                            <TableCell align="center">
                              {emp.total > 0 ? Math.round((emp.absent / emp.total) * 100) : 0}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Full employee breakdown */}
          {data.employeeSummary.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Full Employee Breakdown</Typography>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 560 }} size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell align="center">Total</TableCell>
                        <TableCell align="center">Present</TableCell>
                        <TableCell align="center">Late</TableCell>
                        <TableCell align="center">Absent</TableCell>
                        <TableCell align="center">Attendance %</TableCell>
                        <TableCell align="center">Late %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.employeeSummary.map(emp => (
                        <TableRow key={emp.employeeId} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{emp.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp.position}</Typography>
                          </TableCell>
                          <TableCell align="center">{emp.total}</TableCell>
                          <TableCell align="center">{emp.present}</TableCell>
                          <TableCell align="center">{emp.late}</TableCell>
                          <TableCell align="center">{emp.absent}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${emp.attendanceRate}%`}
                              color={emp.attendanceRate >= 80 ? 'success' : emp.attendanceRate >= 60 ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">{emp.lateRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default AttendanceInsights;
