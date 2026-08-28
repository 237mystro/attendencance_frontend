import { Search, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  DataTable,
  ErrorState,
  Input,
  LoadingState,
  MetricCard,
  Panel,
  Select,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { fetchInsights } from '@/api/attendance';
import { fetchEmployeeOptions } from '@/api/employee-options';
import { breakdownColumns, rankingColumns } from '../insights-columns';
import { AttendanceTrendChart } from '../components/AttendanceTrendChart';

const DEFAULT_RANGE_DAYS = 90;

const isoDaysAgo = (days) =>
  new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

/** Aggregated attendance analytics over a date range. */
export function AttendanceInsightsPanel() {
  const [draft, setDraft] = useState({
    startDate: isoDaysAgo(DEFAULT_RANGE_DAYS),
    endDate: new Date().toISOString().slice(0, 10),
    employeeId: '',
  });
  // Only committed filters trigger a request, so editing a date does not fire
  // one query per keystroke.
  const [filters, setFilters] = useState(draft);

  const employees = useApi((signal) => fetchEmployeeOptions(signal), []);
  const insights = useApi(
    (signal) => fetchInsights(filters, signal),
    [filters.startDate, filters.endDate, filters.employeeId],
  );

  const data = insights.data?.data;

  const employeeOptions = [
    { value: '', label: 'All employees' },
    ...(employees.data?.data || []).map((employee) => ({
      value: employee._id,
      label: employee.name,
    })),
  ];

  return (
    <div className="flex flex-col gap-5">
      <Panel title="Query attendance data" interactive={false}>
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters(draft);
          }}
        >
          <Input
            label="From"
            type="date"
            value={draft.startDate}
            max={draft.endDate}
            onChange={(event) =>
              setDraft((current) => ({ ...current, startDate: event.target.value }))
            }
          />
          <Input
            label="To"
            type="date"
            value={draft.endDate}
            min={draft.startDate}
            onChange={(event) =>
              setDraft((current) => ({ ...current, endDate: event.target.value }))
            }
          />
          <Select
            label="Employee"
            value={draft.employeeId}
            options={employeeOptions}
            onChange={(event) =>
              setDraft((current) => ({ ...current, employeeId: event.target.value }))
            }
          />
          <Button
            type="submit"
            loading={insights.loading}
            startIcon={<Search aria-hidden="true" className="size-4" />}
          >
            {insights.loading ? 'Loading…' : 'Run query'}
          </Button>
        </form>
      </Panel>

      {insights.loading && <LoadingState label="Crunching attendance data…" />}

      {insights.error && (
        <ErrorState message={insights.error} onRetry={insights.refetch} />
      )}

      {!insights.loading && !insights.error && data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Total records"
              value={data.summary.totalRecords}
              icon={<Users className="size-5" />}
              accent="text-brand-500"
            />
            <MetricCard
              label="Present"
              value={data.summary.totalPresent}
              icon={<TrendingUp className="size-5" />}
              accent="text-success"
            />
            <MetricCard
              label="Late"
              value={data.summary.totalLate}
              icon={<TrendingDown className="size-5" />}
              accent="text-warn"
            />
            <MetricCard
              label="Absent"
              value={data.summary.totalAbsent}
              icon={<TrendingDown className="size-5" />}
              accent="text-danger"
            />
          </div>

          <AttendanceTrendChart trend={data.monthlyTrend} />

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="Most late arrivals" interactive={false}>
              <DataTable
                columns={rankingColumns({ countKey: 'late', countHeader: 'Late', tone: 'warn' })}
                rows={data.topLate || []}
                getRowKey={(row) => row.employeeId}
                emptyTitle="No late records"
                emptyDescription="Nobody arrived late in this period."
              />
            </Panel>

            <Panel title="Most absences" interactive={false}>
              <DataTable
                columns={rankingColumns({ countKey: 'absent', countHeader: 'Absent', tone: 'danger' })}
                rows={data.topAbsent || []}
                getRowKey={(row) => row.employeeId}
                emptyTitle="No absence records"
                emptyDescription="Nobody was absent in this period."
              />
            </Panel>
          </div>

          <Panel title="Full employee breakdown" interactive={false}>
            <DataTable
              columns={breakdownColumns}
              rows={data.employeeSummary || []}
              getRowKey={(row) => row.employeeId}
              caption="Attendance totals per employee"
              emptyTitle="No employees in this range"
            />
          </Panel>
        </>
      )}
    </div>
  );
}
