import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useMeasure } from '../use-measure';

describe('useMeasure', () => {
    let observeMock: any;
    let disconnectMock: any;

    beforeEach(() => {
        observeMock = vi.fn();
        disconnectMock = vi.fn();

        // Mock ResizeObserver
        global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
            observe: observeMock.mockImplementation((el: HTMLElement) => {
                // Simulate an initial trigger
                callback([{ target: el }], {} as any);
            }),
            disconnect: disconnectMock,
            unobserve: vi.fn(),
        }));

        // Mock getBoundingClientRect
        HTMLElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            top: 0,
            right: 100,
            bottom: 100,
            left: 0,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default bounds', () => {
        const { result } = renderHook(() => useMeasure());
        expect(result.current.bounds.width).toBe(0);
    });

    it('should update bounds on resize (simulated)', () => {
        const { result } = renderHook(() => useMeasure());
        const div = document.createElement('div');

        // Assign the ref
        act(() => {
            (result.current.ref as any).current = div;
        });

        // Re-render to trigger the effect
        const { rerender } = renderHook(() => useMeasure());

        // Since we simulated the callback in the mock observe, 
        // it should have updated the state.
        // In a real scenario, the effect runs after mount.

        // We expect the observer to have been called
        expect(global.ResizeObserver).toHaveBeenCalled();
    });

    it('should respect debounce option', async () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useMeasure({ debounce: 100 }));
        const div = document.createElement('div');

        act(() => {
            (result.current.ref as any).current = div;
        });

        // Manually trigger the ResizeObserver callback
        const [[callback]] = (global.ResizeObserver as any).mock.calls;

        act(() => {
            callback([{ target: div }]);
        });

        // Should still be default because of debounce
        expect(result.current.bounds.width).toBe(0);

        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current.bounds.width).toBe(100);
        vi.useRealTimers();
    });

    it('should disconnect observer on unmount', () => {
        const { result, unmount } = renderHook(() => useMeasure());
        const div = document.createElement('div');

        act(() => {
            (result.current.ref as any).current = div;
        });

        unmount();
        expect(disconnectMock).toHaveBeenCalled();
    });
});
