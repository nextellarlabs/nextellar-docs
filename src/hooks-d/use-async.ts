import { useState, useCallback, useEffect, useRef } from 'react';

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

export interface UseAsyncOptions {
    immediate?: boolean;
}

export interface ExecuteOptions<T> {
    optimisticData?: T;
}

export interface UseAsyncReturn<T, E = Error> {
    data: T | null;
    error: E | null;
    loading: boolean;
    status: AsyncStatus;
    execute: (...args: any[]) => Promise<T | void>;
    // Overload for execute with options
    executeWithOptions: (args: any[], options?: ExecuteOptions<T>) => Promise<T | void>;
    reset: () => void;
    setData: (data: T | null) => void;
}

/**
 * Wraps an asynchronous operation with loading, error, and data state management.
 * Supports automatic cancellation on unmount and optimistic updates.
 * 
 * @param asyncFunction - The asynchronous function to execute. Receives an AbortSignal as the last argument.
 * @param options - Hook configuration options.
 * @returns An object containing the current state and control functions.
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
    const latestDataRef = useRef<T | null>(null);
    latestDataRef.current = data;

    const reset = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setData(null);
        setError(null);
        setStatus('idle');
    }, []);

    const executeInternal = useCallback(
        async (args: any[], executeOptions?: ExecuteOptions<T>) => {
            // Abort previous request if in flight
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const previousData = latestDataRef.current;

            // Handle optimistic update
            if (executeOptions?.optimisticData !== undefined) {
                setData(executeOptions.optimisticData);
            }

            // Create new AbortController for this request
            const controller = new AbortController();
            abortControllerRef.current = controller;

            setStatus('pending');
            setError(null);

            try {
                const result = await asyncFunction(...args, controller.signal);

                if (!controller.signal.aborted) {
                    setData(result);
                    setStatus('success');
                    return result;
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    // Rollback on error if we had an optimistic update
                    if (executeOptions?.optimisticData !== undefined) {
                        setData(previousData);
                    }
                    setError(err as E);
                    setStatus('error');
                }
            }
        },
        [asyncFunction]
    );

    const execute = useCallback(
        (...args: any[]) => executeInternal(args),
        [executeInternal]
    );

    const executeWithOptions = useCallback(
        (args: any[], executeOptions?: ExecuteOptions<T>) => executeInternal(args, executeOptions),
        [executeInternal]
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
        executeWithOptions,
        reset,
        setData,
    };
}
