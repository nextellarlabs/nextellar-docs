import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useCountdown } from '../use-countdown';

describe('useCountdown', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Set system time to a known point for deterministic tests
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('should initialize correctly with a duration', () => {
        const duration = 1000 * 60; // 1 minute
        const { result } = renderHook(() => useCountdown(duration));

        expect(result.current.days).toBe('00');
        expect(result.current.hours).toBe('00');
        expect(result.current.minutes).toBe('01');
        expect(result.current.seconds).toBe('00');
        expect(result.current.isRunning).toBe(true);
    });

    it('should calculate time correctly and update over time', () => {
        const duration = 5000; // 5 seconds
        const { result } = renderHook(() => useCountdown(duration));

        expect(result.current.seconds).toBe('05');

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(result.current.seconds).toBe('03');
    });

    it('should format long durations correctly (DD:HH:MM:SS)', () => {
        const duration = (2 * 24 * 60 * 60 * 1000) + (5 * 60 * 60 * 1000) + (30 * 60 * 1000) + 15000; // 2 days, 5 hours, 30 min, 15 sec
        const { result } = renderHook(() => useCountdown(duration));

        expect(result.current.days).toBe('02');
        expect(result.current.hours).toBe('05');
        expect(result.current.minutes).toBe('30');
        expect(result.current.seconds).toBe('15');
    });

    it('should pause and resume correctly', () => {
        // 10 seconds duration
        const duration = 10000;
        const { result } = renderHook(() => useCountdown(duration));

        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(result.current.seconds).toBe('08');
        expect(result.current.isRunning).toBe(true);

        act(() => {
            result.current.pause();
        });
        expect(result.current.isRunning).toBe(false);

        // advance time while paused
        act(() => {
            vi.advanceTimersByTime(3000);
        });
        // Should still be at 8 seconds
        expect(result.current.seconds).toBe('08');

        act(() => {
            result.current.resume();
        });
        expect(result.current.isRunning).toBe(true);

        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(result.current.seconds).toBe('06');
    });

    it('should reset correctly', () => {
        const duration = 10000;
        const { result } = renderHook(() => useCountdown(duration));

        act(() => {
            vi.advanceTimersByTime(5000);
        });
        expect(result.current.seconds).toBe('05');

        act(() => {
            result.current.reset();
        });
        expect(result.current.seconds).toBe('10');
    });

    it('should trigger onComplete when reaches zero', () => {
        const onComplete = vi.fn();
        const duration = 3000;
        const { result } = renderHook(() => useCountdown(duration, { onComplete }));

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(result.current.seconds).toBe('00');
        expect(result.current.isRunning).toBe(false);
        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should support target timestamp input (Date object)', () => {
        const targetDate = new Date('2026-01-01T00:00:10Z'); // 10 seconds ahead
        const { result } = renderHook(() => useCountdown(targetDate));

        expect(result.current.seconds).toBe('10');

        act(() => {
            vi.advanceTimersByTime(5000);
        });
        expect(result.current.seconds).toBe('05');
    });
});
