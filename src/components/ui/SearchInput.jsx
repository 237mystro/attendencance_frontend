import { Search, X } from 'lucide-react';
import { useId } from 'react';

import { cn } from '@/lib/cn';

/** Search box with a leading icon and a clear button that appears when filled. */
export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search…',
  label = 'Search',
  className,
  ...props
}) {
  const id = useId();

  return (
    <div className={cn('relative w-full', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-soft"
      />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="field-base py-2.5 pr-10 pl-10"
        {...props}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => (onClear ? onClear() : onChange(''))}
          className="absolute inset-y-0 right-2 my-auto flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/8 dark:hover:bg-white/10"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
}
