import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/cn';
import { IconButton } from './Button';

/**
 * Page control for client-side paginated lists.
 *
 * On phones it shows only the arrows plus a "Page 2 of 9" label; from `sm` up
 * it adds numbered buttons with an ellipsis for long ranges.
 */
export function Pagination({ page, pageCount, onChange, className, totalLabel }) {
  if (pageCount <= 1) return null;

  const pages = buildPageList(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row',
        className,
      )}
    >
      {totalLabel && (
        <p className="text-xs text-muted dark:text-muted-soft">{totalLabel}</p>
      )}

      <div className="flex items-center gap-1">
        <IconButton
          label="Previous page"
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </IconButton>

        <span className="px-2 text-xs font-semibold text-muted sm:hidden dark:text-muted-soft">
          Page {page} of {pageCount}
        </span>

        <ul className="hidden items-center gap-1 sm:flex">
          {pages.map((entry, index) =>
            entry === '…' ? (
              <li
                key={`gap-${index}`}
                aria-hidden="true"
                className="px-1 text-xs text-muted"
              >
                …
              </li>
            ) : (
              <li key={entry}>
                <button
                  type="button"
                  aria-current={entry === page ? 'page' : undefined}
                  onClick={() => onChange(entry)}
                  className={cn(
                    'min-h-9 min-w-9 rounded-btn px-2 text-sm font-bold transition-colors',
                    entry === page
                      ? 'bg-brand-500 text-white'
                      : 'text-muted hover:bg-ink/6 dark:text-muted-soft dark:hover:bg-white/10',
                  )}
                >
                  {entry}
                </button>
              </li>
            ),
          )}
        </ul>

        <IconButton
          label="Next page"
          size="sm"
          variant="secondary"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </IconButton>
      </div>
    </nav>
  );
}

/** Produces e.g. `[1, '…', 4, 5, 6, '…', 20]` for the numbered buttons. */
function buildPageList(page, pageCount) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...pages].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b);

  return sorted.flatMap((value, index) => {
    const previous = sorted[index - 1];
    return previous && value - previous > 1 ? ['…', value] : [value];
  });
}
