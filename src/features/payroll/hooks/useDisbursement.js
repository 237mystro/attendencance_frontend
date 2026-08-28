import { useCallback, useEffect, useRef, useState } from 'react';

import { useToast } from '@/context/toast-context';
import { disburseToEmployee, fetchPaymentStatus } from '@/api/payroll';
import { unpaidLines } from '../payroll-fields';

const PAYABLE_STATUSES = ['processed', 'paid'];

/**
 * Paying employees within a processed payroll run.
 *
 * Payments go out one at a time, not in parallel: each is a real money
 * transfer, and a serial loop means a failure part-way through leaves an
 * unambiguous record of who was paid. Failures are collected per employee so
 * one bad mobile-money number does not hide the rest.
 */
export function useDisbursement(payroll, { onSettled } = {}) {
  const toast = useToast();

  const [status, setStatus] = useState({});
  const [errors, setErrors] = useState({});
  const [payingId, setPayingId] = useState('');
  const [batch, setBatch] = useState(null);

  const payrollId = payroll?._id;
  const isPayable = PAYABLE_STATUSES.includes(payroll?.status);

  // Cancelled on unmount so a long batch cannot write to a dead component.
  const activeRef = useRef(true);
  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!payrollId || !isPayable) return undefined;

    let active = true;
    fetchPaymentStatus(payrollId)
      .then((data) => {
        if (active && data?.success) setStatus(data.data || {});
      })
      .catch(() => {
        // Without this the rows simply show as unpaid, which is the safe default.
      });

    return () => {
      active = false;
    };
  }, [payrollId, isPayable]);

  /** Pays one employee, recording either the receipt or the reason it failed. */
  const payOne = useCallback(
    async (employeeId) => {
      try {
        const data = await disburseToEmployee(payrollId, employeeId);
        if (!data?.success) throw new Error(data?.message || 'Payment failed.');

        setStatus((current) => ({
          ...current,
          [employeeId]: {
            paid: true,
            paidAt: data.data?.paidAt || new Date().toISOString(),
            transactionId: data.data?.transactionId,
          },
        }));
        return true;
      } catch (caught) {
        setErrors((current) => ({
          ...current,
          [employeeId]: caught?.message || 'Payment failed.',
        }));
        return false;
      }
    },
    [payrollId],
  );

  const payEmployee = useCallback(
    async (employeeId) => {
      setPayingId(employeeId);
      setErrors((current) => {
        const next = { ...current };
        delete next[employeeId];
        return next;
      });

      try {
        await payOne(employeeId);
      } finally {
        if (activeRef.current) setPayingId('');
        onSettled?.();
      }
    },
    [payOne, onSettled],
  );

  const payAll = useCallback(async () => {
    const pending = unpaidLines(payroll, status);
    if (!pending.length) {
      toast.info('Everyone in this payroll has already been paid.');
      return;
    }

    setErrors({});
    setBatch({ current: 0, total: pending.length });

    let succeeded = 0;
    for (let index = 0; index < pending.length; index += 1) {
      if (!activeRef.current) break;
      setBatch({ current: index + 1, total: pending.length });
      // Sequential on purpose — see the note at the top of this hook.
      if (await payOne(pending[index].employeeId)) succeeded += 1;
    }

    if (activeRef.current) setBatch(null);

    const failed = pending.length - succeeded;
    if (failed === 0) {
      toast.success(`All ${succeeded} payments went through.`);
    } else {
      toast.warn(
        `${succeeded} of ${pending.length} payments succeeded. ${failed} failed — see the rows marked in red.`,
        { duration: 10000 },
      );
    }
    onSettled?.();
  }, [payroll, status, payOne, toast, onSettled]);

  const lines = payroll?.employees || [];
  const paidCount = lines.filter((line) => status[line.employeeId]?.paid).length;

  return {
    status,
    errors,
    payingId,
    batch,
    running: Boolean(batch),
    isPayable,
    paidCount,
    totalCount: lines.length,
    allPaid: lines.length > 0 && paidCount === lines.length,
    payEmployee,
    payAll,
  };
}
