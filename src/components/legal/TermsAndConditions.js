import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Divider, Paper, Stack, Typography
} from '@mui/material';
import { ArrowBack, GavelRounded } from '@mui/icons-material';

const EFFECTIVE_DATE = 'January 1, 2025';
const COMPANY_NAME   = 'AutoPayroll';
const CONTACT_EMAIL  = 'support@autopayroll.app';

const Section = ({ number, title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, color: '#0f172a', display: 'flex', gap: 1 }}>
      <Box component="span" sx={{ color: '#155eef' }}>{number}.</Box> {title}
    </Typography>
    <Box sx={{ color: '#475569', lineHeight: 1.85, fontSize: 15 }}>{children}</Box>
  </Box>
);

const Bullet = ({ children }) => (
  <Box sx={{ display: 'flex', gap: 1.5, mb: 0.75 }}>
    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#155eef', mt: '9px', flexShrink: 0 }} />
    <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.75 }}>{children}</Typography>
  </Box>
);

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f3f6fb', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mb: 3, color: '#64748b', fontWeight: 600, textTransform: 'none' }}
          >
            Go back
          </Button>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{
              width: 52, height: 52, borderRadius: 3,
              bgcolor: '#155eef', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <GavelRounded sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', lineHeight: 1.1 }}>
                Terms &amp; Conditions
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25 }}>
                {COMPANY_NAME} · Effective {EFFECTIVE_DATE}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #e2e8f0' }}>

          {/* Preamble */}
          <Box sx={{
            p: 2.5, mb: 4, borderRadius: 3,
            bgcolor: '#eff6ff', border: '1px solid #bfdbfe'
          }}>
            <Typography variant="body2" sx={{ color: '#1e40af', lineHeight: 1.8 }}>
              Please read these Terms and Conditions carefully before using the {COMPANY_NAME} platform.
              By accessing or using our service — whether as a business administrator, branch manager, HR
              officer, or employee — you agree to be bound by these terms. If you do not agree, please
              do not use the platform.
            </Typography>
          </Box>

          <Section number="1" title="Acceptance of Terms">
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              These Terms and Conditions ("Terms") constitute a legally binding agreement between you
              ("User") and {COMPANY_NAME} ("we", "our", or "us"). They govern your access to and use of
              the {COMPANY_NAME} payroll and workforce management platform, including all related
              websites, mobile applications, and services (collectively, the "Service").
            </Typography>
            <Typography variant="body2">
              By creating an account, logging in, or otherwise using the Service, you confirm that you
              are at least 18 years old, have the legal authority to enter into this agreement, and
              accept these Terms in full.
            </Typography>
          </Section>

          <Section number="2" title="Description of Service">
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              {COMPANY_NAME} is a cloud-based workforce management platform that provides:
            </Typography>
            <Bullet>Payroll processing and salary disbursement tracking</Bullet>
            <Bullet>Employee attendance monitoring via geolocation and QR code check-in</Bullet>
            <Bullet>Shift scheduling, transfer requests, and assignment management</Bullet>
            <Bullet>Late deduction calculation and report generation</Bullet>
            <Bullet>Internal messaging and announcement broadcasting</Bullet>
            <Bullet>Leave request management and approvals</Bullet>
            <Bullet>Real-time notifications via push alerts and email</Bullet>
            <Typography variant="body2" sx={{ mt: 1.5 }}>
              Features and availability may change at our discretion. We reserve the right to modify,
              suspend, or discontinue any part of the Service at any time with reasonable notice.
            </Typography>
          </Section>

          <Section number="3" title="User Accounts and Security">
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              To use the Service, you must create an account with accurate, complete, and current
              information. You are responsible for:
            </Typography>
            <Bullet>Maintaining the confidentiality of your login credentials</Bullet>
            <Bullet>All activity that occurs under your account</Bullet>
            <Bullet>Immediately notifying us of any unauthorized use of your account</Bullet>
            <Bullet>Ensuring only authorized personnel have admin or HR-level access</Bullet>
            <Typography variant="body2" sx={{ mt: 1.5 }}>
              The "Remember me" / "Stay signed in" feature stores an encrypted session token on your
              device for up to 30 days. You should not enable this feature on shared or public devices.
              You can sign out at any time to revoke the stored session.
            </Typography>
          </Section>

          <Section number="4" title="Employer and Administrator Responsibilities">
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              Business administrators who create a workspace ("Employer") are responsible for:
            </Typography>
            <Bullet>
              Ensuring all employee data entered into the platform is accurate and has been collected
              lawfully under applicable labor and privacy laws
            </Bullet>
            <Bullet>
              Obtaining any required consent from employees before recording attendance location data
            </Bullet>
            <Bullet>
              Configuring payroll deductions, salary rates, and schedules in compliance with local
              labor regulations
            </Bullet>
            <Bullet>
              Reviewing and approving deduction reports before disbursement
            </Bullet>
            <Bullet>
              Managing branch-level access and ensuring branch managers do not exceed their
              authorized scope
            </Bullet>
            <Typography variant="body2" sx={{ mt: 1.5 }}>
              {COMPANY_NAME} is a tool to facilitate workforce management. Compliance with employment
              law, minimum wage requirements, and payroll regulations remains solely the responsibility
              of the employer.
            </Typography>
          </Section>

          <Section number="5" title="Employee Data and Privacy">
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              We are committed to protecting personal data. When using the Service:
            </Typography>
            <Bullet>
              Employee personal data (name, email, phone, salary, location check-ins) is stored
              securely and only accessible to authorized company personnel
            </Bullet>
            <Bullet>
              Location data captured during attendance check-in is used solely for verifying
              on-site presence and is not shared with third parties
            </Bullet>
            <Bullet>
              Push notification subscriptions are stored per-device and can be revoked at any time
              through your browser or device settings
            </Bullet>
            <Bullet>
              You may request deletion of your personal data by contacting us at{' '}
              <Box component="span" sx={{ color: '#155eef', fontWeight: 600 }}>{CONTACT_EMAIL}</Box>
            </Bullet>
            <Typography variant="body2" sx={{ mt: 1.5 }}>
              We do not sell, rent, or share personal data with third parties for marketing purposes.
              For full details, please refer to our Privacy Policy.
            </Typography>
          </Section>

          <Section number="6" title="Acceptable Use">
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              You agree not to use the Service to:
            </Typography>
            <Bullet>Falsify attendance records, check-in locations, or payroll data</Bullet>
            <Bullet>Access another user's account without authorization</Bullet>
            <Bullet>Upload or transmit malicious code, viruses, or harmful content</Bullet>
            <Bullet>
              Attempt to reverse-engineer, scrape, or extract data from the platform
            </Bullet>
            <Bullet>
              Use the platform in any way that violates applicable laws or regulations
            </Bullet>
            <Bullet>
              Impersonate another employee, administrator, or {COMPANY_NAME} representative
            </Bullet>
            <Typography variant="body2" sx={{ mt: 1.5 }}>
              Violation of these rules may result in immediate account suspension without notice.
            </Typography>
          </Section>

          <Section number="7" title="Payments and Subscription">
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              If the Service includes a paid subscription tier:
            </Typography>
            <Bullet>Fees are billed in advance on a monthly or annual basis</Bullet>
            <Bullet>
              All fees are non-refundable except where required by applicable law
            </Bullet>
            <Bullet>
              We reserve the right to change pricing with at least 30 days' advance notice
            </Bullet>
            <Bullet>
              Non-payment may result in service suspension after a grace period
            </Bullet>
          </Section>

          <Section number="8" title="Limitation of Liability">
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              To the maximum extent permitted by law, {COMPANY_NAME} and its affiliates shall not be
              liable for:
            </Typography>
            <Bullet>
              Any indirect, incidental, consequential, or punitive damages arising from your use
              of the Service
            </Bullet>
            <Bullet>
              Payroll errors resulting from incorrect data entered by the employer or administrator
            </Bullet>
            <Bullet>
              Loss of data due to factors outside our reasonable control, including force majeure
              events, third-party provider outages, or user error
            </Bullet>
            <Bullet>
              Any labor disputes, regulatory penalties, or compliance failures arising from the
              employer's use of the platform
            </Bullet>
            <Typography variant="body2" sx={{ mt: 1.5 }}>
              Our total liability for any claim arising out of or relating to these Terms shall not
              exceed the amount you paid us in the 12 months preceding the claim.
            </Typography>
          </Section>

          <Section number="9" title="Modifications to Terms">
            <Typography variant="body2">
              We may update these Terms from time to time to reflect changes to the Service, legal
              requirements, or our business practices. When we make material changes, we will notify
              you via email or an in-app notice at least 14 days before the changes take effect.
              Continued use of the Service after the effective date constitutes acceptance of the
              revised Terms. If you do not agree to the updated Terms, you must stop using the Service
              and may request account deletion.
            </Typography>
          </Section>

          <Section number="10" title="Governing Law">
            <Typography variant="body2">
              These Terms shall be governed by and construed in accordance with the laws applicable in
              the jurisdiction where your business is registered, without regard to its conflict of law
              provisions. Any disputes arising from these Terms shall be resolved by good-faith
              negotiation first; failing that, by binding arbitration or the courts of competent
              jurisdiction.
            </Typography>
          </Section>

          <Section number="11" title="Contact Us">
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              If you have any questions about these Terms, or if you need to report a violation or
              request data deletion, please contact us:
            </Typography>
            <Box sx={{
              p: 2.25, borderRadius: 3,
              bgcolor: '#f8fafc', border: '1px solid #e2e8f0',
              display: 'inline-block'
            }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a' }}>{COMPANY_NAME}</Typography>
              <Typography variant="body2" sx={{ color: '#475569' }}>
                Email:{' '}
                <Box component="a" href={`mailto:${CONTACT_EMAIL}`}
                  sx={{ color: '#155eef', textDecoration: 'none', fontWeight: 600 }}>
                  {CONTACT_EMAIL}
                </Box>
              </Typography>
            </Box>
          </Section>

          <Divider sx={{ my: 4, borderColor: '#e2e8f0' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Last updated: {EFFECTIVE_DATE} · {COMPANY_NAME}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                size="small"
                component={Link}
                to="/login"
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                Back to Login
              </Button>
              <Button
                variant="contained"
                size="small"
                component={Link}
                to="/register"
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                Create Account
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
