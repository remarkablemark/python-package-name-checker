/** User-selected theme preference: system follows OS, light/dark are explicit overrides. */
type ThemeMode = 'system' | 'light' | 'dark';

/** The resolved theme actually applied to the UI after considering OS preference. */
type ResolvedTheme = 'light' | 'dark';

export type { ResolvedTheme, ThemeMode };
