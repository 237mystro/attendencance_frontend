import { useCallback, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { useApi } from '@/hooks/useApi';
import {
  approveReport,
  createBonus,
  deleteBonus,
  fetchBonuses,
  fetchBufferMinutes,
  fetchLateRecords,
  fetchReports,
  generateReport,
  payAndSendReport,
  saveBufferMinutes,
} from '@/api/deductions';
import { currentPeriod } from '../deduction-fields';

/** The grace period before lateness starts costing money. */
export function useDeductionBuffer() {
  const toast = useToast();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const query = useApi((signal) => fetchBufferMinutes(signal), []);

  // Draft overlays the saved value, so nothing needs resetting when it loads.
  const minutes = draft ?? query.data?.bufferMinutes ?? 0;

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const data = await saveBufferMinutes(minutes);
      if (!data?.success) throw new Error(data?.message || 'Failed to save.');

      toast.success(`Grace period set to ${minutes} minutes.`);
      return true;
    } catch (caught) {
      toast.error(caught?.message || 'Could not save the grace period.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [minutes, toast]);

  return { minutes, setMinutes: setDraft, loading: query.loading, saving, save };
}

/** Late records for a chosen month. */
export function useLateRecords() {
  const [period, setPeriod] = useState(currentPeriod);
  const query = useApi((signal) => fetchLateRecords(period, signal), [
    period.month,
    period.year,
  ]);

  return {
    records: query.data?.data || [],
    period,
    setPeriod,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Monthly deduction reports and the actions that move one along. */
export function useDeductionReports() {
  const toast = useToast();
  const [period, setPeriod] = useState(currentPeriod);
  const [working, setWorking] = useState('');

  const query = useApi((signal) => fetchReports(signal), []);
  const reports = query.data?.data || [];

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

  return {
    reports,
    period,
    setPeriod,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    working,
    generate: () =>
      runAction(
        'generate',
        () => generateReport(period),
        'Report generated for the selected period.',
      ),
    approve: (report) =>
      runAction('approve', () => approveReport(report._id), 'Report approved.'),
    payAndSend: (report) =>
      runAction(
        'pay',
        () => payAndSendReport(report._id),
        'Report marked as paid and breakdowns emailed to employees.',
      ),
  };
}

/** Discretionary bonuses for a chosen month. */
export function useBonuses() {
  const toast = useToast();
  const [period, setPeriod] = useState(currentPeriod);
  const [saving, setSaving] = useState(false);

  const query = useApi((signal) => fetchBonuses(period, signal), [
    period.month,
    period.year,
  ]);

  const add = useCallback(
    async (values) => {
      setSaving(true);
      try {
        const data = await createBonus({ ...values, ...period });
        if (!data?.success) throw new Error(data?.message || 'Failed to add.');

        query.refetch();
        toast.success('Bonus added.');
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not add that bonus.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [period, query, toast],
  );

  const remove = useCallback(
    async (bonus) => {
      try {
        await deleteBonus(bonus._id);
        query.refetch();
        toast.success('Bonus removed.');
        return true;
      } catch (caught) {
        toast.error(caught?.message || 'Could not remove that bonus.');
        return false;
      }
    },
    [query, toast],
  );

  return {
    bonuses: query.data?.data || [],
    period,
    setPeriod,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    add,
    remove,
    saving,
  };
}
