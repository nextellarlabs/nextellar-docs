'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseIdleOptions {
  /** Events that reset the idle timer */
  events?: Array<keyof WindowEventMap>;
  /** Initial idle state. Default: false */
  initialState?: boolean;
}

const DEFAULT_EVENTS: Array<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
];

/**
 * Detects user inactivity. Returns true when no activity occurs within timeout.
 */
export function useIdle(
  timeout: number = 60000,
  options: UseIdleOptions = {}
): boolean {
  const { events = DEFAULT_EVENTS, initialState = false } = options;

  const [idle, setIdle] = useState(initialState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    setIdle((prev) => (prev ? false : prev));
    timerRef.current = setTimeout(() => {
      setIdle(true);
    }, timeout);
  }, [timeout]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = () => resetTimer();
    resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handler, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handler);
      });
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [events, resetTimer]);

  return idle;
}
