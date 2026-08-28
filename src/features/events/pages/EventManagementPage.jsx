import { CalendarDays, MapPin, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  PageHero,
  PageWrapper,
  TabPanel,
  Tabs,
} from '@/components/ui';
import { formatDateTime } from '@/lib/formatters';
import { EventDetailDialog } from '../components/EventDetailDialog';
import { EventWizardDialog } from '../components/EventWizardDialog';
import { useEvents } from '../hooks/useEvents';

/** One event in the list. */
function EventCard({ event, onOpen, onDelete }) {
  return (
    <li className="surface-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h4 className="font-bold text-ink dark:text-ink-dark">{event.title}</h4>
        <p className="mt-0.5 text-sm text-muted dark:text-muted-soft">
          {formatDateTime(event.date)}
        </p>
        {event.location?.address && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted dark:text-muted-soft">
            <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
            {event.location.address}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Badge tone="neutral" icon={<Users aria-hidden="true" className="size-3.5" />}>
          {event.attendeeCount ?? 0}
        </Badge>
        <Button size="sm" variant="secondary" onClick={() => onOpen(event)}>
          Attendees
        </Button>
        <IconButton
          label={`Delete ${event.title}`}
          size="sm"
          className="text-danger"
          onClick={() => onDelete(event)}
        >
          <Trash2 aria-hidden="true" />
        </IconButton>
      </div>
    </li>
  );
}

/** Create events, share their check-in links, and review who attended. */
export function EventManagementPage() {
  const events = useEvents();
  const [tab, setTab] = useState('upcoming');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const rows = tab === 'upcoming' ? events.upcoming : events.past;

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: events.upcoming.length },
    { id: 'past', label: `Past (${events.past.length})` },
  ];

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Events"
        title="Events and attendance"
        subtitle="Create an event, share its link, and collect attendance from anyone who turns up."
        actions={
          <Button
            variant="secondary"
            className="border-white/20 bg-white/15 text-white hover:bg-white/25"
            startIcon={<Plus aria-hidden="true" className="size-4" />}
            onClick={() => setWizardOpen(true)}
          >
            New event
          </Button>
        }
      />

      <Tabs tabs={tabs} value={tab} onChange={setTab} idPrefix="events" />

      <TabPanel id={tab} value={tab} idPrefix="events">
        {events.loading ? (
          <LoadingState label="Loading events…" />
        ) : events.error ? (
          <ErrorState message={events.error} onRetry={events.refetch} />
        ) : rows.length === 0 ? (
          <div className="surface-panel">
            <EmptyState
              icon={<CalendarDays aria-hidden="true" className="size-6" />}
              title={tab === 'upcoming' ? 'No upcoming events' : 'No past events'}
              description={
                tab === 'upcoming'
                  ? 'Create one to start collecting attendance.'
                  : 'Events move here once their date has passed.'
              }
              action={
                tab === 'upcoming' && (
                  <Button
                    startIcon={<Plus aria-hidden="true" className="size-4" />}
                    onClick={() => setWizardOpen(true)}
                  >
                    New event
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onOpen={setViewing}
                onDelete={setPendingDelete}
              />
            ))}
          </ul>
        )}
      </TabPanel>

      {wizardOpen && (
        <EventWizardDialog
          onClose={() => setWizardOpen(false)}
          onCreate={events.create}
          saving={events.saving}
        />
      )}

      {viewing && (
        <EventDetailDialog
          key={viewing._id}
          event={viewing}
          onClose={() => setViewing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={events.deleting}
        title="Delete this event?"
        confirmLabel="Delete"
        onConfirm={async () => {
          await events.remove(pendingDelete);
          setPendingDelete(null);
        }}
      >
        <p className="text-sm leading-relaxed text-muted dark:text-muted-soft">
          <strong>{pendingDelete?.title}</strong> and{' '}
          <strong>every attendee record it holds</strong> will be permanently
          removed. Export the attendee list first if you need it. This cannot be
          undone.
        </p>
      </ConfirmDialog>
    </PageWrapper>
  );
}
