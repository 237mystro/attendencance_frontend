import { Banknote, CircleCheckBig, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useCountUp } from '../hooks/useCountUp';
import { WEEKLY_BARS } from '../landing-content';

const BAR_REVEAL_DELAY_MS = 1300;

/** The dark product mock-up under the hero, with its counters and bars. */
export function OperationsSnapshot() {
  const reducedMotion = usePrefersReducedMotion();
  const [barsVisible, setBarsVisible] = useState(reducedMotion);

  const employees = useCountUp(248, { delay: 900 });
  const present = useCountUp(231, { delay: 1050 });
  const pending = useCountUp(12, { duration: 1000, delay: 800 });

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = setTimeout(() => setBarsVisible(true), BAR_REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  const tiles = [
    { label: 'Employees', value: employees, accent: 'text-blue-300' },
    { label: 'Present today', value: present, accent: 'text-emerald-300' },
    { label: 'Pending actions', value: pending, accent: 'text-amber-200' },
  ];

  return (
    <div className="relative mx-auto mt-12 w-full max-w-3xl md:mt-16">
      <div className="relative overflow-hidden rounded-hero bg-[#071228]/97 p-4 shadow-[0_60px_120px_rgb(8_23_47/0.28)] ring-1 ring-white/5 sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              'radial-gradient(circle at 85% 0%, rgb(59 130 246 / 0.26), transparent 42%)',
              'radial-gradient(circle at 15% 100%, rgb(20 184 166 / 0.18), transparent 40%)',
            ].join(','),
          }}
        />

        <div className="relative">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-extrabold text-slate-200">Operations snapshot</p>
              <p className="text-sm text-slate-400">
                {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-green-400/20 bg-green-400/10 px-2.5 py-1 text-xs font-bold text-green-400">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-green-400 motion-safe:animate-pulse"
              />
              Payroll ready
            </span>
          </div>

          <ul className="grid grid-cols-3 gap-2 sm:gap-3">
            {tiles.map((tile) => (
              <li
                key={tile.label}
                className="rounded-panel border border-white/8 bg-white/6 p-3 sm:p-4"
              >
                <p className={`text-xl font-extrabold sm:text-2xl ${tile.accent}`}>
                  {tile.value}
                </p>
                <p className="text-xs leading-snug text-slate-400">{tile.label}</p>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-panel border border-white/7 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-white">Weekly attendance consistency</p>
              <p className="font-extrabold text-blue-300">94%</p>
            </div>

            {WEEKLY_BARS.map(([day, percent], index) => (
              <div key={day} className="mb-2 last:mb-0">
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>{day}</span>
                  <span>{percent}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-sky-400 to-brand-500 transition-[width] duration-1000 ease-out"
                    style={{
                      width: barsVisible ? `${percent}%` : '0%',
                      transitionDelay: `${index * 80}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-panel border border-white/7 bg-white/5 p-4">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-200/12 text-amber-200"
            >
              <Banknote className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white">Monthly payroll prepared</p>
              <p className="truncate text-xs text-slate-400">
                248 staff records validated and ready for payout review.
              </p>
            </div>
            <p className="shrink-0 font-extrabold text-white sm:text-lg">XAF 18.4M</p>
          </div>
        </div>
      </div>

      {/* Floating callouts — hidden on phones, where they would overlap. */}
      <div className="absolute -top-6 right-2 hidden w-48 rounded-panel bg-white/95 p-4 shadow-[0_24px_48px_rgb(8_23_47/0.16)] sm:block md:-right-6 md:w-52">
        <p className="flex items-center gap-2 text-sm font-extrabold text-ink">
          <CircleCheckBig aria-hidden="true" className="size-4 text-success" />
          Approval queue
        </p>
        <p className="mt-1 text-2xl font-extrabold text-brand-950">12</p>
        <p className="text-xs leading-snug text-muted">
          Late requests, leave items, and payroll actions requiring review.
        </p>
      </div>

      <div className="absolute bottom-8 left-2 hidden w-52 rounded-panel bg-white p-4 shadow-[0_24px_48px_rgb(8_23_47/0.14)] sm:block md:-left-6 md:w-60">
        <p className="mb-2 flex items-center gap-2 text-sm font-extrabold text-ink">
          <Clock aria-hidden="true" className="size-4 text-brand-500" />
          Payroll momentum
        </p>
        {[
          ['Attendance sync', 'Complete', 'text-ink'],
          ['Salary validation', 'In review', 'text-ink'],
          ['Payout readiness', '96%', 'text-success'],
        ].map(([label, value, tone]) => (
          <p key={label} className="flex justify-between text-xs">
            <span className="text-muted">{label}</span>
            <span className={`font-bold ${tone}`}>{value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
