import { useId } from 'react';

import { cn } from '@/lib/cn';
import { CountBadge } from './Badge';

/**
 * Tab bar following the ARIA tabs pattern: arrow keys move between tabs, and
 * each panel is wired to its tab. The list scrolls horizontally on narrow
 * screens rather than wrapping or overflowing the page.
 *
 * @param {{id: string, label: string, count?: number}[]} tabs
 */
export function Tabs({ tabs, value, onChange, className, idPrefix }) {
  const generatedId = useId();
  const prefix = idPrefix || generatedId;

  const handleKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.id === value);
    if (index === -1) return;

    const moves = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };

    const next = moves[event.key];
    if (next === undefined) return;

    event.preventDefault();
    onChange(tabs[next].id);
    document.getElementById(`${prefix}-tab-${tabs[next].id}`)?.focus();
  };

  return (
    <div
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        // `w-full min-w-0` pins the strip to its container's width. Without
        // it a flex parent sizes the strip to its min-content width, pushing
        // the tabs past a narrow viewport instead of letting them scroll.
        'table-scroll flex w-full min-w-0 gap-1 border-b border-line dark:border-line-dark',
        className,
      )}
    >
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            id={`${prefix}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${prefix}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex min-h-tap shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-bold whitespace-nowrap transition-colors sm:px-4',
              selected
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-muted hover:text-ink dark:text-muted-soft dark:hover:text-ink-dark',
            )}
          >
            {tab.label}
            {tab.count > 0 && <CountBadge count={tab.count} tone="brand" />}
          </button>
        );
      })}
    </div>
  );
}

/** The panel matching a tab. Renders nothing unless its tab is selected. */
export function TabPanel({ id, value, idPrefix, children, className }) {
  if (id !== value) return null;

  return (
    <div
      id={idPrefix ? `${idPrefix}-panel-${id}` : undefined}
      role="tabpanel"
      aria-labelledby={idPrefix ? `${idPrefix}-tab-${id}` : undefined}
      tabIndex={0}
      className={cn('pt-5 focus-visible:outline-none', className)}
    >
      {children}
    </div>
  );
}
