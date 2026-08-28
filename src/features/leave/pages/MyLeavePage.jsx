import { CalendarDays, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button, DataTable, PageWrapper, Panel } from '@/components/ui';
import { LeaveRequestDialog } from '../components/LeaveRequestDialog';
import { useMyLeaveRequests } from '../hooks/useLeaveRequests';
import { myLeaveColumns } from '../leave-columns';

/** The employee's own leave requests, and the form to add one. */
export function MyLeavePage() {
  const leave = useMyLeaveRequests();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <PageWrapper className="max-w-4xl">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
            My leave
          </h2>
          <p className="mt-1 text-sm text-muted dark:text-muted-soft">
            Request time off and track where each request stands.
          </p>
        </div>

        <Button
          startIcon={<Plus aria-hidden="true" className="size-4" />}
          onClick={() => setFormOpen(true)}
        >
          Request leave
        </Button>
      </header>

      <Panel
        title="My requests"
        subtitle={
          leave.counts.pending > 0
            ? `${leave.counts.pending} awaiting a decision`
            : undefined
        }
        interactive={false}
      >
        <DataTable
          columns={myLeaveColumns}
          rows={leave.requests}
          loading={leave.loading}
          error={leave.error}
          onRetry={leave.refetch}
          caption="My leave requests"
          emptyIcon={<CalendarDays aria-hidden="true" className="size-6" />}
          emptyTitle="No leave requests yet"
          emptyDescription="Request time off and it will appear here with its status."
          emptyAction={
            <Button
              startIcon={<Plus aria-hidden="true" className="size-4" />}
              onClick={() => setFormOpen(true)}
            >
              Request leave
            </Button>
          }
        />
      </Panel>

      {formOpen && (
        <LeaveRequestDialog
          onClose={() => setFormOpen(false)}
          onSubmit={leave.submit}
          submitting={leave.submitting}
        />
      )}
    </PageWrapper>
  );
}
