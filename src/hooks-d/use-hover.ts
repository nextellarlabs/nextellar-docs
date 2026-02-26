import { useState, useRef, useEffect, useCallback, RefObject } from 'react';

export interface UseHoverOptions {
    /** Optional delay in milliseconds before marking as hovered (prevents accidental triggers). Defaults to 0. */
    delay?: number;
    /** Whether touch device long-press should count as hover. Defaults to true. */
    touchEnabled?: boolean;
    /** Duration in milliseconds for a long press to count as hover on touch devices. Defaults to 500. */
    touchDelay?: number;
}

export interface UseHoverReturn<T extends HTMLElement> {
    /** Ref to attach to the element you want to monitor. */
    ref: RefObject<T | null>;
    /** Whether the element is currently hovered (or long-pressed on touch). */
    isHovered: boolean;
}

/**
 * Hook that detects when a user hovers over an element.
 * Supports optional delay to prevent accidental triggers, touch device long-press
 * as a hover equivalent, and is fully SSR-safe.
 *
 * @param options - Configuration: delay (ms), touchEnabled, touchDelay (ms).
 * @returns `{ ref, isHovered }` — attach `ref` to your element and read `isHovered`.
 *
 * @example
 * const { ref, isHovered } = useHover({ delay: 200 });
 *
 * return <div ref={ref}>{isHovered && <Tooltip />}</div>;
 */
export function useHover<T extends HTMLElement = HTMLElement>(
    options: UseHoverOptions = {}
): UseHoverReturn<T> {
    const { delay = 0, touchEnabled = true, touchDelay = 500 } = options;

    const ref = useRef<T | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Timers stored in refs so they survive re-renders without causing them.
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearHoverTimer = useCallback(() => {
        if (hoverTimerRef.current !== null) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
    }, []);

    const clearTouchTimer = useCallback(() => {
        if (touchTimerRef.current !== null) {
            clearTimeout(touchTimerRef.current);
            touchTimerRef.current = null;
        }
    }, []);

    const handleMouseEnter = useCallback(() => {
        clearHoverTimer();
        if (delay > 0) {
            hoverTimerRef.current = setTimeout(() => setIsHovered(true), delay);
        } else {
            setIsHovered(true);
        }
    }, [delay, clearHoverTimer]);

    const handleMouseLeave = useCallback(() => {
        clearHoverTimer();
        setIsHovered(false);
    }, [clearHoverTimer]);

    const handleTouchStart = useCallback(() => {
        if (!touchEnabled) return;
        clearTouchTimer();
        touchTimerRef.current = setTimeout(() => setIsHovered(true), touchDelay);
    }, [touchEnabled, touchDelay, clearTouchTimer]);

    const handleTouchEnd = useCallback(() => {
        clearTouchTimer();
        setIsHovered(false);
    }, [clearTouchTimer]);

    useEffect(() => {
        // SSR guard — do nothing if window is not available.
        if (typeof window === 'undefined') return;

        const element = ref.current;
        if (!element) return;

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        if (touchEnabled) {
            element.addEventListener('touchstart', handleTouchStart);
            element.addEventListener('touchend', handleTouchEnd);
            element.addEventListener('touchcancel', handleTouchEnd);
        }

        return () => {
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('touchcancel', handleTouchEnd);
            clearHoverTimer();
            clearTouchTimer();
        };
    }, [
        handleMouseEnter,
        handleMouseLeave,
        handleTouchStart,
        handleTouchEnd,
        touchEnabled,
        clearHoverTimer,
        clearTouchTimer,
    ]);

    return { ref, isHovered };
}
