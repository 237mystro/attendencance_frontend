import {
  BadgeDollarSign,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  Clock,
  FolderLock,
  LayoutDashboard,
  Landmark,
  MapPin,
  MessageSquare,
  MinusCircle,
  QrCode,
  ScanLine,
  Store,
  Users,
  Wallet,
} from 'lucide-react';

import { ROUTES } from './routes';

/**
 * Sidebar navigation for each portal.
 *
 * The three dashboard shells in the source were ~85% duplicated markup that
 * differed only in these lists, a gradient, and a portal label — so those are
 * the only things described here, and one `DashboardShell` renders all three.
 *
 * Icons are stored as component references, not elements, so this stays a plain
 * `.js` module and each item is rendered as `<item.icon />`.
 *
 * `badge` names a live count from `SocketContext`: 'messages' or 'late'.
 * `accent` is the Tailwind text colour of the icon and active left border,
 * preserving the per-item colour coding of the original.
 */

export const PORTALS = {
  admin: {
    key: 'admin',
    label: 'Admin Panel',
    gradient: 'linear-gradient(180deg,#0d1f42 0%,#112952 60%,#153566 100%)',
    logoGradient: 'from-sky-400 to-blue-700',
    logoIcon: Wallet,
  },
  branch: {
    key: 'branch',
    label: 'Branch Portal',
    gradient: 'linear-gradient(180deg,#0e2218 0%,#122d20 60%,#163a28 100%)',
    logoGradient: 'from-green-600 to-green-400',
    logoIcon: Store,
  },
  employee: {
    key: 'employee',
    label: 'Employee Portal',
    gradient: 'linear-gradient(180deg,#0c1e38 0%,#0d2e55 60%,#0f3b6a 100%)',
    logoGradient: 'from-teal-400 to-teal-700',
    logoIcon: Wallet,
  },
};

export const ADMIN_NAV = [
  { label: 'Dashboard', to: ROUTES.admin.dashboard, icon: LayoutDashboard, accent: 'text-blue-400' },
  { label: 'Employees', to: ROUTES.admin.employees, icon: Users, accent: 'text-emerald-400' },
  { label: 'Scheduling', to: ROUTES.admin.scheduling, icon: CalendarClock, accent: 'text-purple-400' },
  { label: 'Attendance', to: ROUTES.admin.attendance, icon: ClipboardCheck, accent: 'text-amber-400' },
  { label: 'Leave', to: ROUTES.admin.leave, icon: CalendarDays, accent: 'text-rose-400' },
  { label: 'Late Requests', to: ROUTES.admin.lateRequests, icon: Clock, accent: 'text-amber-500', badge: 'late' },
  { label: 'Events', to: ROUTES.admin.events, icon: CalendarDays, accent: 'text-orange-400' },
  { label: 'Payroll', to: ROUTES.admin.payroll, icon: Wallet, accent: 'text-teal-400' },
  { label: 'Messaging', to: ROUTES.admin.messaging, icon: MessageSquare, accent: 'text-green-400', badge: 'messages' },
  { label: 'Geofence', to: ROUTES.admin.geofence, icon: MapPin, accent: 'text-sky-400' },
  { label: 'Company QR', to: ROUTES.admin.companyQr, icon: QrCode, accent: 'text-lime-400' },
  { label: 'Late Deductions', to: ROUTES.admin.lateDeductions, icon: MinusCircle, accent: 'text-red-400' },
  { label: 'Branches', to: ROUTES.admin.branches, icon: Store, accent: 'text-teal-400' },
  { label: 'Salary Advances', to: ROUTES.admin.salaryAdvances, icon: Landmark, accent: 'text-sky-500' },
  { label: 'Document Vault', to: ROUTES.admin.documents, icon: FolderLock, accent: 'text-violet-400' },
];

