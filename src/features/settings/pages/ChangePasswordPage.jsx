import { KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Alert, PageWrapper } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { PasswordSection } from '../components/PasswordSection';

/**
 * A dedicated change-password screen.
 *
 * Kept as its own route because employees are sent straight here after signing
 * in with a temporary password; the full settings screen would bury the one
 * thing they need to do.
 */
export function ChangePasswordPage() {
  return (
    <PageWrapper className="max-w-2xl">
      <header className="mb-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-panel bg-brand-50 text-brand-500 dark:bg-brand-500/15"
        >
          <KeyRound className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
            Change your password
          </h2>
          <p className="text-sm text-muted dark:text-muted-soft">
            Pick something only you know, especially if you were given a temporary
            one.
          </p>
        </div>
      </header>

      <PasswordSection standalone />

      <Alert tone="info" className="mt-5">
        Notification and appearance preferences are on the{' '}
        <Link to={ROUTES.employee.settings} className="font-bold underline">
          Settings
        </Link>{' '}
        screen.
      </Alert>
    </PageWrapper>
  );
}
