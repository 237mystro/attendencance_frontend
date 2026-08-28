import { useCallback, useMemo, useState } from 'react';

/**
 * Small form controller: values, per-field errors, touched tracking, and a
 * submit wrapper that validates first and disables while in flight.
 *
 * `validate` receives the whole values object and returns `{ field: message }`.
 * Keeping validation as a plain function means the rules live next to the form
 * and stay testable without a form library.
 */
export function useForm({ initialValues = {}, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const setValue = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    // Clear the field's error as soon as the user edits it.
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  }, []);

  /** Spread onto an input: `<Input {...field('email')} />`. */
  const field = useCallback(
    (name, { type = 'text' } = {}) => ({
      name,
      value: values[name] ?? (type === 'checkbox' ? false : ''),
      onChange: (event) => {
        const target = event?.target;
        if (!target) {
          setValue(name, event);
          return;
        }
        setValue(name, target.type === 'checkbox' ? target.checked : target.value);
      },
      onBlur: () => setTouched((current) => ({ ...current, [name]: true })),
      error: touched[name] ? errors[name] : undefined,
    }),
    [values, errors, touched, setValue],
  );

  const runValidation = useCallback(() => {
    if (!validate) return {};
    const result = validate(values) || {};
    // Drop keys with no message so `isValid` stays accurate.
    return Object.fromEntries(Object.entries(result).filter(([, message]) => message));
  }, [validate, values]);

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault?.();
      setSubmitError('');

      const nextErrors = runValidation();
      setErrors(nextErrors);
      setTouched(
        Object.fromEntries(Object.keys(values).map((key) => [key, true])),
      );

      if (Object.keys(nextErrors).length) {
        // Move focus to the first invalid control so keyboard users land on it.
        const [firstField] = Object.keys(nextErrors);
        document.querySelector(`[name="${firstField}"]`)?.focus();
        return { ok: false };
      }

      setSubmitting(true);
      try {
        const result = await onSubmit(values);
        return { ok: true, data: result };
      } catch (caught) {
        setSubmitError(caught?.message || 'Something went wrong. Please try again.');
        return { ok: false, error: caught };
      } finally {
        setSubmitting(false);
      }
    },
    [runValidation, onSubmit, values],
  );

  /**
   * Marks fields as touched so their errors become visible.
   *
   * Needed by multi-step forms: a step is validated on "Continue", before the
   * user has blurred anything, and errors set without this would be stored but
   * never shown — the button would appear to do nothing.
   */
  const markTouched = useCallback((names) => {
    setTouched((current) => ({
      ...current,
      ...Object.fromEntries(names.map((name) => [name, true])),
    }));
  }, []);

  const reset = useCallback(
    (nextValues = initialValues) => {
      setValues(nextValues);
      setErrors({});
      setTouched({});
      setSubmitError('');
    },
    [initialValues],
  );

  const isValid = useMemo(
    () => Object.keys(runValidation()).length === 0,
    [runValidation],
  );

  return {
    values,
    errors,
    touched,
    submitting,
    submitError,
    isValid,
    field,
    setValue,
    setValues,
    setErrors,
    markTouched,
    setSubmitError,
    handleSubmit,
    reset,
  };
}

/** Reusable validation rules, so the same message appears app-wide. */
export const rules = {
  required: (value, label = 'This field') =>
    value === undefined || value === null || String(value).trim() === ''
      ? `${label} is required.`
      : undefined,

  email: (value) =>
    value && !/^\S+@\S+\.\S+$/.test(String(value).trim())
      ? 'Enter a valid email address.'
      : undefined,

  minLength: (value, length, label = 'This field') =>
    value && String(value).length < length
      ? `${label} must be at least ${length} characters.`
      : undefined,

  matches: (value, other, message = 'Values do not match.') =>
    value !== other ? message : undefined,

  positiveNumber: (value, label = 'This field') => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return `${label} must be a number.`;
    return parsed <= 0 ? `${label} must be greater than zero.` : undefined;
  },
};

/** Returns the first non-undefined rule result. */
export const firstError = (...results) => results.find(Boolean);
