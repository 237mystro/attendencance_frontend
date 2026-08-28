import { cn } from '@/lib/cn';
import { scorePassword } from '../password-strength';

const TONES = {
  weak: { bar: 'bg-red-500', text: 'text-red-500' },
  fair: { bar: 'bg-orange-500', text: 'text-orange-500' },
  good: { bar: 'bg-yellow-500', text: 'text-yellow-600' },
  strong: { bar: 'bg-success', text: 'text-success' },
};

/**
 * Strength meter shown under the password field. Announced politely rather
 * than assertively so it does not interrupt typing.
 */
export function PasswordStrength({ password }) {
  const { percent, label, tone } = scorePassword(password);
  if (!tone) return null;

  const colors = TONES[tone];

  return (
    <div className="mt-2 flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8">
        <div
          className={cn('h-full rounded-full transition-all duration-300', colors.bar)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p aria-live="polite" className={cn('w-12 shrink-0 text-xs font-bold', colors.text)}>
        {label}
      </p>
    </div>
  );
}
