import { useId } from 'react';

import { cn } from '@/lib/cn';
import { describedBy } from '@/lib/aria';
import { Field } from './Field';

/** Single-line text input with optional leading and trailing adornments. */
export function Input({
  id: providedId,
  label,
  hint,
  error,
  required,
  startIcon,
  endIcon,
  className,
  wrapperClassName,
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
        <div className="relative">
          {startIcon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-soft"
            >
              {startIcon}
            </span>
          )}
          <input
            id={id}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy({ error, hint, hintId, errorId })}
            className={cn(
              'field-base py-2.5',
              startIcon && 'pl-10',
              endIcon && 'pr-11',
              error && 'field-invalid',
              className,
            )}
            {...props}
          />
          {endIcon && (
            <span className="absolute inset-y-0 right-1.5 flex items-center">
              {endIcon}
            </span>
          )}
        </div>
      )}
    </Field>
  );
}

/** Multi-line text input. */
export function Textarea({
  id: providedId,
  label,
  hint,
  error,
  required,
  rows = 4,
  className,
  wrapperClassName,
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
        <textarea
          id={id}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy({ error, hint, hintId, errorId })}
          className={cn(
            'field-base resize-y py-2.5 leading-relaxed',
            error && 'field-invalid',
            className,
          )}
          {...props}
        />
      )}
    </Field>
  );
}
