import { renderHook } from '@testing-library/react';
import { usePrevious } from './use-previous';
import { describe, it, expect } from 'vitest';

describe('usePrevious', () => {
    it('returns undefined on initial render', () => {
        const { result } = renderHook(() => usePrevious(0));
        expect(result.current).toBeUndefined();
    });

    it('returns the previous value after update', () => {
        const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
            initialProps: { value: 0 },
        });

        expect(result.current).toBeUndefined();

        rerender({ value: 1 });
        expect(result.current).toBe(0);

        rerender({ value: 2 });
        expect(result.current).toBe(1);

        rerender({ value: 3 });
        expect(result.current).toBe(2);
    });

    it('works with strings', () => {
        const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
            initialProps: { value: 'first' },
        });

        expect(result.current).toBeUndefined();

        rerender({ value: 'second' });
        expect(result.current).toBe('first');

        rerender({ value: 'third' });
        expect(result.current).toBe('second');
    });

    it('works with objects', () => {
        const obj1 = { id: 1 };
        const obj2 = { id: 2 };
        const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
            initialProps: { value: obj1 },
        });

        expect(result.current).toBeUndefined();

        rerender({ value: obj2 });
        expect(result.current).toBe(obj1);
    });

    it('preserves types correctly', () => {
        const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
            initialProps: { value: 0 as number },
        });

        // Verification of type safety is implicit here via TS
        rerender({ value: 5 });
        expect(typeof result.current).toBe('number');
    });
});
