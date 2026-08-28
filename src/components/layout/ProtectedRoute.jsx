import { Navigate, useLocation } from 'react-router-dom';

import { ROUTES, dashboardFor } from '@/constants/routes';
import { useAuth } from '@/context/auth-context';

/**
 * Gate for authenticated routes.
 *
 * `AuthProvider` reads the stored session synchronously in its initialiser, so
 * there is no hydration window to wait on here: the first render already knows
 * whether someone is signed in. A signed-in user who lacks the role is sent to
 * their own dashboard rather than shown a dead end.
 */
export function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={dashboardFor(currentUser.role)} replace />;
  }

  return children;
}

/**
 * The inverse guard for /login and /register: a user who already has a session
 * is sent straight to their dashboard instead of being shown the form again.
 */
export function PublicOnlyRoute({ children }) {
  const { currentUser } = useAuth();

  if (currentUser) return <Navigate to={dashboardFor(currentUser.role)} replace />;

  return children;
}
