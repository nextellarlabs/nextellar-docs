'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseIntersectionObserverOptions {
  /** Number or array of ratios in [0, 1] at which to trigger. Default 0. */
  threshold?: number | number[];
  /** Margin around the root. Default "0px". */
  rootMargin?: string;
  /** Root element for the observer. Default null (viewport). */
  root?: Element | null;
  /** If true, disconnect after the first time the element intersects. */
  triggerOnce?: boolean;
}

export interface UseIntersectionObserverReturn {
  /** Callback ref to attach to the element to observe. */
  ref: (node: Element | null) => void;
  /** Whether the element is currently intersecting the root. */
  isIntersecting: boolean;
  /** Latest IntersectionObserverEntry, or null before first callback. */
  entry: IntersectionObserverEntry | null;
}

/**
 * Wraps the IntersectionObserver API with React lifecycle management.
 * Use for lazy-loading (e.g. Mermaid, CodePlayground) or scroll-spy.
 * Disconnects the observer on unmount and, when triggerOnce is true, after first intersection.
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    threshold = 0,
    rootMargin = '0px',
    root = null,
    triggerOnce = false,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggeredOnceRef = useRef(false);

  const ref = useCallback(
    (node: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      elementRef.current = node;

      if (node === null) {
        setEntry(null);
        setIsIntersecting(false);
        return;
      }

      if (triggeredOnceRef.current && triggerOnce) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (!first) return;
          setEntry(first);
          setIsIntersecting(first.isIntersecting);
          if (first.isIntersecting && triggerOnce) {
            triggeredOnceRef.current = true;
            observerRef.current?.disconnect();
            observerRef.current = null;
          }
        },
        { threshold, rootMargin, root: root ?? undefined }
      );
      observerRef.current.observe(node);
    },
    [threshold, rootMargin, root, triggerOnce]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return { ref, isIntersecting, entry };
}

export interface UseScrollSpyOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
}

/**
 * Observes multiple heading elements by id and returns the id of the one
 * currently intersecting (for table-of-contents scroll-spy).
 * Uses the same options as useIntersectionObserver.
 */
export function useScrollSpy(
  headingIds: string[],
  options: UseScrollSpyOptions = {}
): string {
  const { threshold = 0, rootMargin = '-80px 0px -80% 0px', root = null } =
    options;
  const [activeId, setActiveId] = useState('');

  const idsKey = headingIds.join(',');

  useEffect(() => {
    if (headingIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { threshold, rootMargin, root: root ?? undefined }
    );

    headingIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [idsKey, rootMargin, root, threshold]);

  return activeId;
}
