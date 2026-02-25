'use client';

import { useEffect, useRef, useCallback, type RefCallback } from 'react';

export interface UseFocusTrapOptions {
  /** Whether the focus trap is active. Default: true */
  active?: boolean;
  /** Return focus to the previously focused element on deactivate. Default: true */
  returnFocusOnDeactivate?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1
  );
}

/**
 * A hook that traps keyboard focus within a container element.
 * Useful for modals, drawers, and popovers to ensure accessible keyboard navigation.
 *
 * @param options Configuration for the focus trap
 * @returns A ref to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions = {}
): RefCallback<T> {
  const { active = true, returnFocusOnDeactivate = true } = options;

  const containerRef = useRef<T | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle Tab key to trap focus
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !containerRef.current) return;

    const focusable = getFocusableElements(containerRef.current);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift+Tab: wrap from first to last
      if (activeElement === first || !containerRef.current.contains(activeElement)) {
        event.preventDefault();
        last.focus();
      }
    } else {
      // Tab: wrap from last to first
      if (activeElement === last || !containerRef.current.contains(activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }
  }, []);

  // Activate/deactivate the trap
  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Store the currently focused element to restore later
    previousFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;

    // Focus the first focusable element inside the container
    const focusable = getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      // If no focusable elements, make the container itself focusable
      container.setAttribute('tabindex', '-1');
      container.focus();
    }

    document.addEventListener('keydown', handleKeyDown);

    // Observe dynamic content changes to keep focus within the trap
    const observer = new MutationObserver(() => {
      if (!container.contains(document.activeElement)) {
        const updatedFocusable = getFocusableElements(container);
        if (updatedFocusable.length > 0) {
          updatedFocusable[0].focus();
        }
      }
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();

      // Restore focus to the previously focused element
      if (returnFocusOnDeactivate && previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };
  }, [active, handleKeyDown, returnFocusOnDeactivate]);

  // Callback ref to capture the container element
  const ref = useCallback(
    (node: T | null) => {
      containerRef.current = node;
    },
    []
  );

  return ref;
}
