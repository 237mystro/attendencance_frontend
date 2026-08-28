import {
  Banknote,
  BriefcaseBusiness,
  Globe,
  MapPin,
  QrCode,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';

/**
 * Marketing copy for the landing page, kept apart from the layout so the
 * sections stay short and the wording can be edited without reading JSX.
 * Icons are component references, rendered as `<item.icon />`.
 */

export const NAV_LINKS = [
  { label: 'Why AutoPayroll', href: '#features' },
  { label: 'Who it serves', href: '#personas' },
  { label: 'Security', href: '#security' },
];

export const TRUST_POINTS = [
  'Business-grade access control',
  'Real-time attendance visibility',
  'Payroll built for African teams',
];

export const STATS = [
  { value: '500+', label: 'Businesses modernizing payroll' },
  { value: '12,000+', label: 'Employees managed across teams' },
  { value: 'XAF 2B+', label: 'Payroll value processed with confidence' },
  { value: '99.9%', label: 'Operational uptime for daily workflows' },
];

export const FEATURES = [
  {
    icon: QrCode,
    title: 'Attendance with proof',
    description:
      'Geo-aware QR check-ins create a dependable attendance stream that managers can trust in real time.',
    accent: 'text-brand-500 bg-brand-500/12',
    hover: 'hover:border-brand-500/20',
  },
  {
    icon: Banknote,
    title: 'Payroll that moves faster',
    description:
      'Turn attendance, shifts, and deduction rules into polished payroll runs with less spreadsheet work.',
    accent: 'text-accent-500 bg-accent-500/12',
    hover: 'hover:border-accent-500/20',
  },
  {
    icon: Users,
    title: 'One workspace for every role',
    description:
      'Admins, HR teams, branch operators, and employees each get a focused experience inside the same platform.',
    accent: 'text-amber-700 bg-amber-700/12',
    hover: 'hover:border-amber-700/20',
  },
  {
    icon: MapPin,
    title: 'Geofence-aware operations',
    description:
      'Define check-in boundaries and location logic to keep field teams and onsite staff accountable.',
    accent: 'text-violet-600 bg-violet-600/12',
    hover: 'hover:border-violet-600/20',
  },
  {
    icon: TrendingUp,
    title: 'Decisions backed by live data',
    description:
      'See staffing patterns, attendance trends, payout readiness, and deduction impact from one executive view.',
    accent: 'text-cyan-600 bg-cyan-600/12',
    hover: 'hover:border-cyan-600/20',
  },
  {
    icon: ShieldCheck,
    title: 'Designed for professional trust',
    description:
      'Secure access, role-based permissions, and a clean audit-friendly workflow support business-critical use.',
    accent: 'text-red-600 bg-red-600/12',
    hover: 'hover:border-red-600/20',
  },
];

export const BENEFITS = [
  'Reduce manual payroll preparation and attendance disputes.',
  'Give leadership a clearer view of workforce readiness.',
  'Create a more professional employee experience from onboarding to payday.',
];

export const VALUE_TILES = [
  { icon: QrCode, label: 'Attendance stream', value: 'Live sync', accent: 'text-brand-500' },
  { icon: Banknote, label: 'Payroll processing', value: 'Automated rules', accent: 'text-accent-500' },
  { icon: Globe, label: 'Team communication', value: 'Announcements + chat', accent: 'text-amber-700' },
  {
    icon: BriefcaseBusiness,
    label: 'Executive controls',
    value: 'Permissions + oversight',
    accent: 'text-violet-600',
  },
];

export const PERSONAS = [
  {
    eyebrow: 'Leadership view',
    title: 'For administrators',
    description:
      'Oversee payroll readiness, attendance, staff setup, announcements, and business controls from one elevated workspace.',
    bullets: ['Payroll approvals', 'Branch oversight', 'Company settings', 'Executive reporting'],
  },
  {
    eyebrow: 'Operational view',
    title: 'For branch and HR teams',
    description:
      'Run local attendance, shift coordination, and employee actions without depending on fragmented tools.',
    bullets: [
      'Attendance dashboards',
      'Shift scheduling',
      'Leave and late requests',
      'Local employee actions',
    ],
    featured: true,
  },
  {
    eyebrow: 'Daily experience',
    title: 'For employees',
    description:
      'Give staff a more modern experience for check-ins, schedules, requests, payments, and communication.',
    bullets: ['QR check-in', 'My schedule', 'Leave requests', 'Payment visibility'],
  },
];

export const SECURITY_ITEMS = [
  'Role-based access for admins, branches, HR, and employees',
  'Location-aware QR attendance controls',
  'Clear operational history for approvals and payroll actions',
];

export const ROLLOUT_STEPS = [
  {
    label: '01',
    title: 'Create your workspace',
    description:
      'Set up your company account and establish the command center for payroll and attendance operations.',
  },
  {
    label: '02',
    title: 'Bring your team in',
    description:
      'Add employees, define roles, configure locations, and organize schedules without heavy onboarding friction.',
  },
  {
    label: '03',
    title: 'Run payroll with confidence',
    description:
      'Turn check-ins and shift activity into payroll-ready data and complete pay runs with better clarity.',
  },
];

export const WEEKLY_BARS = [
  ['Monday', 92],
  ['Tuesday', 95],
  ['Wednesday', 90],
  ['Thursday', 97],
  ['Friday', 94],
];
