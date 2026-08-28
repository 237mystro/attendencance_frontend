import { request } from '@/api/client';

/** Account settings, profile, and password. */

export const fetchSettings = (signal) => request('/settings', { signal });

export const saveSettings = (payload) =>
  request('/settings', { method: 'PUT', json: payload });

/**
 * Updates the profile, optionally replacing the avatar.
 *
 * Multipart because of the image, so no `Content-Type` header — the browser
 * sets the boundary itself.
 */
export const saveProfile = ({ avatar, ...fields }) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value ?? ''));
  if (avatar) formData.append('avatar', avatar);

  return request('/settings/profile', { method: 'PUT', body: formData });
};

export const changePassword = ({ currentPassword, newPassword }) =>
  request('/settings/change-password', {
    method: 'PUT',
    json: { currentPassword, newPassword },
  });

/** The signed-in employee's own record, for the extra profile details. */
export const fetchMyEmployeeRecord = (signal) =>
  request('/employees/me', { signal });

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const MIN_PASSWORD_LENGTH = 6;
