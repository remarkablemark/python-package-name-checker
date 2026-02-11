import { useEffect, useState } from 'react';
import type { ResolvedTheme, ThemeMode } from 'src/types/theme';

const THEME_KEY = 'python-package-name-checker.theme';
const VALID_MODES: ThemeMode[] = ['system', 'light', 'dark'];
const CYCLE_ORDER: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

interface UseThemeReturn {
  /** The user's stored theme preference. */
  themeMode: ThemeMode;
  /** The resolved theme applied to the UI. */
  resolvedTheme: ResolvedTheme;
  /** Advances to the next theme in the cycle: system → light → dark → system. */
  cycleTheme: () => void;
}

function readStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && VALID_MODES.includes(stored as ThemeMode)) {
      return stored as ThemeMode;
    }
  } catch {
    // localStorage unavailable — fall back to default
  }
  return 'system';
}

function getSystemPreference(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return prefersDark ? 'dark' : 'light';
}

/**
 * Manages theme state, localStorage persistence, OS preference detection,
 * and document.documentElement class toggling for dark mode.
 */
export default function useTheme(): UseThemeReturn {
  const [themeMode, setThemeMode] = useState<ThemeMode>(readStoredTheme);
  const [prefersDark, setPrefersDark] = useState(getSystemPreference);

  const resolvedTheme = resolveTheme(themeMode, prefersDark);

  useEffect(() => {
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [resolvedTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (event: { matches: boolean }) => {
      setPrefersDark(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  const cycleTheme = () => {
    const next = CYCLE_ORDER[themeMode];
    setThemeMode(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // localStorage unavailable — skip persistence
    }
  };

  return { themeMode, resolvedTheme, cycleTheme };
}
