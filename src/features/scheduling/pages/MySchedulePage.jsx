import { CalendarCheck, Inbox } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageWrapper,
  Panel,
  SearchInput,
  TabPanel,
  Tabs,
} from '@/components/ui';
import { formatDate } from '@/lib/formatters';
import {
  IncomingTransferCard,
  InvitationCard,
  OutgoingTransferCard,
  ShiftCard,
} from '../components/ShiftCards';
import { TransferRequestDialog } from '../components/TransferRequestDialog';
import { useMySchedule } from '../hooks/useMySchedule';

/** The employee's schedule, invitations, and shift transfers. */
export function MySchedulePage() {
  const schedule = useMySchedule();
  const [tab, setTab] = useState('shifts');
  const [search, setSearch] = useState('');
  const [transferring, setTransferring] = useState(null);

  const visibleShifts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return schedule.myShifts;

    return schedule.myShifts.filter((shift) =>
      [shift.day, shift.startTime, shift.endTime, formatDate(shift.date)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [schedule.myShifts, search]);

  const tabs = [
    { id: 'shifts', label: 'My shifts' },
    {
      id: 'invitations',
      label: 'Invitations',
      count: schedule.invitations.length,
    },
    { id: 'transfers', label: 'Transfers', count: schedule.incoming.length },
  ];

  return (
    <PageWrapper className="max-w-4xl">
      <header className="mb-5">
        <h2 className="text-xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
          My schedule
        </h2>
        <p className="mt-1 text-sm text-muted dark:text-muted-soft">
          Your shifts, invitations awaiting a reply, and transfers with
          colleagues.
        </p>
      </header>

      {/* The header and tabs stay put while loading or on failure, so the
          screen never collapses to a bare error message. */}
      {schedule.loading ? (
        <LoadingState label="Loading your schedule…" />
      ) : schedule.error ? (
        <ErrorState message={schedule.error} onRetry={schedule.refetch} />
      ) : (
        <>
          <Tabs tabs={tabs} value={tab} onChange={setTab} idPrefix="schedule" />

          <TabPanel id="shifts" value={tab} idPrefix="schedule">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by day, date, or time…"
              label="Search my shifts"
              className="mb-4 sm:max-w-md"
            />

            {visibleShifts.length === 0 ? (
              <div className="surface-panel">
                <EmptyState
                  icon={<CalendarCheck aria-hidden="true" className="size-6" />}
                  title={search ? 'No matching shifts' : 'No shifts scheduled'}
                  description={
                    search
                      ? 'Try a different day, date, or time.'
                      : 'Shifts appear here once you accept an invitation.'
                  }
                />
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {visibleShifts.map((shift) => (
                  <ShiftCard
                    key={shift._id}
                    shift={shift}
                    onTransfer={setTransferring}
                  />
                ))}
              </ul>
            )}
          </TabPanel>

          <TabPanel id="invitations" value={tab} idPrefix="schedule">
            {schedule.invitations.length === 0 ? (
              <div className="surface-panel">
                <EmptyState
                  icon={<Inbox aria-hidden="true" className="size-6" />}
                  title="No pending invitations"
                  description="When your manager assigns you a shift, it appears here for you to accept or decline."
                />
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {schedule.invitations.map((shift) => (
                  <InvitationCard
                    key={shift._id}
                    shift={shift}
                    busy={schedule.responding === shift._id}
                    onAnswer={schedule.answerInvitation}
                  />
                ))}
              </ul>
            )}
          </TabPanel>

          <TabPanel id="transfers" value={tab} idPrefix="schedule">
            <div className="flex flex-col gap-5">
              <Panel
                title="Requests for you"
                interactive={false}
                bodyClassName="p-0 sm:p-0"
              >
                {schedule.incoming.length === 0 ? (
                  <EmptyState
                    title="Nothing to review"
                    description="Requests from colleagues who want you to cover a shift appear here."
                  />
                ) : (
                  <ul className="flex flex-col gap-3 p-4 sm:p-5">
                    {schedule.incoming.map((transfer) => (
                      <IncomingTransferCard
                        key={transfer._id}
                        transfer={transfer}
                        busy={schedule.responding === transfer._id}
                        onAnswer={schedule.answerTransfer}
                      />
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel
                title="Requests you sent"
                interactive={false}
                bodyClassName="p-0 sm:p-0"
              >
                {schedule.outgoing.length === 0 ? (
                  <EmptyState
                    title="No requests sent"
                    description="Use Transfer on any upcoming shift to offer it to a colleague."
                  />
                ) : (
                  <ul className="flex flex-col gap-3 p-4 sm:p-5">
                    {schedule.outgoing.map((transfer) => (
                      <OutgoingTransferCard
                        key={transfer._id}
                        transfer={transfer}
                      />
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </TabPanel>
        </>
      )}

      {transferring && (
        <TransferRequestDialog
          shift={transferring}
          candidates={schedule.candidates}
          onClose={() => setTransferring(null)}
          onSubmit={schedule.offerTransfer}
          submitting={schedule.submitting}
        />
      )}
    </PageWrapper>
  );
}
