import { AtSign } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Alert, Button, Checkbox, Input } from '@/components/ui';
import { ROUTES, dashboardFor } from '@/constants/routes';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { firstError, rules, useForm } from '@/hooks/useForm';
import { AuthLayout } from '../components/AuthLayout';
import { PasswordInput } from '../components/PasswordInput';

const LAST_EMAIL_KEY = 'autopayroll-last-email';

const readLastEmail = () => {
  try {
    return window.localStorage.getItem(LAST_EMAIL_KEY) || '';
  } catch {
    return '';
  }
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const form = useForm({
    initialValues: { email: readLastEmail(), password: '', remember: false },
    validate: (values) => ({
      email: firstError(
        rules.required(values.email, 'Email address'),
        rules.email(values.email),
      ),
      password: rules.required(values.password, 'Password'),
    }),
    onSubmit: async (values) => {
      const data = await login(values.email, values.password, {
        remember: values.remember,
      });

      try {
        if (values.remember) {
          window.localStorage.setItem(LAST_EMAIL_KEY, values.email.trim().toLowerCase());
        } else {
          window.localStorage.removeItem(LAST_EMAIL_KEY);
        }
      } catch {
        // Privacy mode — the sign-in itself still succeeded.
      }

      toast.success(`Welcome back, ${data.user?.name || 'there'}.`);

      // Return the user to wherever the guard interrupted them, if anywhere.
      const target = location.state?.from || dashboardFor(data.user?.role);
      navigate(target, { replace: true });
    },
  });

  return (
    <AuthLayout
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Sign in to your workspace to manage attendance, payroll, and your team."
    >
      <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-5">
        {form.submitError && <Alert tone="danger">{form.submitError}</Alert>}

        <Input
          label="Work email"
          type="email"
          autoFocus
          autoComplete="email"
          placeholder="name@company.com"
          startIcon={<AtSign className="size-5" />}
          required
          {...form.field('email')}
        />

        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          required
          {...form.field('password')}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Checkbox
            label="Remember my email"
            description="Stay signed in for 30 days"
            checked={form.values.remember}
            {...form.field('remember', { type: 'checkbox' })}
          />

          <Link
            to={ROUTES.forgotPassword}
            className="inline-flex min-h-tap items-center text-sm font-bold text-brand-500 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={form.submitting}>
          {form.submitting ? 'Signing in…' : 'Sign in to workspace'}
        </Button>

        <hr className="border-ink/8" />

        <div className="rounded-panel border border-ink/8 bg-slate-50 p-4">
          <p className="text-sm font-bold text-ink">New business?</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Launch your payroll workspace, onboard your team, and start managing
            attendance in minutes.
          </p>
          <Link
            to={ROUTES.register}
            className="mt-2 inline-flex min-h-tap items-center text-sm font-extrabold text-brand-500 hover:underline"
          >
            Create a business account
          </Link>
        </div>

        <p className="text-center text-xs text-muted-soft">
          By signing in you agree to our{' '}
          <Link to={ROUTES.terms} className="font-bold text-brand-500 hover:underline">
            Terms &amp; Conditions
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
