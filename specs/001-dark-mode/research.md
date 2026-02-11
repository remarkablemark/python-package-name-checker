# Research: Dark Mode

**Feature**: 001-dark-mode | **Date**: 2026-02-11

## R1: Tailwind CSS 4 Dark Mode Strategy

**Decision**: Use `@custom-variant dark (&:where(.dark, .dark *))` in `src/index.css` to enable class-based dark mode toggling.

**Rationale**: The spec requires a three-state toggle (system / light / dark) where explicit user choice overrides OS preference. Tailwind CSS 4's default `dark:` variant uses the `prefers-color-scheme` media query, which only supports automatic OS detection — not manual overrides. The `@custom-variant` directive switches `dark:` to be driven by the `.dark` class on the `<html>` element, enabling JavaScript-controlled toggling while preserving the same `dark:` utility syntax.

**Alternatives considered**:

- **Default `prefers-color-scheme` media query**: Cannot support manual light/dark override — rejected.
- **`data-theme` attribute variant**: Works but `.dark` class is the documented Tailwind convention and simpler to manage — rejected.

## R2: Flash-Free Theme Initialization (FOUC Prevention)

**Decision**: Add a synchronous inline `<script>` in `index.html` `<head>` that reads `localStorage.theme` and toggles the `.dark` class on `<html>` before the body renders.

**Rationale**: The spec requires no flash of incorrect theme on page load (FR-009, SC-006). React hydration happens asynchronously after DOM paint, so relying on React alone would cause a visible flash. A blocking inline script in `<head>` runs before any rendering occurs, ensuring the correct class is present from the first paint.

**Implementation**:

