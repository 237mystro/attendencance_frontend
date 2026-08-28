import {
  ErrorState,
  LoadingState,
  PageHero,
  PageWrapper,
} from '@/components/ui';
import { PasswordSection } from '../components/PasswordSection';
import {
  AppearanceSection,
  NotificationSection,
  SecuritySection,
} from '../components/PreferenceSections';
import { ProfileSection } from '../components/ProfileSection';
import { useAccountSettings } from '../hooks/useAccountSettings';
import { useProfileForm } from '../hooks/useProfileForm';

/** Everything about this account, in one place. */
export function SettingsPage() {
  const profile = useProfileForm();
  const settings = useAccountSettings();

  return (
    <PageWrapper className="max-w-3xl">
      <PageHero
        eyebrow="Settings"
        title="Manage your account"
        subtitle="Update your profile, notification preferences, appearance, and security."
      />

      <div className="flex flex-col gap-5">
        {/* The profile section is seeded from the session, so it renders even
            while the preference request is still in flight. */}
        <ProfileSection profile={profile} />

        {settings.loading ? (
          <LoadingState label="Loading your preferences…" />
        ) : settings.error ? (
          <ErrorState message={settings.error} onRetry={settings.refetch} />
        ) : (
          <>
            <NotificationSection settings={settings} />
            <AppearanceSection settings={settings} />
            <SecuritySection settings={settings} />
          </>
        )}

        <PasswordSection />
      </div>
    </PageWrapper>
  );
}
