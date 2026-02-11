# Quickstart: Dark Mode

**Feature**: 001-dark-mode | **Date**: 2026-02-11

## Prerequisites

- Node.js 24
- npm (comes with Node.js)
- Existing project dependencies installed (`npm install`)

## Implementation Order

### Step 1: Tailwind Dark Mode Configuration

Add the `@custom-variant` directive to `src/index.css` to enable class-based dark mode:

```css
@import 'tailwindcss';

@custom-variant dark (&:where(.dark, .dark *));
```

Also add the dark mode placeholder override alongside the existing one:

```css
.dark .placeholder-light::placeholder {
  color: var(--color-slate-500);
}
```

### Step 2: Flash-Free Inline Script

Add a synchronous inline `<script>` in `index.html` `<head>` (before the body renders):

```html
<script>
  (function () {
    try {
      var theme = localStorage.getItem('python-package-name-checker.theme');
      var prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      if (theme === 'dark' || ((!theme || theme === 'system') && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      // localStorage unavailable — fall back to OS preference only
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
  })();
</script>
```

### Step 3: Theme Types

Create `src/types/theme.ts`:

```typescript
type ThemeMode = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

export type { ResolvedTheme, ThemeMode };
```

### Step 4: useTheme Hook

Create `src/hooks/useTheme.ts`:

- Read initial theme from localStorage (default: `'system'`)
- Compute `resolvedTheme` from `themeMode` + OS `prefers-color-scheme`
- Listen to `matchMedia` changes for real-time OS theme updates
- Toggle `.dark` class on `document.documentElement`
- Expose `{ themeMode, resolvedTheme, cycleTheme }`

### Step 5: ThemeToggle Component

Create `src/components/ThemeToggle/`:

- `ThemeToggle.tsx` — fixed bottom-right button with inline SVG icons
- `ThemeToggle.types.ts` — props interface
- `ThemeToggle.test.tsx` — unit tests
- `index.ts` — barrel export

### Step 6: Dark Variant Classes on Existing Components

Update existing components with `dark:` Tailwind classes:

- **`App.tsx`**: Add `dark:bg-gray-900` to `<main>`, `dark:text-slate-200` to `<h1>`
- **`PackageNameInput.tsx`**: Add `dark:bg-gray-800 dark:border-gray-600 dark:text-slate-100` to input
- **`AvailabilityResult.tsx`**: Add `dark:text-green-400`, `dark:text-red-400`, `dark:text-amber-400`, `dark:text-blue-400` to status messages
- **`index.html`**: Add `dark:bg-gray-900` to `<body>`

### Step 7: Wire Up in App

- Call `useTheme()` in `App` component
- Render `<ThemeToggle>` with theme props

## Verification Commands

```bash
# Type check
npm run lint:tsc

# Lint
npm run lint

# Tests with coverage
npm run test:ci

# Build
npm run build

# Dev server (manual visual testing)
npm start
```

## Key Files Changed

| File                                                       | Change Type |
| ---------------------------------------------------------- | ----------- |
| `src/index.css`                                            | Modified    |
| `index.html`                                               | Modified    |
| `src/types/theme.ts`                                       | New         |
| `src/hooks/useTheme.ts`                                    | New         |
| `src/hooks/useTheme.test.ts`                               | New         |
| `src/components/ThemeToggle/ThemeToggle.tsx`               | New         |
| `src/components/ThemeToggle/ThemeToggle.types.ts`          | New         |
| `src/components/ThemeToggle/ThemeToggle.test.tsx`          | New         |
| `src/components/ThemeToggle/index.ts`                      | New         |
| `src/components/App/App.tsx`                               | Modified    |
| `src/components/App/App.test.tsx`                          | Modified    |
| `src/components/PackageNameInput/PackageNameInput.tsx`     | Modified    |
| `src/components/AvailabilityResult/AvailabilityResult.tsx` | Modified    |
