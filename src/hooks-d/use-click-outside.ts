import { RefObject, useEffect, useCallback } from 'react';

export interface UseClickOutsideOptions {
    /** Whether the listener is active. Defaults to true. */
    enabled?: boolean;
    /** Refs that should be excluded from "outside" detection. */
    excludeRefs?: RefObject<HTMLElement | null>[];
}

/**
 * Hook that detects clicks or touches outside a referenced element or elements.
 * 
 * @param refs - A single ref or an array of refs to the elements to monitor.
 * @param handler - Callback function to trigger when an outside click occurs.
 * @param options - Configuration options (enabled, excludeRefs).
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    refs: RefObject<T | null> | RefObject<T | null>[],
    handler: (event: MouseEvent | TouchEvent) => void,
    options: UseClickOutsideOptions = {}
): void {
    const { enabled = true, excludeRefs = [] } = options;

    const listener = useCallback(
        (event: MouseEvent | TouchEvent) => {
            if (!enabled) return;

            const target = event.target as HTMLElement;

            // Check if click is on any of the main refs
            const targetRefs = (Array.isArray(refs) ? refs : [refs]) as RefObject<HTMLElement | null>[];
            const isInsideMain = targetRefs.some((ref) => {
                return ref.current && ref.current.contains(target);
            });

            if (isInsideMain) return;

            // Check if click is on any of the excluded refs
            const isInsideExcluded = excludeRefs.some((ref) => {
                return ref.current && ref.current.contains(target);
            });

            if (isInsideExcluded) return;

            handler(event);
        },
        [refs, handler, enabled, excludeRefs]
    );

    useEffect(() => {
        if (!enabled) return;

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [enabled, listener]);
}
