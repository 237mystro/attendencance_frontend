import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes';

/** Closing call to action. */
export function LandingCta() {
  return (
    <section className="bg-linear-to-br from-[#071426] via-brand-900 to-brand-500 py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="inline-flex rounded-full border border-white/12 bg-white/12 px-4 py-1.5 text-sm font-bold text-white">
          Ready to elevate operations?
        </p>

        <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
          Bring your payroll and workforce experience up to modern business standards.
        </h2>

        <p className="mt-4 leading-relaxed text-slate-300 md:text-lg">
          Create your workspace today and give your team a more polished, dependable
          system for attendance, payroll, and daily operations.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            as={Link}
            to={ROUTES.register}
            size="lg"
            variant="secondary"
            className="rounded-full border-0 px-7 text-brand-900"
            endIcon={<ArrowRight aria-hidden="true" className="size-5" />}
          >
            Create business account
          </Button>
          <Button
            as={Link}
            to={ROUTES.login}
            variant="ghost"
            size="lg"
            className="rounded-full border border-white/20 bg-white/8 px-7 text-white hover:bg-white/15 hover:text-white"
          >
            Sign in
          </Button>
        </div>
      </div>
    </section>
  );
}

/** Site footer. */
export function LandingFooter() {
  return (
    <footer className="bg-[#06101f] py-8">
      <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-900 to-brand-500 text-sm font-extrabold text-white"
          >
            AP
          </span>
          <div>
            <p className="font-extrabold text-white">AutoPayroll</p>
            <p className="text-xs text-slate-400">Built for serious business operations</p>
          </div>
        </div>

        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} AutoPayroll. Payroll and workforce operations,
          reimagined for modern teams.
        </p>
      </div>
    </footer>
  );
}
