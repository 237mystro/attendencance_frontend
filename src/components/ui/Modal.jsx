import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';
import { IconButton } from './Button';

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  full: 'sm:max-w-6xl',
};

/**
 * Accessible dialog.
 *
 * Escape closes it, focus is trapped inside while open and restored on close,
 * and background scrolling is locked. On phones it fills the viewport and
 * scrolls its own body rather than pushing the page, which is what keeps the
 * long forms in payroll and scheduling usable at 320px.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
  closeOnBackdrop = true,
  className,
}) {
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    restoreFocusRef.current = document.activeElement;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    const focusable = () =>
      panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ) ?? [];

    // Move focus into the dialog so the next Tab stays inside it.
    const first = focusable()[0];
    (first || panelRef.current)?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = Array.from(focusable());
      if (!items.length) {
        event.preventDefault();
        return;
      }

      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        role="presentation"
        onClick={closeOnBackdrop ? onClose : undefined}
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col rounded-t-panel bg-surface shadow-glass',
          'sm:max-h-[88dvh] sm:rounded-panel',
          'dark:bg-surface-dark',
          SIZES[size],
          className,
        )}
      >
        {(title || onClose) && (
          <header className="flex items-start gap-3 border-b border-line px-5 py-4 dark:border-line-dark">
            <div className="min-w-0 flex-1">
              {title && (
                <h2
                  id={titleId}
                  className="text-lg font-extrabold tracking-tight text-ink dark:text-ink-dark"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="mt-1 text-sm leading-relaxed text-muted dark:text-muted-soft"
                >
                  {description}
                </p>
              )}
            </div>
            {onClose && (
              <IconButton label="Close dialog" size="sm" onClick={onClose}>
                <X aria-hidden="true" className="size-5" />
              </IconButton>
            )}
          </header>
        )}

        {/* The body scrolls, not the page — required for small viewports. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>

        {footer && (
          <footer className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end dark:border-line-dark">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
