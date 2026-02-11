# Implementation Plan: Dark Mode

**Branch**: `001-dark-mode` | **Date**: 2026-02-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-dark-mode/spec.md`

## Summary

Add a three-state dark mode toggle (system / light / dark) to the Python Package Name Checker. The toggle is a fixed floating icon button in the bottom-right corner that cycles through modes on click. Theme preference persists in localStorage. When set to "system", the app follows OS `prefers-color-scheme` in real-time. All UI elements update to dark-appropriate colors using Tailwind CSS `dark:` variants. The implementation must meet WCAG 2.1 AA contrast requirements and be fully keyboard/screen-reader accessible.

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19  
**Primary Dependencies**: React 19, Tailwind CSS 4, Vite 7  
**Storage**: localStorage (theme preference persistence)  
**Testing**: Vitest 4 + @testing-library/react + @testing-library/user-event  
**Target Platform**: Static site (GitHub Pages), all modern browsers  
**Project Type**: Single-page web application (client-side only)  
**Performance Goals**: Theme switch within 100ms; no flash of wrong theme on page load (FR-009)  
**Constraints**: No new runtime dependencies (constitution: Simplicity & Performance); Tailwind-only styling; 100% test coverage  
**Scale/Scope**: 1 new component (ThemeToggle), 1 new hook (useTheme), minor updates to existing components for dark: variants

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                   | Status  | Notes                                                                                      |
| --------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| I. Component-First          | ✅ PASS | ThemeToggle will follow `src/components/ThemeToggle/` directory pattern with barrel export |
| II. Accessibility & UX      | ✅ PASS | Semantic `<button>`, ARIA labels, keyboard navigation, WCAG AA contrast ratios planned     |
| III. Test-First             | ✅ PASS | 100% coverage maintained; tests for hook, component, and dark variant rendering            |
| IV. Type Safety             | ✅ PASS | ThemeMode union type (`'system' \| 'light' \| 'dark'`); typed hook return; no implicit any |
| V. Simplicity & Performance | ✅ PASS | No new runtime dependencies; Tailwind `dark:` variants; inline SVG icons (no icon library) |
| Technology Constraints      | ✅ PASS | No stack changes; uses existing Tailwind 4, React 19, Vite 7                               |
| Development Workflow        | ✅ PASS | All gates (lint, type check, test, build) will pass                                        |

**Gate result**: ✅ ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-dark-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A — no API contracts for this feature)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── App/
│   │   ├── App.tsx                    # Updated: wrap with theme context, add dark: variants
│   │   ├── App.test.tsx               # Updated: add dark mode integration tests
│   │   └── index.ts
│   ├── AvailabilityResult/
│   │   ├── AvailabilityResult.tsx     # Updated: add dark: variant classes
│   │   └── ...
│   ├── PackageNameInput/
│   │   ├── PackageNameInput.tsx       # Updated: add dark: variant classes
│   │   └── ...
│   ├── Spinner/
│   │   └── ...                        # Inherits currentColor — no changes needed
│   └── ThemeToggle/                   # NEW
│       ├── ThemeToggle.tsx            # Cycling icon button component
│       ├── ThemeToggle.types.ts       # Props interface
│       ├── ThemeToggle.test.tsx       # Unit tests
│       └── index.ts                   # Barrel export
├── hooks/
│   ├── useTheme.ts                    # NEW: theme state, localStorage, media query listener
│   └── useTheme.test.ts              # NEW: hook tests
├── types/
│   └── theme.ts                       # NEW: ThemeMode, ResolvedTheme types
├── index.css                          # Updated: dark mode placeholder override
└── main.tsx                           # No changes expected

index.html                             # Updated: inline script for flash-free theme init
```

**Structure Decision**: Single project structure following existing patterns. New `ThemeToggle` component follows the established `src/components/ComponentName/` directory convention. New `useTheme` hook follows `src/hooks/` pattern. Theme types go in `src/types/theme.ts` alongside existing `pypi.ts`.

## Complexity Tracking

> No constitution violations — this section is intentionally empty.
