import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useForm } from './use-form';

describe('useForm', () => {
    const initialValues = {
        email: 'test@example.com',
        password: '',
    };

    const validate = {
        email: (v: string) => (v.includes('@') ? true : 'Invalid email'),
        password: (v: string) => (v.length >= 6 ? true : 'Min 6 characters'),
    };

    it('1. Initializes values from initialValues', () => {
        const { result } = renderHook(() => useForm({ initialValues }));
        expect(result.current.values).toEqual(initialValues);
    });

    it('2. Initializes errors as empty object', () => {
        const { result } = renderHook(() => useForm({ initialValues }));
        expect(result.current.errors).toEqual({});
    });

    it('3. Initializes touched as empty object', () => {
        const { result } = renderHook(() => useForm({ initialValues }));
        expect(result.current.touched).toEqual({});
    });

    it('4. isDirty is false on initialization', () => {
        const { result } = renderHook(() => useForm({ initialValues }));
        expect(result.current.isDirty).toBe(false);
    });

    it('5. isDirty is true after a value changes', () => {
        const { result } = renderHook(() => useForm({ initialValues }));
        act(() => {
            result.current.register('email').onChange({
                target: { value: 'new@example.com' },
            } as any);
        });
        expect(result.current.isDirty).toBe(true);
    });

    it('6. isDirty returns false after reset()', () => {
        const { result } = renderHook(() => useForm({ initialValues }));
        act(() => {
            result.current.register('email').onChange({
                target: { value: 'new@example.com' },
            } as any);
        });
        expect(result.current.isDirty).toBe(true);
        act(() => {
            result.current.reset();
        });
        expect(result.current.isDirty).toBe(false);
    });

    it('7. register() returns correct name and value for a field', () => {
        const { result } = renderHook(() => useForm({ initialValues }));
        const registration = result.current.register('email');
        expect(registration.name).toBe('email');
        expect(registration.value).toBe(initialValues.email);
    });

    it('8. onChange from register() updates values[field]', () => {
        const { result } = renderHook(() => useForm({ initialValues }));
        act(() => {
            result.current.register('password').onChange({
                target: { value: 'password123' },
            } as any);
        });
        expect(result.current.values.password).toBe('password123');
    });

    it('9. onBlur from register() marks field as touched', () => {
        const { result } = renderHook(() => useForm({ initialValues }));
        act(() => {
            result.current.register('email').onBlur();
        });
        expect(result.current.touched.email).toBe(true);
    });

    it('10. onBlur runs field validator and populates errors[field] on invalid input', () => {
        const { result } = renderHook(() => useForm({ initialValues, validate }));
        act(() => {
            result.current.register('email').onChange({
                target: { value: 'invalid-email' },
            } as any);
        });
        act(() => {
            result.current.register('email').onBlur();
        });
        expect(result.current.errors.email).toBe('Invalid email');
    });

    it('11. onBlur clears errors[field] when input becomes valid', () => {
        const { result } = renderHook(() => useForm({ initialValues, validate }));
        // First make it invalid
        act(() => {
            result.current.register('email').onChange({
                target: { value: 'invalid-email' },
            } as any);
        });
        act(() => {
            result.current.register('email').onBlur();
        });
        expect(result.current.errors.email).toBe('Invalid email');

        // Now make it valid
        act(() => {
            result.current.register('email').onChange({
                target: { value: 'valid@example.com' },
            } as any);
        });
        act(() => {
            result.current.register('email').onBlur();
        });
        expect(result.current.errors.email).toBeUndefined();
    });

    it('12. error from register() is undefined for untouched fields', () => {
        const { result } = renderHook(() => useForm({ initialValues, validate }));
        // Change value but don't blur
        act(() => {
            result.current.register('email').onChange({
                target: { value: 'invalid-email' },
            } as any);
        });
        const registration = result.current.register('email');
        expect(registration.error).toBeUndefined();
    });

    it('13. error from register() returns the error string after blur on invalid field', () => {
        const { result } = renderHook(() => useForm({ initialValues, validate }));
        act(() => {
            result.current.register('email').onChange({
                target: { value: 'invalid-email' },
            } as any);
        });
        act(() => {
            result.current.register('email').onBlur();
        });
        const registration = result.current.register('email');
        expect(registration.error).toBe('Invalid email');
    });

    it('14. handleSubmit runs all validators before calling onSubmit', () => {
        const onSubmit = vi.fn();
        const { result } = renderHook(() => useForm({ initialValues: { email: '', password: '' }, onSubmit, validate }));

        act(() => {
            result.current.handleSubmit();
        });

        expect(result.current.errors.email).toBe('Invalid email');
        expect(result.current.errors.password).toBe('Min 6 characters');
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('15. handleSubmit does NOT call onSubmit if any validator fails', () => {
        const onSubmit = vi.fn();
        const { result } = renderHook(() => useForm({ initialValues: { email: 'valid@test.com', password: '' }, onSubmit, validate }));

        act(() => {
            result.current.handleSubmit();
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(result.current.errors.password).toBe('Min 6 characters');
    });

    it('16. handleSubmit calls onSubmit with current values when all valid', async () => {
        const onSubmit = vi.fn();
        const { result } = renderHook(() => useForm({
            initialValues: { email: 'valid@test.com', password: 'password123' },
            onSubmit,
            validate
        }));

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(onSubmit).toHaveBeenCalledWith({ email: 'valid@test.com', password: 'password123' });
    });

    it('17. isSubmitting is true during async onSubmit execution', async () => {
        let resolveSubmit: (value: void | PromiseLike<void>) => void;
        const onSubmit = vi.fn(() => new Promise<void>((resolve) => {
            resolveSubmit = resolve;
        }));

        const { result } = renderHook(() => useForm({
            initialValues: { email: 'valid@test.com', password: 'password123' },
            onSubmit,
            validate
        }));

        let submitPromise: Promise<void>;
        act(() => {
            submitPromise = result.current.handleSubmit();
        });

        expect(result.current.isSubmitting).toBe(true);

        await act(async () => {
            resolveSubmit!(undefined);
            await submitPromise!;
        });

        expect(result.current.isSubmitting).toBe(false);
    });

    it('18. isSubmitting returns to false after onSubmit resolves', async () => {
        const onSubmit = vi.fn(() => Promise.resolve());
        const { result } = renderHook(() => useForm({
            initialValues: { email: 'valid@test.com', password: 'password123' },
            onSubmit,
            validate
        }));

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.isSubmitting).toBe(false);
    });

    it('19. isSubmitting returns to false even if onSubmit throws', async () => {
        const onSubmit = vi.fn(() => Promise.reject(new Error('Submit failed')));
        const { result } = renderHook(() => useForm({
            initialValues: { email: 'valid@test.com', password: 'password123' },
            onSubmit,
            validate
        }));

        await act(async () => {
            try {
                await result.current.handleSubmit();
            } catch (e) {
                // Ignore error
            }
        });

        expect(result.current.isSubmitting).toBe(false);
    });

    it('20. reset() restores values, clears errors, clears touched', () => {
        const { result } = renderHook(() => useForm({ initialValues, validate }));

        act(() => {
            result.current.register('email').onChange({ target: { value: 'invalid' } } as any);
        });
        act(() => {
            result.current.register('email').onBlur();
        });

        expect(result.current.values.email).toBe('invalid');
        expect(result.current.errors.email).toBe('Invalid email');
        expect(result.current.touched.email).toBe(true);

        act(() => {
            result.current.reset();
        });

        expect(result.current.values).toEqual(initialValues);
        expect(result.current.errors).toEqual({});
        expect(result.current.touched).toEqual({});
    });

    it('21. setFieldValue updates value without running validation', () => {
        const { result } = renderHook(() => useForm({ initialValues, validate }));

        act(() => {
            result.current.setFieldValue('email', 'invalid-email');
        });

        expect(result.current.values.email).toBe('invalid-email');
        expect(result.current.errors.email).toBeUndefined();
    });

    it('22. setFieldError injects an external error string for a field', () => {
        const { result } = renderHook(() => useForm({ initialValues }));

        act(() => {
            result.current.setFieldError('email', 'Server error');
        });

        expect(result.current.errors.email).toBe('Server error');
    });
});
