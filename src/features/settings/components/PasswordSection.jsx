import { KeyRound } from 'lucide-react';

import { Alert, Button, Panel } from '@/components/ui';
import { PasswordInput } from '@/features/auth/components/PasswordInput';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { usePasswordChange } from '../hooks/useAccountSettings';

/**
 * Changing the account password.
 *
 * Reuses the auth screens' password field and strength meter, so the rules and
 * the feedback are identical wherever a password is set.
 */
export function PasswordSection({ standalone = false }) {
  const password = usePasswordChange();

  return (
    <Panel
      title="Change password"
      subtitle={
        standalone
          ? 'Choose a new password for your account.'
          : 'You will stay signed in on this device.'
      }
      interactive={false}
    >
      <form
        noValidate
        className="flex max-w-md flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          password.submit();
        }}
      >
        {password.error && <Alert tone="danger">{password.error}</Alert>}

        <PasswordInput
          label="Current password"
          autoComplete="current-password"
          value={password.values.currentPassword}
          onChange={(event) => password.patch({ currentPassword: event.target.value })}
        />

        <div>
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            value={password.values.newPassword}
            onChange={(event) => password.patch({ newPassword: event.target.value })}
          />
          <PasswordStrength password={password.values.newPassword} />
        </div>

        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          showLockIcon={false}
          value={password.values.confirmPassword}
          onChange={(event) => password.patch({ confirmPassword: event.target.value })}
        />

        <Button
          type="submit"
          className="self-start"
          loading={password.saving}
          startIcon={<KeyRound aria-hidden="true" className="size-4" />}
        >
          Change password
        </Button>
      </form>
    </Panel>
  );
}