export const BRANCH_NAV = [
  { label: 'Dashboard', to: ROUTES.branch.dashboard, icon: LayoutDashboard, accent: 'text-blue-400' },
  { label: 'Employees', to: ROUTES.branch.employees, icon: Users, accent: 'text-emerald-400' },
  { label: 'Scheduling', to: ROUTES.branch.scheduling, icon: CalendarClock, accent: 'text-purple-400' },
  { label: 'Attendance', to: ROUTES.branch.attendance, icon: ClipboardCheck, accent: 'text-amber-400' },
  { label: 'Leave', to: ROUTES.branch.leave, icon: CalendarDays, accent: 'text-rose-400' },
  { label: 'Late Requests', to: ROUTES.branch.lateRequests, icon: Clock, accent: 'text-amber-500', badge: 'late' },
  { label: 'Events', to: ROUTES.branch.events, icon: CalendarDays, accent: 'text-orange-400' },
  { label: 'Payroll', to: ROUTES.branch.payroll, icon: Wallet, accent: 'text-teal-400' },
  { label: 'Messaging', to: ROUTES.branch.messaging, icon: MessageSquare, accent: 'text-green-400', badge: 'messages' },
  { label: 'Geofence', to: ROUTES.branch.geofence, icon: MapPin, accent: 'text-cyan-400' },
  { label: 'Branch QR', to: ROUTES.branch.branchQr, icon: QrCode, accent: 'text-lime-400' },
  { label: 'Late Deductions', to: ROUTES.branch.lateDeductions, icon: MinusCircle, accent: 'text-red-400' },
  { label: 'Salary Advances', to: ROUTES.branch.salaryAdvances, icon: Landmark, accent: 'text-sky-500' },
];

export const EMPLOYEE_NAV = [
  { label: 'Dashboard', to: ROUTES.employee.dashboard, icon: LayoutDashboard, accent: 'text-blue-400' },
  { label: 'Check-In', to: ROUTES.employee.checkin, icon: ScanLine, accent: 'text-emerald-400' },
  { label: 'My Schedule', to: ROUTES.employee.schedule, icon: CalendarClock, accent: 'text-purple-400' },
  { label: 'My Payments', to: ROUTES.employee.payments, icon: Wallet, accent: 'text-teal-400' },
  { label: 'Leave', to: ROUTES.employee.leave, icon: CalendarDays, accent: 'text-rose-400' },
  { label: 'Late Request', to: ROUTES.employee.lateRequest, icon: Clock, accent: 'text-amber-500' },
  { label: 'My Deductions', to: ROUTES.employee.myDeductions, icon: MinusCircle, accent: 'text-red-400' },
  { label: 'Salary Advance', to: ROUTES.employee.salaryAdvance, icon: BadgeDollarSign, accent: 'text-sky-500' },
  { label: 'Messaging', to: ROUTES.employee.messaging, icon: MessageSquare, accent: 'text-violet-400', badge: 'messages' },
];

export const NAV_BY_PORTAL = {
  admin: ADMIN_NAV,
  branch: BRANCH_NAV,
  employee: EMPLOYEE_NAV,
};

/**
 * Titles for screens that have no sidebar entry — reached from a button, a
 * menu, or a redirect. Without these the top bar would fall back to
 * "Dashboard" and mislabel the page. Keyed by the last path segment.
 */
export const OFF_NAV_TITLES = {
  'employee-onboarding': 'Add employee',
  announcements: 'Announcements',
  'change-password': 'Change password',
  profile: 'Profile',
  settings: 'Settings',
};

/** Short description shown under the page title in the branch top bar. */
export const PAGE_SUMMARIES = {
  Dashboard: 'Branch operations and attendance priorities',
  Employees: 'People management for this branch',
  Scheduling: 'Shift coverage and coordination',
  Attendance: 'Live branch attendance visibility',
  Leave: 'Leave review for branch staff',
  'Late Requests': 'Late-arrival approvals and follow-up',
  Events: 'Branch event coordination',
  Payroll: 'Branch payroll review workspace',
  Messaging: 'Messages and branch-wide updates',
  Geofence: 'Location settings for attendance rules',
  'Branch QR': 'QR access for branch check-in flow',
  'Late Deductions': 'Deduction policy and branch summaries',
  'Salary Advances': 'Advance requests and repayment tracking',
};
