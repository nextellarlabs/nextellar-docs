import { useState, useCallback, useMemo } from 'react';

export type ValidateFn<V> = (value: V) => true | string;

export interface UseFormOptions<T extends Record<string, unknown>> {
    initialValues: T;
    onSubmit?: (values: T) => void | Promise<void>;
    validate?: Partial<{ [K in keyof T]: ValidateFn<T[K]> }>;
}

export interface FieldRegistration {
    name: string;
    value: unknown;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    error: string | undefined;
}

export interface UseFormReturn<T extends Record<string, unknown>> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isDirty: boolean;
    isSubmitting: boolean;
    register: (field: keyof T) => FieldRegistration;
    handleSubmit: (e?: React.FormEvent) => Promise<void>;
    reset: () => void;
    setFieldValue: (field: keyof T, value: T[keyof T]) => void;
    setFieldError: (field: keyof T, error: string) => void;
}

/**
 * Basic deep equality check for objects and arrays.
 */
function isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        if (!keysB.includes(key) || !isEqual(a[key], b[key])) return false;
    }
    return true;
}

/**
 * A lightweight hook for managing form state, validation, and submission.
 *
 * @param options - Configuration object containing initialValues, onSubmit, and validate map
 * @returns An object containing form state and helper methods to manage the form
 *
 * @example
 * // Basic login form with validation
 * const { register, handleSubmit } = useForm({
 *   initialValues: { email: '', password: '' },
 *   onSubmit: async (values) => login(values),
 *   validate: {
 *     email: (v) => /\S+@\S+/.test(v) || 'Invalid email',
 *     password: (v) => v.length >= 8 || 'Min 8 characters',
 *   },
 * });
 *
 * @example
 * // Search form (single field, no validation)
 * const { register, handleSubmit } = useForm({
 *   initialValues: { query: '' },
 *   onSubmit: (values) => performSearch(values.query),
 * });
 *
 * @example
 * // Server error injection using setFieldError
 * const { register, handleSubmit, setFieldError } = useForm({
 *   initialValues: { username: '' },
 *   onSubmit: async (values) => {
 *     try {
 *       await api.updateUsername(values.username);
 *     } catch (err) {
 *       setFieldError('username', 'Username already taken');
 *     }
 *   },
 * });
 */
export function useForm<T extends Record<string, unknown>>(
    options: UseFormOptions<T>
): UseFormReturn<T> {
    const { initialValues, onSubmit, validate } = options;

    const [values, setValues] = useState<T>({ ...initialValues });
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isDirty = useMemo(() => !isEqual(values, initialValues), [values, initialValues]);

    const validateField = useCallback(
        (field: keyof T, value: T[keyof T]): string | undefined => {
            if (!validate || !validate[field]) return undefined;
            const result = validate[field]!(value);
            return result === true ? undefined : result;
        },
        [validate]
    );

    const validateAll = useCallback((): Partial<Record<keyof T, string>> => {
        const newErrors: Partial<Record<keyof T, string>> = {};
        if (validate) {
            (Object.keys(validate) as Array<keyof T>).forEach((field) => {
                const error = validateField(field, values[field]);
                if (error) {
                    newErrors[field] = error;
                }
            });
        }
        return newErrors;
    }, [validate, validateField, values]);

    const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    }, []);

    const setFieldError = useCallback((field: keyof T, error: string) => {
        setErrors((prev) => ({ ...prev, [field]: error }));
    }, []);

    const register = useCallback(
        (field: keyof T): FieldRegistration => {
            return {
                name: field as string,
                value: values[field],
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                    const value = e.target.value as T[keyof T];
                    setValues((prev) => ({ ...prev, [field]: value }));
                },
                onBlur: () => {
                    setTouched((prev) => ({ ...prev, [field]: true }));
                    const error = validateField(field, values[field]);
                    setErrors((prev) => {
                        const newErrors = { ...prev };
                        if (error) {
                            newErrors[field] = error;
                        } else {
                            delete newErrors[field];
                        }
                        return newErrors;
                    });
                },
                error: touched[field] ? errors[field] : undefined,
            };
        },
        [values, errors, touched, validateField]
    );

    const handleSubmit = useCallback(
        async (e?: React.FormEvent) => {
            if (e && e.preventDefault) {
                e.preventDefault();
            }

            const allErrors = validateAll();
            setErrors(allErrors);

            // Mark all fields as touched on submit to show errors
            const allTouched: Partial<Record<keyof T, boolean>> = {};
            (Object.keys(values) as Array<keyof T>).forEach((key) => {
                allTouched[key] = true;
            });
            setTouched(allTouched);

            if (Object.keys(allErrors).length === 0) {
                setIsSubmitting(true);
                try {
                    if (onSubmit) {
                        await onSubmit(values);
                    }
                } finally {
                    setIsSubmitting(false);
                }
            }
        },
        [values, validateAll, onSubmit]
    );

    const reset = useCallback(() => {
        setValues({ ...initialValues });
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        isDirty,
        isSubmitting,
        register,
        handleSubmit,
        reset,
        setFieldValue,
        setFieldError,
    };
}
