import { AdminShell, BranchShell, EmployeeShell } from '@/components/layout/DashboardShell';
import { PublicOnlyRoute } from '@/components/layout/ProtectedRoute';
import { ROUTES } from '@/constants/routes';
import { lazyPage } from './lazy-page';

/*
 * Feature screens load on demand. The attendance screens alone pull in Leaflet,
 * Recharts, jsQR, the webcam, and the WebAuthn client — roughly two thirds of
 * the bundle — and nobody needs all of that to reach the login form.
 */
const LandingPage = lazyPage(() => import('@/features/landing/pages/LandingPage'), 'LandingPage');
const LoginPage = lazyPage(() => import('@/features/auth/pages/LoginPage'), 'LoginPage');
const RegisterPage = lazyPage(() => import('@/features/auth/pages/RegisterPage'), 'RegisterPage');
const ForgotPasswordPage = lazyPage(() => import('@/features/auth/pages/ForgotPasswordPage'), 'ForgotPasswordPage');
const TermsPage = lazyPage(() => import('@/features/legal/pages/TermsPage'), 'TermsPage');

const AttendanceDashboardPage = lazyPage(() => import('@/features/attendance/pages/AttendanceDashboardPage'), 'AttendanceDashboardPage');
const CheckInPage = lazyPage(() => import('@/features/attendance/pages/CheckInPage'), 'CheckInPage');
const GeofenceSettingsPage = lazyPage(() => import('@/features/attendance/pages/GeofenceSettingsPage'), 'GeofenceSettingsPage');
const CompanyQrPage = lazyPage(() => import('@/features/attendance/pages/CompanyQrPage'), 'CompanyQrPage');
const BranchQrPage = lazyPage(() => import('@/features/attendance/pages/BranchQrPage'), 'BranchQrPage');

const EmployeeListPage = lazyPage(() => import('@/features/employees/pages/EmployeeListPage'), 'EmployeeListPage');
const EmployeeOnboardingPage = lazyPage(() => import('@/features/employees/pages/EmployeeOnboardingPage'), 'EmployeeOnboardingPage');
const BranchesPage = lazyPage(() => import('@/features/branches/pages/BranchesPage'), 'BranchesPage');

const ShiftSchedulingPage = lazyPage(() => import('@/features/scheduling/pages/ShiftSchedulingPage'), 'ShiftSchedulingPage');
const MySchedulePage = lazyPage(() => import('@/features/scheduling/pages/MySchedulePage'), 'MySchedulePage');
const LeaveManagementPage = lazyPage(() => import('@/features/leave/pages/LeaveManagementPage'), 'LeaveManagementPage');
const MyLeavePage = lazyPage(() => import('@/features/leave/pages/MyLeavePage'), 'MyLeavePage');
const LatePermissionAdminPage = lazyPage(() => import('@/features/late-permissions/pages/LatePermissionAdminPage'), 'LatePermissionAdminPage');
const LatePermissionRequestPage = lazyPage(() => import('@/features/late-permissions/pages/LatePermissionRequestPage'), 'LatePermissionRequestPage');

const PayrollProcessingPage = lazyPage(() => import('@/features/payroll/pages/PayrollProcessingPage'), 'PayrollProcessingPage');
const MyPaymentsPage = lazyPage(() => import('@/features/payroll/pages/MyPaymentsPage'), 'MyPaymentsPage');
const LateDeductionsPage = lazyPage(() => import('@/features/deductions/pages/LateDeductionsPage'), 'LateDeductionsPage');
const MyDeductionsPage = lazyPage(() => import('@/features/deductions/pages/MyDeductionsPage'), 'MyDeductionsPage');
const SalaryAdvanceAdminPage = lazyPage(() => import('@/features/salary-advances/pages/SalaryAdvanceAdminPage'), 'SalaryAdvanceAdminPage');
const MySalaryAdvancePage = lazyPage(() => import('@/features/salary-advances/pages/MySalaryAdvancePage'), 'MySalaryAdvancePage');

const MessagingPage = lazyPage(() => import('@/features/messaging/pages/MessagingPage'), 'MessagingPage');
const AnnouncementFormPage = lazyPage(() => import('@/features/messaging/pages/AnnouncementFormPage'), 'AnnouncementFormPage');
const EventManagementPage = lazyPage(() => import('@/features/events/pages/EventManagementPage'), 'EventManagementPage');
const PublicEventPage = lazyPage(() => import('@/features/events/pages/PublicEventPage'), 'PublicEventPage');
const DocumentVaultPage = lazyPage(() => import('@/features/documents/pages/DocumentVaultPage'), 'DocumentVaultPage');

