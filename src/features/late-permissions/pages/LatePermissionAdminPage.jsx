import { Clock } from 'lucide-react';
import { useState } from 'react';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHero,
  PageWrapper,
  TabPanel,
  Tabs,
} from '@/components/ui';
import { LateRequestCard } from '../components/LateRequestCard';
import { LateReviewDialog } from '../components/LateReviewDialog';
import { useLateRequestReview } from '../hooks/useLatePermissions';

/** The approver's queue for late-arrival requests. */
export function LatePermissionAdminPage() {
  const late = useLateRequestReview();
  const [tab, setTab] = useState('pending');
  const [reviewing, setReviewing] = useState(null);

  const rows = tab === 'pending' ? late.pending : late.requests;

  const tabs = [
    { id: 'pending', label: 'Pending', count: late.pending.length },
    { id: 'all', label: `All requests (${late.requests.length})` },
  ];

  return (
    <PageWrapper className="max-w-4xl">
      <PageHero
        eyebrow="Late requests"
        title="Late arrival requests"
        subtitle="Review requests to arrive late and decide whether the usual penalty applies."
        chips={late.pending.length > 0 ? [`${late.pending.length} awaiting review`] : []}
      />

      <Tabs tabs={tabs} value={tab} onChange={setTab} idPrefix="late" />

      <TabPanel id={tab} value={tab} idPrefix="late">
        {late.loading ? (
          <LoadingState label="Loading requests…" />
        ) : late.error ? (
          <ErrorState message={late.error} onRetry={late.refetch} />
        ) : rows.length === 0 ? (
          <div className="surface-panel">
            <EmptyState
              icon={<Clock aria-hidden="true" className="size-6" />}
              title={tab === 'pending' ? 'Nothing to review' : 'No requests yet'}
              description={
                tab === 'pending'
                  ? 'Requests appear here as employees send them.'
                  : 'Nobody has asked to arrive late yet.'
              }
            />
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((request) => (
              <LateRequestCard
                key={request._id}
                request={request}
                onReview={setReviewing}
              />
            ))}
          </ul>
        )}
      </TabPanel>

      {reviewing && (
        <LateReviewDialog
          request={reviewing}
          loading={late.reviewing}
          onClose={() => setReviewing(null)}
          onConfirm={async (decision) => {
            const done = await late.review(reviewing, decision);
            if (done) setReviewing(null);
          }}
        />
      )}
    </PageWrapper>
  );
}
