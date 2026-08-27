import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Alert, Collapse, IconButton, Tooltip, Tab, Tabs,
  LinearProgress
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  AccessTime, CardGiftcard, MoneyOff, CheckCircle, KeyboardArrowDown,
  KeyboardArrowUp, Info, EmojiEvents
} from '@mui/icons-material';
import { apiRequest } from '../../utils/api';

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

const STATUS_COLORS = { draft: 'default', approved: 'primary', paid: 'success' };
const STATUS_LABELS = { draft: 'Pending', approved: 'Approved', paid: 'Paid' };
const BONUS_TYPES = { overtime: 'Overtime', good_conduct: 'Good Conduct', other: 'Other' };
const BONUS_COLORS = { overtime: 'primary', good_conduct: 'success', other: 'default' };
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '--';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function SummaryCard({ icon, label, value, color, sub }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid #e8ecf3', borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
        </Box>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#1a2f52' }}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

function RecordRow({ record }) {
  return (
    <TableRow hover>
      <TableCell>{fmtDate(record.date)}</TableCell>
      <TableCell>{record.scheduledStart || '--'}</TableCell>
      <TableCell>{fmtTime(record.actualCheckIn)}</TableCell>
      <TableCell>
        <Chip
          label={`${record.lateMinutes} min`}
          size="small"
          sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600, fontSize: 12 }}
        />
      </TableCell>
      <TableCell align="right" sx={{ color: '#d32f2f', fontWeight: 600 }}>
        -XAF {fmt(record.deductionAmount)}
      </TableCell>
    </TableRow>
  );
}

