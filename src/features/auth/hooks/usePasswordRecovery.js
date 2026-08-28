import { useCallback, useState } from 'react';

import { requestPasswordReset, resetPassword } from '@/api/auth';

const MIN_PASSWORD_LENGTH = 6;
const OTP_LENGTH = 6;

/**
 * Drives the two-step password recovery flow, keeping the request/verify
 * sequence and its validation out of the page component.
 *
 * Steps: `request` → `reset` → `done`.
 */
export function usePasswordRecovery({ onComplete } = {}) {
  const [step, setStep] = useState('request');
  const [values, setValues] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setError('');
  }, []);

  const sendCode = useCallback(async () => {
    if (!values.email.trim()) {
      setError('Enter the email address linked to your account.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const data = await requestPasswordReset(values.email);
      // Worded so it never confirms whether the address has an account.
      setNotice(data?.message || 'If that email exists, a reset code has been sent.');
      setStep('reset');
    } catch (caught) {
      setError(caught?.message || 'Unable to send a reset code right now.');
    } finally {
      setSubmitting(false);
    }
  }, [values.email]);

  const submitNewPassword = useCallback(async () => {
    if (values.otp.trim().length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code from your email.`);
      return;
    }
    if (values.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const data = await resetPassword(values);
      setNotice(data?.message || 'Password reset successful. You can now sign in.');
      setValues((current) => ({
        ...current,
        otp: '',
        password: '',
        confirmPassword: '',
      }));
      setStep('done');
      onComplete?.();
    } catch (caught) {
      setError(caught?.message || 'Unable to reset your password.');
    } finally {
      setSubmitting(false);
    }
  }, [values, onComplete]);

  const restart = useCallback(() => {
    setStep('request');
    setNotice('');
    setError('');
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (step === 'request') return sendCode();
      if (step === 'reset') return submitNewPassword();
      return undefined;
    },
    [step, sendCode, submitNewPassword],
  );

  return {
    step,
    values,
    setValue,
    error,
    notice,
    submitting,
    handleSubmit,
    restart,
    otpLength: OTP_LENGTH,
    minPasswordLength: MIN_PASSWORD_LENGTH,
  };
}
