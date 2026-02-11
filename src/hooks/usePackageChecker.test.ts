import { act, renderHook } from '@testing-library/react';

import usePackageChecker from './usePackageChecker';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('usePackageChecker', () => {
  it('initial state is idle', () => {
    const { result } = renderHook(() => usePackageChecker());

    expect(result.current.status).toBe('idle');
    expect(result.current.inputValue).toBe('');
    expect(result.current.message).toBe('');
    expect(result.current.projectUrl).toBe('');
    expect(result.current.normalizedName).toBe('');
  });

  it('typing triggers debounce — no fetch before 300ms', () => {
    const { result } = renderHook(() => usePackageChecker());

    act(() => {
      result.current.onChange('requests');
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('after 300ms fetch is called with normalized name', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    const { result } = renderHook(() => usePackageChecker());

    act(() => {
      result.current.onChange('My_Package');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://pypi.org/pypi/my-package/json',
      expect.objectContaining({
        signal: expect.any(AbortSignal) as AbortSignal,
      }),
    );
  });

  it('result updates state to taken', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    const { result } = renderHook(() => usePackageChecker());

    act(() => {
      result.current.onChange('requests');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('taken');
    expect(result.current.projectUrl).toBe(
      'https://pypi.org/project/requests/',
    );
  });

  it('result updates state to available', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const { result } = renderHook(() => usePackageChecker());

    act(() => {
      result.current.onChange('xyzzy-not-real');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('available');
    expect(result.current.normalizedName).toBe('xyzzy-not-real');
  });

  it('changing input cancels previous request via AbortController', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    const { result } = renderHook(() => usePackageChecker());

    act(() => {
      result.current.onChange('first');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Change input before first debounce fires — timer is cleared
    act(() => {
      result.current.onChange('second');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Only the second request should have been made (first timer was cleared)
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://pypi.org/pypi/second/json',
      expect.objectContaining({
        signal: expect.any(AbortSignal) as AbortSignal,
      }),
    );
    expect(result.current.status).toBe('available');
  });

  it('empty input resets to idle without fetch', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    const { result } = renderHook(() => usePackageChecker());

    act(() => {
      result.current.onChange('test');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('taken');

    mockFetch.mockClear();
    act(() => {
      result.current.onChange('');
    });

    expect(result.current.status).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('invalid input sets status to invalid with validation message', async () => {
    const { result } = renderHook(() => usePackageChecker());

    act(() => {
      result.current.onChange('my package');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(result.current.status).toBe('invalid');
    expect(result.current.message).toBe(
      'Package name can only contain letters, numbers, hyphens, underscores, and periods',
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('no fetch is called for invalid input', async () => {
    const { result } = renderHook(() => usePackageChecker());

    act(() => {
      result.current.onChange('-invalid');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(result.current.status).toBe('invalid');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('whitespace-only input sets status to idle', () => {
    const { result } = renderHook(() => usePackageChecker());

    act(() => {
      result.current.onChange('   ');
    });

    expect(result.current.status).toBe('idle');
  });

  it('transitioning from invalid to valid input triggers lookup', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    const { result } = renderHook(() => usePackageChecker());

    act(() => {
      result.current.onChange('my package');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(result.current.status).toBe('invalid');

    act(() => {
      result.current.onChange('mypackage');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('available');
    expect(mockFetch).toHaveBeenCalled();
  });

  it('error result sets status to error with categorized message', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    const { result } = renderHook(() => usePackageChecker());

    act(() => {
      result.current.onChange('test');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.message).toBe(
      'Too many requests, please wait and try again',
    );
  });

  it('modifying input after error resets state and triggers new lookup', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const { result } = renderHook(() => usePackageChecker());

    act(() => {
      result.current.onChange('test');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('error');

    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    act(() => {
      result.current.onChange('test2');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('available');
  });
});
