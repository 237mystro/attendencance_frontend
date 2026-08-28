import { avatarColor } from '@/lib/avatar-color';
import { cn } from '@/lib/cn';
import { getInitials } from '@/lib/formatters';

const SIZES = {
  xs: 'size-7 text-[11px]',
  sm: 'size-9 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
  xl: 'size-24 text-3xl',
};

/** Profile picture with a coloured initials fallback. */
export function Avatar({ src, name, size = 'md', className }) {
  const label = name || 'User';

  return src ? (
    <img
      src={src}
      alt={label}
      className={cn('shrink-0 rounded-full object-cover', SIZES[size], className)}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white',
        avatarColor(label),
        SIZES[size],
        className,
      )}
    >
      {getInitials(label)}
    </span>
  );
}
