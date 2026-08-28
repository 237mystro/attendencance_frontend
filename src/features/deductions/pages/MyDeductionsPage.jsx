import { Clock, Gift, MinusCircle, Trophy } from 'lucide-react';
import { useState } from 'react';

import {
  DataTable,
  MetricCard,
  PageHero,
  PageWrapper,
  Panel,
  TabPanel,
  Tabs,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/formatters';
import {
  fetchMyBonuses,
  fetchMyLateRecords,
  fetchMyReports,
} from '@/api/deductions';
import {
  myBonusColumns,
  myRecordColumns,
  myReportColumns,
} from '../my-deduction-columns';

/** What lateness has cost the employee, and what bonuses have offset it. */
export function MyDeductionsPage() {
  const [tab, setTab] = useState('records');

  const recordQuery = useApi((signal) => fetchMyLateRecords(signal), []);
  const reportQuery = useApi((signal) => fetchMyReports(signal), []);
  const bonusQuery = useApi((signal) => fetchMyBonuses(signal), []);

  const records = recordQuery.data?.data || [];
  const reports = reportQuery.data?.data || [];
  const bonuses = bonusQuery.data?.data || [];

  const totalDeducted = reports.reduce(
    (total, report) => total + (report.deductionAmount || 0),
    0,
  );
  const totalBonuses = bonuses.reduce((total, bonus) => total + (bonus.amount || 0), 0);
  const lateMinutes = records.reduce(
    (total, record) => total + (record.lateMinutes || 0),
    0,
  );

  const tabs = [
    { id: 'records', label: 'Late records' },
    { id: 'reports', label: 'Monthly reports' },
    { id: 'bonuses', label: 'Bonuses' },
  ];

  return (
    <PageWrapper>
      <PageHero
        eyebrow="My deductions"
        title="What lateness has cost you"
        subtitle="Every late arrival, the monthly totals, and the bonuses that offset them."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total late minutes"
          value={lateMinutes}
          icon={<Clock className="size-5" />}
          accent="text-warn"
        />
        <MetricCard
          label="Total deducted"
          value={formatCurrency(totalDeducted)}
          icon={<MinusCircle className="size-5" />}
          accent="text-danger"
        />
        <MetricCard
          label="Total bonuses"
          value={formatCurrency(totalBonuses)}
          icon={<Trophy className="size-5" />}
          accent="text-success"
        />
      </div>

      <Tabs tabs={tabs} value={tab} onChange={setTab} idPrefix="my-deductions" />

      <TabPanel id="records" value={tab} idPrefix="my-deductions">
        <Panel interactive={false}>
          <DataTable
            columns={myRecordColumns}
            rows={records}
            loading={recordQuery.loading}
            error={recordQuery.error}
            onRetry={recordQuery.refetch}
            caption="My late arrivals"
            emptyIcon={<Clock aria-hidden="true" className="size-6" />}
            emptyTitle="No late arrivals"
            emptyDescription="You have not been late beyond the grace period."
          />
        </Panel>
      </TabPanel>

      <TabPanel id="reports" value={tab} idPrefix="my-deductions">
        <Panel interactive={false}>
          <DataTable
            columns={myReportColumns}
            rows={reports}
            loading={reportQuery.loading}
            error={reportQuery.error}
            onRetry={reportQuery.refetch}
            caption="My monthly deduction reports"
            emptyIcon={<MinusCircle aria-hidden="true" className="size-6" />}
            emptyTitle="No reports yet"
            emptyDescription="Monthly summaries appear here once they are generated."
          />
        </Panel>
      </TabPanel>

      <TabPanel id="bonuses" value={tab} idPrefix="my-deductions">
        <Panel interactive={false}>
          <DataTable
            columns={myBonusColumns}
            rows={bonuses}
            loading={bonusQuery.loading}
            error={bonusQuery.error}
            onRetry={bonusQuery.refetch}
            caption="My bonuses"
            emptyIcon={<Gift aria-hidden="true" className="size-6" />}
            emptyTitle="No bonuses yet"
            emptyDescription="Bonuses your manager awards appear here."
          />
        </Panel>
      </TabPanel>
    </PageWrapper>
  );
}
