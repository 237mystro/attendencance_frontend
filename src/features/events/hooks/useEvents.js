import { useCallback, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { useApi } from '@/hooks/useApi';
import { createEvent, deleteEvent, fetchEvents } from '@/api/events';
import { isPastEvent } from '../event-fields';

/** The event list, split into upcoming and past, plus create and delete. */
export function useEvents() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const query = useApi((signal) => fetchEvents(signal), []);
  const events = query.data?.data || [];

  const create = useCallback(
    async (values) => {
      setSaving(true);
      try {
        const data = await createEvent({
          ...values,
          location: {
            ...values.location,
            latitude: Number(values.location.latitude),
            longitude: Number(values.location.longitude),
            radius: Number(values.location.radius) || 100,
          },
        });
        if (!data?.success && !data?.data) {
          throw new Error(data?.message || 'Could not create the event.');
        }

        query.refetch();
        toast.success('Event created. Share its link or QR code to collect attendance.');
        return data.data;
      } catch (caught) {
        toast.error(caught?.message || 'Could not create the event.');
        return null;
      } finally {
        setSaving(false);
      }
    },
    [query, toast],
  );

  const remove = useCallback(
    async (event) => {
      setDeleting(true);
      try {
        await deleteEvent(event._id);
        query.refetch();
        toast.success(`${event.title} and its attendee data have been deleted.`);
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not delete the event.');
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [query, toast],
  );

  return {
    upcoming: events.filter((event) => !isPastEvent(event)),
    past: events.filter(isPastEvent),
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    create,
    saving,
    remove,
    deleting,
  };
}
