import { cn } from '@/lib/cn';

/**
 * Numbered progress tiles for a short wizard.
 *
 * Rendered as an ordered list with `aria-current` on the active step, so the
 * sequence and the user's position in it are conveyed without relying on the
 * colour change alone.
 */
export function StepIndicator({ steps, activeIndex }) {
  return (
    <ol className="grid grid-cols-2 gap-2">
      {steps.map((step, index) => {
        const reached = activeIndex >= index;

        return (
          <li
            key={step.key}
            aria-current={activeIndex === index ? 'step' : undefined}
            className={cn(
              'rounded-panel border p-3 transition-colors',
              reached
                ? 'border-brand-500/20 bg-brand-50/60'
                : 'border-ink/8 bg-white',
            )}
          >
            <p
              className={cn(
                'text-xs font-extrabold',
                reached ? 'text-brand-500' : 'text-muted-soft',
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </p>
            <p className="mt-0.5 text-sm font-bold text-ink">{step.title}</p>
          </li>
        );
      })}
    </ol>
  );
}
