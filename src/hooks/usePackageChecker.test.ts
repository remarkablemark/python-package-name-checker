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
});
