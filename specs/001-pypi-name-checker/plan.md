# Implementation Plan: Python Package Name Checker

**Branch**: `001-pypi-name-checker` | **Date**: 2026-02-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-pypi-name-checker/spec.md`

## Summary

Build a client-side React application that lets users check Python package name availability on PyPI in real time. The user types a package name into a hero-style input field; after a 300ms debounce, the app validates the name against PyPI naming rules, normalizes it, and fetches `https://pypi.org/pypi/{name}/json`. Results display inline as "✅ Available" or "❌ Taken" (with a link to the PyPI project page). The app handles validation errors, network failures, rate limiting, and stale request cancellation. No backend — all lookups happen via direct browser fetch. Deployed as a static site to GitHub Pages.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode) on Node.js 24  
**Primary Dependencies**: React 19.2, React DOM 19.2, Tailwind CSS 4.1  
**Build Tool**: Vite 7.3 with React Compiler (babel-plugin-react-compiler)  
**Storage**: N/A — no persistence, no server, no search history  
**Testing**: Vitest 4.0 + @testing-library/react 16.3 + @testing-library/user-event 14.6 (jsdom environment, 100% coverage enforced)  
**Target Platform**: Modern browsers (static site deployed to GitHub Pages at `remarkablemark.org/python-package-name-checker/`)  
**Project Type**: Single-page client-side React application  
**Performance Goals**: <5s end-to-end name check (SC-001), <2s initial load (SC-005)  
**Constraints**: No backend/proxy; direct browser fetch to PyPI API; minimal bundle size; mobile-first responsive (min 320px)  
**Scale/Scope**: Single-screen app with one input field and result display; ~5 components

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| #   | Principle                   | Status  | Notes                                                                                                                                                   |
| --- | --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I   | Component-First             | ✅ PASS | All UI features will be self-contained functional components in `src/components/ComponentName/` with barrel exports. No class components.               |
| II  | Accessibility & UX          | ✅ PASS | Semantic HTML (`main`, `form`, `input`, `a`), ARIA labels on interactive elements, keyboard navigation, Tailwind-only styling with responsive prefixes. |
| III | Test-First (NON-NEGOTIABLE) | ✅ PASS | 100% coverage enforced by Vitest config. Tests use @testing-library/react + user-event. PyPI API calls will be mocked. Red-Green-Refactor cycle.        |
| IV  | Type Safety                 | ✅ PASS | Strict mode enabled. All props via interfaces. Runtime type guards for PyPI API responses. No `any`, no `console.log`.                                  |
| V   | Simplicity & Performance    | ✅ PASS | No manual memoization (React Compiler handles it). No new dependencies needed — fetch API is built-in. Minimal bundle. YAGNI.                           |
| —   | Technology Constraints      | ✅ PASS | All locked technologies match existing `package.json`. No new runtime dependencies required.                                                            |
| —   | Development Workflow        | ✅ PASS | All gates (lint, type check, test:ci, build) will be enforced. Import order via eslint-plugin-simple-import-sort.                                       |

**Gate Result**: ✅ ALL GATES PASS — no violations, no complexity justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── App/                    # Existing — root layout component
│   │   ├── App.tsx
│   │   ├── App.test.tsx
│   │   └── index.ts
│   ├── PackageNameInput/       # Hero input field with inline spinner
│   │   ├── PackageNameInput.tsx
│   │   ├── PackageNameInput.types.ts
│   │   ├── PackageNameInput.test.tsx
│   │   └── index.ts
│   ├── AvailabilityResult/     # Status display (available/taken/error)
│   │   ├── AvailabilityResult.tsx
│   │   ├── AvailabilityResult.types.ts
│   │   ├── AvailabilityResult.test.tsx
│   │   └── index.ts
│   └── Spinner/                # Inline loading spinner icon
│       ├── Spinner.tsx
│       ├── Spinner.test.tsx
│       └── index.ts
├── hooks/
│   ├── usePackageChecker.ts    # Orchestrates debounce, validation, fetch, cancellation
│   └── usePackageChecker.test.ts
├── utils/
│   ├── validatePackageName.ts  # PyPI naming rule validation
│   ├── validatePackageName.test.ts
│   ├── normalizePackageName.ts # Hyphen/underscore/case normalization
│   ├── normalizePackageName.test.ts
│   ├── checkPyPI.ts            # Fetch wrapper for PyPI JSON API
│   └── checkPyPI.test.ts
├── types/
│   └── pypi.ts                 # Shared interfaces (AvailabilityStatus, CheckResult, etc.)
├── index.css                   # Existing — Tailwind entry
├── main.tsx                    # Existing — React root
├── main.test.tsx               # Existing
└── vite-env.d.ts               # Existing

test/
└── setupFiles.ts               # Existing — global test setup
```

**Structure Decision**: Single-project React SPA. Extends the existing `src/components/` pattern with new component directories. Utility functions and the custom hook are co-located under `src/hooks/` and `src/utils/`. Shared TypeScript interfaces live in `src/types/`. No new top-level directories needed.

## Complexity Tracking

> No constitution violations detected. No complexity justification needed.
