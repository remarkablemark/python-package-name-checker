import { act, renderHook } from '@testing-library/react';

import useTheme from './useTheme';

let mediaChangeHandler: ((event: { matches: boolean }) => void) | null = null;

const mockAddEventListener = vi.fn(
  (_event: string, handler: (event: { matches: boolean }) => void) => {
    mediaChangeHandler = handler;
  },
);
const mockRemoveEventListener = vi.fn(() => {
  mediaChangeHandler = null;
});

function setupMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    })),
  });
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  mediaChangeHandler = null;
  mockAddEventListener.mockClear();
  mockRemoveEventListener.mockClear();
  setupMatchMedia(false);
});

describe('useTheme hook', () => {
  it('defaults to system mode when no localStorage value exists', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.themeMode).toBe('system');
  });

  it('resolves to light when mode is system and OS prefers light', () => {
    setupMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    expect(result.current.themeMode).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('resolves to dark when mode is system and OS prefers dark', () => {
    setupMatchMedia(true);
    const { result } = renderHook(() => useTheme());

    expect(result.current.themeMode).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('cycles through system → light → dark → system', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.themeMode).toBe('system');

    act(() => {
      result.current.cycleTheme();
    });
    expect(result.current.themeMode).toBe('light');

    act(() => {
      result.current.cycleTheme();
    });
    expect(result.current.themeMode).toBe('dark');

    act(() => {
      result.current.cycleTheme();
    });
    expect(result.current.themeMode).toBe('system');
  });

  it('reads initial theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());

    expect(result.current.themeMode).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('writes theme to localStorage on cycle', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.cycleTheme();
    });

    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('resolves to light when mode is explicitly light', () => {
    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe('light');
  });

  it('resolves to dark when mode is explicitly dark regardless of OS preference', () => {
    setupMatchMedia(false);
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('adds dark class to documentElement when resolved theme is dark', () => {
    setupMatchMedia(true);
    renderHook(() => useTheme());

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class from documentElement when resolved theme is light', () => {
    document.documentElement.classList.add('dark');
    setupMatchMedia(false);
    localStorage.setItem('theme', 'light');
    renderHook(() => useTheme());

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('treats invalid localStorage values as system', () => {
    localStorage.setItem('theme', 'invalid-value');
    const { result } = renderHook(() => useTheme());

    expect(result.current.themeMode).toBe('system');
  });

  it('handles localStorage being unavailable gracefully', () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

    const { result } = renderHook(() => useTheme());

    expect(result.current.themeMode).toBe('system');

    // Should not throw when cycling
    act(() => {
      result.current.cycleTheme();
    });
    expect(result.current.themeMode).toBe('light');

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  // T018: System preference detection tests
  it('listens to matchMedia prefers-color-scheme changes', () => {
    renderHook(() => useTheme());

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  it('updates resolvedTheme in real-time when OS preference changes and mode is system', () => {
    setupMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe('light');

    act(() => {
      mediaChangeHandler?.({ matches: true });
    });

    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('ignores OS preference changes when mode is explicitly light', () => {
    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe('light');

    act(() => {
      mediaChangeHandler?.({ matches: true });
    });

    expect(result.current.resolvedTheme).toBe('light');
  });

  it('ignores OS preference changes when mode is explicitly dark', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe('dark');

    act(() => {
      mediaChangeHandler?.({ matches: false });
    });

    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('first visit with OS dark mode renders dark', () => {
    setupMatchMedia(true);
    const { result } = renderHook(() => useTheme());

    expect(result.current.themeMode).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('first visit with OS light mode renders light', () => {
    setupMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    expect(result.current.themeMode).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('cleans up matchMedia listener on unmount', () => {
    const { unmount } = renderHook(() => useTheme());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });
});
