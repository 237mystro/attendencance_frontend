import { useCallback, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { useApi } from '@/hooks/useApi';
import { useTableControls } from '@/hooks/useTableControls';
import {
  createEmployee,
  deleteEmployee,
  fetchEmployees,
  updateEmployee,
} from '@/api/employees';

/**
 * Loads the workforce directory and owns create / update / delete.
 *
 * Search, sorting, and pagination come from the shared `useTableControls`, so
 * this list behaves the same way as every other list in the app.
 */
export function useEmployees() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  /** Credentials to show once, right after an employee is created. */
  const [newCredentials, setNewCredentials] = useState(null);

  const query = useApi((signal) => fetchEmployees(signal), []);
  const employees = query.data?.data || [];

  const table = useTableControls(employees, {
    searchKeys: ['name', 'email', 'position', 'department'],
    pageSize: 10,
    initialSort: 'name',
  });

  const save = useCallback(
    async (payload, editingId) => {
      setSaving(true);
      try {
        const data = editingId
          ? await updateEmployee(editingId, payload)
          : await createEmployee(payload);

        if (!data?.success) throw new Error(data?.message || 'Operation failed.');

        // A brand-new account comes back with a one-time password that is
        // never retrievable again, so it is surfaced immediately.
        if (!editingId && data.data?.temporaryPassword) {
          setNewCredentials({
            email: payload.email,
            password: data.data.temporaryPassword,
          });
        }

        query.refetch();
        toast.success(editingId ? 'Employee updated.' : 'Employee created.');
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not save the employee.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [query, toast],
  );

  const remove = useCallback(
    async (employee) => {
      setDeleting(true);
      try {
        const data = await deleteEmployee(employee._id);
        if (!data?.success) throw new Error(data?.message || 'Delete failed.');

        query.refetch();
        toast.success(`${employee.name} has been removed.`);
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not remove the employee.');
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [query, toast],
  );

  return {
    ...table,
    total: employees.length,
    matching: table.total,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    save,
    saving,
    remove,
    deleting,
    newCredentials,
    dismissCredentials: () => setNewCredentials(null),
  };
}
