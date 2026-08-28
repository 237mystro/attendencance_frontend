import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

import { useToastQueue } from '@/context/toast-context';
import { cn } from '@/lib/cn';

const TONES = {
  success: {
    icon: CheckCircle2,
    className: 'border-success/30 bg-success-soft text-success dark:bg-success/20 dark:text-green-200',
  },
  danger: {
    icon: XCircle,
    className: 'border-danger/30 bg-danger-soft text-danger dark:bg-danger/20 dark:text-red-200',
  },
  warn: {
    icon: AlertTriangle,
    className: 'border-warn/30 bg-warn-soft text-amber-700 dark:bg-warn/20 dark:text-amber-200',
  },
  info: {
    icon: Info,
    className: 'border-info/30 bg-info-soft text-info dark:bg-info/20 dark:text-sky-200',
  },
};

/**
 * Renders the toast queue. Mount once, near the root.
 *
 * Positioned bottom-centre on phones and bottom-right from `sm` up, above the
 * safe-area inset so it clears iOS home indicators.
 */
export function Toaster() {
  const { toasts, dismiss } = useToastQueue();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-0 sm:items-end"
    >
      {toasts.map((toast) => {
        const tone = TONES[toast.tone] || TONES.info;
        const Icon = tone.icon;

        return (
          <div
            key={toast.id}
            role={toast.tone === 'danger' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border px-4 py-3 shadow-panel-hover backdrop-blur-sm',
              tone.className,
            )}
          >
            <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <p className="min-w-0 flex-1 text-sm leading-relaxed font-semibold break-words">
              {toast.message}
            </p>
            {toast.action}
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
              className="-m-1 shrink-0 rounded p-1 transition-opacity hover:opacity-70"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