const SettingsPage = lazyPage(() => import('@/features/settings/pages/SettingsPage'), 'SettingsPage');
const ProfilePage = lazyPage(() => import('@/features/settings/pages/ProfilePage'), 'ProfilePage');
const ChangePasswordPage = lazyPage(() => import('@/features/settings/pages/ChangePasswordPage'), 'ChangePasswordPage');

const AdminDashboardPage = lazyPage(() => import('@/features/dashboard/pages/AdminDashboardPage'), 'AdminDashboardPage');
const BranchDashboardPage = lazyPage(() => import('@/features/dashboard/pages/BranchDashboardPage'), 'BranchDashboardPage');
const EmployeeDashboardPage = lazyPage(() => import('@/features/dashboard/pages/EmployeeDashboardPage'), 'EmployeeDashboardPage');

/**
 * The app's route tables, kept out of `App.jsx` so adding a screen is a
 * one-line edit next to its siblings.
 *
 * Child paths are relative to their portal's base path. Every screen is now
 * code-split, so a portal only downloads the routes it actually visits.
 */

export const PUBLIC_ROUTES = [
  { path: ROUTES.landing, element: <LandingPage /> },
  {
    path: ROUTES.login,
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: ROUTES.register,
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },
  // Both paths render the same two-step flow, as in the source: `/reset-password`
  // is where the emailed link lands, and it resumes at the code-entry step.
  { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
  { path: ROUTES.resetPassword, element: <ForgotPasswordPage /> },
  { path: ROUTES.terms, element: <TermsPage /> },
  { path: ROUTES.publicEvent, element: <PublicEventPage /> },
];

export const ADMIN_ROUTES = {
  layout: AdminShell,
  routes: [
    { path: 'dashboard', element: <AdminDashboardPage /> },
    { path: 'employees', element: <EmployeeListPage /> },
    { path: 'employee-onboarding', element: <EmployeeOnboardingPage /> },
    { path: 'scheduling', element: <ShiftSchedulingPage /> },
    { path: 'attendance', element: <AttendanceDashboardPage /> },
    { path: 'leave', element: <LeaveManagementPage /> },
    { path: 'late-requests', element: <LatePermissionAdminPage /> },
    { path: 'events', element: <EventManagementPage /> },
    { path: 'payroll', element: <PayrollProcessingPage /> },
    { path: 'messaging', element: <MessagingPage /> },
    { path: 'messaging/announcements', element: <AnnouncementFormPage /> },
    { path: 'geofence', element: <GeofenceSettingsPage /> },
    { path: 'company-qr', element: <CompanyQrPage /> },
    { path: 'late-deductions', element: <LateDeductionsPage /> },
    { path: 'branches', element: <BranchesPage /> },
    { path: 'salary-advances', element: <SalaryAdvanceAdminPage /> },
    { path: 'documents', element: <DocumentVaultPage /> },
    { path: 'settings', element: <SettingsPage /> },
    { path: 'profile', element: <ProfilePage /> },
  ],
};

export const BRANCH_ROUTES = {
  layout: BranchShell,
  routes: [
    { path: 'dashboard', element: <BranchDashboardPage /> },
    { path: 'employees', element: <EmployeeListPage /> },
    { path: 'scheduling', element: <ShiftSchedulingPage /> },
    { path: 'attendance', element: <AttendanceDashboardPage /> },
    { path: 'leave', element: <LeaveManagementPage /> },
    { path: 'late-requests', element: <LatePermissionAdminPage /> },
    { path: 'events', element: <EventManagementPage /> },
    { path: 'payroll', element: <PayrollProcessingPage /> },
    { path: 'messaging', element: <MessagingPage /> },
    { path: 'geofence', element: <GeofenceSettingsPage /> },
    { path: 'branch-qr', element: <BranchQrPage /> },
    { path: 'late-deductions', element: <LateDeductionsPage /> },
    { path: 'salary-advances', element: <SalaryAdvanceAdminPage /> },
    { path: 'settings', element: <SettingsPage /> },
    { path: 'profile', element: <ProfilePage /> },
  ],
};

export const EMPLOYEE_ROUTES = {
  layout: EmployeeShell,
  routes: [
    { path: 'dashboard', element: <EmployeeDashboardPage /> },
    { path: 'checkin', element: <CheckInPage /> },
    { path: 'schedule', element: <MySchedulePage /> },
    { path: 'payments', element: <MyPaymentsPage /> },
    { path: 'leave', element: <MyLeavePage /> },
    { path: 'late-request', element: <LatePermissionRequestPage /> },
    { path: 'my-deductions', element: <MyDeductionsPage /> },
    { path: 'salary-advance', element: <MySalaryAdvancePage /> },
    { path: 'messaging', element: <MessagingPage /> },
    { path: 'change-password', element: <ChangePasswordPage /> },
    { path: 'settings', element: <SettingsPage /> },
    { path: 'profile', element: <ProfilePage /> },
  ],
};
