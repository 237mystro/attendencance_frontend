import { Crosshair, Save, Search } from 'lucide-react';
import { useState } from 'react';

import { GeofenceMap } from '@/components/map/GeofenceMap';
import { Alert, Button, Input, LoadingState, Modal } from '@/components/ui';
import { MIN_GEOFENCE_RADIUS_METRES } from '@/features/attendance/geofence-rules';
import { useBranchGeofence } from '../hooks/useBranchGeofence';

const MAX_RADIUS = 1000;

/** Sets the attendance boundary for a single branch. */
export function BranchGeofenceDialog({ branch, onClose, onSaved }) {
  const geofence = useBranchGeofence(branch, { onSaved });
  const [query, setQuery] = useState('');

  return (
    <Modal
      open={Boolean(branch)}
      onClose={geofence.saving ? undefined : onClose}
      closeOnBackdrop={!geofence.saving}
      size="lg"
      title={`Geofence for ${branch?.name || 'this branch'}`}
      description="Staff assigned here must be inside this circle to clock in or out."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={geofence.saving}>
            Close
          </Button>
          <Button
            loading={geofence.saving}
            disabled={!geofence.position}
            startIcon={<Save aria-hidden="true" className="size-4" />}
            onClick={geofence.save}
          >
            Save geofence
          </Button>
        </>
      }
    >
      {geofence.loading ? (
        <LoadingState label="Loading this branch's boundary…" />
      ) : (
        <div className="flex flex-col gap-4">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              geofence.searchAddress(query);
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
              <Button type="submit" loading={geofence.searching}>
                Search
              </Button>
              <Button
                type="button"
                variant="secondary"
                loading={geofence.locating}
                startIcon={<Crosshair aria-hidden="true" className="size-4" />}
                onClick={geofence.useMyLocation}
              >
                Use my location
              </Button>
            </div>
          </form>

          <GeofenceMap
            position={geofence.position}
            radius={geofence.radius}
            onSelect={geofence.selectPosition}
          />

          {!geofence.position && (
            <Alert tone="info">
              No boundary set for this branch. Click the map to place the pin.
            </Alert>
          )}

          <div>
            <label
              htmlFor="branch-radius"
              className="flex items-baseline justify-between text-sm font-bold text-ink dark:text-ink-dark"
            >
              Allowed distance from the pin
              <span className="text-brand-500">{geofence.radius} m</span>
            </label>
            <input
              id="branch-radius"
              type="range"
              min={MIN_GEOFENCE_RADIUS_METRES}
              max={MAX_RADIUS}
              step={10}
              value={geofence.radius}
              onChange={(event) => geofence.setRadius(Number(event.target.value))}
              className="range-input mt-2"
            />
          </div>

          <Input
            label="Address label"
            value={geofence.address}
            onChange={(event) => geofence.setAddress(event.target.value)}
            hint="Shown on the branch card and printed QR poster."
          />
        </div>
      )}
    </Modal>
  );
}
