import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

/**
 * A small popover menu anchored to a trigger.
 *
 * Escape and outside clicks close it, and focus returns to the trigger — the
 * behaviour MUI's `Menu` provided for the avatar and row-action menus.
 */
export function Dropdown({ trigger, children, align = 'right', className }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {trigger({
        ref: triggerRef,
        onClick: () => setOpen((previous) => !previous),
        'aria-expanded': open,
        'aria-haspopup': 'menu',
      })}

      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className={cn(
            'absolute z-40 mt-2 min-w-48 overflow-hidden rounded-card border border-line bg-surface py-1 shadow-menu',
            'dark:border-line-dark dark:bg-surface-dark',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** A row inside a `Dropdown`. Renders as a button or, with `as`, a link. */
export function DropdownItem({
  as: Component = 'button',
  icon,
  danger = false,
  className,
  children,
  ...props
}) {
  return (
    <Component
      role="menuitem"
      type={Component === 'button' ? 'button' : undefined}
      className={cn(
        'flex min-h-tap w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-semibold transition-colors',
        danger
          ? 'text-danger hover:bg-danger-soft dark:hover:bg-danger/15'
          : 'text-ink hover:bg-ink/5 dark:text-ink-dark dark:hover:bg-white/8',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Component>
  );
}

export function DropdownDivider() {
  return <hr className="my-1 border-line dark:border-line-dark" />;
}
