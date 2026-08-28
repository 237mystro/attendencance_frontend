import { useId } from 'react';

import { cn } from '@/lib/cn';
import { describedBy } from '@/lib/aria';
import { Field } from './Field';

/** Chevron drawn as a data URI so the control needs no wrapper element. */
const CHEVRON =
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%2364748b%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')] bg-[length:1.15rem] bg-[right_0.6rem_center] bg-no-repeat";

/**
 * A native `<select>` rather than a custom listbox: it is keyboard- and
 * screen-reader-correct for free, and on mobile it opens the OS picker.
 *
 * Pass `options` as `[{ value, label }]`, or supply `<option>` children.
 */
export function Select({
  id: providedId,
  label,
  hint,
  error,
  required,
  options = [],
  placeholder,
  className,
  wrapperClassName,
  children,
  ...props
}) {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      {({ hintId, errorId }) => (
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy({ error, hint, hintId, errorId })}
          className={cn(
            'field-base cursor-pointer appearance-none py-2.5 pr-9',
            CHEVRON,
            error && 'field-invalid',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
      )}
    </Field>
  );
}
