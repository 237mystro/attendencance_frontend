import { cn } from '@/lib/cn';
import { EmptyState, ErrorState, LoadingState } from './States';

/**
 * One table component for the whole app, driven by a column config.
 *
 * Below `md` each row renders as a stacked card of label/value pairs; from `md`
 * up it is a real `<table>`. That is what satisfies the "tables become stacked
 * cards on mobile" requirement without every screen hand-rolling two layouts.
 *
 * Column shape:
 *   key         unique id, also used to read `row[key]` when no `render`
 *   header      column heading
 *   render      (row, index) => node
 *   align       'left' | 'right' | 'center'
 *   className   extra classes for the cell
 *   primary     true → shown as the card title on mobile, not a label/value row
 *   hideOnMobile true → omitted from the mobile card entirely
 */
export function DataTable({
  columns,
  rows = [],
  getRowKey = (row, index) => row?._id ?? row?.id ?? index,
  loading = false,
  error = null,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  emptyIcon,
  onRowClick,
  caption,
  className,
}) {
  if (loading) return <LoadingState label="Loading records…" />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!rows.length) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  const alignment = {
    right: 'text-right',
    center: 'text-center',
    left: 'text-left',
  };

  return (
    <>
      {/* Mobile: stacked cards. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row, index) => {
          const primary = columns.find((column) => column.primary);
          const rest = columns.filter(
            (column) => !column.primary && !column.hideOnMobile,
          );

          return (
            <li
              key={getRowKey(row, index)}
              className={cn(
                'rounded-card border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark',
                onRowClick && 'cursor-pointer transition-colors hover:border-brand-500/40',
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {primary && (
                <div className="mb-3 text-sm font-bold text-ink dark:text-ink-dark">
                  {primary.render ? primary.render(row, index) : row[primary.key]}
                </div>
              )}
              <dl className="flex flex-col gap-2">
                {rest.map((column) => (
                  <div
                    key={column.key}
                    className="flex items-start justify-between gap-3"
                  >
                    <dt className="text-xs font-semibold text-muted dark:text-muted-soft">
                      {column.header}
                    </dt>
                    <dd className="min-w-0 text-right text-sm text-ink dark:text-ink-dark">
                      {column.render ? column.render(row, index) : row[column.key]}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>

      {/* Desktop: a real table, scrolling inside its own container. */}
      <div className={cn('table-scroll hidden md:block', className)}>
        <table className="w-full border-collapse text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-line dark:border-line-dark">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'bg-ink/3 px-3 py-3 text-xs font-bold whitespace-nowrap text-muted dark:bg-white/4 dark:text-muted-soft',
                    alignment[column.align] || alignment.left,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-line transition-colors last:border-0 dark:border-line-dark',
                  'hover:bg-ink/2 dark:hover:bg-white/4',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-3 py-3 text-ink dark:text-ink-dark',
                      alignment[column.align] || alignment.left,
                      column.className,
                    )}
                  >
                    {column.render ? column.render(row, index) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
