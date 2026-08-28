import { AtSign, Building2, CircleCheckBig, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert, Button, Checkbox, Input } from '@/components/ui';
import { DEFAULT_COUNTRY_CODE, getCountryConfig } from '@/constants/countries';
import { ROUTES, dashboardFor } from '@/constants/routes';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useForm } from '@/hooks/useForm';
import { AuthLayout } from '../components/AuthLayout';
import { CountryPhoneFields } from '../components/CountryPhoneFields';
import { PasswordInput } from '../components/PasswordInput';
import { PasswordStrength } from '../components/PasswordStrength';
import {
  MIN_PASSWORD_LENGTH,
  toRegistrationPayload,
  validateRegistration,
} from '../register-validation';

export function RegisterPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const form = useForm({
    initialValues: {
      name: '',
      company: '',
      countryCode: DEFAULT_COUNTRY_CODE,
      phone: '',
      registrationNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    validate: validateRegistration,
    onSubmit: async (values) => {
      const data = await signup(toRegistrationPayload(values));

      toast.success('Workspace created. Welcome to AutoPayroll.');
      navigate(dashboardFor(data.user?.role), { replace: true });
    },
  });

  const country = getCountryConfig(form.values.countryCode);

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your workspace"
      subtitle="Set up your company account and start managing attendance and payroll."
    >
      <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
        {form.submitError && <Alert tone="danger">{form.submitError}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            autoFocus
            autoComplete="name"
            placeholder="Jane Doe"
            startIcon={<UserRound className="size-5" />}
            required
            {...form.field('name')}
          />
          <Input
            label="Company name"
            autoComplete="organization"
            placeholder="ThinkBig Multimedia"
            startIcon={<Building2 className="size-5" />}
            required
            {...form.field('company')}
          />
        </div>

        <CountryPhoneFields
          required
          countryCode={form.values.countryCode}
          onCountryChange={(value) => form.setValue('countryCode', value)}
          phone={form.values.phone}
          onPhoneChange={(value) => form.setValue('phone', value)}
          phoneError={form.touched.phone ? form.errors.phone : undefined}
        />

        <Input
          label={country.registrationLabel}
          placeholder="Enter your business registration identifier"
          required
          {...form.field('registrationNumber')}
          onChange={(event) =>
            form.setValue('registrationNumber', event.target.value.toUpperCase())
          }
        />

        <Input
          label="Business email"
          type="email"
          autoComplete="email"
          placeholder="admin@company.com"
          startIcon={<AtSign className="size-5" />}
          required
          {...form.field('email')}
        />

        <fieldset className="rounded-panel border border-ink/8 bg-white p-4">
          <legend className="px-1 text-sm font-bold text-ink">Create secure access</legend>

          <div className="flex flex-col gap-4 pt-1">
            <div>
              <PasswordInput
                label="Password"
                autoComplete="new-password"
                placeholder="Choose a strong password"
                hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
                required
                {...form.field('password')}
              />
              <PasswordStrength password={form.values.password} />
            </div>

            <PasswordInput
              label="Confirm password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              required
              {...form.field('confirmPassword')}
            />
          </div>
        </fieldset>

        <div className="rounded-panel border border-accent-500/15 bg-accent-500/5 p-4">
          <Checkbox
            name="agreeToTerms"
            checked={form.values.agreeToTerms}
            {...form.field('agreeToTerms', { type: 'checkbox' })}
            label={
              <>
                I confirm this workspace is for my organization and I agree to the{' '}
                <Link
                  to={ROUTES.terms}
                  className="font-bold text-accent-500 underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  Terms &amp; Conditions
                </Link>{' '}
                for secure business use.
              </>
            }
          />
        </div>

        <Button type="submit" size="lg" fullWidth loading={form.submitting}>
          {form.submitting ? 'Creating workspace…' : 'Create business workspace'}
        </Button>

        <div className="rounded-panel bg-ink p-4 text-white">
          <p className="flex items-center gap-2 text-sm font-bold">
            <CircleCheckBig aria-hidden="true" className="size-4 text-cyan-300" />
            What happens next
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
            After signup you can add employees, configure payroll settings, define
            attendance rules, and start inviting your team immediately.
          </p>
        </div>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to={ROUTES.login} className="font-extrabold text-brand-500 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
