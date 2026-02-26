import { renderHook } from '@testing-library/react';
import { useInterval } from './use-interval';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useInterval', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('initially does nothing if delay is null', () => {
        const callback = vi.fn();
        renderHook(() => useInterval(callback, null));

        vi.advanceTimersByTime(1000);
        expect(callback).not.toHaveBeenCalled();
    });

    it('starts interval if delay is provided', () => {
        const callback = vi.fn();
        renderHook(() => useInterval(callback, 1000));

        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1000);
        expect(callback).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(2000);
        expect(callback).toHaveBeenCalledTimes(3);
    });

    it('supports immediate execution', () => {
        const callback = vi.fn();
        renderHook(() => useInterval(callback, 1000, { immediate: true }));

        expect(callback).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1000);
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it('pauses when delay becomes null', () => {
        const callback = vi.fn();
        const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
            initialProps: { delay: 1000 as number | null },
        });

        vi.advanceTimersByTime(1000);
        expect(callback).toHaveBeenCalledTimes(1);

        rerender({ delay: null });
        vi.advanceTimersByTime(2000);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('updates when delay changes', () => {
        const callback = vi.fn();
        const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
            initialProps: { delay: 1000 },
        });

        vi.advanceTimersByTime(1000);
        expect(callback).toHaveBeenCalledTimes(1);

        rerender({ delay: 500 });
        vi.advanceTimersByTime(500);
        expect(callback).toHaveBeenCalledTimes(2);

        vi.advanceTimersByTime(500);
        expect(callback).toHaveBeenCalledTimes(3);
    });

    it('uses the latest callback', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        const { rerender } = renderHook(({ callback }) => useInterval(callback, 1000), {
            initialProps: { callback: callback1 },
        });

        vi.advanceTimersByTime(500);
        rerender({ callback: callback2 });

        vi.advanceTimersByTime(500);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('cleans up on unmount', () => {
        const callback = vi.fn();
        const { unmount } = renderHook(() => useInterval(callback, 1000));

        unmount();
        vi.advanceTimersByTime(1000);
        expect(callback).not.toHaveBeenCalled();
    });
});
