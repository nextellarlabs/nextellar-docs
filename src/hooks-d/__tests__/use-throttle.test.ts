import { renderHook, act } from '@testing-library/react';
import { useThrottle } from '../use-throttle';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('initial', 100));
    expect(result.current).toBe('initial');
  });

  it('should update immediately on the leading edge by default', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useThrottle(value, 100),
      { initialProps: { value: 'a' } }
    );

    // Advance past the throttle interval so the first real change fires
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'b' });

    // Leading edge: should update right away
    expect(result.current).toBe('b');
  });

  it('should throttle rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useThrottle(value, 200),
      { initialProps: { value: 0 } }
    );

    // Ensure we're past the initial throttle window
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // First change — fires on leading edge
    rerender({ value: 1 });
    expect(result.current).toBe(1);

    // Rapid changes within the throttle window
    rerender({ value: 2 });
    rerender({ value: 3 });
    expect(result.current).toBe(1);

    // After the interval, trailing edge fires with latest value
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(3);
  });

  it('should respect leading: false option', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useThrottle(value, 200, { leading: false, trailing: true }),
      { initialProps: { value: 'a' } }
    );

    // Advance past the initial throttle window
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'b' });

    // Leading disabled — should not update immediately
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Trailing fires after interval
    expect(result.current).toBe('b');
  });

  it('should respect trailing: false option', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useThrottle(value, 200, { leading: true, trailing: false }),
      { initialProps: { value: 0 } }
    );

    // Advance past the initial throttle window
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Leading fires
    rerender({ value: 1 });
    expect(result.current).toBe(1);

    // Rapid changes — trailing is off, so no update after interval
    rerender({ value: 2 });
    rerender({ value: 3 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Value 3 is not emitted because trailing is false
    // The next leading-edge change will pick it up
    expect(result.current).toBe(1);
  });

  it('should cleanup pending timeouts on unmount', () => {
    const spy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount, rerender } = renderHook(
      ({ value }: { value: string }) => useThrottle(value, 200),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    unmount();

    expect(spy).toHaveBeenCalled();
  });

  it('should preserve generic type', () => {
    const { result } = renderHook(() => useThrottle(42, 100));
    const value: number = result.current;
    expect(typeof value).toBe('number');
  });

  it('should use default interval of 100ms', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useThrottle(value),
      { initialProps: { value: 'a' } }
    );

    // Advance past the default 100ms interval
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'b' });
    expect(result.current).toBe('b');

    rerender({ value: 'c' });
    // Still within throttle window
    expect(result.current).toBe('b');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('c');
  });
});
