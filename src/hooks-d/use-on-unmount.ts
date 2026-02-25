'use client';

import { useEffect, useRef } from 'react';

/**
 * Runs a callback when the component unmounts.
 * Semantic alternative to `useEffect(() => () => { cleanup(); }, [])`.
 * Uses a ref to always run the latest callback on unmount (avoids stale closures).
 *
 * @param callback - Function to run on unmount (cleanup).
 *
 * @example
 * useOnUnmount(() => {
 *   saveState();
 *   cleanup();
 * });
 */
export function useOnUnmount(callback: () => void): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return () => {
      callbackRef.current();
    };
    // Intentionally empty: cleanup runs only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
