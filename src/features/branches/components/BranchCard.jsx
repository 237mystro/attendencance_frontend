import { MapPin, Pencil, Store, Trash2, UserCog, Users } from 'lucide-react';

import { Avatar, Badge, Button, IconButton } from '@/components/ui';

/** One person holding a role at this branch. */
function RoleHolder({ label, person }) {
  if (!person) return null;

  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={person.name} size="sm" />
      <div className="min-w-0">
        <p className="text-xs text-muted dark:text-muted-soft">{label}</p>
        <p className="truncate text-sm font-semibold text-ink dark:text-ink-dark">
          {person.name}
        </p>
      </div>
    </div>
  );
}

/** A single branch with its headcount, boundary status, and role holders. */
export function BranchCard({ branch, onEdit, onDelete, onAssign, onGeofence }) {
  const hasGeofence = Boolean(branch.geofence?.latitude);

  return (
    <li className="surface-panel p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-panel bg-brand-50 text-brand-500 dark:bg-brand-500/15"
          >
            <Store className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-ink dark:text-ink-dark">
              {branch.name}
            </h3>
            <p className="text-sm text-muted dark:text-muted-soft">
              {branch.address || 'No address set'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            tone="neutral"
            icon={<Users aria-hidden="true" className="size-3.5" />}
          >
            {branch.employeeCount ?? 0} employees
          </Badge>
          <Badge
            tone={hasGeofence ? 'success' : 'warn'}
            icon={<MapPin aria-hidden="true" className="size-3.5" />}
          >
            {hasGeofence ? `Geofence ${branch.geofence.radius ?? 100} m` : 'No geofence'}
          </Badge>

          <Button
            size="sm"
            variant="secondary"
            startIcon={<MapPin aria-hidden="true" className="size-4" />}
            onClick={() => onGeofence(branch)}
          >
            Geofence
          </Button>
          <Button
            size="sm"
            variant="secondary"
            startIcon={<UserCog aria-hidden="true" className="size-4" />}
            onClick={() => onAssign(branch)}
          >
            Assign role
          </Button>

          <IconButton
            label={`Edit ${branch.name}`}
            size="sm"
            onClick={() => onEdit(branch)}
          >
            <Pencil aria-hidden="true" />
          </IconButton>
          <IconButton
            label={`Remove ${branch.name}`}
            size="sm"
            className="text-danger"
            onClick={() => onDelete(branch)}
          >
            <Trash2 aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      {branch.geofence?.address && (
        <p className="mt-3 flex items-start gap-2 text-xs text-muted dark:text-muted-soft">
          <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          {branch.geofence.address}
        </p>
      )}

      {(branch.managerId || branch.hrId) && (
        <div className="mt-4 flex flex-wrap gap-6 border-t border-line pt-4 dark:border-line-dark">
          <RoleHolder label="Branch manager" person={branch.managerId} />
          <RoleHolder label="Branch HR" person={branch.hrId} />
        </div>
      )}
    </li>
  );
}
