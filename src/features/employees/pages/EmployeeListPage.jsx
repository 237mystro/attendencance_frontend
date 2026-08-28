import { UserPlus, Users } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  ConfirmDialog,
  DataTable,
  PageHero,
  PageWrapper,
  Pagination,
  Panel,
  SearchInput,
} from '@/components/ui';
import { employeeColumns } from '../employee-columns';
import { EmployeeFormDialog } from '../components/EmployeeFormDialog';
import { TempCredentialsDialog } from '../components/TempCredentialsDialog';
import { useEmployees } from '../hooks/useEmployees';

/** The workforce directory: search, add, edit, and remove employee records. */
export function EmployeeListPage() {
  const employees = useEmployees();
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (employee) => {
    setEditing(employee);
    setFormOpen(true);
  };

  const columns = employeeColumns({ onEdit: openEdit, onDelete: setPendingDelete });

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Employee management"
        title="Your workforce directory"
        subtitle="Add, edit, and manage employee records. Configure salaries, departments, and starting schedules."
        actions={
          <Button
            variant="secondary"
            className="border-white/20 bg-white/15 text-white hover:bg-white/25"
            startIcon={<UserPlus aria-hidden="true" className="size-4" />}
            onClick={openAdd}
          >
            Add employee
          </Button>
        }
      />

      <Panel
        title="Employees"
        subtitle={
          employees.isFiltered
            ? `${employees.matching} of ${employees.total} match your search`
            : `${employees.total} on the books`
        }
        interactive={false}
        action={
          <SearchInput
            value={employees.search}
            onChange={employees.setSearch}
            placeholder="Search name, email, position…"
            label="Search employees"
            className="sm:w-80"
          />
        }
      >
        <DataTable
          columns={columns}
          rows={employees.rows}
          loading={employees.loading}
          error={employees.error}
          onRetry={employees.refetch}
          caption="Employee directory"
          emptyIcon={<Users aria-hidden="true" className="size-6" />}
          emptyTitle={employees.isFiltered ? 'No matches' : 'No employees yet'}
          emptyDescription={
            employees.isFiltered
              ? 'Try a different name, email, or position.'
              : 'Add your first employee to start tracking attendance and payroll.'
          }
          emptyAction={
            !employees.isFiltered && (
              <Button
                startIcon={<UserPlus aria-hidden="true" className="size-4" />}
                onClick={openAdd}
              >
                Add employee
              </Button>
            )
          }
        />

        <Pagination
          page={employees.page}
          pageCount={employees.pageCount}
          onChange={employees.setPage}
          totalLabel={`${employees.matching} employee${employees.matching === 1 ? '' : 's'}`}
        />
      </Panel>

      {/* Mounted only while open, and keyed by record, so the form starts
          from the right values without an effect resetting it. */}
      {formOpen && (
        <EmployeeFormDialog
          key={editing?._id ?? 'new'}
          open
          employee={editing}
          onClose={() => setFormOpen(false)}
          onSave={employees.save}
          saving={employees.saving}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={employees.deleting}
        title="Remove this employee?"
        confirmLabel="Remove"
        onConfirm={async () => {
          await employees.remove(pendingDelete);
          setPendingDelete(null);
        }}
      >
        <p className="text-sm leading-relaxed text-muted dark:text-muted-soft">
          <strong>{pendingDelete?.name}</strong> will lose access to the workspace.
          Their attendance and payroll history is kept. This cannot be undone.
        </p>
      </ConfirmDialog>

      {employees.newCredentials && (
        <TempCredentialsDialog
          credentials={employees.newCredentials}
          onClose={employees.dismissCredentials}
        />
      )}
    </PageWrapper>
  );
}
