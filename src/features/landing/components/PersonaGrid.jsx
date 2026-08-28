import { CircleCheckBig } from 'lucide-react';

import { cn } from '@/lib/cn';
import { PERSONAS } from '../landing-content';
import { SectionHeading } from './SectionHeading';

/** The three audiences the platform serves, middle card inverted. */
export function PersonaGrid() {
  return (
    <section id="personas" className="mx-auto w-full max-w-content px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading
        eyebrow="Who it serves"
        title="A refined experience for every actor in the payroll cycle."
        description="The platform keeps leadership, operators, and employees aligned while still giving each role the right level of control."
      />

      <ul className="grid gap-5 lg:grid-cols-3">
        {PERSONAS.map((persona) => (
          <li
            key={persona.title}
            className={cn(
              'rounded-hero border p-6 shadow-panel',
              persona.featured
                ? 'border-brand-950/10 bg-brand-950 text-white'
                : 'border-brand-950/8 bg-white text-brand-950',
            )}
          >
            <p
              className={cn(
                'text-xs font-extrabold',
                persona.featured ? 'text-sky-300' : 'text-brand-500',
              )}
            >
              {persona.eyebrow}
            </p>

            <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
              {persona.title}
            </h3>

            <p
              className={cn(
                'mt-3 leading-relaxed',
                persona.featured ? 'text-slate-300' : 'text-muted',
              )}
            >
              {persona.description}
            </p>

            <hr
              className={cn(
                'my-5',
                persona.featured ? 'border-white/10' : 'border-brand-950/8',
              )}
            />

            <ul className="flex flex-col gap-3">
              {persona.bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2.5">
                  <CircleCheckBig
                    aria-hidden="true"
                    className={cn(
                      'size-4 shrink-0',
                      persona.featured ? 'text-cyan-300' : 'text-brand-500',
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      persona.featured ? 'text-slate-200' : 'text-slate-700',
                    )}
                  >
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
