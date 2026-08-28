/** Countries the platform supports, with phone and currency rules for each. */
export const SUPPORTED_COUNTRIES = [
  {
    code: 'CM',
    name: 'Cameroon',
    dialCode: '+237',
    phoneDigits: 9,
    registrationLabel: 'RC / NIU / business registration number',
    currency: 'XAF',
    timezone: 'Africa/Douala',
  },
  {
    code: 'GH',
    name: 'Ghana',
    dialCode: '+233',
    phoneDigits: 9,
    registrationLabel: 'RC number / tax identification number',
    currency: 'GHS',
    timezone: 'Africa/Accra',
  },
  {
    code: 'NG',
    name: 'Nigeria',
    dialCode: '+234',
    phoneDigits: 10,
    registrationLabel: 'CAC registration number',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
  },
  {
    code: 'KE',
    name: 'Kenya',
    dialCode: '+254',
    phoneDigits: 9,
    registrationLabel: 'Business registration / KRA PIN',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
  },
  {
    code: 'CI',
    name: "Cote d'Ivoire",
    dialCode: '+225',
    phoneDigits: 10,
    registrationLabel: 'RCCM / taxpayer number',
    currency: 'XOF',
    timezone: 'Africa/Abidjan',
  },
  {
    code: 'SN',
    name: 'Senegal',
    dialCode: '+221',
    phoneDigits: 9,
    registrationLabel: 'NINEA / business registration number',
    currency: 'XOF',
    timezone: 'Africa/Dakar',
  },
  {
    code: 'ZA',
    name: 'South Africa',
    dialCode: '+27',
    phoneDigits: 9,
    registrationLabel: 'CIPC registration number',
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
  },
];

export const DEFAULT_COUNTRY_CODE = 'CM';

export const getCountryConfig = (countryCode) =>
  SUPPORTED_COUNTRIES.find(
    (country) =>
      country.code === String(countryCode || DEFAULT_COUNTRY_CODE).toUpperCase(),
  ) || SUPPORTED_COUNTRIES[0];

export const onlyDigits = (value = '') => String(value).replace(/\D/g, '');

/**
 * Strips the dial code and any leading trunk zero, then clamps to the national
 * length — so `+237 6 77 12 34 56`, `0677123456`, and `677123456` all normalise
 * to the same nine digits.
 */
export const normalizeNationalNumber = (value, countryCode) => {
  const country = getCountryConfig(countryCode);
  const dialDigits = onlyDigits(country.dialCode);
  let digits = onlyDigits(value);

  if (digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length);
  }

  if (digits.length === country.phoneDigits + 1 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits.slice(0, country.phoneDigits);
};

export const isValidPhoneForCountry = (value, countryCode) =>
  normalizeNationalNumber(value, countryCode).length ===
  getCountryConfig(countryCode).phoneDigits;

export const getPhoneHelperText = (countryCode) => {
  const country = getCountryConfig(countryCode);
  return `${country.dialCode} + ${country.phoneDigits} digits`;
};

/** Full international form, e.g. `+237677123456`. */
export const toInternationalNumber = (value, countryCode) => {
  const country = getCountryConfig(countryCode);
  const national = normalizeNationalNumber(value, countryCode);
  return national ? `${country.dialCode}${national}` : '';
};
