import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Button } from './Button';

/**
 * The four states every async view needs. Having them here means a screen can
 * cover loading / empty / error / success without inventing its own markup.
 */

export function LoadingState({ label = 'Loading…', className }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}
    >
      <Loader2 aria-hidden="true" className="size-7 animate-spin text-brand-500" />
      <p className="text-sm text-muted dark:text-muted-soft">{label}</p>
    </div>
  );
}

export function EmptyState({ icon, title = 'Nothing here yet', description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-4 py-12 text-center',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-ink/5 text-muted dark:bg-white/8 dark:text-muted-soft">
        {icon || <Inbox aria-hidden="true" className="size-6" />}
      </span>
      <div>
        <p className="text-sm font-bold text-ink dark:text-ink-dark">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted dark:text-muted-soft">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-4 py-12 text-center',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger dark:bg-danger/20">
        <AlertTriangle aria-hidden="true" className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-ink dark:text-ink-dark">{title}</p>
        {message && (
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted dark:text-muted-soft">
            {message}
          </p>
        )}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Inline error message for forms — sits above the submit button. */
export function Alert({ tone = 'danger', title, children, className }) {
  const tones = {
    danger: 'border-danger/25 bg-danger-soft text-danger dark:bg-danger/15 dark:text-red-300',
    success:
      'border-success/25 bg-success-soft text-success dark:bg-success/15 dark:text-green-300',
    warn: 'border-warn/25 bg-warn-soft text-amber-700 dark:bg-warn/15 dark:text-amber-300',
    info: 'border-info/25 bg-info-soft text-info dark:bg-info/15 dark:text-sky-300',
  };

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'rounded-btn border px-4 py-3 text-sm leading-relaxed',
        tones[tone],
        className,
      )}
    >
      {title && <p className="font-bold">{title}</p>}
      {children}
    </div>
  );
}

/** Full-page loader used while the session hydrates and by route Suspense. */
export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <LoadingState label={label} />
    </div>
  );
}

/** Grey placeholder block for skeleton layouts. */
export function Skeleton({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-lg bg-ink/8 dark:bg-white/8', className)}
    />
  );
}
