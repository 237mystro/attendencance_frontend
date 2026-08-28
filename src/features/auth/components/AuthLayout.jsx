import { ArrowUpRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useForceLightMode } from '@/context/theme-context';

/**
 * Shell for the sign-in, registration, and password-recovery screens: brand
 * header, a "back home" link, and the frosted glass card.
 *
 * Locked to light mode, as in the source — these screens use a light gradient
 * backdrop that the dark palette would fight.
 */
export function AuthLayout({ eyebrow, title, subtitle, sideNote, children }) {
  useForceLightMode();

  return (
    <div
      className="flex min-h-dvh justify-center px-4 pt-3 pb-6 sm:px-6 md:px-8 md:pt-5"
      style={{
        backgroundImage: [
          'radial-gradient(circle at top left, rgb(20 91 214 / 0.16), transparent 26%)',
          'radial-gradient(circle at bottom right, rgb(13 148 136 / 0.12), transparent 24%)',
          'linear-gradient(180deg, #f8fbff 0%, #edf3fb 100%)',
        ].join(','),
      }}
    >
      <div className="w-full max-w-xl">
        <header className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-800 to-brand-500 text-base font-extrabold text-white shadow-cta"
            >
              AP
            </span>
            <div className="min-w-0">
              <p className="text-base font-extrabold text-ink">AutoPayroll</p>
              <p className="truncate text-xs text-muted">Business operations suite</p>
            </div>
          </div>

          <Link
            to={ROUTES.landing}
            className="inline-flex min-h-tap shrink-0 items-center gap-1.5 rounded-full border border-brand-800/10 bg-white/80 px-3.5 py-2 text-sm font-bold text-brand-800 backdrop-blur-lg transition-colors hover:bg-white"
          >
            <Home aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Back home</span>
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </header>

        <div className="surface-glass relative overflow-hidden p-5 sm:p-7 md:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: [
                'radial-gradient(circle at top right, rgb(21 94 239 / 0.08), transparent 24%)',
                'radial-gradient(circle at bottom left, rgb(13 148 136 / 0.08), transparent 24%)',
              ].join(','),
            }}
          />

          <div className="relative">
            {eyebrow && (
              <p className="text-xs font-extrabold tracking-[0.16em] text-brand-500 uppercase">
                {eyebrow}
              </p>
            )}

            <h1 className="mt-1 text-2xl leading-tight font-extrabold tracking-tight text-ink sm:text-3xl">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-2 text-base leading-relaxed text-slate-600">{subtitle}</p>
            )}

            {sideNote && (
              <div className="mt-5 rounded-panel border border-brand-500/10 bg-brand-50/50 p-4">
                <p className="text-sm font-bold text-brand-800">Why this matters</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{sideNote}</p>
              </div>
            )}

            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
