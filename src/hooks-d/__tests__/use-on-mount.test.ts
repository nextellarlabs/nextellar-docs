import { renderHook } from '@testing-library/react';
import { useOnMount } from '../use-on-mount';
import { describe, it, expect, vi } from 'vitest';

describe('useOnMount', () => {
  it('runs callback exactly once on mount', () => {
    const fn = vi.fn();
    renderHook(() => useOnMount(fn));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not run callback again on re-render', () => {
    const fn = vi.fn();
    const { rerender } = renderHook(() => useOnMount(fn));
    expect(fn).toHaveBeenCalledTimes(1);
    rerender();
    rerender();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('runs returned cleanup on unmount', () => {
    const cleanup = vi.fn();
    const { unmount } = renderHook(() =>
      useOnMount(() => {
        return cleanup;
      })
    );
    expect(cleanup).not.toHaveBeenCalled();
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('supports callback that returns void', () => {
    const fn = vi.fn();
    const { unmount } = renderHook(() => useOnMount(fn));
    expect(fn).toHaveBeenCalledTimes(1);
    unmount();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
