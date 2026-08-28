import {
  DEFAULT_COUNTRY_CODE,
  getCountryConfig,
  getPhoneHelperText,
  isValidPhoneForCountry,
  normalizeNationalNumber,
} from '@/constants/countries';
import { firstError, rules } from '@/hooks/useForm';

/**
 * Shared shape and validation for an employee record.
 *
 * Both the quick add/edit dialog and the guided onboarding wizard write the
 * same record, so the field list, the rules, and the payload shape live here
 * instead of being written twice and drifting apart.
 */

/** Common job titles offered in the onboarding wizard. */
export const POSITIONS = [
  'Accountant', 'Cashier', 'Clerk', 'Customer Service', 'Data Entry',
  'Driver', 'Engineer', 'Executive', 'Guard / Security', 'HR Officer',
  'Intern', 'IT Support', 'Logistics', 'Manager', 'Marketing',
  'Nurse / Medical', 'Operations', 'Receptionist', 'Sales Representative',
  'Supervisor', 'Technician', 'Warehouse Staff', 'Other',
];

export const WEEKDAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday',
];

export const emptyShift = () => ({ day: '', date: '', startTime: '', endTime: '' });

export const EMPTY_EMPLOYEE = {
  name: '',
  email: '',
  countryCode: DEFAULT_COUNTRY_CODE,
  phone: '',
  momoNumber: '',
  position: '',
  department: '',
  salary: '',
  payPerShift: '',
};

/** Turns an existing record into form values, normalising both phone fields. */
export const toEmployeeFormValues = (employee) => {
  const countryCode = employee.countryCode || DEFAULT_COUNTRY_CODE;

  return {
    name: employee.name || '',
    email: employee.email || '',
    countryCode,
    phone: normalizeNationalNumber(employee.phone, countryCode),
    momoNumber: normalizeNationalNumber(employee.momoNumber, countryCode),
    position: employee.position || '',
    department: employee.department || '',
    salary: employee.salary ?? '',
    payPerShift: employee.payPerShift ?? '',
  };
};

/** The shape the API expects. */
export const toEmployeePayload = (values, shifts = []) => ({
  name: values.name.trim(),
  email: values.email.trim().toLowerCase(),
  countryCode: values.countryCode,
  phone: values.phone,
  momoNumber: values.momoNumber,
  position: values.position,
  department: values.department.trim(),
  salary: Number(values.salary),
  payPerShift: Number(values.payPerShift),
  // Only fully specified shifts are sent; a half-filled row is a mistake, not
  // a partial record, and is rejected by `validateEmployee` before we get here.
  shifts: shifts.filter(
    (shift) => shift.day && shift.date && shift.startTime && shift.endTime,
  ),
});

const phoneRule = (value, countryCode, label) =>
  firstError(
    rules.required(value, label),
    isValidPhoneForCountry(value, countryCode)
      ? undefined
      : `${label} must match the ${getCountryConfig(countryCode).name} format: ${getPhoneHelperText(countryCode)}.`,
  );

/** Validates the whole record. `shifts` is optional. */
export const validateEmployee = (values, shifts = []) => {
  const errors = {
    name: rules.required(values.name, 'Full name'),
    email: firstError(
      rules.required(values.email, 'Email address'),
      rules.email(values.email),
    ),
    phone: phoneRule(values.phone, values.countryCode, 'Phone number'),
    momoNumber: phoneRule(
      values.momoNumber,
      values.countryCode,
      'Mobile money number',
    ),
    position: rules.required(values.position, 'Position'),
    salary: firstError(
      rules.required(values.salary, 'Monthly salary'),
      rules.positiveNumber(values.salary, 'Monthly salary'),
    ),
    payPerShift: firstError(
      rules.required(values.payPerShift, 'Pay per shift'),
      rules.positiveNumber(values.payPerShift, 'Pay per shift'),
    ),
  };

  // A shift row is either blank or complete — half of one would silently drop.
  const hasPartialShift = shifts.some((shift) => {
    const filled = [shift.day, shift.date, shift.startTime, shift.endTime].filter(Boolean);
    return filled.length > 0 && filled.length < 4;
  });
  if (hasPartialShift) {
    errors.shifts = 'Complete every field in a shift row, or clear the row.';
  }

  return errors;
};

/** Which step of the onboarding wizard owns which field. */
export const ONBOARDING_STEPS = [
  { id: 'personal', title: 'Personal info', fields: ['name', 'email'] },
  { id: 'contact', title: 'Contact & country', fields: ['phone', 'momoNumber'] },
  {
    id: 'role',
    title: 'Role & salary',
    fields: ['position', 'salary', 'payPerShift'],
  },
];
