'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type QueueTask<T> = () => Promise<T>;

export interface UseQueueOptions<T, E = Error> {
  /** Max number of concurrent tasks. Default: 1 */
  concurrency?: number;
  /** Start processing immediately. Default: true */
  autoStart?: boolean;
  /** Called when a task resolves */
  onSuccess?: (result: T) => void;
  /** Called when a task rejects */
  onError?: (error: E) => void;
}

export interface UseQueueReturn<T, E = Error> {
  enqueue: (task: QueueTask<T>) => Promise<T>;
  clear: () => void;
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
  pending: number;
  running: number;
  size: number;
  isIdle: boolean;
  lastResult: T | null;
  lastError: E | null;
}

/**
 * Manages a simple async task queue with configurable concurrency.
 */
export function useQueue<T, E = Error>(
  options: UseQueueOptions<T, E> = {}
): UseQueueReturn<T, E> {
  const {
    concurrency = 1,
    autoStart = true,
    onSuccess,
    onError,
  } = options;

  const queueRef = useRef<Array<QueueTask<T>>>([]);
  const runningRef = useRef(0);
  const concurrencyRef = useRef(Math.max(1, concurrency));
  const pausedRef = useRef(!autoStart);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  const [pending, setPending] = useState(0);
  const [running, setRunning] = useState(0);
  const [isPaused, setIsPaused] = useState(!autoStart);
  const [lastResult, setLastResult] = useState<T | null>(null);
  const [lastError, setLastError] = useState<E | null>(null);

  useEffect(() => {
    concurrencyRef.current = Math.max(1, concurrency);
  }, [concurrency]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const processNext = useCallback(() => {
    if (pausedRef.current) return;

    while (
      runningRef.current < concurrencyRef.current &&
      queueRef.current.length > 0
    ) {
      const task = queueRef.current.shift();
      if (!task) break;

      runningRef.current += 1;
      setRunning(runningRef.current);
      setPending(queueRef.current.length);

      Promise.resolve()
        .then(() => task())
        .then((result) => {
          setLastResult(result);
          onSuccessRef.current?.(result);
          return result;
        })
        .catch((err) => {
          setLastError(err as E);
          onErrorRef.current?.(err as E);
          throw err;
        })
        .finally(() => {
          runningRef.current -= 1;
          setRunning(runningRef.current);
          if (!pausedRef.current) processNext();
        });
    }
  }, []);

  const enqueue = useCallback(
    (task: QueueTask<T>) => {
      return new Promise<T>((resolve, reject) => {
        const wrapped = () =>
          Promise.resolve()
            .then(task)
            .then((result) => {
              resolve(result);
              return result;
            })
            .catch((err) => {
              reject(err);
              throw err;
            });

        queueRef.current.push(wrapped);
        setPending(queueRef.current.length);
        processNext();
      });
    },
    [processNext]
  );

  const clear = useCallback(() => {
    queueRef.current = [];
    setPending(0);
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
    processNext();
  }, [processNext]);

  useEffect(() => {
    if (!pausedRef.current) processNext();
  }, [processNext]);

  return {
    enqueue,
    clear,
    pause,
    resume,
    isPaused,
    pending,
    running,
    size: pending + running,
    isIdle: pending === 0 && running === 0,
    lastResult,
    lastError,
  };
}
