/** Every role the API can return on `user.role`. */
export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  BRANCH_MANAGER: 'branch_manager',
  BRANCH_HR: 'branch_hr',
  EMPLOYEE: 'employee',
};

/** Roles that share the `/admin` portal. */
export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.HR];

/** Roles that share the `/branch` portal. */
export const BRANCH_ROLES = [ROLES.BRANCH_MANAGER, ROLES.BRANCH_HR];

/** Roles that share the `/employee` portal. */
export const EMPLOYEE_ROLES = [ROLES.EMPLOYEE];

/** Which portal a role belongs to. Drives redirects and the layout shell. */
export const PORTAL_BY_ROLE = {
  [ROLES.ADMIN]: 'admin',
  [ROLES.HR]: 'admin',
  [ROLES.BRANCH_MANAGER]: 'branch',
  [ROLES.BRANCH_HR]: 'branch',
  [ROLES.EMPLOYEE]: 'employee',
};

/** Human-readable label shown under the user's name in the sidebar. */
export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.HR]: 'HR Manager',
  [ROLES.BRANCH_MANAGER]: 'Branch Manager',
  [ROLES.BRANCH_HR]: 'Branch HR',
  [ROLES.EMPLOYEE]: 'Employee',
};

export const getPortal = (role) => PORTAL_BY_ROLE[role] || null;

export const isBranchRole = (role) => BRANCH_ROLES.includes(role);
