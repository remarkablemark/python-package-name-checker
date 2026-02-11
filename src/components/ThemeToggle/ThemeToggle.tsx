import type { ThemeMode } from 'src/types/theme';

import type { ThemeToggleProps } from './ThemeToggle.types';

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

function MonitorIcon() {
  return (
    <svg
      aria-hidden="true"
      data-icon="monitor"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
    >
      <rect height="13" rx="2" ry="2" width="20" x="2" y="3" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="16" y2="21" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      data-icon="sun"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" x2="12" y1="1" y2="3" />
      <line x1="12" x2="12" y1="21" y2="23" />
      <line x1="4.22" x2="5.64" y1="4.22" y2="5.64" />
      <line x1="18.36" x2="19.78" y1="18.36" y2="19.78" />
      <line x1="1" x2="3" y1="12" y2="12" />
      <line x1="21" x2="23" y1="12" y2="12" />
      <line x1="4.22" x2="5.64" y1="19.78" y2="18.36" />
      <line x1="18.36" x2="19.78" y1="5.64" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      data-icon="moon"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

const ICONS: Record<ThemeMode, () => React.JSX.Element> = {
  system: MonitorIcon,
  light: SunIcon,
  dark: MoonIcon,
};

export default function ThemeToggle({ themeMode, onCycle }: ThemeToggleProps) {
  const Icon = ICONS[themeMode];
  const nextMode = NEXT_MODE[themeMode];

  return (
    <button
      aria-label={`Theme: ${themeMode}. Click to switch to ${nextMode}.`}
      className="fixed right-4 bottom-4 rounded-full bg-white/80 p-3 shadow-lg backdrop-blur-sm transition-colors hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
      onClick={onCycle}
      type="button"
    >
      <Icon />
    </button>
  );
}
