import { cn } from '@/lib/cn';

/**
 * The standard content card. Replaces the source's `DashboardPanel`, including
 * its hover lift and optional header row with a trailing action slot.
 */
export function Panel({
  title,
  subtitle,
  action,
  children,
  as: Component = 'section',
  interactive = true,
  padded = true,
  className,
  bodyClassName,
}) {
  return (
    <Component
      className={cn(
        'surface-panel transition-all duration-300',
        interactive && 'hover:-translate-y-0.5 hover:border-brand-500/20 hover:shadow-panel-hover',
        className,
      )}
    >
      {(title || subtitle || action) && (
        <header
          className={cn(
            'flex flex-col gap-3 border-b border-line sm:flex-row sm:items-center sm:justify-between dark:border-line-dark',
            padded ? 'px-4 py-4 sm:px-6' : 'p-4',
          )}
        >
          <div className="min-w-0">
            {title && (
              <h3 className="text-lg font-extrabold tracking-tight text-ink dark:text-ink-dark">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm leading-relaxed text-muted dark:text-muted-soft">
                {subtitle}
              </p>
            )}
          </div>
          {/*
            `min-w-0` rather than `shrink-0`: a header action holding several
            controls (a search box plus a filter, say) is wider than the header
            at tablet widths, and `shrink-0` made it spill out of the panel
            instead of letting its own `flex-wrap` wrap it onto a second row.
          */}
          {action && <div className="min-w-0">{action}</div>}
        </header>
      )}

      <div className={cn(padded && 'px-4 py-4 sm:px-6 sm:py-5', bodyClassName)}>
        {children}
      </div>
    </Component>
  );
}

/**
 * A headline number with a supporting label and icon. `accent` is a Tailwind
 * text-colour class; the tinted icon chip derives from it via `currentColor`.
 */
export function MetricCard({
  label,
  value,
  icon,
  helper,
  secondaryValue,
  accent = 'text-brand-500',
  className,
}) {
  return (
    <div
      className={cn(
        'surface-panel flex h-full items-start justify-between gap-3 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-panel-hover sm:p-5',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-muted dark:text-muted-soft">{label}</p>
        <p className="mt-1.5 text-2xl leading-none font-extrabold text-ink sm:text-3xl dark:text-ink-dark">
          {value}
        </p>
        {secondaryValue && (
          <p className={cn('mt-1.5 text-sm font-bold', accent)}>{secondaryValue}</p>
        )}
        {helper && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted dark:text-muted-soft">
            {helper}
          </p>
        )}
      </div>

      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-card bg-current/12',
            accent,
          )}
        >
          {icon}
        </span>
      )}
    </div>
  );
}
