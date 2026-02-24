'use client';

import {
    useState,
    useEffect,
    useCallback,
    Dispatch,
    SetStateAction,
} from 'react';

/**
 * A hook that persists state in localStorage and synchronizes across tabs.
 * SSR-safe: Returns initialValue during server render and hydrates on client mount.
 *
 * @param key The localStorage key
 * @param initialValue The initial value to use if no value is found in localStorage
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] {
    // Use state to store the current value.
    // We initialize with initialValue to avoid hydration mismatch during SSR.
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    /**
     * Reads the current value from localStorage.
     * Internal helper function.
     */
    const readValue = useCallback((): T => {
        // Prevent build error "window is undefined" and handle SSR
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            if (item === null) return initialValue;

            // Special handling for "undefined" string which is not valid JSON
            if (item === 'undefined') return undefined as unknown as T;

            return JSON.parse(item) as T;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    }, [key, initialValue]);

    // On mount, hydrate the state with the value from localStorage.
    // This ensures the client-side state matches localStorage after the initial SSR-safe render.
    useEffect(() => {
        setStoredValue(readValue());
        // We only want to run this once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Sets the value both in state and localStorage.
     * Notifies other instances of useLocalStorage with the same key in the same tab.
     */
    const setValue: Dispatch<SetStateAction<T>> = useCallback(
        (value) => {
            try {
                if (typeof window === 'undefined') {
                    console.warn(
                        `Tried setting localStorage key "${key}" even though environment is not a client`
                    );
                    return;
                }

                // Allow value to be a function so we have same API as useState
                const newValue = value instanceof Function ? value(storedValue) : value;

                // Save to local storage
                window.localStorage.setItem(key, JSON.stringify(newValue));

                // Update state
                setStoredValue(newValue);

                // We dispatch a custom event so every useLocalStorage hook instance in the same tab is notified
                window.dispatchEvent(
                    new CustomEvent('local-storage-update', { detail: { key } })
                );
            } catch (error) {
                // Handle QuotaExceededError or other storage errors gracefully
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    /**
     * Removes the value from localStorage and resets state to initialValue.
     */
    const removeValue = useCallback(() => {
        try {
            if (typeof window === 'undefined') return;

            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
            window.dispatchEvent(
                new CustomEvent('local-storage-update', { detail: { key } })
            );
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    // Synchronization across tabs (storage event) and within the same tab (custom event)
    useEffect(() => {
        const handleUpdate = (event: StorageEvent | CustomEvent | Event) => {
            // For cross-tab sync (StorageEvent)
            if (event instanceof StorageEvent) {
                if (event.key !== key) return;
            }

            // For same-tab sync (CustomEvent 'local-storage-update')
            if (event instanceof CustomEvent && event.type === 'local-storage-update') {
                if (event.detail?.key !== key) return;
            }

            // Update state from localStorage
            setStoredValue(readValue());
        };

        window.addEventListener('storage', handleUpdate);
        window.addEventListener('local-storage-update', handleUpdate as EventListener);

        return () => {
            window.removeEventListener('storage', handleUpdate);
            window.removeEventListener('local-storage-update', handleUpdate as EventListener);
        };
    }, [key, readValue]);

    return [storedValue, setValue, removeValue];
}
