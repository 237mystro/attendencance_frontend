import { Save } from 'lucide-react';

import { Alert, Button, Panel, Select, Toggle } from '@/components/ui';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
];

/** Which channels reach this person. */
export function NotificationSection({ settings }) {
  const { notifications } = settings.settings;
  const blocked = settings.permission === 'denied';

  return (
    <Panel
      title="Notifications"
      subtitle="Choose how the app reaches you about messages, shifts, and approvals."
      interactive={false}
    >
      <div className="flex flex-col gap-1">
        <Toggle
          label="Email"
          description="Announcements, approvals, and payroll notices."
          checked={notifications.email}
          onChange={(event) => settings.setNotification('email', event.target.checked)}
        />
        <Toggle
          label="SMS"
          description="Only for time-critical alerts."
          checked={notifications.sms}
          onChange={(event) => settings.setNotification('sms', event.target.checked)}
        />
        <Toggle
          label="Device notifications"
          description="Push alerts on this device, even when the app is closed."
          checked={notifications.push}
          disabled={blocked}
          onChange={(event) => settings.setNotification('push', event.target.checked)}
        />
      </div>

      {blocked && (
        <Alert tone="warn" className="mt-3">
          Your browser is blocking notifications for this site. Allow them in your
          browser&rsquo;s site settings, then reload.
        </Alert>
      )}
    </Panel>
  );
}

/** Theme and language. */
export function AppearanceSection({ settings }) {
  const { preferences } = settings.settings;

  return (
    <Panel
      title="Appearance"
      subtitle="Applied as soon as you save, and remembered on this device."
      interactive={false}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Theme"
          options={THEME_OPTIONS}
          value={preferences.theme}
          onChange={(event) => settings.setPreference('theme', event.target.value)}
        />
        <Select
          label="Language"
          options={LANGUAGE_OPTIONS}
          value={preferences.language}
          onChange={(event) => settings.setPreference('language', event.target.value)}
          hint="More languages are on the way."
        />
      </div>
    </Panel>
  );
}

/** Account security options, and the button that commits all settings. */
export function SecuritySection({ settings }) {
  const { security } = settings.settings;

  return (
    <Panel
      title="Security"
      subtitle="Extra protection for your account."
      interactive={false}
    >
      <Toggle
        label="Two-factor authentication"
        description="Ask for a second factor when signing in from a new device."
        checked={security.twoFactorAuth}
        onChange={(event) => settings.setSecurity('twoFactorAuth', event.target.checked)}
      />

      <Button
        className="mt-5"
        loading={settings.saving}
        startIcon={<Save aria-hidden="true" className="size-4" />}
        onClick={settings.save}
      >
        Save preferences
      </Button>
    </Panel>
  );
}
