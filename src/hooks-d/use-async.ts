import { useState, useCallback, useEffect, useRef } from 'react';

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

export interface UseAsyncOptions {
    immediate?: boolean;
}

export interface UseAsyncReturn<T, E = Error> {
    data: T | null;
    error: E | null;
    loading: boolean;
    status: AsyncStatus;
    execute: (...args: any[]) => Promise<T | void>;
    reset: () => void;
}

/**
 * Wraps an asynchronous operation with loading, error, and data state management.
 * 
 * @param asyncFunction - The asynchronous function to execute. Receives an AbortSignal as the last argument.
 * @param options - Hook configuration options.
 * @returns An object containing the current state and control functions.
 * 
 * @example
 * const { data, loading, error, execute } = useAsync(fetchUser, { immediate: true });
 */
export function useAsync<T, E = Error>(
    asyncFunction: (...args: any[]) => Promise<T>,
    options: UseAsyncOptions = {}
): UseAsyncReturn<T, E> {
    const { immediate = false } = options;

    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<E | null>(null);
    const [status, setStatus] = useState<AsyncStatus>('idle');

    const abortControllerRef = useRef<AbortController | null>(null);

    const reset = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setData(null);
        setError(null);
        setStatus('idle');
    }, []);

    const execute = useCallback(
        async (...args: any[]) => {
            // Abort previous request if in flight
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new AbortController for this request
            const controller = new AbortController();
            abortControllerRef.current = controller;

            setStatus('pending');
            setError(null);

            try {
                // We pass the signal as an extra argument or rely on the function capturing it if defined
                // For broad compatibility, we append it to args
                const result = await asyncFunction(...args, controller.signal);

                if (!controller.signal.aborted) {
                    setData(result);
                    setStatus('success');
                    return result;
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err as E);
                    setStatus('error');
                }
            }
        },
        [asyncFunction]
    );

    useEffect(() => {
        if (immediate) {
            execute();
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [execute, immediate]);

    return {
        data,
        error,
        loading: status === 'pending',
        status,
        execute,
        reset,
    };
}
