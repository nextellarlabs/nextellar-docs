import { renderHook, act } from '@testing-library/react';
import { useAsync } from './use-async';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('useAsync', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('initially has idle status and no data/error', () => {
        const { result } = renderHook(() => useAsync(async () => 'data'));
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBe(null);
        expect(result.current.loading).toBe(false);
        expect(result.current.status).toBe('idle');
    });

    it('sets loading and then data on success', async () => {
        const mockFn = vi.fn().mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve('success data'), 50))
        );
        const { result } = renderHook(() => useAsync(mockFn));

        act(() => {
            result.current.execute();
        });

        expect(result.current.loading).toBe(true);
        expect(result.current.status).toBe('pending');

        await act(async () => {
            vi.advanceTimersByTime(50);
        });

        expect(result.current.data).toBe('success data');
        expect(result.current.loading).toBe(false);
        expect(result.current.status).toBe('success');
    });

    it('sets error on failure', async () => {
        const mockError = new Error('failed');
        const mockFn = vi.fn().mockImplementation(() =>
            new Promise((_, reject) => setTimeout(() => reject(mockError), 50))
        );
        const { result } = renderHook(() => useAsync(mockFn));

        act(() => {
            result.current.execute();
        });

        await act(async () => {
            vi.advanceTimersByTime(50);
        });

        expect(result.current.error).toBe(mockError);
        expect(result.current.loading).toBe(false);
        expect(result.current.status).toBe('error');
    });

    it('supports optimistic updates and rollback', async () => {
        const mockFn = vi.fn().mockImplementation(() =>
            new Promise((_, reject) => setTimeout(() => reject(new Error('fail')), 50))
        );
        const { result } = renderHook(() => useAsync(mockFn));

        act(() => {
            result.current.setData('initial');
        });

        act(() => {
            result.current.executeWithOptions([], { optimisticData: 'optimistic' });
        });

        // Check optimistic state
        expect(result.current.data).toBe('optimistic');
        expect(result.current.loading).toBe(true);

        await act(async () => {
            vi.advanceTimersByTime(50);
        });

        // Should rollback to 'initial'
        expect(result.current.data).toBe('initial');
        expect(result.current.status).toBe('error');
    });

    it('supports immediate execution', async () => {
        const mockFn = vi.fn().mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve('immediate data'), 50))
        );
        const { result } = renderHook(() => useAsync(mockFn, { immediate: true }));

        expect(result.current.status).toBe('pending');

        await act(async () => {
            vi.advanceTimersByTime(50);
        });

        expect(result.current.data).toBe('immediate data');
        expect(result.current.status).toBe('success');
    });

    it('cancels pending request on unmount', async () => {
        const mockFn = vi.fn().mockImplementation((...args) => {
            const signal = args[args.length - 1];
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => resolve('data'), 100);
                signal.addEventListener('abort', () => {
                    clearTimeout(timeout);
                    reject(new Error('Aborted'));
                });
            });
        });
        const { result, unmount } = renderHook(() => useAsync(mockFn));

        act(() => {
            result.current.execute();
        });

        expect(result.current.status).toBe('pending');

        unmount();

        act(() => {
            vi.advanceTimersByTime(150);
        });

        const signal = mockFn.mock.calls[0][mockFn.mock.calls[0].length - 1];
        expect(signal.aborted).toBe(true);
    });

    it('resets state when reset is called', async () => {
        const mockFn = vi.fn().mockResolvedValue('data');
        const { result } = renderHook(() => useAsync(mockFn));

        await act(async () => {
            await result.current.execute();
        });

        expect(result.current.data).toBe('data');

        act(() => {
            result.current.reset();
        });

        expect(result.current.data).toBe(null);
        expect(result.current.status).toBe('idle');
    });
});
