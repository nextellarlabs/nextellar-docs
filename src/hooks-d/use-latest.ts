import { useRef, useEffect, MutableRefObject } from 'react';

/**
 * Returns a stable ref whose `.current` property always holds the most recent
 * value. The ref object identity never changes between renders, but its
 * `.current` is updated synchronously after every render.
 *
 * This solves stale-closure problems in callbacks, `setInterval` / `setTimeout`
 * handlers, and event listeners without introducing extra `useEffect`
 * dependencies or triggering unnecessary re-renders.
 *
 * @param value - The value to track. Any type is accepted via the generic `T`.
 * @returns A `MutableRefObject<T>` whose `.current` is always up-to-date.
 *
 * @example
 * const countRef = useLatest(count);
 *
 * useInterval(() => {
 *   console.log(countRef.current); // Always the latest count, no stale closure
 * }, 1000);
 *
 * @example
 * // Access latest prop value inside an event handler without re-subscribing
 * const onChangeRef = useLatest(onChange);
 * useEffect(() => {
 *   window.addEventListener('resize', () => onChangeRef.current());
 * }, []); // empty deps — handler is always fresh via the ref
 */
export function useLatest<T>(value: T): MutableRefObject<T> {
    const ref = useRef<T>(value);

    // Keep ref.current in sync after every render.
    // We do this in useEffect (not inline) so the update is synchronous
    // after the render phase but before any effects that read it.
    useEffect(() => {
        ref.current = value;
    });

    return ref;
}
