# Quickstart: Python Package Name Checker

**Feature Branch**: `001-pypi-name-checker`
**Date**: 2026-02-10

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- npm (comes with Node.js)

## Setup

```bash
# Clone and switch to feature branch
git checkout 001-pypi-name-checker

# Install dependencies
npm install
```

## Development

```bash
# Start dev server (opens browser at http://localhost:5173)
npm start
```

## Quality Gates

Run all gates before committing:

```bash
# Lint
npm run lint

# Type check
npm run lint:tsc

# Tests with 100% coverage
npm run test:ci

# Production build
npm run build
```

## Implementation Order

### 1. Utility Functions (no dependencies)

Create these first — they are pure functions with no React dependency:

1. **`src/utils/validatePackageName.ts`** — PEP 508 validation regex
2. **`src/utils/normalizePackageName.ts`** — PEP 503 normalization
3. **`src/utils/checkPyPI.ts`** — Fetch wrapper for PyPI JSON API

Each file gets a co-located `.test.ts` file. Write tests first (Red-Green-Refactor).

### 2. Shared Types

4. **`src/types/pypi.ts`** — `AvailabilityStatus`, `CheckResult`, `ValidationResult`, `PackageCheckerState` interfaces

### 3. Components (bottom-up)

5. **`src/components/Spinner/`** — Simple SVG spinner (no props beyond className)
6. **`src/components/AvailabilityResult/`** — Displays status, message, link
7. **`src/components/PackageNameInput/`** — Hero input with inline Spinner

### 4. Custom Hook

8. **`src/hooks/usePackageChecker.ts`** — Orchestrates debounce, validation, normalization, fetch, cancellation. Returns `PackageCheckerState` + `onChange` handler.

### 5. Integration

9. **Update `src/components/App/App.tsx`** — Wire up `usePackageChecker` hook, render `PackageNameInput` + `AvailabilityResult`.

### 6. Agent Context Update

10. **Run agent context update**: `bash .specify/scripts/bash/update-agent-context.sh windsurf`

## Key Files

| File                                                       | Purpose                               |
| ---------------------------------------------------------- | ------------------------------------- |
| `src/types/pypi.ts`                                        | Shared TypeScript interfaces          |
| `src/utils/validatePackageName.ts`                         | PEP 508 name validation               |
| `src/utils/normalizePackageName.ts`                        | PEP 503 name normalization            |
| `src/utils/checkPyPI.ts`                                   | PyPI API fetch wrapper                |
| `src/hooks/usePackageChecker.ts`                           | Main orchestration hook               |
| `src/components/Spinner/Spinner.tsx`                       | Loading spinner                       |
| `src/components/PackageNameInput/PackageNameInput.tsx`     | Hero input field                      |
| `src/components/AvailabilityResult/AvailabilityResult.tsx` | Result display                        |
| `src/components/App/App.tsx`                               | Root layout (existing, to be updated) |

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/utils/validatePackageName.test.ts

# Run tests with coverage report
npm run test:ci
```

All PyPI API calls must be mocked in tests using `vi.fn()` / `vi.mock()`.
Use `@testing-library/user-event` for simulating typing with debounce.
Use `vi.useFakeTimers()` for testing debounce behavior.
