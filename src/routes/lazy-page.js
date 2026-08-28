import { lazy } from 'react';

/**
 * Wraps a dynamic import of a named page export for `React.lazy`.
 *
 * `lazy` expects a module whose default export is the component, but the pages
 * are named exports so that editors can find them and Fast Refresh works. This
 * adapts one to the other in a single place.
 *
 * @param {() => Promise<Record<string, import('react').ComponentType>>} loader
 * @param {string} exportName
 */
export const lazyPage = (loader, exportName) =>
  lazy(async () => {
    const module = await loader();
    return { default: module[exportName] };
  });
