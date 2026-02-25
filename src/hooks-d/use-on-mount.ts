'use client';

import { useEffect } from 'react';

/**
 * Runs a callback exactly once when the component mounts.
 * Semantic alternative to `useEffect(() => { ... }, [])`.
 *
 * @param callback - Function to run on mount. May return a cleanup function (same as useEffect).
 *
 * @example
 * useOnMount(() => {
 *   fetchInitialData();
 * });
 */
export function useOnMount(callback: () => void | (() => void)): void {
  useEffect(() => {
    return callback();
    // Intentionally empty: run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
