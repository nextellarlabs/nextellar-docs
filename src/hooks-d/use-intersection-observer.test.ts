import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useIntersectionObserver,
  useScrollSpy,
} from './use-intersection-observer';

describe('useIntersectionObserver', () => {
  let observerCallback: (entries: IntersectionObserverEntry[]) => void;
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;
  let unobserve: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();

    const MockIntersectionObserver = vi.fn(
      class MockIntersectionObserver implements IntersectionObserver {
        readonly root: Element | null = null;
        readonly rootMargin: string = '';
        readonly thresholds: ReadonlyArray<number> = [];

        constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
          observerCallback = callback;
        }

        observe = observe;
        disconnect = disconnect;
        unobserve = unobserve;
        takeRecords = vi.fn().mockReturnValue([]);
      }
    );

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns ref, isIntersecting, and entry', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current).toHaveProperty('ref');
    expect(result.current).toHaveProperty('isIntersecting');
    expect(result.current).toHaveProperty('entry');
    expect(typeof result.current.ref).toBe('function');
    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.entry).toBeNull();
  });

  it('observes element when ref is attached', () => {
    const el = document.createElement('div');
    const { result } = renderHook(() => useIntersectionObserver());

    act(() => {
      result.current.ref(el);
    });

    expect(observe).toHaveBeenCalledWith(el);
  });

  it('updates isIntersecting and entry when element intersects', () => {
    const el = document.createElement('div');
    el.id = 'test-el';
    const { result } = renderHook(() => useIntersectionObserver());

    act(() => {
      result.current.ref(el);
    });

    const entry = {
      target: el,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: 0,
    } as IntersectionObserverEntry;

    act(() => {
      observerCallback([entry]);
    });

    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.entry).toBe(entry);
  });

  it('disconnects observer on unmount', () => {
    const el = document.createElement('div');
    const { result, unmount } = renderHook(() => useIntersectionObserver());

    act(() => {
      result.current.ref(el);
    });

    unmount();

    expect(disconnect).toHaveBeenCalled();
  });

  it('disconnects when ref is set to null', () => {
    const el = document.createElement('div');
    const { result } = renderHook(() => useIntersectionObserver());

    act(() => {
      result.current.ref(el);
    });

    act(() => {
      result.current.ref(null);
    });

    expect(disconnect).toHaveBeenCalled();
  });

  it('triggerOnce disconnects after first intersection', () => {
    const el = document.createElement('div');
    const { result } = renderHook(() =>
      useIntersectionObserver({ triggerOnce: true })
    );

    act(() => {
      result.current.ref(el);
    });

    const entry = {
      target: el,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: 0,
    } as IntersectionObserverEntry;

    act(() => {
      observerCallback([entry]);
    });

    expect(result.current.isIntersecting).toBe(true);
    expect(disconnect).toHaveBeenCalled();
  });

  it('passes threshold and rootMargin to IntersectionObserver', () => {
    let capturedOptions: IntersectionObserverInit | undefined;
    const MockIO = vi.fn(
      function (
        this: unknown,
        _callback: () => void,
        options?: IntersectionObserverInit
      ) {
        capturedOptions = options;
        return {
          observe: vi.fn(),
          disconnect: vi.fn(),
          unobserve: vi.fn(),
          takeRecords: vi.fn().mockReturnValue([]),
        };
      }
    );
    vi.stubGlobal('IntersectionObserver', MockIO);

    const el = document.createElement('div');
    const { result } = renderHook(() =>
      useIntersectionObserver({ threshold: 0.5, rootMargin: '10px' })
    );

    act(() => {
      result.current.ref(el);
    });

    expect(capturedOptions).toEqual(
      expect.objectContaining({
        threshold: 0.5,
        rootMargin: '10px',
      })
    );
  });

  it('works with dynamically attached ref (element added later)', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(observe).not.toHaveBeenCalled();

    const el = document.createElement('div');
    act(() => {
      result.current.ref(el);
    });

    expect(observe).toHaveBeenCalledWith(el);
  });
});

describe('useScrollSpy', () => {
  let observerCallback: (entries: IntersectionObserverEntry[]) => void;
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observe = vi.fn();
    disconnect = vi.fn();

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(
        class MockIntersectionObserver implements IntersectionObserver {
          readonly root: Element | null = null;
          readonly rootMargin: string = '';
          readonly thresholds: ReadonlyArray<number> = [];

          constructor(
            callback: (entries: IntersectionObserverEntry[]) => void
          ) {
            observerCallback = callback;
          }

          observe = observe;
          disconnect = disconnect;
          unobserve = vi.fn();
          takeRecords = vi.fn().mockReturnValue([]);
        }
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('returns empty string when no headings', () => {
    const { result } = renderHook(() => useScrollSpy([]));
    expect(result.current).toBe('');
  });

  it('returns active id when element is intersecting', () => {
    const el = document.createElement('div');
    el.id = 'section-1';
    document.body.appendChild(el);

    const { result } = renderHook(() => useScrollSpy(['section-1']));

    act(() => {
      observerCallback([
        {
          target: el,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: 0,
        } as IntersectionObserverEntry,
      ]);
    });

    expect(result.current).toBe('section-1');
  });
});
