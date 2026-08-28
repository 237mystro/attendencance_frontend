/** Small helpers for wiring ARIA relationships on form controls. */

/**
 * Picks the right `aria-describedby` target for a field: the error message when
 * there is one, otherwise the hint, otherwise nothing.
 */
export const describedBy = ({ error, hint, hintId, errorId }) => {
  if (error) return errorId;
  if (hint) return hintId;
  return undefined;
};
