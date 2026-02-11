import type { ResolvedTheme, ThemeMode } from 'src/types/theme';

interface ThemeToggleProps {
  /** The user's current theme preference. */
  themeMode: ThemeMode;
  /** The resolved theme applied to the UI. */
  resolvedTheme: ResolvedTheme;
  /** Handler called when the user clicks to cycle the theme. */
  onCycle: () => void;
}

export type { ThemeToggleProps };
