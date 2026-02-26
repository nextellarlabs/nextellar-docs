import { renderHook, act } from '@testing-library/react';
import { useToggle } from './use-toggle';
import { describe, it, expect } from 'vitest';

describe('useToggle', () => {
    it('1. Default initial value is false when no argument is passed', () => {
        const { result } = renderHook(() => useToggle());
        expect(result.current[0]).toBe(false);
    });

    it('2. Accepts explicit true as initial value', () => {
        const { result } = renderHook(() => useToggle(true));
        expect(result.current[0]).toBe(true);
    });

    it('3. Accepts explicit false as initial value', () => {
        const { result } = renderHook(() => useToggle(false));
        expect(result.current[0]).toBe(false);
    });

    it('4. toggle() flips false -> true', () => {
        const { result } = renderHook(() => useToggle(false));
        act(() => {
            result.current[1].toggle();
        });
        expect(result.current[0]).toBe(true);
    });

    it('5. toggle() flips true -> false', () => {
        const { result } = renderHook(() => useToggle(true));
        act(() => {
            result.current[1].toggle();
        });
        expect(result.current[0]).toBe(false);
    });

    it('6. on() sets value to true from false', () => {
        const { result } = renderHook(() => useToggle(false));
        act(() => {
            result.current[1].on();
        });
        expect(result.current[0]).toBe(true);
    });

    it('7. on() is idempotent - calling twice stays true', () => {
        const { result } = renderHook(() => useToggle(false));
        act(() => {
            result.current[1].on();
            result.current[1].on();
        });
        expect(result.current[0]).toBe(true);
    });

    it('8. off() sets value to false from true', () => {
        const { result } = renderHook(() => useToggle(true));
        act(() => {
            result.current[1].off();
        });
        expect(result.current[0]).toBe(false);
    });

    it('9. off() is idempotent - calling twice stays false', () => {
        const { result } = renderHook(() => useToggle(true));
        act(() => {
            result.current[1].off();
            result.current[1].off();
        });
        expect(result.current[0]).toBe(false);
    });

    it('10. set(true) sets value to true', () => {
        const { result } = renderHook(() => useToggle(false));
        act(() => {
            result.current[1].set(true);
        });
        expect(result.current[0]).toBe(true);
    });

    it('11. set(false) sets value to false', () => {
        const { result } = renderHook(() => useToggle(true));
        act(() => {
            result.current[1].set(false);
        });
        expect(result.current[0]).toBe(false);
    });

    it('12. toggle reference is stable across re-renders (strict toBe equality)', () => {
        const { result, rerender } = renderHook(() => useToggle());
        const initialToggle = result.current[1].toggle;
        rerender();
        expect(result.current[1].toggle).toBe(initialToggle);
    });

    it('13. on reference is stable across re-renders (strict toBe equality)', () => {
        const { result, rerender } = renderHook(() => useToggle());
        const initialOn = result.current[1].on;
        rerender();
        expect(result.current[1].on).toBe(initialOn);
    });

    it('14. off reference is stable across re-renders (strict toBe equality)', () => {
        const { result, rerender } = renderHook(() => useToggle());
        const initialOff = result.current[1].off;
        rerender();
        expect(result.current[1].off).toBe(initialOff);
    });

    it('15. set reference is stable across re-renders (strict toBe equality)', () => {
        const { result, rerender } = renderHook(() => useToggle());
        const initialSet = result.current[1].set;
        rerender();
        expect(result.current[1].set).toBe(initialSet);
    });
});