```html
<script>
  (function () {
    var theme = localStorage.getItem('python-package-name-checker.theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

**Alternatives considered**:

- **React `useLayoutEffect`**: Runs after first paint — causes flash. Rejected.
- **CSS `prefers-color-scheme` only**: Cannot respect stored user preference. Rejected.
- **Server-side rendering**: Not applicable — static site on GitHub Pages. Rejected.

## R3: Theme State Management (Hook vs Context)

**Decision**: Use a custom `useTheme` hook that manages theme state internally. No React Context needed.

**Rationale**: The app has a flat component tree. The `ThemeToggle` component is the only consumer of theme-switching logic. The `useTheme` hook manages localStorage read/write, `matchMedia` listener for system preference changes, and toggling the `.dark` class on `document.documentElement`. Other components don't need to know the current theme — they simply use Tailwind `dark:` variants which respond to the CSS class automatically.

**Alternatives considered**:

- **React Context + Provider**: Adds unnecessary complexity for a single consumer. Constitution Principle V (Simplicity) favors the simpler approach. Can be refactored later if needed. Rejected.
- **Global state library (Zustand, Jotai)**: Violates constitution constraint on no new dependencies. Rejected.

## R4: localStorage Graceful Degradation

**Decision**: Wrap all `localStorage` access in try-catch. On failure, fall back to system preference detection without persisting.

**Rationale**: FR-008 requires graceful handling when localStorage is unavailable (e.g., some private browsing modes). The inline `<head>` script and the `useTheme` hook both access localStorage, so both need protection.

**Alternatives considered**:

- **Feature detection before access**: `typeof localStorage !== 'undefined'` doesn't catch quota/security errors. Rejected.
- **Cookie fallback**: Adds complexity for an edge case; system preference fallback is sufficient. Rejected.

## R5: Theme Cycling Order & Icon Mapping

**Decision**: Cycle order is `system → light → dark → system`. Icons are inline SVGs: monitor (system), sun (light), moon (dark).

**Rationale**: The spec defines a cycling icon button (FR-001) that advances to the next mode on each click. The `system → light → dark` order matches user expectation: start with automatic, then explicit overrides. Inline SVGs avoid adding an icon library dependency (constitution: Simplicity & Performance).

**Icon designs**: Simple 24×24 SVG paths:

- **Monitor**: Rectangle with stand (represents system/auto)
- **Sun**: Circle with radiating lines (represents light mode)
- **Moon**: Crescent shape (represents dark mode)

**Alternatives considered**:

- **Icon library (Lucide, Heroicons)**: Adds a runtime dependency for 3 icons. Rejected per constitution Principle V.
- **Emoji icons**: Inconsistent rendering across platforms; not styleable. Rejected.
- **Text labels instead of icons**: Spec explicitly requires icon button. Rejected.

## R6: localStorage Key & Value Schema

**Decision**: Use key `"theme"` with values `"system"`, `"light"`, or `"dark"`. Default (no key present) is treated as `"system"`.

**Rationale**: Matches the Tailwind docs convention (`localStorage.theme`). Storing `"system"` explicitly (rather than removing the key) simplifies the cycling logic and makes the stored state unambiguous. The inline `<head>` script treats missing key and `"system"` identically — both defer to `prefers-color-scheme`.

**Alternatives considered**:

- **Remove key for system mode** (Tailwind docs pattern): Ambiguous — can't distinguish "never visited" from "chose system". Storing `"system"` is clearer. Rejected.
- **Structured JSON value**: Over-engineered for a single enum value. Rejected.

## R7: Dark Mode Color Palette

**Decision**: Use Tailwind's built-in color scale with the following dark mode mappings:

| Element           | Light Mode         | Dark Mode              |
| ----------------- | ------------------ | ---------------------- |
| Page background   | white (default)    | `dark:bg-gray-900`     |
| Primary text      | `text-slate-600`   | `dark:text-slate-200`  |
| Secondary text    | `text-slate-500`   | `dark:text-slate-400`  |
| Input background  | white (default)    | `dark:bg-gray-800`     |
| Input border      | `border-slate-300` | `dark:border-gray-600` |
| Input text        | default            | `dark:text-slate-100`  |
| Available (green) | `text-green-600`   | `dark:text-green-400`  |
| Taken (red)       | `text-red-600`     | `dark:text-red-400`    |
| Invalid (amber)   | `text-amber-600`   | `dark:text-amber-400`  |
| Link              | `text-blue-600`    | `dark:text-blue-400`   |
| Link hover        | `text-blue-800`    | `dark:text-blue-300`   |
| Focus ring        | `ring-blue-500`    | `dark:ring-blue-400`   |
| Spinner           | `text-slate-400`   | inherits (no change)   |

**Rationale**: Using `-400` shades for dark mode text on `-900` backgrounds provides contrast ratios well above WCAG AA 4.5:1 minimums. The slate/gray palette is consistent with the existing design language.

**Alternatives considered**:

- **Custom CSS variables for theming**: Adds complexity; Tailwind `dark:` variants are idiomatic and sufficient. Rejected.
- **Completely different color palette**: Unnecessary — shifting the shade within the same hue family maintains brand consistency. Rejected.

## R8: Accessibility — Screen Reader & Keyboard

**Decision**: The ThemeToggle button uses `aria-label` that dynamically reflects the current mode (e.g., "Theme: dark. Click to switch to system."). The button is a native `<button>` element, inherently keyboard-focusable and activatable via Enter/Space.

**Rationale**: FR-007 requires keyboard accessibility and screen reader announcements. Native `<button>` provides this for free. Dynamic `aria-label` tells screen reader users both the current state and what will happen on click.

**Alternatives considered**:

- **`aria-live` region for announcements**: Over-engineered for a simple toggle; `aria-label` on the button itself is sufficient. Rejected.
- **`role="switch"`**: Semantically for binary toggles; this is a three-state cycle, so a standard button with descriptive label is more appropriate. Rejected.

## R9: Tailwind v4 Placeholder Color in Dark Mode

**Decision**: Extend the existing `.placeholder-light::placeholder` override in `src/index.css` to include a dark mode variant.

**Rationale**: The existing codebase already has a workaround for Tailwind v4's preflight overriding `::placeholder` color. In dark mode, the placeholder needs to be visible against the dark input background. A dark-mode-specific rule ensures adequate contrast.

**Implementation**: Add `.dark .placeholder-light::placeholder { color: var(--color-slate-500); }` to `src/index.css`.
