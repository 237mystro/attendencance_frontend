import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Wraps a mutating call (POST/PUT/PATCH/DELETE) with submitting and error
 * state. Every form in the app uses this for its disabled-while-submitting
 * behaviour, so no screen has to track that by hand.
 *
 * Resolves to `{ ok, data }` or `{ ok: false, error }` rather than throwing,
 * so callers can branch without a try/catch around every click handler.
 */
export function useMutation(mutator, { onSuccess, onError } = {}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const mutate = useCallback(
    async (...args) => {
      setSubmitting(true);
      setError(null);

      try {
        const result = await mutator(...args);
        if (mounted.current) setSubmitting(false);
        onSuccess?.(result, ...args);
        return { ok: true, data: result };
      } catch (caught) {
        const message = caught?.message || 'Something went wrong. Please try again.';
        if (mounted.current) {
          setError(message);
          setSubmitting(false);
        }
        onError?.(caught);
        return { ok: false, error: message };
      }
    },
    [mutator, onSuccess, onError],
  );

  return { mutate, submitting, error, setError };
}
