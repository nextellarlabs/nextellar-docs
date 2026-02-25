import { renderHook, act } from '@testing-library/react';
import { useScrollLock, useScrollLockAuto } from '../use-scroll-lock';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useScrollLock', () => {
  const originalOverflow = document.body.style.overflow;
  const originalPosition = document.body.style.position;
  const originalTop = document.body.style.top;
  const originalWidth = document.body.style.width;

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
    document.body.style.position = originalPosition;
    document.body.style.top = originalTop;
    document.body.style.width = originalWidth;
    document.documentElement.style.height = '';
    document.documentElement.style.overflow = '';
  });

  beforeEach(() => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
  });

  it('should lock body scroll and set overflow hidden', () => {
    const { result } = renderHook(() => useScrollLock());

    act(() => {
      result.current.lock();
    });

    expect(document.body.style.overflow).toBe('hidden');
    expect(result.current.isLocked).toBe(true);
  });

  it('should unlock and restore original overflow on unlock', () => {
    document.body.style.overflow = 'scroll';
    const { result } = renderHook(() => useScrollLock());

    act(() => {
      result.current.lock();
    });
    expect(document.body.style.overflow).toBe('hidden');

    act(() => {
      result.current.unlock();
    });
    expect(document.body.style.overflow).toBe('scroll');
    expect(result.current.isLocked).toBe(false);
  });

  it('should support nested locks and only restore when last unlock', () => {
    const { result: r1 } = renderHook(() => useScrollLock());
    const { result: r2 } = renderHook(() => useScrollLock());

    act(() => {
      r1.current.lock();
    });
    act(() => {
      r2.current.lock();
    });
    expect(document.body.style.overflow).toBe('hidden');

    act(() => {
      r1.current.unlock();
    });
    expect(document.body.style.overflow).toBe('hidden');

    act(() => {
      r2.current.unlock();
    });
    expect(document.body.style.overflow).toBe('');
  });

  it('should be idempotent: multiple lock() then one unlock()', () => {
    const { result } = renderHook(() => useScrollLock());

    act(() => {
      result.current.lock();
      result.current.lock();
      result.current.lock();
    });
    act(() => {
      result.current.unlock();
    });
    expect(document.body.style.overflow).toBe('');
  });

  it('should cleanup on unmount', () => {
    const { result, unmount } = renderHook(() => useScrollLock());
    act(() => result.current.lock());
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('useScrollLockAuto', () => {
  const originalOverflow = document.body.style.overflow;

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.documentElement.style.height = '';
    document.documentElement.style.overflow = '';
  });

  it('should lock when isOpen is true and unlock when false', () => {
    const { rerender } = renderHook(
      ({ isOpen }: { isOpen: boolean }) => {
        useScrollLockAuto(isOpen);
        return null;
      },
      { initialProps: { isOpen: false } }
    );

    expect(document.body.style.overflow).toBe('');

    rerender({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');

    rerender({ isOpen: false });
    expect(document.body.style.overflow).toBe('');
  });

  it('should cleanup on unmount when open', () => {
    const { unmount } = renderHook(
      ({ isOpen }: { isOpen: boolean }) => {
        useScrollLockAuto(isOpen);
        return null;
      },
      { initialProps: { isOpen: true } }
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
