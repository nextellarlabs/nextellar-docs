import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useQueue } from '../use-queue';

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

describe('useQueue', () => {
    it('runs tasks sequentially with concurrency 1', async () => {
        const { result } = renderHook(() => useQueue<string>({ concurrency: 1 }));

        const task1 = deferred<string>();
        const task2 = deferred<string>();

        let p1: Promise<string>;
        let p2: Promise<string>;

        await act(async () => {
            p1 = result.current.enqueue(() => task1.promise);
            p2 = result.current.enqueue(() => task2.promise);
        });

        expect(result.current.running).toBe(1);
        expect(result.current.pending).toBe(1);

        await act(async () => {
            task1.resolve('a');
            await p1!;
        });

        expect(result.current.running).toBe(1);
        expect(result.current.pending).toBe(0);

        await act(async () => {
            task2.resolve('b');
            await p2!;
        });

        expect(result.current.isIdle).toBe(true);
        expect(result.current.lastResult).toBe('b');
    });

    it('pauses and resumes processing', async () => {
        const { result } = renderHook(() =>
            useQueue<string>({ autoStart: false })
        );

        const task = deferred<string>();

        await act(async () => {
            result.current.enqueue(() => task.promise);
        });

        expect(result.current.running).toBe(0);
        expect(result.current.pending).toBe(1);
        expect(result.current.isPaused).toBe(true);

        await act(async () => {
            result.current.resume();
        });

        expect(result.current.isPaused).toBe(false);
        expect(result.current.running).toBe(1);

        await act(async () => {
            task.resolve('done');
        });

        expect(result.current.isIdle).toBe(true);
    });

    it('captures lastError on rejection', async () => {
        const { result } = renderHook(() => useQueue<string>());

        const error = new Error('boom');
        let promise!: Promise<string>;

        await act(async () => {
            promise = result.current.enqueue(() => Promise.reject(error));
        });

        await expect(promise).rejects.toThrow('boom');
        expect(result.current.lastError).toBe(error);
    });
});
