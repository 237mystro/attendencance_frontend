import { Crosshair, MapPin, Save, Search } from 'lucide-react';
import { useState } from 'react';

import {
  Alert,
  Button,
  Input,
  LoadingState,
  PageHero,
  PageWrapper,
  Panel,
} from '@/components/ui';
import { formatDistance } from '@/lib/formatters';
import { CompanyProfileFields } from '../components/CompanyProfileFields';
import { GeofenceMap } from '@/components/map/GeofenceMap';
import { MIN_GEOFENCE_RADIUS_METRES } from '../geofence-rules';
import { useGeofenceSettings } from '../hooks/useGeofenceSettings';

const MAX_RADIUS = 1000;

/** Defines the boundary employees must be inside to clock in or out. */
export function GeofenceSettingsPage() {
  const settings = useGeofenceSettings();
  const [query, setQuery] = useState('');

  if (settings.loading) {
    return (
      <PageWrapper>
        <LoadingState label="Loading geofence settings…" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Geofence"
        title="Set your attendance boundary"
        subtitle="Employees must be inside this circle to clock in or out. Click the map, drag the pin, or search for an address."
      />

      <div className="flex flex-col gap-5">
        <Panel title="Location" interactive={false}>
          <form
            className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              settings.searchAddress(query);
            }}
          >
            <Input
              label="Search for an address"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. Molyko, Buea, Cameroon"
              startIcon={<Search className="size-4" />}
              wrapperClassName="flex-1"
            />
            <div className="flex gap-2">
              <Button type="submit" loading={settings.searching}>
                Search
              </Button>
              <Button
                type="button"
                variant="secondary"
                loading={settings.locating}
                startIcon={<Crosshair aria-hidden="true" className="size-4" />}
                onClick={settings.useMyLocation}
              >
                Use my location
              </Button>
            </div>
          </form>

          <GeofenceMap
            position={settings.position}
            radius={settings.radius}
            onSelect={settings.selectPosition}
          />

          {settings.position ? (
            <p className="mt-3 text-xs text-muted dark:text-muted-soft">
              Pin: {settings.position[0].toFixed(6)}, {settings.position[1].toFixed(6)}
              {settings.accuracy
                ? ` · captured to ±${Math.round(settings.accuracy)} m`
                : ''}
            </p>
          ) : (
            <Alert tone="info" className="mt-3">
              No boundary set yet. Click anywhere on the map to place the pin.
            </Alert>
          )}

          <Input
            label="Address label"
            className="mt-4"
            value={settings.address}
            onChange={(event) => settings.setAddress(event.target.value)}
            hint="Shown to employees and on printed QR posters."
          />
        </Panel>

        <Panel title="Radius" interactive={false}>
          <label
            htmlFor="geofence-radius"
            className="flex items-baseline justify-between text-sm font-bold text-ink dark:text-ink-dark"
          >
            Allowed distance from the pin
            <span className="text-brand-500">{settings.radius} m</span>
          </label>

          <input
            id="geofence-radius"
            type="range"
            min={MIN_GEOFENCE_RADIUS_METRES}
            max={MAX_RADIUS}
            step={10}
            value={settings.radius}
            onChange={(event) => settings.setRadius(Number(event.target.value))}
            aria-describedby="geofence-radius-hint"
            className="range-input mt-2"
          />

          <p
            id="geofence-radius-hint"
            className="mt-2 text-xs text-muted dark:text-muted-soft"
          >
            Minimum {MIN_GEOFENCE_RADIUS_METRES} m. Consumer GPS is rarely accurate
            enough for a tighter boundary, and a smaller one would lock staff out.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="secondary"
              loading={settings.testing}
              disabled={!settings.position}
              startIcon={<MapPin aria-hidden="true" className="size-4" />}
              onClick={settings.testFromHere}
            >
              Test from where I am
            </Button>

            {settings.testResult && (
              <Alert
                tone={settings.testResult.inside ? 'success' : 'warn'}
                className="flex-1"
              >
                You are {formatDistance(settings.testResult.distance)} from the pin —{' '}
                {settings.testResult.inside
                  ? 'inside the boundary.'
                  : 'outside the boundary.'}{' '}
                <span className="opacity-80">
                  (GPS accuracy ±{Math.round(settings.testResult.accuracy)} m)
                </span>
              </Alert>
            )}
          </div>
        </Panel>

        <CompanyProfileFields settings={settings} />

        {/* Sticky so the action stays reachable on a long form. */}
        <div className="sticky bottom-0 -mx-4 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur-sm sm:mx-0 sm:rounded-panel sm:border sm:px-5 dark:border-line-dark dark:bg-canvas-dark/95">
          <Button
            fullWidth
            size="lg"
            loading={settings.saving}
            disabled={!settings.position}
            startIcon={<Save aria-hidden="true" className="size-5" />}
            onClick={settings.save}
            className="sm:w-auto"
          >
            {settings.saving ? 'Saving…' : 'Save geofence'}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
