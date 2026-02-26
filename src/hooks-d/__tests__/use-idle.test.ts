import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useIdle } from '../use-idle';

describe('useIdle', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('becomes idle after timeout', () => {
        const { result } = renderHook(() => useIdle(1000));

        expect(result.current).toBe(false);

        act(() => {
            vi.advanceTimersByTime(999);
        });
        expect(result.current).toBe(false);

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current).toBe(true);
    });

    it('resets idle state on activity', () => {
        const { result } = renderHook(() => useIdle(1000));

        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(result.current).toBe(true);

        act(() => {
            window.dispatchEvent(new Event('mousemove'));
        });
        expect(result.current).toBe(false);

        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(result.current).toBe(true);
    });
});
