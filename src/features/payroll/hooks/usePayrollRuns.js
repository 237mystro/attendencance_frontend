import { useCallback, useState } from 'react';

import { ADMIN_ROLES } from '@/constants/roles';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useApi } from '@/hooks/useApi';
import {
  approvePayroll,
  fetchPayrolls,
  processPayroll,
  submitPayrollForApproval,
} from '@/api/payroll';

/**
 * The list of payroll runs and the approval workflow that moves one along.
 *
 * Branch users may submit a run for review; only admins and HR can approve or
 * process it, which is what keeps disbursement out of a branch's hands.
 */
export function usePayrollRuns() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [working, setWorking] = useState('');

  const query = useApi((signal) => fetchPayrolls(signal), []);
  const payrolls = query.data?.data || [];

  const canApprove = ADMIN_ROLES.includes(currentUser?.role);

  const runAction = useCallback(
    async (label, action, successMessage) => {
      setWorking(label);
      try {
        const data = await action();
        if (!data?.success) throw new Error(data?.message || 'Action failed.');

        query.refetch();
        toast.success(successMessage);
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not complete that action.');
        return false;
      } finally {
        setWorking('');
      }
    },
    [query, toast],
  );

  const submitForApproval = useCallback(
    (payroll) =>
      runAction(
        'submit',
        () => submitPayrollForApproval(payroll._id),
        'Payroll submitted for approval.',
      ),
    [runAction],
  );

  const approve = useCallback(
    (payroll, note) =>
      runAction(
        'approve',
        () => approvePayroll(payroll._id, note),
        'Payroll approved and ready for disbursement.',
      ),
    [runAction],
  );

  const process = useCallback(
    (payroll) =>
      runAction('process', () => processPayroll(payroll._id), 'Payroll marked as processed.'),
    [runAction],
  );

  return {
    payrolls,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    canApprove,
    working,
    submitForApproval,
    approve,
    process,
  };
}
