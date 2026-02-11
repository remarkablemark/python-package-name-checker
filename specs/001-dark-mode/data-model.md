# Data Model: Dark Mode

**Feature**: 001-dark-mode | **Date**: 2026-02-11

## Entities

### ThemeMode

Represents the user's chosen theme preference. This is the value stored in localStorage and managed by the `useTheme` hook.

| Field | Type                            | Description                          |
| ----- | ------------------------------- | ------------------------------------ |
| value | `'system' \| 'light' \| 'dark'` | The user's selected theme preference |

**Default**: `'system'`
**Storage**: `localStorage` key `"theme"`
**Validation**: Must be one of the three literal values. Invalid stored values are treated as `'system'`.

### ResolvedTheme

The computed theme actually applied to the UI. Derived from `ThemeMode` and the OS preference.

| Field | Type                | Description                            |
| ----- | ------------------- | -------------------------------------- |
| value | `'light' \| 'dark'` | The effective theme rendered in the UI |

**Derivation rules**:

- If `ThemeMode` is `'light'` → `ResolvedTheme` is `'light'`
- If `ThemeMode` is `'dark'` → `ResolvedTheme` is `'dark'`
- If `ThemeMode` is `'system'` → `ResolvedTheme` matches OS `prefers-color-scheme`

### State Transitions

```
ThemeMode cycling (on button click):
  system → light → dark → system → ...

ResolvedTheme derivation:
  ┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
  │  ThemeMode   │────▶│  Resolution      │────▶│ ResolvedTheme │
  │  (stored)    │     │  Logic           │     │ (applied)     │
  └─────────────┘     └──────────────────┘     └───────────────┘
                             ▲
                             │
                      ┌──────┴───────┐
                      │ OS preference │
                      │ (matchMedia)  │
                      └──────────────┘
```

## Type Definitions

### `src/types/theme.ts`

```typescript
/** User-selected theme preference: system follows OS, light/dark are explicit overrides. */
type ThemeMode = 'system' | 'light' | 'dark';

/** The resolved theme actually applied to the UI after considering OS preference. */
type ResolvedTheme = 'light' | 'dark';
```

## Hook Interface

### `useTheme` Return Type

```typescript
interface UseThemeReturn {
  /** The user's stored theme preference. */
  themeMode: ThemeMode;
  /** The resolved theme applied to the UI. */
  resolvedTheme: ResolvedTheme;
  /** Advances to the next theme in the cycle: system → light → dark → system. */
  cycleTheme: () => void;
}
```

## Component Interface

### `ThemeToggle` Props

```typescript
interface ThemeToggleProps {
  /** The user's current theme preference. */
  themeMode: ThemeMode;
  /** The resolved theme applied to the UI. */
  resolvedTheme: ResolvedTheme;
  /** Handler called when the user clicks to cycle the theme. */
  onCycle: () => void;
}
```

## Storage Schema

| Key       | Type     | Values                          | Default behavior     |
| --------- | -------- | ------------------------------- | -------------------- |
| `"theme"` | `string` | `"system"`, `"light"`, `"dark"` | Missing = `"system"` |

**Read behavior**: On page load, the inline `<head>` script and `useTheme` hook both read `localStorage.getItem('python-package-name-checker.theme')`. If the value is `null`, missing, or not one of the three valid values, it is treated as `"system"`.

**Write behavior**: On each cycle, `localStorage.setItem('python-package-name-checker.theme', newMode)` is called. The value is always one of the three valid strings.

**Error handling**: All localStorage access is wrapped in try-catch. On failure (e.g., private browsing), the app falls back to system preference without persisting.

## DOM Side Effects

The `useTheme` hook manages a side effect on `document.documentElement`:

- When `resolvedTheme` is `'dark'`: adds class `"dark"` to `<html>`
- When `resolvedTheme` is `'light'`: removes class `"dark"` from `<html>`

This class drives all Tailwind `dark:` variant styles throughout the app.

## Relationships

```
localStorage("theme")
       │
       ▼
   useTheme hook
       │
       ├── themeMode (stored preference)
       ├── resolvedTheme (computed from themeMode + OS pref)
       ├── cycleTheme() (advances themeMode, writes localStorage)
       │
       ▼
   ThemeToggle component (renders icon, calls cycleTheme on click)
       │
       ▼
   document.documentElement.classList ("dark" class)
       │
       ▼
   All components (Tailwind dark: variants respond automatically)
```
