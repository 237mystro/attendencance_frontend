import { Clock, Send } from 'lucide-react';

import {
  Alert,
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageWrapper,
  Panel,
  Textarea,
} from '@/components/ui';
import { rules, useForm } from '@/hooks/useForm';
import { formatTime } from '@/lib/formatters';
import {
  LateRequestCard,
  LateStatusBadge,
} from '../components/LateRequestCard';
import { useMyLateRequests } from '../hooks/useLatePermissions';

/** An employee's own late-arrival request for today, plus their history. */
export function LatePermissionRequestPage() {
  const late = useMyLateRequests();

  const form = useForm({
    initialValues: { reason: '', estimatedArrival: '' },
    validate: (values) => ({
      reason: rules.required(values.reason, 'A reason'),
    }),
    onSubmit: async (values) => {
      const sent = await late.submit({
        reason: values.reason.trim(),
        estimatedArrival: values.estimatedArrival,
      });
      if (sent) form.reset({ reason: '', estimatedArrival: '' });
    },
  });

  return (
    <PageWrapper className="max-w-2xl">
      <header className="mb-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-panel bg-warn/12 text-warn"
        >
          <Clock className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
            Late arrival request
          </h2>
          <p className="text-sm text-muted dark:text-muted-soft">
            Tell your manager in advance if you will be arriving late today.
          </p>
        </div>
      </header>

      {/* The header stays put while loading or on failure, so the screen never
          collapses to a bare error message. */}
      {late.loading ? (
        <LoadingState label="Loading your requests…" />
      ) : late.error ? (
        <ErrorState message={late.error} onRetry={late.refetch} />
      ) : (
        <div className="flex flex-col gap-5">
          {late.today ? (
            <Panel title="Today's request" interactive={false}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-sm text-muted dark:text-muted-soft">
                  Sent {formatTime(late.today.createdAt || late.today.date)}
                </p>
                <LateStatusBadge status={late.today.status} />
              </div>

              <p className="mt-3 leading-relaxed text-ink dark:text-ink-dark">
                {late.today.reason}
              </p>

              {late.today.estimatedArrival && (
                <p className="mt-2 text-sm text-muted dark:text-muted-soft">
                  You expect to arrive around{' '}
                  {formatTime(late.today.estimatedArrival)}.
                </p>
              )}

              {late.today.adminNote && (
                <Alert tone="info" className="mt-4">
                  <p className="font-bold">Note from your manager</p>
                  <p className="mt-1">{late.today.adminNote}</p>
                </Alert>
              )}
            </Panel>
          ) : (
            <Panel
              title="Request to arrive late"
              subtitle="One request per day. Your manager is notified immediately."
              interactive={false}
            >
              <form
                onSubmit={form.handleSubmit}
                noValidate
                className="flex flex-col gap-4"
              >
                {form.submitError && (
                  <Alert tone="danger">{form.submitError}</Alert>
                )}

                <Textarea
                  label="Why will you be late?"
                  rows={3}
                  required
                  placeholder="Traffic, a medical appointment, a family matter…"
                  {...form.field('reason')}
                />

                <Input
                  label="Estimated arrival"
                  type="time"
                  hint="Optional, but it helps your manager plan cover."
                  {...form.field('estimatedArrival')}
                />

                <Button
                  type="submit"
                  loading={form.submitting}
                  startIcon={<Send aria-hidden="true" className="size-4" />}
                >
                  {form.submitting ? 'Sending…' : 'Send request'}
                </Button>
              </form>
            </Panel>
          )}

          <Panel
            title="Past requests"
            interactive={false}
            bodyClassName="p-0 sm:p-0"
          >
            {late.history.length === 0 ? (
              <EmptyState
                title="No past requests"
                description="Requests you send are kept here so you can see how they were decided."
              />
            ) : (
              <ul className="flex flex-col gap-3 p-4 sm:p-5">
                {late.history.map((request) => (
                  <LateRequestCard key={request._id} request={request} />
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </PageWrapper>
  );
}
