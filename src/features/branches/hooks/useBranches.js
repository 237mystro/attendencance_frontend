import { useCallback, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { useApi } from '@/hooks/useApi';
import { fetchEmployees } from '@/api/employees';
import {
  assignBranchRole,
  createBranch,
  deleteBranch,
  updateBranch,
} from '@/api/branches';
import { fetchBranches } from '@/api/branches';

/**
 * Loads branches together with the employee list they draw managers from,
 * and owns create / update / delete / assign.
 */
export function useBranches() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const branchQuery = useApi((signal) => fetchBranches(signal), []);
  const employeeQuery = useApi((signal) => fetchEmployees(signal), []);

  const branches = branchQuery.data?.data || [];
  const employees = employeeQuery.data?.data || [];

  const save = useCallback(
    async (values, editingId) => {
      setSaving(true);
      try {
        const data = editingId
          ? await updateBranch(editingId, values)
          : await createBranch(values);

        if (!data?.success) throw new Error(data?.message || 'Save failed.');

        branchQuery.refetch();
        toast.success(editingId ? 'Branch updated.' : 'Branch created.');
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not save the branch.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [branchQuery, toast],
  );

  const remove = useCallback(
    async (branch) => {
      setDeleting(true);
      try {
        const data = await deleteBranch(branch._id);
        if (!data?.success) throw new Error(data?.message || 'Delete failed.');

        branchQuery.refetch();
        toast.success(`${branch.name} has been removed.`);
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not remove the branch.');
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [branchQuery, toast],
  );

  const assign = useCallback(
    async (branch, values) => {
      setAssigning(true);
      try {
        const data = await assignBranchRole(branch._id, values);
        if (!data?.success) throw new Error(data?.message || 'Assignment failed.');

        branchQuery.refetch();
        toast.success('Role assigned.');
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not assign the role.');
        return false;
      } finally {
        setAssigning(false);
      }
    },
    [branchQuery, toast],
  );

  return {
    branches,
    employees,
    loading: branchQuery.loading,
    error: branchQuery.error,
    refetch: branchQuery.refetch,
    save,
    saving,
    remove,
    deleting,
    assign,
    assigning,
  };
}
