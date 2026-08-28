import { request } from '@/api/client';

/**
 * The employee list, used only to populate filter dropdowns.
 *
 * Lives here rather than in the employees feature so attendance does not
 * depend on a feature it otherwise has nothing to do with; the full employee
 * API arrives with that feature.
 */
export const fetchEmployeeOptions = (signal) => request('/employees', { signal });
