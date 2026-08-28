import { CalendarDays } from 'lucide-react';
import { useState } from 'react';

import { DataTable, PageHero, PageWrapper, Panel, TabPanel, Tabs } from '@/components/ui';
import { LEAVE_STATUS } from '@/constants/status';
import { LeaveReviewDialog } from '../components/LeaveReviewDialog';
import { useLeaveReview } from '../hooks/useLeaveRequests';
import { leaveReviewColumns } from '../leave-columns';

const TAB_STATUS = {
  pending: LEAVE_STATUS.PENDING,
  approved: LEAVE_STATUS.APPROVED,
  denied: LEAVE_STATUS.DENIED,
};

/** The approver's queue for leave requests. */
export function LeaveManagementPage() {
  const leave = useLeaveReview();
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState(null);

  const status = TAB_STATUS[tab];
  const rows = leave.requests.filter((request) => request.status === status);

  const columns = leaveReviewColumns({
    status,
    onReview: (request, action) => setPending({ request, action }),
  });

  const tabs = [
    { id: 'pending', label: 'Pending', count: leave.counts.pending },
    { id: 'approved', label: 'Approved' },
    { id: 'denied', label: 'Denied' },
  ];

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Leave"
        title="Leave management"
        subtitle="Review time-off requests and record the reasoning behind each decision."
        chips={leave.counts.pending > 0 ? [`${leave.counts.pending} awaiting review`] : []}
      />

      <Tabs tabs={tabs} value={tab} onChange={setTab} idPrefix="leave" />

      <TabPanel id={tab} value={tab} idPrefix="leave">
        <Panel interactive={false}>
          <DataTable
            columns={columns}
            rows={rows}
            loading={leave.loading}
            error={leave.error}
            onRetry={leave.refetch}
            caption={`${tab} leave requests`}
            emptyIcon={<CalendarDays aria-hidden="true" className="size-6" />}
            emptyTitle={`No ${tab} requests`}
            emptyDescription={
              tab === 'pending'
                ? 'Nothing is waiting on you right now.'
                : `No requests have been ${tab} yet.`
            }
          />
        </Panel>
      </TabPanel>

      {pending && (
        <LeaveReviewDialog
          request={pending.request}
          action={pending.action}
          loading={leave.reviewing}
          onClose={() => setPending(null)}
          onConfirm={async (note) => {
            const done = await leave.review(pending.request, pending.action, note);
            if (done) setPending(null);
          }}
        />
      )}
    </PageWrapper>
  );
}
