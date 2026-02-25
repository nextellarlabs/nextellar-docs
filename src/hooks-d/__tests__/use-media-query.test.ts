import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '../use-media-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Helper to create a mock MediaQueryList
function createMockMediaQueryList(matches: boolean) {
  const listeners: Array<(event: MediaQueryListEvent) => void> = [];

  return {
    matches,
    media: '',
    onchange: null as ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null,
    addEventListener: vi.fn((_event: string, cb: (event: MediaQueryListEvent) => void) => {
      listeners.push(cb);
    }),
    removeEventListener: vi.fn((_event: string, cb: (event: MediaQueryListEvent) => void) => {
      const index = listeners.indexOf(cb);
      if (index > -1) listeners.splice(index, 1);
    }),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    // Helper to simulate a change
    _triggerChange(newMatches: boolean) {
      this.matches = newMatches;
      listeners.forEach((cb) =>
        cb({ matches: newMatches } as MediaQueryListEvent)
      );
    },
    _listeners: listeners,
  };
}

describe('useMediaQuery', () => {
  let mockMql: ReturnType<typeof createMockMediaQueryList>;

  beforeEach(() => {
    mockMql = createMockMediaQueryList(false);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mockMql)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the initial match state', () => {
    mockMql.matches = true;
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('should return false when query does not match', () => {
    mockMql.matches = false;
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should update when the media query changes', () => {
    mockMql.matches = false;
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => {
      mockMql._triggerChange(true);
    });

    expect(result.current).toBe(true);
  });

  it('should clean up the event listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    unmount();

    expect(mockMql.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('should re-subscribe when the query string changes', () => {
    const { rerender } = renderHook(
      ({ query }: { query: string }) => useMediaQuery(query),
      { initialProps: { query: '(max-width: 768px)' } }
    );

    // Should have been called once initially
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');

    rerender({ query: '(max-width: 1024px)' });
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1024px)');
  });

  it('should work with prefers-reduced-motion', () => {
    mockMql.matches = true;
    const { result } = renderHook(() =>
      useMediaQuery('(prefers-reduced-motion: reduce)')
    );
    expect(result.current).toBe(true);
  });

  it('should work with prefers-color-scheme', () => {
    mockMql.matches = true;
    const { result } = renderHook(() =>
      useMediaQuery('(prefers-color-scheme: dark)')
    );
    expect(result.current).toBe(true);
  });
});
