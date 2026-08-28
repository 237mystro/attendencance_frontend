import { Download, Users } from 'lucide-react';

import {
  Button,
  DataTable,
  ErrorState,
  LoadingState,
  Modal,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { formatDateTime } from '@/lib/formatters';
import { fetchAttendees } from '@/api/events';
import { attendeeValue, exportAttendeesCsv } from '../event-fields';

/**
 * Everyone who checked in to an event.
 *
 * The columns come from the event's own field set, so a form asking for
 * dietary needs produces a table with a dietary-needs column.
 */
export function EventDetailDialog({ event, onClose }) {
  const query = useApi((signal) => fetchAttendees(event._id, signal), [event._id]);
  const attendees = query.data?.data || [];

  const fields = event.requiredFields?.length
    ? event.requiredFields
    : [
        { name: 'name', label: 'Name' },
        { name: 'email', label: 'Email' },
      ];

  const columns = [
    ...fields.map((field, index) => ({
      key: field.name,
      header: field.label || field.name,
      primary: index === 0,
      render: (attendee) => attendeeValue(attendee, field) || '—',
    })),
    {
      key: 'createdAt',
      header: 'Checked in',
      render: (attendee) => formatDateTime(attendee.createdAt),
    },
  ];

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={event.title}
      description={`${attendees.length} attendee${attendees.length === 1 ? '' : 's'}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            disabled={!attendees.length}
            startIcon={<Download aria-hidden="true" className="size-4" />}
            onClick={() => exportAttendeesCsv(event, attendees)}
          >
            Export CSV
          </Button>
        </>
      }
    >
      {query.loading ? (
        <LoadingState label="Loading attendees…" />
      ) : query.error ? (
        <ErrorState message={query.error} onRetry={query.refetch} />
      ) : (
        <DataTable
          columns={columns}
          rows={attendees}
          caption={`Attendees for ${event.title}`}
          emptyIcon={<Users aria-hidden="true" className="size-6" />}
          emptyTitle="Nobody has checked in yet"
          emptyDescription="Share the event link or QR code so attendees can register."
        />
      )}
    </Modal>
  );
}
