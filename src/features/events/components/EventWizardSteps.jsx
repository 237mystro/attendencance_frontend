import { Crosshair, Plus } from 'lucide-react';

import { GeofenceMap } from '@/components/map/GeofenceMap';
import { Alert, Button, Input, Select, Textarea } from '@/components/ui';
import { cn } from '@/lib/cn';
import { FIELD_TYPE_OPTIONS } from '../event-fields';

/** Step 1 — which questions the attendance form asks. */
export function FieldSelectionStep({ wizard }) {
  const { values, availableFields, customField, setCustomField } = wizard;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted dark:text-muted-soft">
        Pick what each attendee must provide. Everything chosen becomes a required
        question on the public form.
      </p>

      <ul className="flex flex-wrap gap-2">
        {availableFields.map((field) => {
          const chosen = values.requiredFields.some((item) => item.name === field.name);

          return (
            <li key={field.name}>
              <button
                type="button"
                aria-pressed={chosen}
                onClick={() => wizard.toggleField(field)}
                className={cn(
                  'min-h-tap rounded-btn border px-3 text-sm font-bold transition-colors',
                  chosen
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-line text-muted hover:border-brand-500/40 dark:border-line-dark dark:text-muted-soft',
                )}
              >
                {field.label}
              </button>
            </li>
          );
        })}
      </ul>

      <fieldset className="rounded-panel border border-line p-4 dark:border-line-dark">
        <legend className="px-1 text-sm font-bold text-ink dark:text-ink-dark">
          Add your own field
        </legend>

        <div className="grid gap-3 pt-1 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <Input
            label="Label"
            value={customField.label}
            onChange={(event) =>
              setCustomField((current) => ({ ...current, label: event.target.value }))
            }
            placeholder="e.g. Dietary needs"
          />
          <Select
            label="Type"
            options={FIELD_TYPE_OPTIONS}
            value={customField.type}
            onChange={(event) =>
              setCustomField((current) => ({ ...current, type: event.target.value }))
            }
          />
          {customField.type === 'select' && (
            <Input
              label="Options"
              value={customField.options}
              onChange={(event) =>
                setCustomField((current) => ({ ...current, options: event.target.value }))
              }
              hint="Separate with commas."
            />
          )}
          <Button
            variant="secondary"
            startIcon={<Plus aria-hidden="true" className="size-4" />}
            onClick={wizard.addCustomField}
          >
            Add field
          </Button>
        </div>
      </fieldset>
    </div>
  );
}

/** Step 2 — where the event is, and how close attendees must be. */
export function LocationStep({ wizard }) {
  const { values } = wizard;
  const position =
    values.location.latitude && values.location.longitude
      ? [Number(values.location.latitude), Number(values.location.longitude)]
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="flex-1 text-sm text-muted dark:text-muted-soft">
          Click the map to place the venue. Attendees must be inside the circle to
          check in.
        </p>
        <Button
          variant="secondary"
          loading={wizard.locating}
          startIcon={<Crosshair aria-hidden="true" className="size-4" />}
          onClick={wizard.useMyLocation}
        >
          Use my location
        </Button>
      </div>

      <GeofenceMap
        position={position}
        radius={Number(values.location.radius) || 100}
        onSelect={(latitude, longitude) => wizard.patchLocation({ latitude, longitude })}
      />

      <div>
        <label
          htmlFor="event-radius"
          className="flex items-baseline justify-between text-sm font-bold text-ink dark:text-ink-dark"
        >
          Check-in radius
          <span className="text-brand-500">{values.location.radius} m</span>
        </label>
        <input
          id="event-radius"
          type="range"
          min={20}
          max={2000}
          step={10}
          value={values.location.radius}
          onChange={(event) =>
            wizard.patchLocation({ radius: Number(event.target.value) })
          }
          className="range-input mt-2"
        />
      </div>

      <Input
        label="Address"
        value={values.location.address}
        onChange={(event) => wizard.patchLocation({ address: event.target.value })}
        hint="Optional. Shown to attendees on the public page."
      />
    </div>
  );
}

/** Step 3 — the title, date, and description. */
export function DetailsStep({ wizard }) {
  const { values } = wizard;

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Event title"
        required
        autoFocus
        value={values.title}
        onChange={(event) => wizard.patch({ title: event.target.value })}
        placeholder="e.g. Annual general meeting"
      />

      <Input
        label="Date and time"
        type="datetime-local"
        required
        value={values.date}
        onChange={(event) => wizard.patch({ date: event.target.value })}
      />

      <Textarea
        label="Description"
        rows={3}
        value={values.description}
        onChange={(event) => wizard.patch({ description: event.target.value })}
        hint="Optional. Shown to attendees before they check in."
      />

      <Alert tone="info">
        Collecting {values.requiredFields.length} field
        {values.requiredFields.length === 1 ? '' : 's'} from each attendee.
      </Alert>
    </div>
  );
}
