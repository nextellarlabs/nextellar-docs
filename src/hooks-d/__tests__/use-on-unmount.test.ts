import { renderHook } from '@testing-library/react';
import { useOnUnmount } from '../use-on-unmount';
import { describe, it, expect, vi } from 'vitest';

describe('useOnUnmount', () => {
  it('runs callback on unmount', () => {
    const fn = vi.fn();
    const { unmount } = renderHook(() => useOnUnmount(fn));
    expect(fn).not.toHaveBeenCalled();
    unmount();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not run callback on mount or re-render', () => {
    const fn = vi.fn();
    const { rerender, unmount } = renderHook(() => useOnUnmount(fn));
    expect(fn).not.toHaveBeenCalled();
    rerender();
    rerender();
    expect(fn).not.toHaveBeenCalled();
    unmount();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('runs the latest callback on unmount (ref pattern)', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ cb }: { cb: () => void }) => useOnUnmount(cb),
      { initialProps: { cb: first } }
    );
    rerender({ cb: second });
    unmount();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
