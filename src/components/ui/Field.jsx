import { cn } from '@/lib/cn';

/**
 * Shared label / hint / error scaffolding for every form control.
 *
 * Renders its child as a function so the control can wire `aria-describedby`
 * to whichever of the hint or error ids is actually present.
 */
export function Field({ id, label, hint, error, required, children, className }) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-bold text-ink dark:text-ink-dark">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children({ hintId, errorId })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-muted dark:text-muted-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
