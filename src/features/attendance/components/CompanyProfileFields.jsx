import { Input, Panel, Select, Textarea } from '@/components/ui';
import {
  SUPPORTED_COUNTRIES,
  getCountryConfig,
  normalizeNationalNumber,
} from '@/constants/countries';
import { TIMEZONE_OPTIONS } from '../timezones';

const COUNTRY_OPTIONS = SUPPORTED_COUNTRIES.map((country) => ({
  value: country.code,
  label: `${country.name} (${country.dialCode})`,
}));

/**
 * Company details that travel with the geofence on the same endpoint:
 * timezone, contact and registration info, and the payroll rate defaults.
 */
export function CompanyProfileFields({ settings }) {
  const country = getCountryConfig(settings.countryCode);

  const setRate = (field) => (event) =>
    settings.setPayrollDefaults((current) => ({
      ...current,
      [field]: event.target.value === '' ? '' : Number(event.target.value),
    }));

  return (
    <>
      <Panel
        title="Company profile"
        subtitle="Used for payroll formatting, contact details, and attendance timing."
        interactive={false}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Timezone"
            value={settings.timezone}
            options={TIMEZONE_OPTIONS}
            onChange={(event) => settings.setTimezone(event.target.value)}
            hint="Attendance times are evaluated in this zone."
          />

          <Select
            label="Country"
            value={settings.countryCode}
            options={COUNTRY_OPTIONS}
            onChange={(event) => {
              const code = event.target.value;
              settings.setCountryCode(code);
              // Re-normalise the stored number against the new country's rules.
              settings.setCompanyPhone((phone) => normalizeNationalNumber(phone, code));
            }}
          />

          <Input
            label="Company phone"
            type="tel"
            inputMode="numeric"
            value={settings.companyPhone}
            onChange={(event) =>
              settings.setCompanyPhone(
                normalizeNationalNumber(event.target.value, settings.countryCode),
              )
            }
            hint={`${country.phoneDigits} digits after ${country.dialCode}`}
            startIcon={
              <span className="text-sm font-bold text-slate-600 dark:text-muted-soft">
                {country.dialCode}
              </span>
            }
            className="pl-16"
          />

          <Input
            label={country.registrationLabel}
            value={settings.registrationNumber}
            onChange={(event) =>
              settings.setRegistrationNumber(event.target.value.toUpperCase())
            }
          />
        </div>
      </Panel>

      <Panel
        title="Payroll defaults"
        subtitle="Applied to new payroll runs unless a run overrides them."
        interactive={false}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Currency"
            value={settings.payrollDefaults.currency}
            onChange={(event) =>
              settings.setPayrollDefaults((current) => ({
                ...current,
                currency: event.target.value.toUpperCase(),
              }))
            }
            maxLength={4}
          />
          <Input
            label="Tax rate (%)"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={settings.payrollDefaults.taxRate}
            onChange={setRate('taxRate')}
          />
          <Input
            label="Pension rate (%)"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={settings.payrollDefaults.pensionRate}
            onChange={setRate('pensionRate')}
          />
          <Input
            label="Other deductions (%)"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={settings.payrollDefaults.otherDeductionRate}
            onChange={setRate('otherDeductionRate')}
          />
        </div>

        <Textarea
          label="Notes"
          className="mt-4"
          rows={3}
          value={settings.payrollDefaults.notes}
          onChange={(event) =>
            settings.setPayrollDefaults((current) => ({
              ...current,
              notes: event.target.value,
            }))
          }
          hint="Shown to whoever reviews a payroll run."
        />
      </Panel>
    </>
  );
}
