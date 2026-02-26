import { useRef, useEffect } from 'react';

/**
 * A hook that returns the value from the previous render.
 * 
 * @param value - The value to track.
 * @returns The value from the previous render, or undefined on the first render.
 * 
 * @example
 * // Detect scroll direction change
 * const [scrollY, setScrollY] = useState(0);
 * const prevScrollY = usePrevious(scrollY);
 * const direction = scrollY > (prevScrollY ?? 0) ? 'down' : 'up';
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}
