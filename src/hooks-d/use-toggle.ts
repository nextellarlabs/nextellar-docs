import { useState, useCallback, useMemo } from 'react';

export interface ToggleHelpers {
    toggle: () => void;
    on: () => void;
    off: () => void;
    set: (value: boolean) => void;
}

export type UseToggleReturn = [boolean, ToggleHelpers];

/**
 * Manages a boolean state value with stable, named helper methods.
 *
 * @param initialValue - Starting boolean value. Defaults to `false`.
 * @returns A tuple of `[value, { toggle, on, off, set }]` where all helpers
 *          are referentially stable and safe to pass as props or dependencies.
 *
 * @example
 * // 1. Modal
 * const [isOpen, { on: openModal, off: closeModal }] = useToggle();
 * <button onClick={openModal}>Open</button>
 * <Modal open={isOpen} onClose={closeModal} />
 *
 * @example
 * // 2. Feature flag toggle switch
 * const [enabled, { toggle }] = useToggle(false);
 * <Switch checked={enabled} onChange={toggle} />
 *
 * @example
 * // 3. Conditional section
 * const [showDetails, { toggle }] = useToggle();
 * <button onClick={toggle}>{showDetails ? 'Hide' : 'Show'} Details</button>
 * {showDetails && <Details />}
 */
export function useToggle(initialValue: boolean = false): UseToggleReturn {
    const [value, setValue] = useState<boolean>(initialValue);

    const toggle = useCallback(() => setValue((prev) => !prev), []);
    const on = useCallback(() => setValue(true), []);
    const off = useCallback(() => setValue(false), []);
    const set = useCallback((v: boolean) => setValue(v), []);

    const helpers = useMemo(
        () => ({ toggle, on, off, set }),
        [toggle, on, off, set]
    );

    return [value, helpers];
}
