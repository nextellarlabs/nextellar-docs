import { renderHook, act } from '@testing-library/react';
import { useHover } from './use-hover';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useHover', () => {
    let element: HTMLDivElement;

    beforeEach(() => {
        element = document.createElement('div');
        document.body.appendChild(element);
        vi.useFakeTimers();
    });

    afterEach(() => {
        document.body.removeChild(element);
        vi.useRealTimers();
    });

    it('returns isHovered=false initially', () => {
        const { result } = renderHook(() => useHover());
        expect(result.current.isHovered).toBe(false);
    });

    it('returns a stable ref object', () => {
        const { result, rerender } = renderHook(() => useHover());
        const firstRef = result.current.ref;
        rerender();
        expect(result.current.ref).toBe(firstRef);
    });

    it('sets isHovered=true on mouseenter and false on mouseleave', () => {
        const { result } = renderHook(() => useHover());

        // Manually assign ref
        Object.defineProperty(result.current.ref, 'current', {
            writable: true,
            value: element,
        });

        // Re-render so effect picks up the ref
        act(() => {
            element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        });
        // Without delay, should be immediate
        expect(result.current.isHovered).toBe(true);

        act(() => {
            element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        });
        expect(result.current.isHovered).toBe(false);
    });

    it('honours delay option — does not hover immediately', () => {
        const { result } = renderHook(() => useHover({ delay: 300 }));

        Object.defineProperty(result.current.ref, 'current', {
            writable: true,
            value: element,
        });

        act(() => {
            element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        });
        // Still false because delay hasn't elapsed
        expect(result.current.isHovered).toBe(false);

        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(result.current.isHovered).toBe(true);
    });

    it('cancels hover if mouse leaves before delay elapses', () => {
        const { result } = renderHook(() => useHover({ delay: 300 }));

        Object.defineProperty(result.current.ref, 'current', {
            writable: true,
            value: element,
        });

        act(() => {
            element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        });
        act(() => {
            vi.advanceTimersByTime(100);
            element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        });
        act(() => {
            vi.advanceTimersByTime(300);
        });
        // Hover timer should have been cancelled
        expect(result.current.isHovered).toBe(false);
    });

    it('handles touch long-press as hover', () => {
        const { result } = renderHook(() => useHover({ touchEnabled: true, touchDelay: 500 }));

        Object.defineProperty(result.current.ref, 'current', {
            writable: true,
            value: element,
        });

        act(() => {
            element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
        });
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(result.current.isHovered).toBe(true);

        act(() => {
            element.dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
        });
        expect(result.current.isHovered).toBe(false);
    });

    it('does not trigger hover on short touch when touchEnabled=true', () => {
        const { result } = renderHook(() => useHover({ touchEnabled: true, touchDelay: 500 }));

        Object.defineProperty(result.current.ref, 'current', {
            writable: true,
            value: element,
        });

        act(() => {
            element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
        });
        act(() => {
            vi.advanceTimersByTime(100);
            element.dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
        });
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(result.current.isHovered).toBe(false);
    });

    it('ignores touch events when touchEnabled=false', () => {
        const { result } = renderHook(() => useHover({ touchEnabled: false }));

        Object.defineProperty(result.current.ref, 'current', {
            writable: true,
            value: element,
        });

        act(() => {
            element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
        });
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(result.current.isHovered).toBe(false);
    });

    it('cleans up event listeners on unmount', () => {
        const addSpy = vi.spyOn(element, 'addEventListener');
        const removeSpy = vi.spyOn(element, 'removeEventListener');

        const { result, unmount } = renderHook(() => useHover());

        Object.defineProperty(result.current.ref, 'current', {
            writable: true,
            value: element,
        });

        unmount();

        // removeEventListener should have been called for each added event
        expect(removeSpy).toHaveBeenCalled();
        addSpy.mockRestore();
        removeSpy.mockRestore();
    });
});
