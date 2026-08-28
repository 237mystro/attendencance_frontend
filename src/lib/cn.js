/**
 * Joins class names, dropping falsy values.
 *
 * Deliberately not `tailwind-merge` — the primitives in `components/ui` are
 * written so that a caller's `className` always lands last in the string, which
 * is enough for the overrides this app needs.
 */
export const cn = (...classes) => classes.filter(Boolean).join(' ');
