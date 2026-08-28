import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { EmptyState, Panel } from '@/components/ui';
import { useTheme } from '@/context/theme-context';

/**
 * Recharts needs concrete colours for axes, grids, and tooltips — it measures
 * and inlines them rather than inheriting from CSS — so those follow the
 * current theme explicitly.
 */
const useChartColors = () => {
  const { isDark } = useTheme();
  return {
    axis: isDark ? '#94a3b8' : '#64748b',
    grid: isDark ? 'rgb(255 255 255 / 0.08)' : 'rgb(15 23 42 / 0.08)',
    surface: isDark ? '#111c30' : '#ffffff',
    text: isDark ? '#e5eefb' : '#0f172a',
  };
};

/** Present versus absent across the week. */
export function WeeklyAttendanceChart({ data }) {
  const colors = useChartColors();

  if (!data?.length) {
    return (
      <Panel title="Weekly attendance pattern" interactive={false}>
        <EmptyState
          title="Not enough data yet"
          description="The weekly pattern appears once a few days of attendance are recorded."
        />
      </Panel>
    );
  }

  return (
    <Panel
      title="Weekly attendance pattern"
      subtitle="Spot staffing pressure before it affects payroll or service."
      interactive={false}
    >
      {/* ResponsiveContainer needs a sized parent to measure against. */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: colors.axis }} stroke={colors.grid} />
            <YAxis tick={{ fontSize: 12, fill: colors.axis }} stroke={colors.grid} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: colors.grid }}
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${colors.grid}`,
                background: colors.surface,
                color: colors.text,
                fontSize: 13,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="present" name="Present" fill="var(--color-brand-500)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="absent" name="Absent" fill="var(--color-danger)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

/** Today's present / late / absent split. */
export function AttendanceMixChart({ mix }) {
  const colors = useChartColors();
  const total = mix.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <Panel
      title="Today's attendance mix"
      subtitle="The present, late, and absent split for today."
      interactive={false}
    >
      {total === 0 ? (
        <EmptyState
          title="Nobody has checked in yet"
          description="The split appears as people arrive."
        />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mix}
                dataKey="value"
                nameKey="name"
                innerRadius="52%"
                outerRadius="80%"
                paddingAngle={2}
              >
                {mix.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${colors.grid}`,
                  background: colors.surface,
                  color: colors.text,
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
