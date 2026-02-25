'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseClipboardOptions {
  timeout?: number;
}

interface UseClipboardResult<T extends string | number | boolean = string> {
  copy: (text: T) => Promise<boolean>;
  copied: boolean;
  error: Error | null;
}

export function useClipboard<T extends string | number | boolean = string>({
  timeout = 2000,
}: UseClipboardOptions = {}): UseClipboardResult<T> {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const copy = useCallback(
    async (text: T) => {
      clearTimer();
      setCopied(false);
      setError(null);

      const textToCopy = String(text);

      if (typeof window === 'undefined') {
        const ssrError = new Error('Clipboard is not supported in SSR');
        setError(ssrError);
        return false;
      }

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback for older browsers or non-HTTPS contexts
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;

          // Move outside of viewport
          textArea.style.position = 'absolute';
          textArea.style.left = '-999999px';

          document.body.prepend(textArea);
          textArea.select();

          try {
            const successful = document.execCommand('copy');
            if (!successful) {
              throw new Error('Fallback copy command was unsuccessful');
            }
          } finally {
            textArea.remove();
          }
        }

        setCopied(true);
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        setCopied(false);
        setError(
          err instanceof Error
            ? err
            : new Error('Unknown error during clipboard copy')
        );
        return false;
      }
    },
    [timeout, clearTimer]
  );

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return { copy, copied, error };
}
