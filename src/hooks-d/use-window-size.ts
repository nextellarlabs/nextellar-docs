'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tailwind default breakpoints (match tailwind.config.js).
 * Used for isMobile / isTablet / isDesktop helpers.
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export interface UseWindowSizeOptions {
  /** Throttle interval for resize events in ms. Default: 100 */
  throttle?: number;
  /** If set, use debounce instead of throttle for resize (e.g. for expensive recalculations). */
  debounce?: number;
}

export interface UseWindowSizeReturn {
  /** Window inner width, or undefined during SSR */
  width: number | undefined;
  /** Window inner height, or undefined during SSR */
  height: number | undefined;
  /** true when width < 640px (Tailwind sm), undefined during SSR */
  isMobile: boolean | undefined;
  /** true when 640px <= width < 1024px (sm to lg), undefined during SSR */
  isTablet: boolean | undefined;
  /** true when width >= 1024px (Tailwind lg), undefined during SSR */
  isDesktop: boolean | undefined;
}

function getSize(): { width: number; height: number } | undefined {
  if (typeof window === 'undefined') return undefined;
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function getBreakpointHelpers(width: number | undefined): Pick<UseWindowSizeReturn, 'isMobile' | 'isTablet' | 'isDesktop'> {
  if (width === undefined) {
    return { isMobile: undefined, isTablet: undefined, isDesktop: undefined };
  }
  return {
    isMobile: width < BREAKPOINTS.sm,
    isTablet: width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
  };
}

/**
 * Tracks window dimensions and exposes width/height plus breakpoint helpers for
 * responsive logic that can't be handled with CSS alone.
 *
 * SSR-safe: width, height, and breakpoint helpers are undefined during server render
 * to avoid hydration mismatch in Next.js.
 *
 * @param options.throttle - Throttle interval for resize events (default 100ms).
 * @param options.debounce - If set, debounce resize updates instead of throttling.
 * @returns { width, height, isMobile, isTablet, isDesktop }
 *
 * @example
 * // Conditionally render mobile vs desktop navigation
 * function Nav() {
 *   const { isMobile, isDesktop } = useWindowSize({ throttle: 100 });
 *   if (isMobile) return <MobileNav />;
 *   if (isDesktop) return <DesktopNav />;
 *   return <TabletNav />;
 * }
 */
export function useWindowSize(options: UseWindowSizeOptions = {}): UseWindowSizeReturn {
  const { throttle = 100, debounce: debounceMs } = options;

  // SSR-safe: undefined on server and on first client paint to avoid hydration mismatch
  const [size, setSize] = useState<{ width: number; height: number } | undefined>(() => undefined);
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const updateSize = useCallback(() => {
    const next = getSize();
    if (next) setSize(next);
  }, []);

  const scheduleUpdate = useCallback(() => {
    if (debounceMs !== undefined) {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(updateSize, debounceMs);
      return;
    }
    const now = Date.now();
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (now - lastRun.current >= throttle) {
      lastRun.current = now;
      updateSize();
    } else {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const now2 = Date.now();
        if (now2 - lastRun.current >= throttle) {
          lastRun.current = now2;
          updateSize();
        }
      });
    }
  }, [throttle, debounceMs, updateSize]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSize(getSize());
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('resize', scheduleUpdate);
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [scheduleUpdate]);

  const { isMobile, isTablet, isDesktop } = getBreakpointHelpers(size?.width);

  return {
    width: size?.width,
    height: size?.height,
    isMobile,
    isTablet,
    isDesktop,
  };
}
