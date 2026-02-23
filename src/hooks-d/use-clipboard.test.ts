import { renderHook, act } from '@testing-library/react';
import { useClipboard } from './use-clipboard';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset window and navigator mocks
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.copy).toBe('function');
  });

  it('should successfully copy text using navigator.clipboard', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText: writeTextMock } });
    vi.stubGlobal('window', { isSecureContext: true });

    const { result } = renderHook(() => useClipboard());

    let success;
    await act(async () => {
      success = await result.current.copy('test text');
    });

    expect(success).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('test text');
    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should auto-reset copied state after timeout', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText: writeTextMock } });
    vi.stubGlobal('window', { isSecureContext: true });

    const { result } = renderHook(() => useClipboard({ timeout: 1000 }));

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('should use fallback execCommand when navigator.clipboard is unavailable', async () => {
    vi.stubGlobal('navigator', {}); // No clipboard
    const execCommandMock = vi.fn().mockReturnValue(true);
    vi.stubGlobal('document', {
      ...document,
      execCommand: execCommandMock,
      createElement: () => ({
        style: {},
        select: vi.fn(),
        remove: vi.fn(),
      }),
      body: {
        prepend: vi.fn(),
      },
    });

    const { result } = renderHook(() => useClipboard());

    let success;
    await act(async () => {
      success = await result.current.copy('fallback text');
    });

    expect(success).toBe(true);
    expect(execCommandMock).toHaveBeenCalledWith('copy');
    expect(result.current.copied).toBe(true);
  });

  it('should handle copy errors correctly', async () => {
    const errorMessage = 'Permission denied';
    const writeTextMock = vi.fn().mockRejectedValue(new Error(errorMessage));
    vi.stubGlobal('navigator', { clipboard: { writeText: writeTextMock } });
    vi.stubGlobal('window', { isSecureContext: true });

    const { result } = renderHook(() => useClipboard());

    let success;
    await act(async () => {
      success = await result.current.copy('error text');
    });

    expect(success).toBe(false);
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
  });
});
