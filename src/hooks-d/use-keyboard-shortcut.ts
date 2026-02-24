'use client';

import { useEffect, useRef } from 'react';

export type KeyboardShortcutOptions = {
    preventDefault?: boolean;
    ignoreInputFocus?: boolean;
};

/**
 * A hook that registers global keyboard shortcuts for the documentation site.
 * Supports modifier keys (Ctrl, Cmd, Shift, Alt) and key sequences.
 * 
 * @param shortcut Standardized shortcut string (e.g., 'mod+k', 'alt+shift+d', 'g d')
 * @param callback Function to execute when shortcut is triggered
 * @param options Configuration options
 */
export function useKeyboardShortcut(
    shortcut: string,
    callback: (event: KeyboardEvent) => void,
    options: KeyboardShortcutOptions = {}
) {
    const { preventDefault = true, ignoreInputFocus = true } = options;
    const callbackRef = useRef(callback);
    const sequenceRef = useRef<{ keys: string[]; lastTime: number }>({
        keys: [],
        lastTime: 0,
    });

    // Always use the latest callback
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // 1. Check if we should ignore based on focus
            if (ignoreInputFocus) {
                const activeElement = document.activeElement;
                const isInput =
                    activeElement instanceof HTMLInputElement ||
                    activeElement instanceof HTMLTextAreaElement ||
                    activeElement?.hasAttribute('contenteditable') ||
                    (activeElement as any)?.isContentEditable;

                if (isInput) {
                    // Exceptions: allow Escape even in inputs if needed? 
                    // Usually, shortcuts like mod+k should be ignored in inputs.
                    // But sequences like 'Escape' might be useful.
                    // For now, follow the requirement: "Does not fire when user is typing in an input field".
                    return;
                }
            }

            const isMac =
                typeof window !== 'undefined' &&
                /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || navigator.platform || '');

            const parts = shortcut.toLowerCase().split(' ');
            const isSequence = parts.length > 1;

            if (isSequence) {
                // Handle sequence (e.g., 'g d')
                const now = Date.now();
                // If more than 1 second since last key, reset sequence
                if (now - sequenceRef.current.lastTime > 1000) {
                    sequenceRef.current.keys = [];
                }

                sequenceRef.current.keys.push(event.key.toLowerCase());
                sequenceRef.current.lastTime = now;

                // Check if current buffer matches sequence
                const currentBuffer = sequenceRef.current.keys.join(' ');
                if (currentBuffer.endsWith(shortcut.toLowerCase())) {
                    if (preventDefault) event.preventDefault();
                    callbackRef.current(event);
                    sequenceRef.current.keys = []; // Reset after match
                }
            } else {
                // Handle single shortcut (e.g., 'mod+k')
                const keys = shortcut.toLowerCase().split('+');

                const hasMod = keys.includes('mod');
                const hasCtrl = keys.includes('ctrl') || (hasMod && !isMac);
                const hasMeta = keys.includes('meta') || (hasMod && isMac);
                const hasAlt = keys.includes('alt');
                const hasShift = keys.includes('shift');

                // Find the main key (the one that isn't a modifier)
                const mainKey = keys.find(k => !['mod', 'ctrl', 'meta', 'alt', 'shift'].includes(k));

                if (!mainKey) return;

                const isMatch =
                    event.key.toLowerCase() === mainKey &&
                    event.ctrlKey === hasCtrl &&
                    event.metaKey === hasMeta &&
                    event.altKey === hasAlt &&
                    event.shiftKey === hasShift;

                if (isMatch) {
                    if (preventDefault) event.preventDefault();
                    callbackRef.current(event);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcut, preventDefault, ignoreInputFocus]);
}
