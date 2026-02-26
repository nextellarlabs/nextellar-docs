import { renderHook } from '@testing-library/react';
import { useClickOutside } from './use-click-outside';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('useClickOutside', () => {
    let handler: (event: MouseEvent | TouchEvent) => void;
    const mockHandler = vi.fn();

    beforeEach(() => {
        mockHandler.mockClear();
        handler = (e) => mockHandler(e);
    });

    it('calls handler when clicking outside a single ref', () => {
        const el = document.createElement('div');
        const ref = { current: el };
        renderHook(() => useClickOutside(ref, handler));

        const outsideEl = document.createElement('span');
        document.body.appendChild(outsideEl);
        outsideEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(mockHandler).toHaveBeenCalled();
        document.body.removeChild(outsideEl);
    });

    it('does NOT call handler when clicking inside the ref', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);
        const ref = { current: el };
        renderHook(() => useClickOutside(ref, handler));

        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(mockHandler).not.toHaveBeenCalled();
        document.body.removeChild(el);
    });

    it('supports multiple refs', () => {
        const el1 = document.createElement('div');
        const el2 = document.createElement('div');
        document.body.appendChild(el1);
        document.body.appendChild(el2);

        const refs = [{ current: el1 }, { current: el2 }];
        renderHook(() => useClickOutside(refs, handler));

        el1.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        el2.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(mockHandler).not.toHaveBeenCalled();

        const outside = document.createElement('span');
        document.body.appendChild(outside);
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(mockHandler).toHaveBeenCalledTimes(1);

        document.body.removeChild(el1);
        document.body.removeChild(el2);
        document.body.removeChild(outside);
    });

    it('respects the enabled flag', () => {
        const el = document.createElement('div');
        const ref = { current: el };
        const { rerender } = renderHook(({ enabled }) => useClickOutside(ref, handler, { enabled }), {
            initialProps: { enabled: false }
        });

        document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(mockHandler).not.toHaveBeenCalled();

        rerender({ enabled: true });
        document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(mockHandler).toHaveBeenCalled();
    });

    it('excludes specific refs', () => {
        const el = document.createElement('div');
        const excludedEl = document.createElement('button');
        document.body.appendChild(el);
        document.body.appendChild(excludedEl);

        const ref = { current: el };
        const excludeRef = { current: excludedEl };

        renderHook(() => useClickOutside(ref, handler, { excludeRefs: [excludeRef] }));

        excludedEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(mockHandler).not.toHaveBeenCalled();

        document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(mockHandler).toHaveBeenCalled();

        document.body.removeChild(el);
        document.body.removeChild(excludedEl);
    });

    it('handles touch events', () => {
        const el = document.createElement('div');
        const ref = { current: el };
        renderHook(() => useClickOutside(ref, handler));

        document.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
        expect(mockHandler).toHaveBeenCalled();
    });

    it('cleans up listeners on unmount', () => {
        const spy = vi.spyOn(document, 'removeEventListener');
        const { unmount } = renderHook(() => useClickOutside({ current: null as unknown as HTMLElement }, handler));

        unmount();
        expect(spy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(spy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });
});
