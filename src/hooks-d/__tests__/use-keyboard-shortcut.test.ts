import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcut } from '../use-keyboard-shortcut';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useKeyboardShortcut', () => {
    const mockCallback = vi.fn();

    beforeEach(() => {
        mockCallback.mockClear();
        vi.useFakeTimers();
    });

    const fireKeyEvent = (params: any) => {
        const event = new KeyboardEvent('keydown', params);
        window.dispatchEvent(event);
        return event;
    };

    it('should trigger callback for simple key', () => {
        renderHook(() => useKeyboardShortcut('k', mockCallback));
        fireKeyEvent({ key: 'k' });
        expect(mockCallback).toHaveBeenCalled();
    });

    it('should trigger callback for mod+k (MacOS metaKey)', () => {
        // Mock navigator to appear as Mac
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Macintosh',
            configurable: true
        });

        renderHook(() => useKeyboardShortcut('mod+k', mockCallback));

        // Should NOT fire with just k
        fireKeyEvent({ key: 'k' });
        expect(mockCallback).not.toHaveBeenCalled();

        // Should fire with meta+k
        fireKeyEvent({ key: 'k', metaKey: true });
        expect(mockCallback).toHaveBeenCalled();
    });

    it('should trigger callback for mod+k (Windows/Linux ctrlKey)', () => {
        // Mock navigator to appear as Windows
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Windows',
            configurable: true
        });

        renderHook(() => useKeyboardShortcut('mod+k', mockCallback));

        // Should fire with ctrl+k
        fireKeyEvent({ key: 'k', ctrlKey: true });
        expect(mockCallback).toHaveBeenCalled();
    });

    it('should trigger callback for multiple modifiers alt+shift+d', () => {
        renderHook(() => useKeyboardShortcut('alt+shift+d', mockCallback));

        fireKeyEvent({ key: 'd', altKey: true, shiftKey: true });
        expect(mockCallback).toHaveBeenCalled();
    });

    it('should not trigger callback when typing in input field by default', () => {
        renderHook(() => useKeyboardShortcut('k', mockCallback));

        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        fireKeyEvent({ key: 'k' });
        expect(mockCallback).not.toHaveBeenCalled();

        document.body.removeChild(input);
    });

    it('should trigger callback in input if ignoreInputFocus is false', () => {
        renderHook(() => useKeyboardShortcut('k', mockCallback, { ignoreInputFocus: false }));

        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        fireKeyEvent({ key: 'k' });
        expect(mockCallback).toHaveBeenCalled();

        document.body.removeChild(input);
    });

    it('should handle key sequences (g then d)', () => {
        renderHook(() => useKeyboardShortcut('g d', mockCallback));

        fireKeyEvent({ key: 'g' });
        expect(mockCallback).not.toHaveBeenCalled();

        fireKeyEvent({ key: 'd' });
        expect(mockCallback).toHaveBeenCalled();
    });

    it('should reset sequence after timeout', () => {
        renderHook(() => useKeyboardShortcut('g d', mockCallback));

        fireKeyEvent({ key: 'g' });

        // Fast forward more than 1s
        act(() => {
            vi.advanceTimersByTime(1500);
        });

        fireKeyEvent({ key: 'd' });
        expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should prevent default when configured', () => {
        renderHook(() => useKeyboardShortcut('k', mockCallback, { preventDefault: true }));

        const event = new KeyboardEvent('keydown', { key: 'k' });
        vi.spyOn(event, 'preventDefault');
        window.dispatchEvent(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(mockCallback).toHaveBeenCalled();
    });
});
