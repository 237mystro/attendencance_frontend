import { useId } from 'react';

import { cn } from '@/lib/cn';

/**
 * Checkbox with an adjacent label, optional supporting line, and inline error.
 * `label` accepts a node, so it can carry a link (e.g. "…agree to the Terms").
 */
export function Checkbox({
  id: providedId,
  label,
  description,
  error,
  className,
  ...props
}) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      {/* The whole row is the label, so the tap target is the full 44px band
          rather than just the 20px box — WCAG 2.5.5. */}
      <label
        htmlFor={id}
        className="flex min-h-tap cursor-pointer items-start gap-3 py-2 select-none"
      >
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-ink/25 accent-brand-500 dark:border-white/25"
          {...props}
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink dark:text-ink-dark">
            {label}
          </span>
          {description && (
            <span className="block text-xs text-muted dark:text-muted-soft">
              {description}
            </span>
          )}
        </span>
      </label>

      {error && (
        <p id={errorId} role="alert" className="text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * An on/off switch. Built on a native checkbox with `role="switch"` so it stays
 * keyboard-operable and announces its state without extra JavaScript.
 */
export function Toggle({ id: providedId, label, description, className, ...props }) {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <div className={cn('flex min-h-tap items-center justify-between gap-4', className)}>
      <label htmlFor={id} className="cursor-pointer select-none">
        <span className="block text-sm font-semibold text-ink dark:text-ink-dark">
          {label}
        </span>
        {description && (
          <span className="block text-xs text-muted dark:text-muted-soft">
            {description}
          </span>
        )}
      </label>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={cn(
          'relative h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full transition-colors',
          'bg-ink/20 checked:bg-brand-500 dark:bg-white/20',
          'before:absolute before:top-0.5 before:left-0.5 before:size-5 before:rounded-full',
          'before:bg-white before:shadow-sm before:transition-transform',
          'checked:before:translate-x-5',
        )}
        {...props}
      />
    </div>
  );
}
