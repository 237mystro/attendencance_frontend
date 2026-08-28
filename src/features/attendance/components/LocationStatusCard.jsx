import { Loader2, MapPin, RotateCcw } from 'lucide-react';

import { Alert, Button, Panel } from '@/components/ui';
import { formatDistance } from '@/lib/formatters';
import { cn } from '@/lib/cn';

const STATUS_TEXT = {
  idle: 'Location verification required',
  locating: 'Checking your live location…',
  located: 'Location captured — choose how to check in',
  verified: 'Inside the required geofence',
  failed: 'Location verification failed',
};

const STATUS_TONE = {
  idle: 'text-muted',
  locating: 'text-warn',
  located: 'text-info',
  verified: 'text-success',
  failed: 'text-danger',
};

/**
 * Shows where the employee is and whether that satisfies the boundary.
 *
 * On refusal it names the distance, the requirement, and both coordinate pairs,
 * so the employee can tell "I'm too far" apart from "the pin is in the wrong
 * place" and knows which one to raise with an administrator.
 */
export function LocationStatusCard({
  status,
  location,
  geofence,
  distance,
  error,
  onVerify,
  onReset,
  children,
}) {
  const showCoordinates = location && (status === 'located' || status === 'verified');

  return (
    <Panel interactive={false}>
      <div className="flex items-start gap-3">
        {status === 'locating' ? (
          <Loader2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 animate-spin text-warn" />
        ) : (
          <MapPin
            aria-hidden="true"
            className={cn('mt-0.5 size-5 shrink-0', STATUS_TONE[status])}
          />
        )}

        <div className="min-w-0 flex-1">
          <p
            role="status"
            aria-live="polite"
            className={cn('font-semibold', STATUS_TONE[status])}
          >
            {STATUS_TEXT[status]}
            {status === 'verified' && geofence ? ` (${geofence.radius} m radius)` : ''}
          </p>

          {showCoordinates && (
            <p className="mt-0.5 text-xs text-muted dark:text-muted-soft">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} · accuracy
              ±{Math.round(location.accuracy)} m
            </p>
          )}
        </div>
      </div>

      {error && status !== 'verified' && (
        <Alert tone="warn" className="mt-4">
          <p>{error}</p>

          {distance != null && geofence && (
            <div className="mt-2 space-y-1 text-xs">
              <p>
                <strong>Your distance:</strong> {formatDistance(distance)} ·{' '}
                <strong>Required:</strong> within {geofence.radius} m
              </p>
              <p className="opacity-80">
                Geofence pin: {geofence.latitude.toFixed(5)}, {geofence.longitude.toFixed(5)}
                {location
                  ? ` · Your GPS: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                  : ''}
              </p>
              <p className="opacity-80">
                If the pin location is wrong, an administrator can correct it in
                Geofence Settings.
              </p>
            </div>
          )}
        </Alert>
      )}

      {status === 'idle' && (
        <Button
          size="lg"
          className="mt-4"
          fullWidth
          startIcon={<MapPin aria-hidden="true" className="size-5" />}
          onClick={onVerify}
        >
          Verify my location
        </Button>
      )}

      {status === 'failed' && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            startIcon={<RotateCcw aria-hidden="true" className="size-4" />}
            onClick={onVerify}
          >
            Re-check my location
          </Button>
          <Button variant="secondary" onClick={onReset}>
            Reset
          </Button>
        </div>
      )}

      {children}
    </Panel>
  );
}
