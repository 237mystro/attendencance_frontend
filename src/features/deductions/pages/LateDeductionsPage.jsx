import { useState } from 'react';

import { PageHero, PageWrapper, TabPanel, Tabs } from '@/components/ui';
import { BonusesPanel } from '../components/BonusesPanel';
import { BufferSettingsPanel } from '../components/BufferSettingsPanel';
import { LateRecordsPanel } from '../components/LateRecordsPanel';
import { ReportsPanel } from '../components/ReportsPanel';

const TABS = [
  { id: 'buffer', label: 'Grace period' },
  { id: 'records', label: 'Late records' },
  { id: 'reports', label: 'Monthly reports' },
  { id: 'bonuses', label: 'Bonuses' },
];

/**
 * Late deductions and bonuses.
 *
 * Each tab owns its own data, so switching does not refetch the others and a
 * slow report cannot hold up the grace-period setting.
 */
export function LateDeductionsPage() {
  const [tab, setTab] = useState('buffer');

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Deductions"
        title="Bonuses and deductions"
        subtitle="Set the grace period, review what lateness has cost, and award bonuses."
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} idPrefix="deductions" />

      <TabPanel id="buffer" value={tab} idPrefix="deductions">
        <BufferSettingsPanel />
      </TabPanel>

      <TabPanel id="records" value={tab} idPrefix="deductions">
        <LateRecordsPanel />
      </TabPanel>

      <TabPanel id="reports" value={tab} idPrefix="deductions">
        <ReportsPanel />
      </TabPanel>

      <TabPanel id="bonuses" value={tab} idPrefix="deductions">
        <BonusesPanel />
      </TabPanel>
    </PageWrapper>
  );
}
