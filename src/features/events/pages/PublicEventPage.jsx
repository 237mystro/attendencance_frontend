import { CalendarDays, CircleCheckBig, MapPin } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ErrorState, LoadingState } from '@/components/ui';
import { useForceLightMode } from '@/context/theme-context';
import { useApi } from '@/hooks/useApi';
import { calculateDistance, getUserLocation } from '@/lib/geolocation';
import { formatDateTime } from '@/lib/formatters';
import { fetchPublicEvent, submitEventAttendance } from '@/api/events';
import { LocationNotice, PublicEventForm } from '../components/PublicEventForm';

/** Standalone shell — no dashboard chrome, since visitors have no account. */
function PublicShell({ children }) {
  return (
    <main className="flex min-h-dvh items-start justify-center bg-canvas px-4 py-8">
      <div className="w-full max-w-lg">{children}</div>
    </main>
  );
}

/**
 * The public check-in page behind a shared event link.
 *
 * Deliberately unauthenticated — attendees are usually visitors with no
 * account — so location is the only thing proving they are actually present.
 */
export function PublicEventPage() {
  const { companyId, eventId } = useParams();
  useForceLightMode();

  const query = useApi(
    (signal) => fetchPublicEvent(companyId, eventId, signal),
    [companyId, eventId],
  );
  const event = query.data?.data;

  const [answers, setAnswers] = useState({});
  const [locationState, setLocationState] = useState({ status: 'idle' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const checkLocation = useCallback(async () => {
    if (!event?.location?.latitude) return;

    setLocationState({ status: 'locating' });
    try {
      const fix = await getUserLocation();
      const distance = calculateDistance(fix, {
        latitude: event.location.latitude,
        longitude: event.location.longitude,
      });
      const radius = Number(event.location.radius) || 100;

      setLocationState({
        status: distance <= radius ? 'inside' : 'outside',
        distance,
        radius,
        fix,
      });
    } catch (caught) {
      setLocationState({
        status: 'unavailable',
        message: caught?.message || 'Could not read your location.',
      });
    }
  }, [event]);

  // Start the check as soon as the event arrives. The state it writes comes
  // from the Geolocation API; `checkLocation` flips to "locating" before
  // awaiting, which is what the rule notices.
  useEffect(() => {
    if (!event) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkLocation();
  }, [event, checkLocation]);

  const submit = async (formEvent) => {
    formEvent.preventDefault();

    const missing = (event.requiredFields || []).find(
      (field) => !String(answers[field.name] || '').trim(),
    );
    if (missing) {
      setError(`${missing.label || missing.name} is required.`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const data = await submitEventAttendance(companyId, eventId, {
        ...answers,
        userLocation: locationState.fix,
      });
      if (!data?.success) throw new Error(data?.message || 'Check-in failed.');
      setDone(true);
    } catch (caught) {
      setError(caught?.message || 'Could not record your attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  if (query.loading) {
    return (
      <PublicShell>
        <LoadingState label="Loading the event…" />
      </PublicShell>
    );
  }

  if (query.error || !event) {
    return (
      <PublicShell>
        <ErrorState
          title="Event not found"
          message="This link may have expired, or the event may have been removed."
          onRetry={query.refetch}
        />
      </PublicShell>
    );
  }

  if (done) {
    return (
      <PublicShell>
        <div className="surface-panel p-8 text-center">
          <span
            aria-hidden="true"
            className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success"
          >
            <CircleCheckBig className="size-7" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">
            You&rsquo;re checked in
          </h1>
          <p className="mt-2 leading-relaxed text-muted">
            Your attendance at {event.title} has been recorded. You can close this page.
          </p>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="surface-panel p-5 sm:p-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{event.title}</h1>

        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
          {formatDateTime(event.date)}
        </p>

        {event.location?.address && (
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            {event.location.address}
          </p>
        )}

        {event.description && (
          <p className="mt-4 leading-relaxed text-slate-600">{event.description}</p>
        )}

        <LocationNotice state={locationState} onRecheck={checkLocation} />

        <PublicEventForm
          fields={event.requiredFields || []}
          answers={answers}
          onAnswer={(name, value) =>
            setAnswers((current) => ({ ...current, [name]: value }))
          }
          onSubmit={submit}
          submitting={submitting}
          error={error}
          canSubmit={locationState.status === 'inside'}
        />
      </div>
    </PublicShell>
  );
}
