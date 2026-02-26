import { useEffect, useRef } from 'react';

export interface UseIntervalOptions {
    /**
     * Whether the callback should be executed immediately on mount or when the delay changes.
     * Defaults to false.
     */
    immediate?: boolean;
}

/**
 * A declarative hook that sets up an interval timer.
 * 
 * @param callback - The function to execute at each interval.
 * @param delay - The delay in milliseconds. Pass `null` to pause the interval.
 * @param options - Configuration options (immediate).
 * 
 * @example
 * // Poll every 5 seconds
 * useInterval(() => {
 *   fetchLatestData();
 * }, 5000);
 * 
 * @example
 * // Pause when inactive
 * useInterval(callback, isActive ? 1000 : null);
 */
export function useInterval(
    callback: () => void,
    delay: number | null,
    options: UseIntervalOptions = {}
): void {
    const { immediate = false } = options;
    const savedCallback = useRef(callback);

    // Remember the latest callback if it changes.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        if (delay === null) return;

        if (immediate) {
            savedCallback.current();
        }

        const id = setInterval(() => {
            savedCallback.current();
        }, delay);

        return () => clearInterval(id);
    }, [delay, immediate]);
}
