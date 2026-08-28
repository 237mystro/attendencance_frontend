/**
 * Deterministic avatar colours — the same person keeps the same colour on every
 * screen and across sessions, which the original app achieved the same way.
 */
const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-green-600',
  'bg-red-600',
  'bg-orange-600',
  'bg-purple-600',
  'bg-sky-600',
  'bg-pink-600',
  'bg-teal-600',
];

export const avatarColor = (name) =>
  AVATAR_COLORS[(String(name || '').charCodeAt(0) || 0) % AVATAR_COLORS.length];
