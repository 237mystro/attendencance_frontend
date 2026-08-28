import { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { NotFound } from '@/components/layout/NotFound';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PageLoader, Toaster } from '@/components/ui';
import { ADMIN_ROLES, BRANCH_ROLES, EMPLOYEE_ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { AuthProvider } from '@/context/AuthProvider';
import { SocketProvider } from '@/context/SocketProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import { ToastProvider } from '@/context/ToastProvider';
import { ADMIN_ROUTES, BRANCH_ROUTES, EMPLOYEE_ROUTES, PUBLIC_ROUTES } from '@/routes';

/**
 * Renders one portal: a role-gated layout shell with its child routes nested
 * underneath, matching the source's `/admin`, `/branch`, and `/employee` trees.
 */
function portalRoutes({ basePath, roles, layout: Layout, routes }) {
  return (
    <Route
      key={basePath}
      path={basePath}
      element={
        <ProtectedRoute allowedRoles={roles}>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      {routes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
      <Route path="*" element={<NotFound />} />
    </Route>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <SocketProvider>
              <BrowserRouter>
                {/* Route components are code-split, so a fallback covers the
                    moment between navigation and the chunk arriving. */}
                <Suspense fallback={<PageLoader label="Loading…" />}>
                  <Routes>
                    {PUBLIC_ROUTES.map(({ path, element }) => (
                      <Route key={path} path={path} element={element} />
                    ))}

                    {portalRoutes({
                      basePath: ROUTES.admin.root,
                      roles: ADMIN_ROLES,
                      ...ADMIN_ROUTES,
                    })}
                    {portalRoutes({
                      basePath: ROUTES.branch.root,
                      roles: BRANCH_ROLES,
                      ...BRANCH_ROUTES,
                    })}
                    {portalRoutes({
                      basePath: ROUTES.employee.root,
                      roles: EMPLOYEE_ROLES,
                      ...EMPLOYEE_ROUTES,
                    })}

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
              <Toaster />
            </SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
