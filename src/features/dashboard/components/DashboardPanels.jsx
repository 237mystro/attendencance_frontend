import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge, Panel } from '@/components/ui';
import { cn } from '@/lib/cn';

const TONE_STYLES = {
  warn: 'border-warn/25 bg-warn-soft/60 dark:bg-warn/10',
  info: 'border-info/25 bg-info-soft/60 dark:bg-info/10',
  success: 'border-success/25 bg-success-soft/60 dark:bg-success/10',
};

/**
 * Things that need attention, each with a route into the screen that resolves
 * it — an alert you cannot act on is just noise.
 */
export function AlertList({ alerts }) {
  return (
    <Panel
      title="Operational alerts"
      subtitle="What needs attention, and where to deal with it."
      interactive={false}
    >
      <ul className="flex flex-col gap-2">
        {alerts.map((alert) => (
          <li
            key={alert.message}
            className={cn(
              'flex flex-col gap-2 rounded-panel border p-3 sm:flex-row sm:items-center sm:justify-between',
              TONE_STYLES[alert.tone] || TONE_STYLES.info,
            )}
          >
            <p className="text-sm leading-relaxed text-ink dark:text-ink-dark">
              {alert.message}
            </p>

            <Link
              to={alert.to}
              className="inline-flex min-h-tap shrink-0 items-center gap-1.5 text-sm font-bold text-brand-500 hover:underline"
            >
              {alert.actionLabel}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** One counted item in the decision queue. */
function QueueRow({ label, value, detail, to, accent }) {
  return (
    <li>
      <Link
        to={to}
        className={cn(
          'flex min-h-tap items-center justify-between gap-3 rounded-panel border p-3 transition-colors hover:border-brand-500/40',
          accent,
        )}
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink dark:text-ink-dark">
            {label}
          </span>
          {detail && (
            <span className="block text-xs text-muted dark:text-muted-soft">{detail}</span>
          )}
        </span>
        <span className="shrink-0 text-xl font-extrabold text-ink dark:text-ink-dark">
          {value}
        </span>
      </Link>
    </li>
  );
}

/** Approvals and watch-items, each linking to where the work happens. */
export function DecisionQueue({ items }) {
  return (
    <Panel
      title="Decision queue"
      subtitle="The approvals that matter most right now."
      interactive={false}
    >
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <QueueRow key={item.label} {...item} />
        ))}
      </ul>
    </Panel>
  );
}

/** The day's reflection, carried over from the original dashboards. */
export function DailyFocusCard({ quote }) {
  return (
    <div className="rounded-card border border-white/15 bg-white/8 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Sparkles aria-hidden="true" className="size-4 shrink-0 text-blue-200" />
        <p className="text-sm font-bold text-white">Daily focus</p>
        <Badge className="ml-auto border border-white/12 bg-white/10 text-blue-100">
          {quote.focus}
        </Badge>
      </div>

      <blockquote className="mt-3 leading-relaxed font-bold text-white">
        “{quote.text}”
      </blockquote>
    </div>
  );
}
