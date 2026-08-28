import {
  getCountryConfig,
  getPhoneHelperText,
  isValidPhoneForCountry,
} from '@/constants/countries';
import { firstError, rules } from '@/hooks/useForm';

export const MIN_PASSWORD_LENGTH = 6;

/**
 * Validation rules for the business signup form.
 *
 * Kept out of the page component because several rules depend on the selected
 * country — the phone format and the registration-number label both change —
 * and that logic is easier to follow and test on its own.
 */
export const validateRegistration = (values) => {
  const country = getCountryConfig(values.countryCode);

  return {
    name: rules.required(values.name, 'Full name'),
    company: rules.required(values.company, 'Company name'),

    phone: firstError(
      rules.required(values.phone, 'Business phone'),
      isValidPhoneForCountry(values.phone, values.countryCode)
        ? undefined
        : `Enter a valid ${country.name} number: ${getPhoneHelperText(values.countryCode)}.`,
    ),

    registrationNumber: rules.required(
      values.registrationNumber,
      country.registrationLabel,
    ),

    email: firstError(
      rules.required(values.email, 'Business email'),
      rules.email(values.email),
    ),

    password: firstError(
      rules.required(values.password, 'Password'),
      rules.minLength(values.password, MIN_PASSWORD_LENGTH, 'Password'),
    ),

    confirmPassword: firstError(
      rules.required(values.confirmPassword, 'Password confirmation'),
      rules.matches(values.confirmPassword, values.password, 'Passwords do not match.'),
    ),

    agreeToTerms: values.agreeToTerms
      ? undefined
      : 'You must accept the terms to continue.',
  };
};

/** The shape the API expects, normalised from the form values. */
export const toRegistrationPayload = (values) => ({
  name: values.name.trim(),
  company: values.company.trim(),
  countryCode: values.countryCode,
  phone: values.phone,
  registrationNumber: values.registrationNumber.trim(),
  email: values.email.trim().toLowerCase(),
  password: values.password,
});
