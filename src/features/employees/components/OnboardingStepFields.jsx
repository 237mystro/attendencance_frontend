import { Input, Select } from '@/components/ui';
import {
  SUPPORTED_COUNTRIES,
  getCountryConfig,
  getPhoneHelperText,
  normalizeNationalNumber,
} from '@/constants/countries';
import { POSITIONS } from '../employee-fields';

const COUNTRY_OPTIONS = SUPPORTED_COUNTRIES.map((country) => ({
  value: country.code,
  label: `${country.name} (${country.dialCode})`,
}));

const POSITION_OPTIONS = POSITIONS.map((position) => ({
  value: position,
  label: position,
}));

/** The fields belonging to one onboarding step. */
export function OnboardingStepFields({ stepId, form }) {
  const country = getCountryConfig(form.values.countryCode);

  const phoneField = (name, label) => ({
    ...form.field(name),
    label,
    type: 'tel',
    inputMode: 'numeric',
    required: true,
    hint: getPhoneHelperText(form.values.countryCode),
    className: 'pl-16',
    startIcon: (
      <span className="text-sm font-bold text-slate-600 dark:text-muted-soft">
        {country.dialCode}
      </span>
    ),
    onChange: (event) =>
      form.setValue(
        name,
        normalizeNationalNumber(event.target.value, form.values.countryCode),
      ),
  });

  if (stepId === 'personal') {
    return (
      <>
        <Input label="Full name" required autoFocus {...form.field('name')} />
        <Input
          label="Email address"
          type="email"
          required
          hint="Their sign-in address and where login instructions are sent."
          {...form.field('email')}
        />
      </>
    );
  }

  if (stepId === 'contact') {
    return (
      <>
        <Select
          label="Country"
          required
          value={form.values.countryCode}
          options={COUNTRY_OPTIONS}
          onChange={(event) => {
            const code = event.target.value;
            form.setValues((current) => ({
              ...current,
              countryCode: code,
              phone: normalizeNationalNumber(current.phone, code),
              momoNumber: normalizeNationalNumber(current.momoNumber, code),
            }));
          }}
        />
        <Input {...phoneField('phone', 'Phone number')} />
        <Input {...phoneField('momoNumber', 'Mobile money number')} />
      </>
    );
  }

  return (
    <>
      <Select
        label="Position"
        required
        placeholder="Select a position"
        options={POSITION_OPTIONS}
        {...form.field('position')}
      />
      <Input label="Department" {...form.field('department')} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={`Monthly salary (${country.currency})`}
          type="number"
          min={0}
          required
          {...form.field('salary')}
        />
        <Input
          label={`Pay per shift (${country.currency})`}
          type="number"
          min={0}
          required
          {...form.field('payPerShift')}
        />
      </div>
    </>
  );
}
