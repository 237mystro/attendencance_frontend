import { cn } from '@/lib/cn';

/** Constrains page content to the same max width the source used (1320px). */
export function PageWrapper({ children, className }) {
  return (
    <div className={cn('mx-auto w-full max-w-content px-4 py-5 sm:px-6 sm:py-6', className)}>
      {children}
    </div>
  );
}

/**
 * The dark gradient hero band at the top of each dashboard page, carried over
 * from the source's `DashboardHero`.
 */
export function PageHero({ eyebrow, title, subtitle, chips = [], actions, aside, className }) {
  return (
    <div className={cn('surface-hero mb-5 p-5 sm:p-7', className)}>
      {/* Corner highlights that give the band its depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(circle at 0% 0%, rgb(59 130 246 / 0.15) 0%, transparent 35%)',
            'radial-gradient(circle at 100% 0%, rgb(37 99 235 / 0.10) 0%, transparent 35%)',
            'radial-gradient(circle at 100% 100%, rgb(29 78 216 / 0.15) 0%, transparent 35%)',
            'radial-gradient(circle at 0% 100%, rgb(30 64 175 / 0.10) 0%, transparent 35%)',
          ].join(','),
        }}
      />

      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <div className="min-w-0">
          {eyebrow && (
            <span className="mb-3 inline-flex rounded-lg border border-white/15 bg-white/12 px-2.5 py-1 text-xs font-bold">
              {eyebrow}
            </span>
          )}

          {/* h2, not h1: the top bar owns the page's single h1. */}
          <h2 className="max-w-3xl text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed font-medium text-white/85 sm:text-base">
              {subtitle}
            </p>
          )}

          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-lg border border-white/12 bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
                >
                  {chip}
                </li>
              ))}
            </ul>
          )}

          {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
        </div>

        {aside && (
          <div className="rounded-card border border-white/15 bg-white/8 p-4 backdrop-blur-xl">
            {aside}
          </div>
        )}
      </div>
    </div>
  );
}
