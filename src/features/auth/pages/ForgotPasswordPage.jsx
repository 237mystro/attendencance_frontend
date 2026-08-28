import { AtSign, KeyRound, MailCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert, Button, Input } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/context/toast-context';
import { AuthLayout } from '../components/AuthLayout';
import { PasswordInput } from '../components/PasswordInput';
import { StepIndicator } from '../components/StepIndicator';
import { usePasswordRecovery } from '../hooks/usePasswordRecovery';

const STEPS = [
  { key: 'request', title: 'Request code' },
  { key: 'reset', title: 'Set new password' },
];

const REDIRECT_DELAY_MS = 1200;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const redirectTimer = useRef(null);

  const recovery = usePasswordRecovery({
    onComplete: () => {
      toast.success('Password updated. Redirecting you to sign in…');
      redirectTimer.current = setTimeout(
        () => navigate(ROUTES.login, { replace: true }),
        REDIRECT_DELAY_MS,
      );
    },
  });

  // Cancel the pending redirect if the user leaves first.
  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const { step, values, setValue, submitting } = recovery;
  const isRequestStep = step === 'request';
  const isDone = step === 'done';

  const submitLabel = isDone
    ? 'Password updated'
    : isRequestStep
      ? 'Send recovery code'
      : 'Reset password';

  return (
    <AuthLayout
      eyebrow="Password recovery"
      title="Reset your password"
      subtitle="Request a one-time email code, then create a new password."
    >
      <form onSubmit={recovery.handleSubmit} noValidate className="flex flex-col gap-5">
        <StepIndicator steps={STEPS} activeIndex={isRequestStep ? 0 : 1} />

        {recovery.error && <Alert tone="danger">{recovery.error}</Alert>}
        {recovery.notice && <Alert tone="success">{recovery.notice}</Alert>}

        <div className="rounded-panel border border-brand-500/10 bg-brand-50/50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <MailCheck aria-hidden="true" className="size-4 text-brand-500" />
            Recovery codes are delivered by email
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Enter the email tied to your workspace. When the code arrives, stay on
            this page to finish the reset.
          </p>
        </div>

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="name@company.com"
          startIcon={<AtSign className="size-5" />}
          value={values.email}
          onChange={(event) => setValue('email', event.target.value)}
          disabled={!isRequestStep}
          required
        />

        {!isRequestStep && (
          <>
            <Input
              label={`${recovery.otpLength}-digit code`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={recovery.otpLength}
              placeholder="Enter the code sent to your email"
              startIcon={<KeyRound className="size-5" />}
              value={values.otp}
              onChange={(event) =>
                setValue('otp', event.target.value.replace(/\D/g, ''))
              }
              disabled={isDone}
              required
            />

            <PasswordInput
              label="New password"
              autoComplete="new-password"
              placeholder="Choose a new password"
              hint={`At least ${recovery.minPasswordLength} characters.`}
              value={values.password}
              onChange={(event) => setValue('password', event.target.value)}
              disabled={isDone}
              required
            />

            <PasswordInput
              label="Confirm new password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              showLockIcon={false}
              value={values.confirmPassword}
              onChange={(event) => setValue('confirmPassword', event.target.value)}
              disabled={isDone}
              required
            />
          </>
        )}

        <Button type="submit" size="lg" fullWidth loading={submitting} disabled={isDone}>
          {submitting ? 'Working…' : submitLabel}
        </Button>

        {step === 'reset' && (
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            disabled={submitting}
            onClick={recovery.restart}
          >
            Use another email
          </Button>
        )}

        <div className="rounded-panel bg-ink p-4 text-white">
          <p className="text-sm font-bold">Quick note</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
            Recovery codes are meant for immediate use. Complete the reset as soon as
            the email arrives for the smoothest experience.
          </p>
        </div>

        <p className="text-sm text-slate-600">
          Remembered it?{' '}
          <Link to={ROUTES.login} className="font-extrabold text-brand-500 hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
