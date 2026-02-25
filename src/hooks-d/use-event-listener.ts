import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

// Window Overload
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  target: Window,
  options?: AddEventListenerOptions
): void;

// Document Overload
export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  target: Document,
  options?: AddEventListenerOptions
): void;

// Element Overload (Direct)
export function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLElement>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  target: T | null,
  options?: AddEventListenerOptions
): void;

// Element Overload (Ref)
export function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLElement>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  target: RefObject<T>,
  options?: AddEventListenerOptions
): void;

// Base Overload
export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  target?: Window | Document | HTMLElement | null | RefObject<HTMLElement>,
  options?: AddEventListenerOptions
): void;

export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  target?: Window | Document | HTMLElement | null | RefObject<HTMLElement>,
  options?: AddEventListenerOptions
): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return;

    // Resolve the actual target element
    let targetElement: EventTarget | null = null;
    
    if (target === undefined) {
      targetElement = window;
    } else if (target === null) {
      targetElement = null;
    } else if ('current' in target) {
      targetElement = target.current;
    } else {
      targetElement = target;
    }

    // Check target supports addEventListener
    if (!targetElement || !targetElement.addEventListener) return;

    // Create stable listener that calls savedHandler.current
    const eventListener: EventListener = (event) => savedHandler.current(event);

    // addEventListener
    targetElement.addEventListener(eventName, eventListener, options);

    // Return cleanup that calls removeEventListener
    return () => {
      targetElement?.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, target, options?.capture, options?.passive, options?.once]);
}
