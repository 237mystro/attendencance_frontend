import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui';
import { ROUTES, dashboardFor } from '@/constants/routes';
import { useAuth } from '@/context/auth-context';

/**
 * 404 page. The original app had no catch-all route, so an unknown URL
 * rendered a blank white screen with no way back.
 */
export function NotFound() {
  const { currentUser } = useAuth();
  const home = currentUser ? dashboardFor(currentUser.role) : ROUTES.landing;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15">
        <Compass aria-hidden="true" className="size-8" />
      </span>

      <div>
        <p className="text-sm font-bold tracking-widest text-brand-500 uppercase">
          Error 404
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl dark:text-ink-dark">
          We couldn&rsquo;t find that page
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted dark:text-muted-soft">
          The link may be out of date, or the page may have moved since it was
          shared with you.
        </p>
      </div>

      <Button as={Link} to={home}>
        {currentUser ? 'Back to dashboard' : 'Back to home'}
      </Button>
    </main>
  );
}
