'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * A hook that subscribes to a CSS media query and returns whether it matches.
 * SSR-safe: returns `undefined` during server render to avoid hydration mismatches.
 *
 * @param query The CSS media query string (e.g., '(max-width: 768px)')
 * @returns `true` if the query matches, `false` if not, `undefined` during SSR
 */
export function useMediaQuery(query: string): boolean | undefined {
  const [matches, setMatches] = useState<boolean | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    return window.matchMedia(query).matches;
  });

  const handleChange = useCallback((event: MediaQueryListEvent) => {
    setMatches(event.matches);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [query, handleChange]);

  return matches;
}
