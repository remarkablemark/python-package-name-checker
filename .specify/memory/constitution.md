<!--
  Sync Impact Report
  ==================
  Version change: N/A → 1.0.0 (initial ratification)
  Modified principles: N/A (initial)
  Added sections:
    - Core Principles (5): Component-First, Accessibility & UX,
      Test-First, Type Safety, Simplicity & Performance
    - Technology Constraints
    - Development Workflow
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed
    - .specify/templates/spec-template.md ✅ no changes needed
    - .specify/templates/tasks-template.md ✅ no changes needed
  Follow-up TODOs: None
-->

# Python Package Name Checker Constitution

## Core Principles

### I. Component-First

Every UI feature MUST be implemented as a self-contained React
functional component. Components MUST be independently testable,
documented with TSDoc where non-trivial, and organized following
the established directory pattern:

```
src/components/ComponentName/
├── ComponentName.tsx
├── ComponentName.types.ts
├── ComponentName.test.tsx
└── index.ts
```

No class components are permitted. Hooks MUST be called at the top
level only. Props MUST be destructured in the function signature.
Barrel exports via `index.ts` are required for each component
directory.

### II. Accessibility & UX

All UI elements MUST use semantic HTML tags (`header`, `nav`,
`main`, `button`, `form`, etc.). Interactive elements MUST include
proper ARIA labels, keyboard navigation support, and focus
management. Images MUST have descriptive `alt` text.

Styling MUST use Tailwind CSS utility classes exclusively — no
custom CSS files unless absolutely necessary. Responsive design
MUST use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).

Rationale: This is a public-facing tool; usability and
accessibility directly impact adoption.

### III. Test-First (NON-NEGOTIABLE)

100% code coverage is required across all statements, branches,
functions, and lines. This threshold is enforced by Vitest
configuration and MUST NOT be lowered.

Tests MUST use `@testing-library/react` for component rendering
and `@testing-library/user-event` for simulating user interactions.
External dependencies (API calls, browser APIs) MUST be mocked.
Test names MUST clearly describe the behavior under test.

The Red-Green-Refactor cycle is strictly enforced:

1. Write failing tests
2. Implement minimal code to pass
3. Refactor while keeping tests green

### IV. Type Safety

TypeScript strict mode is enabled and MUST NOT be relaxed. All
types MUST be explicit — no implicit `any`. Interfaces are
preferred over type aliases for object shapes. React event handlers
MUST use proper event types (`React.MouseEvent`, `React.FormEvent`,
etc.).

Runtime type guards MUST be used when processing external data
(e.g., PyPI API responses). No `console.log` or `debugger`
statements are permitted in committed code.

### V. Simplicity & Performance

Start simple; follow YAGNI principles. The React Compiler handles
memoization automatically — manual `useMemo`, `useCallback`, and
`React.memo` MUST NOT be used.

Dependencies MUST be justified before addition. The bundle MUST
remain minimal for fast load times, as this is a static site
deployed to GitHub Pages. No server-side runtime exists — all
external API calls happen client-side.

## Technology Constraints

The following stack is locked and MUST NOT be changed without a
constitution amendment:

| Layer       | Technology                 | Version |
| ----------- | -------------------------- | ------- |
| UI Library  | React                      | 19      |
| Language    | TypeScript (strict)        | 5       |
| Build Tool  | Vite                       | 7       |
| Test Runner | Vitest                     | 4       |
| Styling     | Tailwind CSS               | 4       |
| Linter      | ESLint                     | 9       |
| Formatter   | Prettier + Tailwind plugin | —       |
| Compiler    | React Compiler (Babel)     | —       |
| Node.js     | Node.js                    | 24      |

Additional constraints:

- ESM only (`"type": "module"` in `package.json`)
- Conventional commits enforced by commitlint
- Husky + lint-staged enforce quality gates on every commit
- Deployment target: GitHub Pages (static site at
  `remarkablemark.org/python-package-name-checker/`)

## Development Workflow

All code changes MUST pass the following gates before merge:

1. **Lint**: `npm run lint` — zero ESLint errors
2. **Type check**: `npm run lint:tsc` — zero TypeScript errors
3. **Test**: `npm run test:ci` — all tests pass with 100% coverage
4. **Build**: `npm run build` — production build succeeds

Import order is enforced by `eslint-plugin-simple-import-sort`:

1. External libraries
2. Internal modules (absolute `src/` imports)
3. Relative imports

Code review MUST verify compliance with all constitution
principles. Complexity MUST be justified — if a simpler approach
exists, it MUST be used unless a documented rationale explains why
the complex approach is necessary.

## Governance

This constitution is the authoritative source of project standards.
It supersedes all other practices and documentation when conflicts
arise.

**Amendment procedure**:

1. Propose change with rationale
2. Document impact on existing code
3. Update constitution with version bump
4. Propagate changes to dependent templates and documentation

**Versioning policy** (semantic versioning):

- **MAJOR**: Backward-incompatible principle removals or
  redefinitions
- **MINOR**: New principle or section added, or materially expanded
  guidance
- **PATCH**: Clarifications, wording fixes, non-semantic
  refinements

**Compliance review**: All pull requests MUST be checked against
constitution principles. The `AGENTS.md` file provides runtime
development guidance and MUST remain consistent with this
constitution.

**Version**: 1.0.0 | **Ratified**: 2026-02-10 | **Last Amended**: 2026-02-10
