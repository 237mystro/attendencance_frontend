import { Alert, Button, Input, Select } from '@/components/ui';
import { formatDistance } from '@/lib/formatters';

/** Explains where the attendee stands relative to the venue. */
export function LocationNotice({ state, onRecheck }) {
  return (
    <div className="mt-5">
      {state.status === 'locating' && (
        <Alert tone="info">Checking that you are at the venue…</Alert>
      )}

      {state.status === 'inside' && (
        <Alert tone="success">
          You are at the venue ({formatDistance(state.distance)} from the centre).
          Fill in your details below.
        </Alert>
      )}

      {state.status === 'outside' && (
        <Alert tone="warn">
          You are {formatDistance(state.distance)} away. You must be within{' '}
          {state.radius} m to check in.
        </Alert>
      )}

      {state.status === 'unavailable' && <Alert tone="danger">{state.message}</Alert>}

      {state.status !== 'locating' && state.status !== 'inside' && (
        <Button variant="secondary" className="mt-3" onClick={onRecheck}>
          Check my location again
        </Button>
      )}
    </div>
  );
}

/**
 * The attendance form, built from the event's own field definitions.
 *
 * The submit button stays disabled until location is confirmed, so nobody
 * fills the whole form only to be refused at the end.
 */
export function PublicEventForm({
  fields,
  answers,
  onAnswer,
  onSubmit,
  submitting,
  error,
  canSubmit,
}) {
  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
      {error && <Alert tone="danger">{error}</Alert>}

      {fields.map((field) => {
        const shared = {
          key: field.name,
          label: field.label || field.name,
          required: true,
          value: answers[field.name] || '',
          onChange: (event) => onAnswer(field.name, event.target.value),
        };

        return field.type === 'select' ? (
          <Select
            {...shared}
            placeholder={`Select ${(field.label || field.name).toLowerCase()}`}
            options={(field.options || []).map((option) => ({
              value: option,
              label: option,
            }))}
          />
        ) : (
          <Input {...shared} type={field.type === 'text' ? 'text' : field.type} />
        );
      })}

      <Button type="submit" size="lg" fullWidth loading={submitting} disabled={!canSubmit}>
        {submitting ? 'Checking in…' : 'Check in'}
      </Button>
    </form>
  );
}
