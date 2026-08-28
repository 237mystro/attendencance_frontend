import { useCallback, useState } from 'react';

import { useToast } from '@/context/toast-context';
import {
  calculateEmployeePay,
  downloadPayPreviewPdf,
  emailPayPreview,
} from '@/api/payroll';

/**
 * Works out what an employee would be paid for a date range.
 *
 * A preview only — nothing is written and nothing is paid — so the result can
 * be shared freely as a PDF or an email before any run is created.
 */
export function usePayCalculator() {
  const toast = useToast();

  const [form, setForm] = useState({ employeeId: '', startDate: '', endDate: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [busy, setBusy] = useState('');

  /** Editing any input invalidates the previous result. */
  const patch = useCallback((changes) => {
    setForm((current) => ({ ...current, ...changes }));
    setError('');
    setResult(null);
  }, []);

  const calculate = useCallback(async () => {
    if (!form.employeeId || !form.startDate || !form.endDate) {
      setError('Choose an employee and a date range.');
      return;
    }
    if (form.startDate > form.endDate) {
      setError('The start date must be before the end date.');
      return;
    }

    setCalculating(true);
    setError('');
    try {
      const data = await calculateEmployeePay(form);
      if (!data?.success) throw new Error(data?.message || 'Calculation failed.');
      setResult(data.data);
    } catch (caught) {
      setError(caught?.message || 'Could not calculate that.');
    } finally {
      setCalculating(false);
    }
  }, [form]);

  const savePdf = useCallback(async () => {
    setBusy('pdf');
    try {
      await downloadPayPreviewPdf(form, result?.employee?.name);
    } catch (caught) {
      toast.error(caught?.message || 'Could not generate the PDF.');
    } finally {
      setBusy('');
    }
  }, [form, result, toast]);

  const sendEmail = useCallback(
    async (recipientEmail) => {
      if (!recipientEmail.trim()) {
        setError('Enter a recipient email address.');
        return false;
      }

      setBusy('email');
      try {
        const data = await emailPayPreview({
          ...form,
          recipientEmail: recipientEmail.trim(),
        });
        if (!data?.success) {
          throw new Error(
            data?.message || 'Could not send. Check email is configured on the server.',
          );
        }
        toast.success(`Pay preview emailed to ${recipientEmail.trim()}.`);
        return true;
      } catch (caught) {
        setError(caught?.message || 'Could not send the email.');
        return false;
      } finally {
        setBusy('');
      }
    },
    [form, toast],
  );

  return { form, patch, result, error, setError, calculating, busy, calculate, savePdf, sendEmail };
}
