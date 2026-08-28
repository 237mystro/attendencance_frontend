import { Landmark, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import {
  DataTable,
  IconButton,
  PageHero,
  PageWrapper,
  Panel,
  Select,
} from '@/components/ui';
import { AdvanceReviewDialog } from '../components/AdvanceReviewDialog';
import { advanceReviewColumns } from '../advance-columns';
import { useAdvanceReview } from '../hooks/useSalaryAdvances';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'repaid', label: 'Repaid' },
];

/** The approver's queue for salary advances. */
export function SalaryAdvanceAdminPage() {
  const advances = useAdvanceReview();
  const [reviewing, setReviewing] = useState(null);

  const columns = advanceReviewColumns({
    onReview: setReviewing,
    onMarkRepaid: advances.markRepaid,
    working: advances.working,
  });

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Salary advances"
        title="Advance requests"
        subtitle="Approve advances against future salary and track what is still to be recovered."
      />

      <Panel
        title="Requests"
        subtitle={`${advances.advances.length} shown`}
        interactive={false}
        action={
          <div className="flex items-center gap-2">
            <Select
              label="Status"
              wrapperClassName="w-44"
              options={STATUS_OPTIONS}
              value={advances.status}
              onChange={(event) => advances.setStatus(event.target.value)}
            />
            <IconButton label="Refresh requests" onClick={advances.refetch}>
              <RefreshCw aria-hidden="true" />
            </IconButton>
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={advances.advances}
          loading={advances.loading}
          error={advances.error}
          onRetry={advances.refetch}
          caption="Salary advance requests"
          emptyIcon={<Landmark aria-hidden="true" className="size-6" />}
          emptyTitle="No requests here"
          emptyDescription={
            advances.status
              ? 'Try a different status filter.'
              : 'Advance requests appear here as employees send them.'
          }
        />
      </Panel>

      {reviewing && (
        <AdvanceReviewDialog
          key={reviewing._id}
          advance={reviewing}
          working={advances.working}
          onClose={() => setReviewing(null)}
          onDecide={async (advance, action, values) => {
            const done = await advances.review(advance, action, values);
            if (done) setReviewing(null);
          }}
        />
      )}
    </PageWrapper>
  );
}
