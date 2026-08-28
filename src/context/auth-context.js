import { createContext, useContext } from 'react';

/**
 * Context object and consumer hook for authentication.
 *
 * Kept apart from `AuthProvider.jsx` so that file exports only a component,
 * which is what keeps Fast Refresh working on the provider.
 */
export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}
