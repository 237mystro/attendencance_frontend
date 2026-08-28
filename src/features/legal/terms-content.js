export const COMPANY_NAME = 'AutoPayroll';
export const CONTACT_EMAIL = 'support@autopayroll.app';
export const EFFECTIVE_DATE = 'January 1, 2025';

export const PREAMBLE = `Please read these Terms and Conditions carefully before using the ${COMPANY_NAME} platform. By accessing or using our service — whether as a business administrator, branch manager, HR officer, or employee — you agree to be bound by these terms. If you do not agree, please do not use the platform.`;

/**
 * The terms, as data rather than markup.
 *
 * Each section has `paragraphs` (prose) and optional `bullets`. Keeping the
 * copy here means the renderer stays small and the legal text can be revised
 * without touching component code.
 */
export const TERMS_SECTIONS = [
  {
    title: 'Acceptance of Terms',
    paragraphs: [
      `These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User") and ${COMPANY_NAME} ("we", "our", or "us"). They govern your access to and use of the ${COMPANY_NAME} payroll and workforce management platform, including all related websites, mobile applications, and services (collectively, the "Service").`,
      'By creating an account, logging in, or otherwise using the Service, you confirm that you are at least 18 years old, have the legal authority to enter into this agreement, and accept these Terms in full.',
    ],
  },
  {
    title: 'Description of Service',
    paragraphs: [`${COMPANY_NAME} is a cloud-based workforce management platform that provides:`],
    bullets: [
      'Payroll processing and salary disbursement tracking',
      'Employee attendance monitoring via geolocation and QR code check-in',
      'Shift scheduling, transfer requests, and assignment management',
      'Late deduction calculation and report generation',
      'Internal messaging and announcement broadcasting',
      'Leave request management and approvals',
      'Real-time notifications via push alerts and email',
    ],
    footer:
      'Features and availability may change at our discretion. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.',
  },
  {
    title: 'User Accounts and Security',
    paragraphs: [
      'To use the Service, you must create an account with accurate, complete, and current information. You are responsible for:',
    ],
    bullets: [
      'Maintaining the confidentiality of your login credentials',
      'All activity that occurs under your account',
      'Immediately notifying us of any unauthorized use of your account',
      'Ensuring only authorized personnel have admin or HR-level access',
    ],
    footer:
      'The "Remember me" / "Stay signed in" feature stores an encrypted session token on your device for up to 30 days. You should not enable this feature on shared or public devices. You can sign out at any time to revoke the stored session.',
  },
  {
    title: 'Employer and Administrator Responsibilities',
    paragraphs: [
      'Business administrators who create a workspace ("Employer") are responsible for:',
    ],
    bullets: [
      'Ensuring all employee data entered into the platform is accurate and has been collected lawfully under applicable labor and privacy laws',
      'Obtaining any required consent from employees before recording attendance location data',
      'Configuring payroll deductions, salary rates, and schedules in compliance with local labor regulations',
      'Reviewing and approving deduction reports before disbursement',
      'Managing branch-level access and ensuring branch managers do not exceed their authorized scope',
    ],
    footer: `${COMPANY_NAME} is a tool to facilitate workforce management. Compliance with employment law, minimum wage requirements, and payroll regulations remains solely the responsibility of the employer.`,
  },
  {
    title: 'Employee Data and Privacy',
    paragraphs: ['We are committed to protecting personal data. When using the Service:'],
    bullets: [
      'Employee personal data (name, email, phone, salary, location check-ins) is stored securely and only accessible to authorized company personnel',
      'Location data captured during attendance check-in is used solely for verifying on-site presence and is not shared with third parties',
      'Push notification subscriptions are stored per-device and can be revoked at any time through your browser or device settings',
      `You may request deletion of your personal data by contacting us at ${CONTACT_EMAIL}`,
    ],
    footer:
      'We do not sell, rent, or share personal data with third parties for marketing purposes. For full details, please refer to our Privacy Policy.',
  },
  {
    title: 'Acceptable Use',
    paragraphs: ['You agree not to use the Service to:'],
    bullets: [
      'Falsify attendance records, check-in locations, or payroll data',
      "Access another user's account without authorization",
      'Upload or transmit malicious code, viruses, or harmful content',
      'Attempt to reverse-engineer, scrape, or extract data from the platform',
      'Use the platform in any way that violates applicable laws or regulations',
      `Impersonate another employee, administrator, or ${COMPANY_NAME} representative`,
    ],
    footer:
      'Violation of these rules may result in immediate account suspension without notice.',
  },
  {
    title: 'Payments and Subscription',
    paragraphs: ['If the Service includes a paid subscription tier:'],
    bullets: [
      'Fees are billed in advance on a monthly or annual basis',
      'All fees are non-refundable except where required by applicable law',
      "We reserve the right to change pricing with at least 30 days' advance notice",
      'Non-payment may result in service suspension after a grace period',
    ],
  },
  {
    title: 'Limitation of Liability',
    paragraphs: [
      `To the maximum extent permitted by law, ${COMPANY_NAME} and its affiliates shall not be liable for:`,
    ],
    bullets: [
      'Any indirect, incidental, consequential, or punitive damages arising from your use of the Service',
      'Payroll errors resulting from incorrect data entered by the employer or administrator',
      'Loss of data due to factors outside our reasonable control, including force majeure events, third-party provider outages, or user error',
      "Any labor disputes, regulatory penalties, or compliance failures arising from the employer's use of the platform",
    ],
    footer:
      'Our total liability for any claim arising out of or relating to these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.',
  },
  {
    title: 'Modifications to Terms',
    paragraphs: [
      'We may update these Terms from time to time to reflect changes to the Service, legal requirements, or our business practices. When we make material changes, we will notify you via email or an in-app notice at least 14 days before the changes take effect.',
      'Continued use of the Service after the effective date constitutes acceptance of the revised Terms. If you do not agree to the updated Terms, you must stop using the Service and may request account deletion.',
    ],
  },
  {
    title: 'Governing Law',
    paragraphs: [
      'These Terms shall be governed by and construed in accordance with the laws applicable in the jurisdiction where your business is registered, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved by good-faith negotiation first; failing that, by binding arbitration or the courts of competent jurisdiction.',
    ],
  },
  {
    title: 'Contact Us',
    paragraphs: [
      'If you have any questions about these Terms, or if you need to report a violation or request data deletion, please contact us:',
    ],
    contact: true,
  },
];
