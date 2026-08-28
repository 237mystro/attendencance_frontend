import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { useToast } from '@/context/toast-context';
import { useApi } from '@/hooks/useApi';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/lib/notifications';
import {
  MIN_PASSWORD_LENGTH,
  changePassword,
  fetchSettings,
  saveSettings,
} from '@/api/settings';

const DEFAULTS = {
  notifications: { email: true, sms: false, push: true },
  preferences: { theme: 'light', language: 'en' },
  security: { twoFactorAuth: false },
};

/**
 * Notification, appearance, and security settings.
 *
 * Local edits overlay the fetched values, so nothing has to be copied into
 * state when the request lands. Saving the theme also applies it immediately,
 * rather than waiting for the next page load.
 */
export function useAccountSettings() {
  const toast = useToast();
  const { setTheme } = useTheme();
  const { patchUser } = useAuth();

  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [permission, setPermission] = useState(getNotificationPermission);

  const query = useApi((signal) => fetchSettings(signal), []);

  // Memoised on the fetched payload and the draft, both stable references, so
  // `save` is not rebuilt on every render by fresh object literals.
  const settings = useMemo(() => {
    const saved = query.data?.data || {};
    return {
      notifications: {
        ...DEFAULTS.notifications,
        ...saved.notifications,
        ...draft.notifications,
      },
      preferences: {
        ...DEFAULTS.preferences,
        ...saved.preferences,
        ...draft.preferences,
      },
      security: { ...DEFAULTS.security, ...saved.security, ...draft.security },
    };
  }, [query.data, draft]);

  const patchGroup = useCallback((group, changes) => {
    setDraft((current) => ({
      ...current,
      [group]: { ...current[group], ...changes },
    }));
  }, []);

  /**
   * Turning push on needs the browser's permission first — flipping the toggle
   * without it would save a preference the device cannot honour.
   */
  const setNotification = useCallback(
    async (field, enabled) => {
      if (field === 'push' && enabled && permission !== 'granted') {
        const result = await requestNotificationPermission();
        setPermission(result);

        if (result !== 'granted') {
          toast.warn(
            'Your browser blocked notifications. Allow them in site settings, then try again.',
          );
          return;
        }
      }
      patchGroup('notifications', { [field]: enabled });
    },
    [permission, patchGroup, toast],
  );

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const data = await saveSettings(settings);
      if (!data?.success) throw new Error(data?.message || 'Failed to save settings.');

      // Apply the theme now, and mirror both groups into the stored user so a
      // reload starts from the same place.
      setTheme(settings.preferences.theme || 'light');
      patchUser({
        preferences: settings.preferences,
        notifications: settings.notifications,
      });

      query.refetch();
      setDraft({});
      toast.success('Settings saved.');
      return true;
    } catch (caught) {
      toast.error(caught?.message || 'Could not save your settings.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings, setTheme, patchUser, query, toast]);

  return {
    settings,
    permission,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    saving,
    setNotification,
    setPreference: (field, value) => patchGroup('preferences', { [field]: value }),
    setSecurity: (field, value) => patchGroup('security', { [field]: value }),
    save,
  };
}

/** Changing the account password. */
export function usePasswordChange() {
  const toast = useToast();
  const [values, setValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const patch = (changes) => {
    setValues((current) => ({ ...current, ...changes }));
    setError('');
  };

  const submit = useCallback(async () => {
    if (!values.currentPassword || !values.newPassword || !values.confirmPassword) {
      setError('Fill in all three password fields.');
      return false;
    }
    if (values.newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return false;
    }
    if (values.newPassword !== values.confirmPassword) {
      setError('The new passwords do not match.');
      return false;
    }
    if (values.newPassword === values.currentPassword) {
      setError('Your new password must be different from the current one.');
      return false;
    }

    setSaving(true);
    try {
      const data = await changePassword(values);
      if (!data?.success) throw new Error(data?.message || 'Failed to change password.');

      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed.');
      return true;
    } catch (caught) {
      setError(caught?.message || 'Could not change your password.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [values, toast]);

  return { values, patch, error, saving, submit };
}
