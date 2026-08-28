import { ArrowRight, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, IconButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';
import { NAV_LINKS } from '../landing-content';

/**
 * Sticky marketing header with an off-canvas menu below `md`.
 *
 * Like the dashboard drawer, the panel's visibility is derived from viewport
 * width as well as the open flag, so it can never linger as a stale overlay
 * after a resize.
 */
export function LandingNav() {
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const visible = open && !isDesktop;

  useEffect(() => {
    if (!visible) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-950/8 bg-[#f5f8fe]/75 backdrop-blur-xl">
        <nav
          aria-label="Main"
          className="mx-auto flex min-h-16 w-full max-w-content items-center gap-3 px-4 sm:px-6"
        >
          <Link to={ROUTES.landing} className="flex min-w-0 flex-1 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-950 to-brand-500 text-base font-extrabold text-white shadow-cta"
            >
              AP
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-extrabold text-ink">AutoPayroll</span>
              <span className="hidden truncate text-xs text-muted sm:block">
                Workforce operations for ambitious businesses
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-tap items-center rounded-btn px-3 text-sm font-bold text-slate-600 transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <Link
            to={ROUTES.login}
            className="inline-flex min-h-tap shrink-0 items-center px-2 text-sm font-bold text-brand-800 sm:px-3"
          >
            Sign in
          </Link>

          <Button
            as={Link}
            to={ROUTES.register}
            className="hidden rounded-full sm:inline-flex"
            endIcon={<ArrowRight aria-hidden="true" className="size-4" />}
          >
            Start free
          </Button>

          <IconButton
            label="Open menu"
            className="text-brand-800 md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden="true" />
          </IconButton>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={cn('fixed inset-0 z-50 md:hidden', visible ? '' : 'pointer-events-none')}
        aria-hidden={!visible}
        // `pointer-events-none` stops the mouse but not the keyboard: without
        // `inert`, the closed drawer's links stay in the tab order and a
        // keyboard user tabs through six invisible controls.
        inert={!visible}
      >
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-ink/50 transition-opacity duration-300',
            visible ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          className={cn(
            'absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-brand-950 p-4 transition-transform duration-300',
            visible ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-lg font-extrabold text-white">AutoPayroll</p>
            <IconButton
              label="Close menu"
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <X aria-hidden="true" />
            </IconButton>
          </div>

          <hr className="mb-2 border-white/10" />

          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-tap items-center rounded-btn px-3 font-bold text-slate-200 transition-colors hover:bg-white/10"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              as={Link}
              to={ROUTES.login}
              variant="ghost"
              fullWidth
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              Sign in
            </Button>
            <Button
              as={Link}
              to={ROUTES.register}
              fullWidth
              onClick={() => setOpen(false)}
              className="rounded-full"
              endIcon={<ArrowRight aria-hidden="true" className="size-4" />}
            >
              Start free
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
