import { Badge } from '@/components/ui';

/** Colours the attendance-rate chip by band, as the source did. */
const rateTone = (rate) => {
  if (rate >= 80) return 'success';
  if (rate >= 60) return 'warn';
  return 'danger';
};

/** Name over position — the identity cell shared by every insights table. */
const employeeCell = {
  key: 'name',
  header: 'Employee',
  primary: true,
  render: (row) => (
    <span>
      <span className="block font-semibold">{row.name}</span>
      <span className="block text-xs text-muted dark:text-muted-soft">
        {row.position}
      </span>
    </span>
  ),
};

/**
 * Columns for the "most late" and "most absences" rankings.
 *
 * The two differ only in which count they show and how the rate is derived —
 * late arrives pre-computed from the API, absences are worked out from the
 * total — so one factory covers both.
 */
export const rankingColumns = ({ countKey, countHeader, tone }) => [
  employeeCell,
  {
    key: countKey,
    header: countHeader,
    align: 'center',
    render: (row) => <Badge tone={tone}>{row[countKey]}</Badge>,
  },
  {
    key: 'rate',
    header: 'Rate',
    align: 'center',
    render: (row) =>
      countKey === 'late'
        ? `${row.lateRate}%`
        : `${row.total > 0 ? Math.round((row.absent / row.total) * 100) : 0}%`,
  },
];

/** Columns for the full per-employee breakdown. */
export const breakdownColumns = [
  employeeCell,
  { key: 'total', header: 'Total', align: 'center' },
  { key: 'present', header: 'Present', align: 'center' },
  { key: 'late', header: 'Late', align: 'center' },
  { key: 'absent', header: 'Absent', align: 'center' },
  {
    key: 'attendanceRate',
    header: 'Attendance %',
    align: 'center',
    render: (row) => (
      <Badge tone={rateTone(row.attendanceRate)}>{row.attendanceRate}%</Badge>
    ),
  },
  {
    key: 'lateRate',
    header: 'Late %',
    align: 'center',
    render: (row) => `${row.lateRate}%`,
  },
];
