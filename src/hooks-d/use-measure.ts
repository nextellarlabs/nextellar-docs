'use client';

import { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react';

export interface UseMeasureOptions {
    /**
     * Optional debounce delay in milliseconds to limit the frequency of dimension updates.
     */
    debounce?: number;
}

export interface RectReadOnly {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
}

const defaultBounds: RectReadOnly = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};

/**
 * A hook that tracks the dimensions and position of an element using ResizeObserver.
 * SSR-safe: Returns default (0) bounds during server rendering.
 *
 * @param options Configuration for the measure hook (e.g. debounce)
 * @returns An object containing the ref to attach to the element and the current bounds.
 */
export function useMeasure<T extends HTMLElement = any>(options: UseMeasureOptions = {}) {
    const { debounce } = options;
    const [bounds, setBounds] = useState<RectReadOnly>(defaultBounds);
    const ref = useRef<T>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Use useLayoutEffect to measure before paint if possible, 
    // falling back to useEffect for SSR environments.
    const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

    useIsomorphicLayoutEffect(() => {
        if (!ref.current) return;

        const observer = new ResizeObserver(([entry]) => {
            if (!entry) return;

            const update = () => {
                const { x, y, width, height, top, right, bottom, left } = entry.target.getBoundingClientRect();
                setBounds({ x, y, width, height, top, right, bottom, left });
            };

            if (debounce && debounce > 0) {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(update, debounce);
            } else {
                update();
            }
        });

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [debounce]);

    return { ref, bounds };
}
