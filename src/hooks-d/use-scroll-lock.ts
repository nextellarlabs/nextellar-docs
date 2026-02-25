'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Module-level lock counter for nested dialogs (multiple open at once)
let lockCount = 0;

// Cached original body styles so we restore exactly what was there
let savedOverflow: string | null = null;
let savedPosition: string | null = null;
let savedTop: string | null = null;
let savedWidth: string | null = null;
let savedScrollY = 0;

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function applyLock(): void {
  const body = document.body;
  const html = document.documentElement;

  if (lockCount === 0) {
    savedOverflow = body.style.overflow;
    savedPosition = body.style.position;
    savedTop = body.style.top;
    savedWidth = body.style.width;
    savedScrollY = window.scrollY ?? window.pageYOffset;
  }

  lockCount += 1;

  body.style.overflow = 'hidden';

  // iOS Safari: overflow:hidden alone often doesn't prevent body scroll.
  // position:fixed + top:-scrollY keeps the viewport from moving and prevents scroll.
  if (isIOS()) {
    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.width = '100%';
    // Prevent rubber-band and address bar resize side effects on some iOS versions
    html.style.height = '100%';
    html.style.overflow = 'hidden';
  }
}

function removeLock(): void {
  if (lockCount <= 0) return;
  lockCount -= 1;

  if (lockCount > 0) return;

  const body = document.body;
  const html = document.documentElement;

  // Restore original overflow (and any other styles we saved)
  body.style.overflow = savedOverflow ?? '';
  body.style.position = savedPosition ?? '';
  body.style.top = savedTop ?? '';
  body.style.width = savedWidth ?? '';

  html.style.height = '';
  html.style.overflow = '';

  const scrollY = savedScrollY;
  savedOverflow = null;
  savedPosition = null;
  savedTop = null;
  savedWidth = null;
  savedScrollY = 0;

  // Restore scroll position after unlocking (especially important for iOS fixed hack)
  if (typeof window !== 'undefined' && typeof scrollY === 'number') {
    window.scrollTo(0, scrollY);
  }
}

export interface UseScrollLockReturn {
  lock: () => void;
  unlock: () => void;
  isLocked: boolean;
}

/**
 * useScrollLock() — imperative API
 * Returns { lock, unlock, isLocked }. Call lock() when opening a modal/drawer,
 * unlock() when closing. Nested dialogs are supported via an internal lock count.
 */
export function useScrollLock(): UseScrollLockReturn {
  const [isLocked, setIsLocked] = useState(false);
  const lockedByThisRef = useRef(false);

  const lock = useCallback(() => {
    if (lockedByThisRef.current) return;
    applyLock();
    lockedByThisRef.current = true;
    setIsLocked(true);
  }, []);

  const unlock = useCallback(() => {
    if (!lockedByThisRef.current) return;
    removeLock();
    lockedByThisRef.current = false;
    setIsLocked(false);
  }, []);

  // Cleanup on unmount: if this instance applied a lock, release it
  useEffect(() => {
    return () => {
      if (lockedByThisRef.current) {
        removeLock();
        lockedByThisRef.current = false;
      }
    };
  }, []);

  return { lock, unlock, isLocked };
}

/**
 * useScrollLock(isOpen) — auto-lock mode
 * When isOpen is true, body scroll is locked; when false, unlocked.
 * Nested usage is supported. Restores original overflow and scroll position on unlock.
 */
export function useScrollLockAuto(isOpen: boolean): void {
  const appliedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      applyLock();
      appliedRef.current = true;
    } else if (appliedRef.current) {
      removeLock();
      appliedRef.current = false;
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (appliedRef.current) {
        removeLock();
        appliedRef.current = false;
      }
    };
  }, []);
}
