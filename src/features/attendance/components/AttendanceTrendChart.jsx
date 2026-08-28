import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { EmptyState, Panel } from '@/components/ui';
import { useTheme } from '@/context/theme-context';

/** Series colours, matching the status tones used across the app. */
const SERIES = [
  { key: 'Present', color: 'var(--color-success)' },
  { key: 'Late', color: 'var(--color-warn)' },
  { key: 'Absent', color: 'var(--color-danger)' },
];

/**
 * Monthly present / late / absent totals.
 *
 * Recharts needs concrete colour values for axes and tooltips, so those follow
 * the current theme rather than inheriting; the bars use CSS custom properties,
 * which resolve correctly in both.
 */
export function AttendanceTrendChart({ trend }) {
  const { isDark } = useTheme();

  const rows = (trend || []).map((month) => ({
    month: month.month,
    Present: month.present,
    Late: month.late,
    Absent: month.absent,
  }));

  if (!rows.length) {
    return (
      <Panel title="Monthly attendance trend" interactive={false}>
        <EmptyState
          title="Not enough data yet"
          description="Attendance trends appear once there are records in the selected range."
        />
      </Panel>
    );
  }

  const axis = isDark ? '#94a3b8' : '#64748b';
  const grid = isDark ? 'rgb(255 255 255 / 0.08)' : 'rgb(15 23 42 / 0.08)';

  return (
    <Panel title="Monthly attendance trend" interactive={false}>
      {/* Fixed height: ResponsiveContainer needs a sized parent to measure. */}
      <div className="h-70 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: axis }} stroke={grid} />
            <YAxis tick={{ fontSize: 12, fill: axis }} stroke={grid} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${grid}`,
                background: isDark ? '#111c30' : '#ffffff',
                color: isDark ? '#e5eefb' : '#0f172a',
                fontSize: 13,
              }}
              cursor={{ fill: grid }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            {SERIES.map((series) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                fill={series.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
