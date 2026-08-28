import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async fetcher and tracks its loading / error / data states.
 *
 * This is the hook that keeps data fetching out of components: a screen calls
 * `useApi((signal) => api.get('/employees', { signal }))` and renders, rather
 * than juggling three `useState` calls of its own. In-flight requests are
 * aborted on unmount and superseded by later ones, so a fast re-filter cannot
 * land stale results.
 *
 * @param {(signal: AbortSignal) => Promise<T>} fetcher
 * @param {unknown[]} deps      Re-runs when these change.
 * @param {object} [options]
 * @param {boolean} [options.enabled=true]  Skip the call when false.
 * @param {T} [options.initialData]
 */
export function useApi(fetcher, deps = [], options = {}) {
  const { enabled = true, initialData = null } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  // Keep the latest fetcher in a ref, updated in an effect, so an inline arrow
  // function does not retrigger the request on every render.
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const requestId = useRef(0);
  const controllerRef = useRef(null);

  const run = useCallback(async () => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    const id = requestId.current + 1;
    requestId.current = id;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current(controller.signal);
      if (id !== requestId.current) return;
      setData(result);
    } catch (caught) {
      if (caught?.name === 'AbortError' || id !== requestId.current) return;
      setError(caught?.message || 'Something went wrong. Please try again.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    // `run` flips `loading` before awaiting, which `set-state-in-effect` flags.
    // Fetch-on-mount is the whole point of this hook and there is no data
    // library in the stack to move it into, so the rule is scoped off here
    // rather than app-wide — this is the one place the pattern lives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run();
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, run, ...deps]);

  return {
    data,
    // Derived rather than reset in an effect: a disabled query is never
    // "loading", whatever the last run left behind.
    loading: enabled ? loading : false,
    error: enabled ? error : null,
    refetch: run,
    setData,
  };
}
