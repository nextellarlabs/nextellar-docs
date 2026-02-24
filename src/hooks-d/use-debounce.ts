'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * A hook that debounces a value.
 * Useful for optimizing search inputs or any other fast-changing values.
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 300)
 * @param immediate Whether to update the value immediately on the first change
 * @returns The debounced value
 */
export function useDebounce<T>(
  value: T,
  delay: number = 300,
  immediate: boolean = false
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const isFirstUpdate = useRef(true);

  useEffect(() => {
    // If immediate is true and it's the first value change (from initial), update immediately
    if (immediate && isFirstUpdate.current && value !== debouncedValue) {
      setDebouncedValue(value);
      isFirstUpdate.current = false;
      return;
    }

    // Update isFirstUpdate even if immediate is false, so we track that at least one update happened
    if (value !== debouncedValue) {
      isFirstUpdate.current = false;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup on unmount or whenever value/delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, immediate, debouncedValue]);

  return debouncedValue;
}
