import { renderHook, act } from '@testing-library/react';
import { useWindowSize } from '../use-window-size';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useWindowSize', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true });
  });

  function setWindowSize(width: number, height: number) {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
  }

  function dispatchResize() {
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  it('returns shape with width, height, and breakpoint helpers', () => {
    setWindowSize(800, 600);
    const { result } = renderHook(() => useWindowSize({ throttle: 100 }));
    expect(result.current).toHaveProperty('width');
    expect(result.current).toHaveProperty('height');
    expect(result.current).toHaveProperty('isMobile');
    expect(result.current).toHaveProperty('isTablet');
    expect(result.current).toHaveProperty('isDesktop');
  });

  it('updates to window dimensions after effect and resize', () => {
    setWindowSize(800, 600);
    const { result } = renderHook(() => useWindowSize({ throttle: 100 }));
    act(() => {
      vi.advanceTimersByTime(0);
    });
    dispatchResize();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(600);
  });

  it('breakpoint helpers match Tailwind: isTablet at 768', () => {
    setWindowSize(768, 600);
    const { result } = renderHook(() => useWindowSize({ throttle: 100 }));
    dispatchResize();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.width).toBe(768);
    expect(result.current.isMobile).toBe(false); // 768 >= 640
    expect(result.current.isTablet).toBe(true);  // 640 <= 768 < 1024
    expect(result.current.isDesktop).toBe(false);
  });

  it('breakpoint helpers: isMobile below 640', () => {
    setWindowSize(639, 480);
    const { result } = renderHook(() => useWindowSize({ throttle: 100 }));
    dispatchResize();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('breakpoint helpers: isDesktop at 1024', () => {
    setWindowSize(1024, 768);
    const { result } = renderHook(() => useWindowSize({ throttle: 100 }));
    dispatchResize();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('throttles resize events (default 100ms)', () => {
    setWindowSize(500, 500);
    const { result } = renderHook(() => useWindowSize({ throttle: 100 }));
    dispatchResize();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.width).toBe(500);
    expect(result.current.height).toBe(500);
    setWindowSize(600, 600);
    dispatchResize();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.width).toBe(600);
    expect(result.current.height).toBe(600);
  });

  it('uses custom throttle option', () => {
    setWindowSize(400, 400);
    const { result } = renderHook(() => useWindowSize({ throttle: 200 }));
    dispatchResize();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.width).toBe(400);
    expect(result.current.height).toBe(400);
  });

  it('debounce option delays update', () => {
    setWindowSize(300, 300);
    const { result } = renderHook(() => useWindowSize({ debounce: 150 }));
    dispatchResize();
    act(() => {
      vi.advanceTimersByTime(50);
    });
    setWindowSize(320, 320);
    dispatchResize();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.width).toBe(320);
    expect(result.current.height).toBe(320);
  });
});