function ReportRow({ report, lateRecords }) {
  const [open, setOpen] = useState(false);
  const myRecords = lateRecords.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() + 1 === report.month && d.getFullYear() === report.year;
  });

  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <TableCell>
          <IconButton size="small">{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>
        </TableCell>
        <TableCell><Typography fontWeight={600}>{report.period}</Typography></TableCell>
        <TableCell>
          <Chip
            label={STATUS_LABELS[report.status] || report.status}
            color={STATUS_COLORS[report.status] || 'default'}
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          <Chip label={`${report.totalLateMinutes} min late`} size="small"
            sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }} />
        </TableCell>
        <TableCell align="right" sx={{ color: '#d32f2f', fontWeight: 600 }}>
          -XAF {fmt(report.deductionAmount)}
        </TableCell>
        <TableCell align="right" sx={{ color: '#388e3c', fontWeight: 700 }}>
          XAF {fmt(report.finalSalary)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: '#f9fafb' }}>
              <Box sx={{ display: 'flex', gap: 4, mb: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Base Salary</Typography>
                  <Typography fontWeight={600}>XAF {fmt(report.baseSalary)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Deduction</Typography>
                  <Typography fontWeight={600} sx={{ color: '#d32f2f' }}>-XAF {fmt(report.deductionAmount)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Net Salary</Typography>
                  <Typography fontWeight={700} sx={{ color: '#388e3c' }}>XAF {fmt(report.finalSalary)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Buffer Applied</Typography>
                  <Typography fontWeight={600}>{report.bufferMinutes} min</Typography>
                </Box>
                {report.emailSentAt && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Report Emailed</Typography>
                    <Typography fontWeight={600}>{fmtDate(report.emailSentAt)}</Typography>
                  </Box>
                )}
              </Box>

              {myRecords.length > 0 && (
                <>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    LATE ARRIVAL DETAILS
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e8ecf3', borderRadius: 2, overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 400 }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell>Date</TableCell>
                          <TableCell>Scheduled</TableCell>
                          <TableCell>Checked In</TableCell>
                          <TableCell>Late By</TableCell>
                          <TableCell align="right">Deduction</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myRecords.map(r => <RecordRow key={r._id} record={r} />)}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              {myRecords.length === 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Detailed records not available for this period.
                </Alert>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function MyDeductions() {
  const [tab, setTab] = useState(0);
  const [reports, setReports] = useState([]);
  const [lateRecords, setLateRecords] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [repRes, recRes, bonRes] = await Promise.allSettled([
      apiRequest('/deductions/my-reports'),
      apiRequest('/deductions/my-records'),
      apiRequest('/deductions/my-bonuses')
    ]);
    if (repRes.status === 'fulfilled' && repRes.value?.success) setReports(repRes.value.data || []);
    if (recRes.status === 'fulfilled' && recRes.value?.success) setLateRecords(recRes.value.data || []);
    if (bonRes.status === 'fulfilled' && bonRes.value?.success) setBonuses(bonRes.value.data || []);
    const firstError = [repRes, recRes, bonRes].find(r => r.status === 'rejected');
    if (firstError) setError(firstError.reason?.message || 'Some data failed to load.');
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Summary stats
  const totalLateMinutes = lateRecords.reduce((s, r) => s + (r.lateMinutes || 0), 0);
  const totalDeducted = reports
    .filter(r => r.status === 'paid')
    .reduce((s, r) => s + (r.deductionAmount || 0), 0);
  const totalBonuses = bonuses.reduce((s, b) => s + (b.amount || 0), 0);
  const paidReports = reports.filter(r => r.status === 'paid').length;

  // Group current month late records
  const now = new Date();
  const thisMonthRecords = lateRecords.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <CardGiftcard sx={{ fontSize: 30, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary' }}>
            My Pay Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your bonuses, late arrivals, and deductions
          </Typography>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<EmojiEvents />}
            label="Total Bonuses"
            value={`XAF ${fmt(totalBonuses)}`}
            color="#388e3c"
            sub={`${bonuses.length} bonus${bonuses.length !== 1 ? 'es' : ''} received`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<AccessTime />}
            label="Total Late (All Time)"
            value={`${totalLateMinutes} min`}
            color="#ff9800"
            sub={`${lateRecords.length} late occurrence${lateRecords.length !== 1 ? 's' : ''}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<MoneyOff />}
            label="Total Deducted"
            value={`XAF ${fmt(totalDeducted)}`}
            color="#d32f2f"
            sub={`From ${paidReports} paid report${paidReports !== 1 ? 's' : ''}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<CheckCircle />}
            label="Reports Processed"
            value={reports.length}
            color="#1976d2"
            sub={`${paidReports} paid, ${reports.filter(r => r.status === 'approved').length} approved`}
          />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Tab label="Bonuses" />
        <Tab label="Late Records" />
        <Tab label="Reports" />
      </Tabs>

      {/* TAB 0: Bonuses */}
      {tab === 0 && (
        <Box>
          {bonuses.length === 0 && !loading ? (
            <Card elevation={0} sx={{ border: '1px solid #e8ecf3', borderRadius: 3 }}>
              <CardContent sx={{ py: 5, textAlign: 'center' }}>
                <EmojiEvents sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                <Typography color="text.secondary">No bonuses yet.</Typography>
                <Typography variant="body2" color="text.secondary">
                  Bonuses given by your admin will appear here.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Card} elevation={0} sx={{ border: '1px solid #e8ecf3', borderRadius: 3, overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 480 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Given By</TableCell>
                    <TableCell align="right">Amount (XAF)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bonuses.map(b => (
                    <TableRow key={b._id} hover>
                      <TableCell>{fmtDate(b.date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={BONUS_TYPES[b.type] || b.type}
                          size="small"
                          color={BONUS_COLORS[b.type] || 'default'}
                        />
                      </TableCell>
                      <TableCell>{b.reason || '—'}</TableCell>
                      <TableCell>
                        <Typography variant="caption">{b.createdBy?.name || '—'}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>
                        +{fmt(b.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#f0fdf4' }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>
                      +{fmt(totalBonuses)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* TAB 1: Late Records */}
      {tab === 1 && (
        <Box>
          {thisMonthRecords.length > 0 && (
            <Card elevation={0} sx={{ border: '1px solid #e8ecf3', borderRadius: 3, mb: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AccessTime sx={{ color: '#ff9800' }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    {MONTH_NAMES[now.getMonth()]} {now.getFullYear()} — This Month
                  </Typography>
                  <Tooltip title="These are your late arrivals this month. A report will be generated at month-end.">
                    <Info sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                </Box>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 400 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Date</TableCell>
                        <TableCell>Scheduled</TableCell>
                        <TableCell>Checked In</TableCell>
                        <TableCell>Late By</TableCell>
                        <TableCell align="right">Est. Deduction</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {thisMonthRecords.map(r => <RecordRow key={r._id} record={r} />)}
                      <TableRow sx={{ bgcolor: '#fff8f0' }}>
                        <TableCell colSpan={3} sx={{ fontWeight: 700 }}>Total</TableCell>
                        <TableCell>
                          <Chip label={`${thisMonthRecords.reduce((s, r) => s + r.lateMinutes, 0)} min`} size="small"
                            sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700 }} />
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#d32f2f', fontWeight: 700 }}>
                          -XAF {fmt(thisMonthRecords.reduce((s, r) => s + r.deductionAmount, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {lateRecords.length === 0 && !loading ? (
            <Alert severity="success" icon={<CheckCircle />}>
              No late records — great attendance!
            </Alert>
          ) : lateRecords.filter(r => {
            const d = new Date(r.date);
            return !(d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());
          }).length > 0 && (
            <Card elevation={0} sx={{ border: '1px solid #e8ecf3', borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>All Late Records</Typography>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 400 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Date</TableCell>
                        <TableCell>Scheduled</TableCell>
                        <TableCell>Checked In</TableCell>
                        <TableCell>Late By</TableCell>
                        <TableCell align="right">Deduction</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lateRecords.filter(r => {
                        const d = new Date(r.date);
                        return !(d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());
                      }).map(r => <RecordRow key={r._id} record={r} />)}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* TAB 2: Reports */}
      {tab === 2 && (
        <Card elevation={0} sx={{ border: '1px solid #e8ecf3', borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Monthly Deduction Reports
            </Typography>

            {!loading && reports.length === 0 && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                <Typography color="text.secondary">No deduction reports yet.</Typography>
                <Typography variant="body2" color="text.secondary">
                  Reports are generated by your admin at the end of each month.
                </Typography>
              </Box>
            )}

            {reports.length > 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell width={40} />
                      <TableCell>Period</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Late Time</TableCell>
                      <TableCell align="right">Deduction</TableCell>
                      <TableCell align="right">Net Salary</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map(r => (
                      <ReportRow key={r._id} report={r} lateRecords={lateRecords} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />
      <Alert severity="info" icon={<Info />}>
        <Typography variant="body2">
          <strong>How deductions work:</strong> If you check in after your shift start time plus the
          buffer period, the late minutes are recorded. At month-end your admin generates a report,
          approves it, and sends you a copy by email. Deduction = (late minutes ÷ 60) × hourly rate.
        </Typography>
      </Alert>
    </Box>
  );
}
