import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_COUNTRY_CODE, normalizeNationalNumber } from '@/constants/countries';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { MAX_AVATAR_BYTES, saveProfile } from '@/api/settings';
import { formatFileSize } from '@/lib/formatters';

/**
 * The profile fields and avatar, shared by the settings screen and the profile
 * page — both write the same record through the same endpoint.
 *
 * Seeded from the signed-in user rather than a fetch: the session already
 * holds these values, so there is nothing to wait for.
 */
export function useProfileForm() {
  const { currentUser, setSession, patchUser } = useAuth();
  const toast = useToast();

  const countryCode = currentUser?.countryCode || DEFAULT_COUNTRY_CODE;

  const [values, setValues] = useState(() => ({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    countryCode,
    phone: normalizeNationalNumber(currentUser?.phone || '', countryCode),
    momoNumber: normalizeNationalNumber(currentUser?.momoNumber || '', countryCode),
    position: currentUser?.position || '',
  }));

  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // A blob URL for the chosen file, falling back to the stored avatar.
  const avatarPreview = useMemo(
    () => (avatar ? URL.createObjectURL(avatar) : currentUser?.avatarUrl || ''),
    [avatar, currentUser?.avatarUrl],
  );

  // Blob URLs leak until revoked, so release the previous one on change.
  useEffect(
    () => () => {
      if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview],
  );

  const patch = useCallback((changes) => {
    setValues((current) => ({ ...current, ...changes }));
    setError('');
  }, []);

  /** Switching country re-normalises both numbers against the new rules. */
  const setCountry = useCallback((code) => {
    setValues((current) => ({
      ...current,
      countryCode: code,
      phone: normalizeNationalNumber(current.phone, code),
      momoNumber: normalizeNationalNumber(current.momoNumber, code),
    }));
  }, []);

  const setPhoneField = useCallback(
    (field, value) =>
      setValues((current) => ({
        ...current,
        [field]: normalizeNationalNumber(value, current.countryCode),
      })),
    [],
  );

  const chooseAvatar = useCallback((file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for your profile picture.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError(
        `That image is ${formatFileSize(file.size)} — the limit is ${formatFileSize(MAX_AVATAR_BYTES)}.`,
      );
      return;
    }

    setError('');
    setAvatar(file);
  }, []);

  const save = useCallback(async () => {
    if (!values.name.trim()) {
      setError('Your name is required.');
      return false;
    }

    setSaving(true);
    setError('');
    try {
      const data = await saveProfile({ ...values, avatar });
      if (!data?.success) throw new Error(data?.message || 'Failed to update profile.');

      // The server returns the canonical user; adopt it wholesale so the avatar
      // URL and anything else it normalised are reflected everywhere.
      if (data.data?.user) {
        patchUser(data.data.user);
      }
      setAvatar(null);
      toast.success('Profile updated.');
      return true;
    } catch (caught) {
      setError(caught?.message || 'Could not update your profile.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [values, avatar, patchUser, toast]);

  return {
    values,
    avatarPreview,
    hasNewAvatar: Boolean(avatar),
    error,
    saving,
    patch,
    setCountry,
    setPhoneField,
    chooseAvatar,
    save,
    // Exposed so a caller can drop an updated session in without a round trip.
    setSession,
  };
}
