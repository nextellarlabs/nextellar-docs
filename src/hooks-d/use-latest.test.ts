import { renderHook, act } from '@testing-library/react';
import { useLatest } from './use-latest';
import { describe, it, expect } from 'vitest';

describe('useLatest', () => {
    it('returns a ref whose current equals the initial value', () => {
        const { result } = renderHook(() => useLatest(42));
        expect(result.current.current).toBe(42);
    });

    it('ref.current is always the latest value after re-renders', () => {
        const { result, rerender } = renderHook(({ value }) => useLatest(value), {
            initialProps: { value: 1 },
        });

        expect(result.current.current).toBe(1);

        rerender({ value: 2 });
        expect(result.current.current).toBe(2);

        rerender({ value: 3 });
        expect(result.current.current).toBe(3);
    });

    it('returns the same ref object (stable identity) across re-renders', () => {
        const { result, rerender } = renderHook(({ value }) => useLatest(value), {
            initialProps: { value: 'hello' },
        });

        const firstRef = result.current;

        rerender({ value: 'world' });

        // The ref object identity must be the same
        expect(result.current).toBe(firstRef);
        // But .current should have updated
        expect(result.current.current).toBe('world');
    });

    it('works with object values', () => {
        const obj1 = { id: 1 };
        const obj2 = { id: 2 };

        const { result, rerender } = renderHook(({ value }) => useLatest(value), {
            initialProps: { value: obj1 },
        });

        expect(result.current.current).toBe(obj1);

        rerender({ value: obj2 });
        expect(result.current.current).toBe(obj2);
    });

    it('works with function values (stale closure prevention)', () => {
        let closureValue = 0;
        const getLatest = () => closureValue;

        const { result, rerender } = renderHook(({ fn }) => useLatest(fn), {
            initialProps: { fn: getLatest },
        });

        // Simulate a new closure capturing a new value
        closureValue = 99;
        const newFn = () => closureValue;

        rerender({ fn: newFn });

        // The ref now points to the latest function
        expect(result.current.current()).toBe(99);
    });

    it('preserves TypeScript generic types', () => {
        const { result } = renderHook(() => useLatest<string>('typed'));
        // TS compile-time check — .current should be typed as string
        const val: string = result.current.current;
        expect(typeof val).toBe('string');
    });

    it('works with null/undefined values', () => {
        const { result, rerender } = renderHook(({ value }) => useLatest(value), {
            initialProps: { value: null as string | null },
        });

        expect(result.current.current).toBeNull();

        rerender({ value: 'present' });
        expect(result.current.current).toBe('present');

        rerender({ value: null });
        expect(result.current.current).toBeNull();
    });

    it('demonstrates stale closure prevention in interval scenario', () => {
        let intervalCallback: (() => void) | null = null;

        const { result, rerender } = renderHook(({ count }) => {
            const countRef = useLatest(count);
            // Simulate what useInterval does — captures the ref, not the value
            intervalCallback = () => countRef.current;
            return countRef;
        }, {
            initialProps: { count: 0 },
        });

        // Simulated interval fires — should read 0
        expect(intervalCallback?.()).toBe(0);

        // State updates but interval callback stays the same reference
        rerender({ count: 10 });

        act(() => { });

        // Same callback, but now reads 10 — no stale closure
        expect(intervalCallback?.()).toBe(10);
    });
});
