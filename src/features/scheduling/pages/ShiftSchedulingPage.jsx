import { CalendarPlus, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  ConfirmDialog,
  DataTable,
  IconButton,
  PageHero,
  PageWrapper,
  Pagination,
  Panel,
  SearchInput,
} from '@/components/ui';
import { formatDate } from '@/lib/formatters';
import { RecurringShiftDialog } from '../components/RecurringShiftDialog';
import { ShiftFormDialog } from '../components/ShiftFormDialog';
import { useShiftScheduling } from '../hooks/useShiftScheduling';
import { shiftColumns } from '../shift-columns';

/** The admin and branch roster: assign, edit, and remove shifts. */
export function ShiftSchedulingPage() {
  const scheduling = useShiftScheduling();

  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (shift) => {
    setEditing(shift);
    setFormOpen(true);
  };

  const columns = shiftColumns({ onEdit: openEdit, onDelete: setPendingDelete });

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Scheduling"
        title="Shift scheduling"
        subtitle="Assign shifts, build recurring rotas, and track who has accepted."
        chips={
          scheduling.pendingCount > 0
            ? [`${scheduling.pendingCount} awaiting a response`]
            : []
        }
        actions={
          <>
            <Button
              variant="secondary"
              className="border-white/20 bg-white/15 text-white hover:bg-white/25"
              startIcon={<CalendarPlus aria-hidden="true" className="size-4" />}
              onClick={() => setRecurringOpen(true)}
            >
              Recurring
            </Button>
            <Button
              variant="secondary"
              className="border-white/20 bg-white/15 text-white hover:bg-white/25"
              startIcon={<Plus aria-hidden="true" className="size-4" />}
              onClick={openAdd}
            >
              Add shift
            </Button>
          </>
        }
      />

      <Panel
        title="All shifts"
        subtitle={
          scheduling.isFiltered
            ? `${scheduling.matching} of ${scheduling.total} match your search`
            : `${scheduling.total} scheduled`
        }
        interactive={false}
        action={
          <div className="flex items-center gap-2">
            <SearchInput
              value={scheduling.search}
              onChange={scheduling.setSearch}
              placeholder="Search employee, position, day…"
              label="Search shifts"
              className="sm:w-72"
            />
            <IconButton label="Refresh shifts" onClick={scheduling.refetch}>
              <RefreshCw aria-hidden="true" />
            </IconButton>
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={scheduling.rows}
          loading={scheduling.loading}
          error={scheduling.error}
          onRetry={scheduling.refetch}
          caption="Scheduled shifts"
          emptyTitle={scheduling.isFiltered ? 'No matches' : 'No shifts yet'}
          emptyDescription={
            scheduling.isFiltered
              ? 'Try a different employee, position, or day.'
              : 'Assign a single shift, or build a recurring rota.'
          }
          emptyAction={
            !scheduling.isFiltered && (
              <Button
                startIcon={<Plus aria-hidden="true" className="size-4" />}
                onClick={openAdd}
              >
                Add shift
              </Button>
            )
          }
        />

        <Pagination
          page={scheduling.page}
          pageCount={scheduling.pageCount}
          onChange={scheduling.setPage}
          totalLabel={`${scheduling.matching} shift${scheduling.matching === 1 ? '' : 's'}`}
        />
      </Panel>

      {formOpen && (
        <ShiftFormDialog
          key={editing?._id ?? 'new'}
          shift={editing}
          employees={scheduling.employees}
          onClose={() => setFormOpen(false)}
          onSave={scheduling.save}
          saving={scheduling.saving}
        />
      )}

      {recurringOpen && (
        <RecurringShiftDialog
          employees={scheduling.employees}
          onClose={() => setRecurringOpen(false)}
          onSave={scheduling.saveRecurring}
          saving={scheduling.saving}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={scheduling.deleting}
        title="Delete this shift?"
        confirmLabel="Delete"
        onConfirm={async () => {
          await scheduling.remove(pendingDelete);
          setPendingDelete(null);
        }}
      >
        <p className="text-sm leading-relaxed text-muted dark:text-muted-soft">
          The shift for <strong>{pendingDelete?.employeeId?.name}</strong> on{' '}
          <strong>{formatDate(pendingDelete?.date)}</strong> will be removed from their
          schedule. This cannot be undone.
        </p>
      </ConfirmDialog>
    </PageWrapper>
  );
}
