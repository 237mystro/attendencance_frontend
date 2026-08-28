import { ArrowRight, CircleCheckBig } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { TRUST_POINTS } from '../landing-content';
import { OperationsSnapshot } from './OperationsSnapshot';

/** The opening screen: headline, calls to action, and the product mock-up. */
export function LandingHero() {
  return (
    <section
      className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-24"
      style={{
        backgroundImage: [
          'radial-gradient(ellipse 80% 55% at 50% -5%, rgb(21 94 239 / 0.18), transparent)',
          'radial-gradient(circle at 12% 70%, rgb(15 118 110 / 0.12), transparent 40%)',
          'radial-gradient(circle at 88% 70%, rgb(124 58 237 / 0.10), transparent 40%)',
          'linear-gradient(180deg, #f7faff 0%, #edf2fd 100%)',
        ].join(','),
      }}
    >
      {/* Faint grid, faded out towards the edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'linear-gradient(rgb(8 23 47 / 0.035) 1px, transparent 1px)',
            'linear-gradient(90deg, rgb(8 23 47 / 0.035) 1px, transparent 1px)',
          ].join(','),
          backgroundSize: '52px 52px',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 50%, rgb(0 0 0 / 0.9) 0%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-content px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-brand-500/15 bg-brand-500/8 px-4 py-1.5 text-xs font-extrabold text-brand-500 sm:text-sm">
            The payroll operating system for modern African businesses
          </p>

          <h1 className="mt-6 text-4xl leading-[0.98] font-extrabold tracking-[-0.045em] text-brand-950 sm:text-5xl md:text-7xl">
            Make payroll feel as{' '}
            <span className="bg-linear-to-br from-brand-500 via-cyan-600 to-accent-500 bg-clip-text text-transparent">
              premium
            </span>{' '}
            as the business you are building.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            AutoPayroll unifies attendance, scheduling, deductions, employee
            coordination, and mobile-ready payroll workflows into one polished
            business workspace.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              as={Link}
              to={ROUTES.register}
              size="lg"
              className="rounded-full px-7 transition-transform hover:-translate-y-0.5"
              endIcon={<ArrowRight aria-hidden="true" className="size-5" />}
            >
              Build your workspace
            </Button>
            <Button
              as={Link}
              to={ROUTES.login}
              variant="secondary"
              size="lg"
              className="rounded-full px-7 shadow-panel transition-transform hover:-translate-y-0.5"
            >
              Access existing account
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <CircleCheckBig aria-hidden="true" className="size-4 shrink-0 text-success" />
                <span className="text-sm font-semibold text-slate-600">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <OperationsSnapshot />
      </div>
    </section>
  );
}
