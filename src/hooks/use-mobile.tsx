import { useMediaQuery } from '@/hooks-d/use-media-query';

/**
 * Returns whether the viewport is at mobile width (< 768px).
 * Uses `useMediaQuery` internally for efficient, SSR-safe media query listening.
 */
export function useIsMobile(): boolean {
  const matches = useMediaQuery('(max-width: 767.98px)');
  return matches ?? false;
}
