import { Input, Select } from '@/components/ui';
import {
  SUPPORTED_COUNTRIES,
  getCountryConfig,
  getPhoneHelperText,
  normalizeNationalNumber,
} from '@/constants/countries';

const COUNTRY_OPTIONS = SUPPORTED_COUNTRIES.map((country) => ({
  value: country.code,
  label: `${country.name} (${country.dialCode})`,
}));

/**
 * Country picker paired with a national phone-number field.
 *
 * The two belong together: the dial-code prefix, the expected digit count, and
 * the normalisation applied while typing all follow from the chosen country.
 */
export function CountryPhoneFields({
  countryCode,
  onCountryChange,
  phone,
  onPhoneChange,
  phoneError,
  phoneLabel = 'Business phone',
  required,
}) {
  const country = getCountryConfig(countryCode);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        label="Country"
        value={countryCode}
        onChange={(event) => onCountryChange(event.target.value)}
        options={COUNTRY_OPTIONS}
        required={required}
      />

      <Input
        label={phoneLabel}
        name="phone"
        type="tel"
        inputMode="numeric"
        value={phone}
        // Strip the dial code and any trunk zero as the user types, so paste
        // from a contacts app produces the same value as manual entry.
        onChange={(event) =>
          onPhoneChange(normalizeNationalNumber(event.target.value, countryCode))
        }
        placeholder={getPhoneHelperText(countryCode)}
        hint={`${country.phoneDigits} digits after ${country.dialCode}`}
        error={phoneError}
        required={required}
        startIcon={
          <span className="text-sm font-bold text-slate-600">{country.dialCode}</span>
        }
        className="pl-16"
      />
    </div>
  );
}
