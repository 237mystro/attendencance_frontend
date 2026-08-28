import { Mail, Pencil, Phone, Wallet, X } from 'lucide-react';
import { useState } from 'react';

import { Avatar, Badge, Button, PageWrapper, Panel } from '@/components/ui';
import { ROLES, ROLE_LABELS } from '@/constants/roles';
import { getCountryConfig } from '@/constants/countries';
import { useAuth } from '@/context/auth-context';
import { useApi } from '@/hooks/useApi';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { fetchMyEmployeeRecord } from '@/api/settings';
import { ProfileSection } from '../components/ProfileSection';
import { useProfileForm } from '../hooks/useProfileForm';

/** One labelled fact about the person. */
function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted dark:text-muted-soft">{label}</p>
        <p className="truncate font-semibold text-ink dark:text-ink-dark">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

/**
 * The signed-in person's own profile.
 *
 * Read-only until "Edit" is pressed, which swaps in the same form the settings
 * screen uses — so there is one place the profile is edited, not two.
 */
export function ProfilePage() {
  const { currentUser } = useAuth();
  const profile = useProfileForm();
  const [editing, setEditing] = useState(false);

  const isEmployee = currentUser?.role === ROLES.EMPLOYEE;

  // Employees have a payroll record with details the session does not carry.
  const employeeQuery = useApi((signal) => fetchMyEmployeeRecord(signal), [], {
    enabled: isEmployee,
  });
  const employee = employeeQuery.data?.employee || employeeQuery.data?.data;

  const country = getCountryConfig(currentUser?.countryCode);

  if (editing) {
    return (
      <PageWrapper className="max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
            Edit profile
          </h2>
          <Button
            variant="secondary"
            startIcon={<X aria-hidden="true" className="size-4" />}
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>

        <ProfileSection
          profile={{
            ...profile,
            save: async () => {
              const saved = await profile.save();
              if (saved) setEditing(false);
              return saved;
            },
          }}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="max-w-3xl">
      <div className="surface-hero mb-5 flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <Avatar src={currentUser?.avatarUrl} name={currentUser?.name} size="xl" />

        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-extrabold tracking-tight">
            {currentUser?.name}
          </h2>
          <p className="mt-0.5 text-white/80">
            {currentUser?.position || ROLE_LABELS[currentUser?.role] || 'Team member'}
          </p>
          <span className="mt-2 inline-flex rounded-lg border border-white/15 bg-white/12 px-2.5 py-1 text-xs font-bold">
            {ROLE_LABELS[currentUser?.role] || currentUser?.role}
          </span>
        </div>

        <Button
          variant="secondary"
          className="shrink-0 border-white/20 bg-white/15 text-white hover:bg-white/25"
          startIcon={<Pencil aria-hidden="true" className="size-4" />}
          onClick={() => setEditing(true)}
        >
          Edit profile
        </Button>
      </div>

      <div className="flex flex-col gap-5">
        <Panel title="Contact" interactive={false}>
          <div className="divide-y divide-line dark:divide-line-dark">
            <Detail icon={Mail} label="Email" value={currentUser?.email} />
            <Detail
              icon={Phone}
              label="Phone"
              value={currentUser?.phone && `${country.dialCode} ${currentUser.phone}`}
            />
            <Detail
              icon={Wallet}
              label="Mobile money"
              value={
                currentUser?.momoNumber && `${country.dialCode} ${currentUser.momoNumber}`
              }
            />
          </div>
        </Panel>

        {isEmployee && employee && (
          <Panel
            title="Employment"
            subtitle="From your payroll record. Contact HR if anything is wrong."
            interactive={false}
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ['Department', employee.department || '—'],
                ['Position', employee.position || '—'],
                ['Monthly salary', formatCurrency(employee.salary, country.currency)],
                ['Pay per shift', formatCurrency(employee.payPerShift, country.currency)],
                ['Joined', formatDate(employee.createdAt)],
                ['Branch', employee.branchId?.name || 'Head office'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted dark:text-muted-soft">{label}</dt>
                  <dd className="font-semibold text-ink dark:text-ink-dark">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        )}

        <Panel title="Account" interactive={false}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{ROLE_LABELS[currentUser?.role] || currentUser?.role}</Badge>
            {currentUser?.company && <Badge tone="neutral">{currentUser.company}</Badge>}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted dark:text-muted-soft">
            Notification, appearance, and password settings live on the Settings
            screen.
          </p>
        </Panel>
      </div>
    </PageWrapper>
  );
}
