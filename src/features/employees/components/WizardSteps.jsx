import { Check } from 'lucide-react';

import { cn } from '@/lib/cn';

/**
 * Horizontal step tracker for the onboarding wizard.
 *
 * An ordered list with `aria-current` on the active step, so the sequence and
 * the user's position are conveyed without relying on colour alone.
 */
export function WizardSteps({ steps, activeIndex }) {
  return (
    <ol className="flex items-start gap-2">
      {steps.map((step, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;

        return (
          <li
            key={step.id}
            aria-current={active ? 'step' : undefined}
            className="flex flex-1 flex-col items-center gap-1.5 text-center"
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-colors',
                done && 'bg-success text-white',
                active && 'bg-brand-500 text-white',
                !done && !active && 'bg-ink/8 text-muted dark:bg-white/10 dark:text-muted-soft',
              )}
            >
              {done ? (
                <>
                  <Check aria-hidden="true" className="size-4" />
                  <span className="sr-only">Completed</span>
                </>
              ) : (
                index + 1
              )}
            </span>

            <span
              className={cn(
                'text-xs leading-snug font-bold',
                active
                  ? 'text-ink dark:text-ink-dark'
                  : 'text-muted dark:text-muted-soft',
              )}
            >
              {step.title}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
