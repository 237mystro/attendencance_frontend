import { ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/cn';
import {
  BENEFITS,
  FEATURES,
  ROLLOUT_STEPS,
  SECURITY_ITEMS,
  STATS,
  VALUE_TILES,
} from '../landing-content';
import { SectionHeading } from './SectionHeading';

/** Headline metrics, split into a column per stat from `lg` up. */
export function StatsBar() {
  return (
    <section className="border-y border-brand-950/6 bg-white py-8 md:py-10">
      <ul className="mx-auto grid w-full max-w-content gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-0">
        {STATS.map((stat, index) => (
          <li
            key={stat.label}
            className={cn(
              'sm:text-center lg:px-6',
              index < STATS.length - 1 && 'lg:border-r lg:border-brand-950/8',
            )}
          >
            <p className="text-3xl font-extrabold text-brand-950 md:text-4xl">
              {stat.value}
            </p>
            <p className="mx-auto mt-1 max-w-60 text-sm leading-relaxed text-muted">
              {stat.label}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto w-full max-w-content px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading
        eyebrow="Why AutoPayroll"
        title="Built to make business operations feel calmer, faster, and more credible."
        description="Every major workflow from attendance to payroll approval is designed to reduce manual effort while raising the quality of your operational experience."
      />

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <li
            key={feature.title}
            className={cn(
              'rounded-hero border border-brand-950/8 bg-white p-6 shadow-panel transition-all duration-300 hover:-translate-y-1.5 hover:shadow-panel-hover',
              feature.hover,
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex size-14 items-center justify-center rounded-panel',
                feature.accent,
              )}
            >
              <feature.icon className="size-7" />
            </span>
            <h3 className="mt-5 text-xl font-extrabold text-brand-950">{feature.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BusinessValue() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <SectionHeading
          eyebrow="Business value"
          title="A single operating rhythm for payroll, attendance, and team coordination."
          description="When time tracking, deductions, approvals, communication, and pay runs live together, your business gains speed without sacrificing discipline."
        />

        <ul className="mx-auto mb-12 flex max-w-xl flex-col gap-3">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex gap-3">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-500" />
              <span className="leading-relaxed text-slate-600">{benefit}</span>
            </li>
          ))}
        </ul>

        <ul className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
          {VALUE_TILES.map((tile) => (
            <li
              key={tile.label}
              className="flex items-center gap-4 rounded-hero border border-brand-950/8 bg-brand-50/40 p-5 shadow-panel transition-transform duration-300 hover:-translate-y-1"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-12 shrink-0 items-center justify-center rounded-panel bg-slate-100',
                  tile.accent,
                )}
              >
                <tile.icon className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted">{tile.label}</p>
                <p className="text-lg font-extrabold text-brand-950">{tile.value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SecurityAndRollout() {
  return (
    <section id="security" className="bg-white py-16 md:py-24">
      <div className="mx-auto grid w-full max-w-content gap-10 px-4 sm:px-6 lg:grid-cols-[5fr_7fr] lg:gap-14">
        <div>
          <p className="inline-flex rounded-lg bg-orange-50 px-3 py-1 text-xs font-extrabold text-amber-700">
            Security + rollout
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-brand-950 md:text-5xl">
            Professional enough for business leadership, simple enough for teams to
            adopt quickly.
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            AutoPayroll is shaped to support real operational discipline while still
            feeling approachable during onboarding and daily use.
          </p>

          <ul className="mt-7 flex flex-col gap-3">
            {SECURITY_ITEMS.map((item) => (
              <li key={item} className="flex gap-3">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-500" />
                <span className="leading-relaxed text-slate-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <ol className="grid gap-5 md:grid-cols-3">
          {ROLLOUT_STEPS.map((step) => (
            <li
              key={step.label}
              className="rounded-hero border border-brand-950/8 bg-white p-5 shadow-panel"
            >
              <span
                aria-hidden="true"
                className="flex size-13 items-center justify-center rounded-full bg-linear-to-br from-brand-900 to-brand-500 font-extrabold text-white"
              >
                {step.label}
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-brand-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
