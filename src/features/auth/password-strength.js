/**
 * Scores a password out of five on length and character variety.
 * Identical scoring to the source, so the meter reads the same.
 */
export const scorePassword = (password) => {
  if (!password) return { percent: 0, label: '', tone: null };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const percent = (score / 5) * 100;

  if (score <= 1) return { percent, label: 'Weak', tone: 'weak' };
  if (score <= 2) return { percent, label: 'Fair', tone: 'fair' };
  if (score <= 3) return { percent, label: 'Good', tone: 'good' };
  return { percent, label: 'Strong', tone: 'strong' };
};
