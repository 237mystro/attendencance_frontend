import { Landmark, Plus } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, DataTable, PageHero, PageWrapper, Panel } from '@/components/ui';
import { AdvanceRequestDialog } from '../components/AdvanceRequestDialog';
import { myAdvanceColumns } from '../advance-columns';
import { useMyAdvances } from '../hooks/useSalaryAdvances';

/** The employee's own salary advances. */
export function MySalaryAdvancePage() {
  const advances = useMyAdvances();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <PageWrapper className="max-w-4xl">
      <PageHero
        eyebrow="Salary advance"
        title="Advances against your salary"
        subtitle="Request an advance and track how it will be recovered."
        actions={
          <Button
            variant="secondary"
            className="border-white/20 bg-white/15 text-white hover:bg-white/25"
            disabled={advances.hasPending}
            startIcon={<Plus aria-hidden="true" className="size-4" />}
            onClick={() => setFormOpen(true)}
          >
            Request an advance
          </Button>
        }
      />

      {advances.hasPending && (
        <Alert tone="info" className="mb-5">
          You already have a request awaiting a decision. You can send another once
          it has been reviewed.
        </Alert>
      )}

      <Panel title="My requests" interactive={false}>
        <DataTable
          columns={myAdvanceColumns}
          rows={advances.advances}
          loading={advances.loading}
          error={advances.error}
          onRetry={advances.refetch}
          caption="My salary advance requests"
          emptyIcon={<Landmark aria-hidden="true" className="size-6" />}
          emptyTitle="No advances yet"
          emptyDescription="Request an advance and it will appear here with its status."
          emptyAction={
            <Button
              startIcon={<Plus aria-hidden="true" className="size-4" />}
              onClick={() => setFormOpen(true)}
            >
              Request an advance
            </Button>
          }
        />
      </Panel>

      {formOpen && (
        <AdvanceRequestDialog
          onClose={() => setFormOpen(false)}
          onSubmit={advances.submit}
          submitting={advances.submitting}
        />
      )}
    </PageWrapper>
  );
}
