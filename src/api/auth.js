import { request } from '@/api/client';

/** Every `/auth` call the app makes, in one place. */

/** Creates a business workspace and returns `{ token, user }`. */
export const registerBusiness = (payload) =>
  request('/auth/register-business', {
    method: 'POST',
    auth: false,
    json: payload,
  });

/**
 * Requests a password-reset code by email.
 *
 * The server deliberately answers the same way whether or not the address
 * exists, so the response must never be used to confirm an account.
 */
export const requestPasswordReset = (email) =>
  request('/auth/forgot-password', {
    method: 'POST',
    auth: false,
    json: { email: email.trim().toLowerCase() },
  });

/** Completes the reset with the emailed one-time code. */
export const resetPassword = ({ email, otp, password }) =>
  request('/auth/reset-password', {
    method: 'POST',
    auth: false,
    json: { email: email.trim().toLowerCase(), otp: otp.trim(), password },
  });
