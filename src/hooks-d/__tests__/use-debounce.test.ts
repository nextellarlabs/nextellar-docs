import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../use-debounce';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return initial value', () => {
        const { result } = renderHook(() => useDebounce('test', 300));
        expect(result.current).toBe('test');
    });

    it('should debounce value changes', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            {
                initialProps: { value: 'initial' },
            }
        );

        rerender({ value: 'changed' });

        // Should still be initial immediately after change
        expect(result.current).toBe('initial');

        // Fast-forward time
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe('changed');
    });

    it('should cleanup timeout on unmount', () => {
        const spy = vi.spyOn(global, 'clearTimeout');
        const { unmount } = renderHook(() => useDebounce('test', 300));

        unmount();

        expect(spy).toHaveBeenCalled();
    });

    it('should update immediately if immediate is true for the first change', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300, true),
            {
                initialProps: { value: 'initial' },
            }
        );

        rerender({ value: 'immediate-change' });

        // Should update immediately due to immediate=true and being the first change
        expect(result.current).toBe('immediate-change');
    });

    it('should debounce subsequent changes even if immediate is true', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300, true),
            {
                initialProps: { value: 'initial' },
            }
        );

        // First change: immediate
        rerender({ value: 'first-change' });
        expect(result.current).toBe('first-change');

        // Second change: debounced
        rerender({ value: 'second-change' });
        expect(result.current).toBe('first-change');

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe('second-change');
    });
});
