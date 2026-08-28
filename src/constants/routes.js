import { PORTAL_BY_ROLE } from './roles';

/** Every route path in the app, in one place. */
export const ROUTES = {
  landing: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  terms: '/terms',
  publicEvent: '/event/:companyId/:eventId',

  admin: {
    root: '/admin',
    dashboard: '/admin/dashboard',
    employees: '/admin/employees',
    employeeOnboarding: '/admin/employee-onboarding',
    scheduling: '/admin/scheduling',
    attendance: '/admin/attendance',
    leave: '/admin/leave',
    lateRequests: '/admin/late-requests',
    events: '/admin/events',
    payroll: '/admin/payroll',
    messaging: '/admin/messaging',
    announcements: '/admin/messaging/announcements',
    geofence: '/admin/geofence',
    companyQr: '/admin/company-qr',
    lateDeductions: '/admin/late-deductions',
    branches: '/admin/branches',
    salaryAdvances: '/admin/salary-advances',
    documents: '/admin/documents',
    settings: '/admin/settings',
    profile: '/admin/profile',
  },

  branch: {
    root: '/branch',
    dashboard: '/branch/dashboard',
    employees: '/branch/employees',
    scheduling: '/branch/scheduling',
    attendance: '/branch/attendance',
    leave: '/branch/leave',
    lateRequests: '/branch/late-requests',
    events: '/branch/events',
    payroll: '/branch/payroll',
    messaging: '/branch/messaging',
    geofence: '/branch/geofence',
    branchQr: '/branch/branch-qr',
    lateDeductions: '/branch/late-deductions',
    salaryAdvances: '/branch/salary-advances',
    settings: '/branch/settings',
    profile: '/branch/profile',
  },

  employee: {
    root: '/employee',
    dashboard: '/employee/dashboard',
    checkin: '/employee/checkin',
    schedule: '/employee/schedule',
    payments: '/employee/payments',
    leave: '/employee/leave',
    lateRequest: '/employee/late-request',
    myDeductions: '/employee/my-deductions',
    salaryAdvance: '/employee/salary-advance',
    messaging: '/employee/messaging',
    changePassword: '/employee/change-password',
    settings: '/employee/settings',
    profile: '/employee/profile',
  },
};

/** Where a freshly authenticated user lands, by role. */
export const DASHBOARD_BY_ROLE = {
  admin: ROUTES.admin.dashboard,
  hr: ROUTES.admin.dashboard,
  branch_manager: ROUTES.branch.dashboard,
  branch_hr: ROUTES.branch.dashboard,
  employee: ROUTES.employee.dashboard,
};

export const dashboardFor = (role) => DASHBOARD_BY_ROLE[role] || ROUTES.login;

/**
 * Resolves a portal-relative key (e.g. `messaging`) to the concrete path for
 * whichever portal the given role belongs to. Used by notification deep-links,
 * which must point at the current user's own copy of a shared screen.
 */
export const portalPath = (role, key) => {
  const portal = PORTAL_BY_ROLE[role];
  return portal ? ROUTES[portal][key] : null;
};
