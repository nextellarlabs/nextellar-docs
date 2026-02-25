'use client';

import { useEffect, useRef, useState } from 'react';

export interface UseThrottleOptions {
  /** Execute on the leading edge of the interval. Default: true */
  leading?: boolean;
  /** Execute on the trailing edge of the interval. Default: true */
  trailing?: boolean;
}

/**
 * A hook that throttles a rapidly changing value.
 * Useful for optimizing scroll, resize, and mousemove event handlers.
 *
 * @param value The value to throttle
 * @param interval The throttle interval in milliseconds (default: 100)
 * @param options Leading/trailing edge execution options
 * @returns The throttled value
 */
export function useThrottle<T>(
  value: T,
  interval: number = 100,
  options: UseThrottleOptions = {}
): T {
  const { leading = true, trailing = true } = options;

  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValue = useRef<T>(value);

  // Always track the latest incoming value
  latestValue.current = value;

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastExecuted.current;

    const execute = () => {
      lastExecuted.current = Date.now();
      setThrottledValue(latestValue.current);
    };

    // Clear any pending trailing call
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (elapsed >= interval) {
      // Enough time has passed — execute immediately if leading is enabled
      if (leading) {
        execute();
      } else if (trailing) {
        // Leading disabled but trailing enabled: schedule a trailing call
        timeoutRef.current = setTimeout(execute, interval);
      }
    } else if (trailing) {
      // Within the throttle window — schedule trailing execution
      const remaining = interval - elapsed;
      timeoutRef.current = setTimeout(execute, remaining);
    }
  }, [value, interval, leading, trailing]);

  // Cleanup pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return throttledValue;
}
