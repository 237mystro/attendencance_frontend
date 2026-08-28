import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/cn';

/**
 * The app's only button. Every variant meets the 44px minimum tap target,
 * and `loading` both disables the button and swaps in a spinner so callers
 * never have to wire that up themselves.
 */

const VARIANTS = {
  primary:
    'bg-linear-to-br from-brand-900 to-brand-500 text-white shadow-cta hover:from-brand-950 hover:to-brand-600 hover:shadow-cta-hover',
  secondary:
    'bg-surface text-ink border border-ink/15 hover:bg-canvas dark:bg-white/5 dark:text-ink-dark dark:border-white/15 dark:hover:bg-white/10',
  soft: 'bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25',
  ghost:
    'text-muted hover:bg-ink/5 hover:text-ink dark:text-muted-soft dark:hover:bg-white/10 dark:hover:text-ink-dark',
  danger: 'bg-danger text-white hover:bg-danger/90',
  success: 'bg-success text-white hover:bg-success/90',
  outline:
    'border border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/15',
};

const SIZES = {
  sm: 'min-h-tap px-3 py-1.5 text-sm gap-1.5',
  md: 'min-h-tap px-4 py-2.5 text-sm gap-2',
  lg: 'min-h-tap px-6 py-3.5 text-base gap-2.5',
};

export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  className,
  children,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <Component
      type={Component === 'button' ? type : undefined}
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-btn font-bold whitespace-nowrap',
        'transition-all duration-200',
        'disabled:pointer-events-none disabled:opacity-55',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin" />
      ) : (
        startIcon
      )}
      {children}
      {!loading && endIcon}
    </Component>
  );
}

/**
 * A square button for a bare icon. `label` is required — it becomes the
 * accessible name, since there is no visible text to fall back on.
 */
export function IconButton({
  label,
  variant = 'ghost',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}) {
  // Every size keeps a 44px box (WCAG 2.5.5); `sm` only shrinks the glyph, so
  // dense toolbars read lighter without becoming hard to hit on a phone.
  const sizes = {
    sm: 'size-11 [&_svg]:size-4',
    md: 'size-11 [&_svg]:size-5',
    lg: 'size-12 [&_svg]:size-6',
  };

  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-btn transition-colors duration-200',
        'disabled:pointer-events-none disabled:opacity-55',
        VARIANTS[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
