import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../use-local-storage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useLocalStorage', () => {
    const key = 'test-key';
    const initialValue = { name: 'Initial' };

    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    it('should return initial value when no value in localStorage', () => {
        const { result } = renderHook(() => useLocalStorage(key, initialValue));
        expect(result.current[0]).toEqual(initialValue);
    });

    it('should return value from localStorage if it exists on mount', () => {
        const existingValue = { name: 'Existing' };
        window.localStorage.setItem(key, JSON.stringify(existingValue));

        const { result } = renderHook(() => useLocalStorage(key, initialValue));

        // In the test environment, the useEffect runs promptly
        expect(result.current[0]).toEqual(existingValue);
    });

    it('should update localStorage and state when setValue is called', () => {
        const { result } = renderHook(() => useLocalStorage(key, initialValue));
        const newValue = { name: 'New' };

        act(() => {
            result.current[1](newValue);
        });

        expect(result.current[0]).toEqual(newValue);
        expect(window.localStorage.getItem(key)).toBe(JSON.stringify(newValue));
    });

    it('should handle functional updates', () => {
        const { result } = renderHook(() => useLocalStorage<number>(key, 0));

        act(() => {
            result.current[1]((prev) => prev + 1);
        });

        expect(result.current[0]).toBe(1);
        expect(window.localStorage.getItem(key)).toBe('1');
    });

    it('should remove value from localStorage and reset state', () => {
        window.localStorage.setItem(key, JSON.stringify({ name: 'Removable' }));
        const { result } = renderHook(() => useLocalStorage(key, initialValue));

        act(() => {
            result.current[2]();
        });

        expect(result.current[0]).toEqual(initialValue);
        expect(window.localStorage.getItem(key)).toBeNull();
    });

    it('should handle nested objects and arrays', () => {
        const complexData = { a: [1, 2], b: { c: 3 } };
        const { result } = renderHook(() => useLocalStorage(key, complexData));

        act(() => {
            result.current[1](complexData);
        });

        expect(result.current[0]).toEqual(complexData);
        expect(JSON.parse(window.localStorage.getItem(key)!)).toEqual(complexData);
    });

    it('should handle Date objects (serialized as strings)', () => {
        const date = new Date('2026-02-24T00:00:00Z');
        const { result } = renderHook(() => useLocalStorage<any>(key, null));

        act(() => {
            result.current[1](date);
        });

        // Note: JSON.stringify of a Date is an ISO string.
        // JSON.parse of that string remains a string.
        expect(result.current[0]).toBe(date.toISOString());
        expect(window.localStorage.getItem(key)).toBe(`"${date.toISOString()}"`);
    });


    it('should handle undefined gracefully', () => {
        const { result } = renderHook(() => useLocalStorage<any>(key, 'something'));

        act(() => {
            result.current[1](undefined);
        });

        expect(result.current[0]).toBeUndefined();
        expect(window.localStorage.getItem(key)).toBe('undefined');

        // Verify it can read back undefined
        const { result: result2 } = renderHook(() => useLocalStorage<any>(key, 'fallback'));
        expect(result2.current[0]).toBeUndefined();
    });

    it('should sync value across tabs via storage event', () => {
        const { result } = renderHook(() => useLocalStorage(key, initialValue));
        const newValue = { name: 'Sync' };

        act(() => {
            // Simulate storage event from another tab
            window.localStorage.setItem(key, JSON.stringify(newValue));
            window.dispatchEvent(new StorageEvent('storage', {
                key: key,
                newValue: JSON.stringify(newValue)
            }));
        });

        expect(result.current[0]).toEqual(newValue);
    });

    it('should sync value within the same tab via custom event', () => {
        const { result } = renderHook(() => useLocalStorage(key, initialValue));
        const newValue = { name: 'LocalSync' };

        act(() => {
            // Manually set item and trigger custom event (simulating another hook instance)
            window.localStorage.setItem(key, JSON.stringify(newValue));
            window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key } }));
        });

        expect(result.current[0]).toEqual(newValue);
    });

    it('should not sync when a different key is updated', () => {
        const { result } = renderHook(() => useLocalStorage(key, initialValue));

        act(() => {
            window.localStorage.setItem('other-key', '"other-value"');
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'other-key',
                newValue: '"other-value"'
            }));
        });

        expect(result.current[0]).toEqual(initialValue);
    });

    it('should handle localStorage errors gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Storage disabled');
        });

        const { result } = renderHook(() => useLocalStorage(key, initialValue));

        expect(result.current[0]).toEqual(initialValue);
        expect(consoleSpy).toHaveBeenCalled();

        getItemSpy.mockRestore();
        consoleSpy.mockRestore();
    });
});
