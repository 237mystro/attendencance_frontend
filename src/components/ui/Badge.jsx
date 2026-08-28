import { cn } from '@/lib/cn';
import { humanizeStatus, toneFor } from '@/constants/status';

const TONES = {
  neutral: 'bg-ink/8 text-muted dark:bg-white/10 dark:text-muted-soft',
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  success: 'bg-success-soft text-success dark:bg-success/20 dark:text-green-300',
  warn: 'bg-warn-soft text-amber-700 dark:bg-warn/20 dark:text-amber-300',
  danger: 'bg-danger-soft text-danger dark:bg-danger/20 dark:text-red-300',
  info: 'bg-info-soft text-info dark:bg-info/20 dark:text-sky-300',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

/** A small status pill. */
export function Badge({ tone = 'neutral', size = 'md', icon, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg font-semibold whitespace-nowrap',
        TONES[tone] || TONES.neutral,
        SIZES[size],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/**
 * A Badge that picks its own tone and label from a status string, so `pending`
 * looks the same in payroll, leave, and salary advances without each screen
 * repeating a colour map.
 */
export function StatusBadge({ status, size = 'md', className }) {
  return (
    <Badge tone={toneFor(status)} size={size} className={className}>
      {humanizeStatus(status)}
    </Badge>
  );
}

/**
 * A count bubble for nav items and icon buttons. Renders nothing at zero and
 * caps the display at `max`.
 */
export function CountBadge({ count, max = 9, className, tone = 'danger' }) {
  const value = Number(count) || 0;
  if (value <= 0) return null;

  const tones = {
    danger: 'bg-danger',
    warn: 'bg-warn',
    brand: 'bg-brand-500',
  };

  return (
    <span
      aria-label={`${value} unread`}
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white',
        tones[tone],
        className,
      )}
    >
      {value > max ? `${max}+` : value}
    </span>
  );
}
