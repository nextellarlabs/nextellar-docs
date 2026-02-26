'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseCountdownOptions {
  /**
   * Callback fired when the countdown reaches 0
   */
  onComplete?: () => void;
  /**
   * Explicitly set to true to treat targetDate as a duration in milliseconds,
   * otherwise it assumes numbers less than 946684800000 (year 2000) are durations.
   */
  isDuration?: boolean;
}

export interface UseCountdownReturn {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isRunning: boolean;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

/**
 * A hook that manages a countdown timer with formatting and controls.
 *
 * @param targetDate The target date/timestamp, or a duration in milliseconds.
 * @param options Additional options for the hook.
 * @returns Formatted time components and control functions.
 */
export function useCountdown(
  targetDate: number | Date | string,
  options?: UseCountdownOptions
): UseCountdownReturn {
  const onCompleteRef = useRef(options?.onComplete);

  // Keep the onComplete ref updated so we don't trigger stale closures
  useEffect(() => {
    onCompleteRef.current = options?.onComplete;
  }, [options?.onComplete]);

  const getTargetTimeMS = useCallback(
    (target: number | Date | string) => {
      if (target instanceof Date) return target.getTime();
      if (typeof target === 'string') return new Date(target).getTime();
      if (typeof target === 'number') {
        if (options?.isDuration) return Date.now() + target;
        // Assume duration if < year 2000 in ms (approx 946684800000)
        if (target < 946684800000) return Date.now() + target;
        return target;
      }
      return Date.now();
    },
    [options?.isDuration]
  );

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const end = getTargetTimeMS(targetDate);
    return Math.max(0, end - Date.now());
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);

  const endTimeRef = useRef<number | null>(null);
  const initialTargetRef = useRef<number | Date | string>(targetDate);

  const initTimer = useCallback(() => {
    const end = getTargetTimeMS(targetDate);
    endTimeRef.current = end;
    const remaining = Math.max(0, end - Date.now());
    setTimeLeft(remaining);

    if (remaining > 0) {
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [targetDate, getTargetTimeMS]);

  // Handle prop changes: reset the timer if the targetDate changes
  useEffect(() => {
    if (initialTargetRef.current !== targetDate) {
      initialTargetRef.current = targetDate;
      initTimer();
    }
  }, [targetDate, initTimer]);

  // Initial mount setup
  useEffect(() => {
    if (endTimeRef.current === null) {
      const end = getTargetTimeMS(initialTargetRef.current);
      endTimeRef.current = end;
      const remaining = Math.max(0, end - Date.now());
      if (remaining > 0) {
        setIsRunning(true);
      }
    }
  }, [getTargetTimeMS]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (timeLeft > 0 && !isRunning) {
      endTimeRef.current = Date.now() + timeLeft;
      setIsRunning(true);
    }
  }, [timeLeft, isRunning]);

  const reset = useCallback(() => {
    initTimer();
  }, [initTimer]);

  useEffect(() => {
    if (!isRunning || !endTimeRef.current) return;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTimeRef.current! - now);

      setTimeLeft(remaining);

      if (remaining === 0) {
        setIsRunning(false);
        onCompleteRef.current?.();
      }
    };

    // Use 500ms to ensure accurate sub-second updates without excessive renders
    // and effectively completely removes visual drift on standard devices
    const intervalId = setInterval(tick, 500);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    isRunning,
    pause,
    resume,
    reset,
  };
}
