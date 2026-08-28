import { Plus, RefreshCw, Store } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  PageHero,
  PageWrapper,
} from '@/components/ui';
import { AssignRoleDialog } from '../components/AssignRoleDialog';
import { BranchCard } from '../components/BranchCard';
import { BranchFormDialog } from '../components/BranchFormDialog';
import { BranchGeofenceDialog } from '../components/BranchGeofenceDialog';
import { useBranches } from '../hooks/useBranches';

/** Create branches, assign who runs them, and set each one's boundary. */
export function BranchesPage() {
  const branches = useBranches();

  const [formBranch, setFormBranch] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [assignBranch, setAssignBranch] = useState(null);
  const [geofenceBranch, setGeofenceBranch] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const openAdd = () => {
    setFormBranch(null);
    setFormOpen(true);
  };

  const openEdit = (branch) => {
    setFormBranch(branch);
    setFormOpen(true);
  };

  const count = branches.branches.length;

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Branches"
        title="Your locations"
        subtitle="Register each site, appoint the people who run it, and set where staff may clock in."
        chips={[`${count} branch${count === 1 ? '' : 'es'} registered`]}
        actions={
          <Button
            variant="secondary"
            className="border-white/20 bg-white/15 text-white hover:bg-white/25"
            startIcon={<Plus aria-hidden="true" className="size-4" />}
            onClick={openAdd}
          >
            New branch
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold text-ink dark:text-ink-dark">
          All branches
        </h3>
        <IconButton label="Refresh branches" onClick={branches.refetch}>
          <RefreshCw aria-hidden="true" />
        </IconButton>
      </div>

      {branches.loading ? (
        <LoadingState label="Loading branches…" />
      ) : branches.error ? (
        <ErrorState message={branches.error} onRetry={branches.refetch} />
      ) : count === 0 ? (
        <div className="surface-panel">
          <EmptyState
            icon={<Store aria-hidden="true" className="size-6" />}
            title="No branches yet"
            description="Register your first location to give it its own QR code, geofence, and management team."
            action={
              <Button
                startIcon={<Plus aria-hidden="true" className="size-4" />}
                onClick={openAdd}
              >
                New branch
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {branches.branches.map((branch) => (
            <BranchCard
              key={branch._id}
              branch={branch}
              onEdit={openEdit}
              onDelete={setPendingDelete}
              onAssign={setAssignBranch}
              onGeofence={setGeofenceBranch}
            />
          ))}
        </ul>
      )}

      {/* Both dialogs mount only while open and are keyed by record, so their
          forms start from the right values without an effect resetting them. */}
      {formOpen && (
        <BranchFormDialog
          key={formBranch?._id ?? 'new'}
          open
          branch={formBranch}
          onClose={() => setFormOpen(false)}
          onSave={branches.save}
          saving={branches.saving}
        />
      )}

      {assignBranch && (
        <AssignRoleDialog
          key={assignBranch._id}
          open
          branch={assignBranch}
          employees={branches.employees}
          onClose={() => setAssignBranch(null)}
          onAssign={branches.assign}
          assigning={branches.assigning}
        />
      )}

      {geofenceBranch && (
        <BranchGeofenceDialog
          branch={geofenceBranch}
          onClose={() => setGeofenceBranch(null)}
          onSaved={branches.refetch}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={branches.deleting}
        title="Remove this branch?"
        confirmLabel="Remove"
        onConfirm={async () => {
          await branches.remove(pendingDelete);
          setPendingDelete(null);
        }}
      >
        <p className="text-sm leading-relaxed text-muted dark:text-muted-soft">
          <strong>{pendingDelete?.name}</strong> and its geofence will be removed.
          Staff assigned to it will need reassigning. This cannot be undone.
        </p>
      </ConfirmDialog>
    </PageWrapper>
  );
}
