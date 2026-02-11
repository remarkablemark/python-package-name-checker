# Tasks: Dark Mode

**Input**: Design documents from `/specs/001-dark-mode/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Included — constitution Principle III (Test-First) is NON-NEGOTIABLE and requires 100% coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configure Tailwind dark mode and create shared types used by all user stories

- [ ] T001 Add `@custom-variant dark (&:where(.dark, .dark *))` directive to `src/index.css` to enable class-based dark mode toggling per research decision R1
- [ ] T002 [P] Create `ThemeMode` and `ResolvedTheme` type definitions in `src/types/theme.ts` per data-model.md
- [ ] T003 [P] Add dark mode placeholder override `.dark .placeholder-light::placeholder` rule to `src/index.css` per research decision R9
- [ ] T004 [P] Add `dark:bg-gray-900` class to `<body>` element in `index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the `useTheme` hook — the core state management that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for useTheme Hook

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T005 Write tests for `useTheme` hook in `src/hooks/useTheme.test.ts`: test initial state defaults to `'system'`, test `cycleTheme` cycles through `system → light → dark → system`, test localStorage read/write, test `resolvedTheme` derivation from `themeMode`, test `document.documentElement.classList` toggling of `'dark'` class, test graceful fallback when localStorage is unavailable (FR-008), test invalid localStorage values treated as `'system'`

### Implementation

- [ ] T006 Implement `useTheme` hook in `src/hooks/useTheme.ts`: read initial theme from localStorage with try-catch (default `'system'`), compute `resolvedTheme` from `themeMode`, toggle `.dark` class on `document.documentElement`, persist to localStorage on cycle, expose `{ themeMode, resolvedTheme, cycleTheme }` per data-model.md hook interface

**Checkpoint**: `useTheme` hook is fully functional and tested — user story implementation can now begin

---

## Phase 3: User Story 1 — Toggle Dark Mode (Priority: P1) 🎯 MVP

**Goal**: User can click a cycling icon button (fixed bottom-right) to switch between system, light, and dark modes. All UI elements update to match the active theme. Preference persists across page reloads.

**Independent Test**: Click the dark mode toggle and verify all visible elements render with dark-appropriate colors, then refresh the page and confirm the preference is retained.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Write tests for `ThemeToggle` component in `src/components/ThemeToggle/ThemeToggle.test.tsx`: test renders correct icon for each mode (monitor for system, sun for light, moon for dark), test clicking button calls `onCycle`, test button has correct `aria-label` for each mode, test button is keyboard accessible (focusable, activatable)
- [ ] T008 [P] [US1] Write tests for dark mode integration in `src/components/App/App.test.tsx`: test `useTheme` is called and `ThemeToggle` is rendered, test dark variant classes are applied when dark mode is active

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create `ThemeToggleProps` interface in `src/components/ThemeToggle/ThemeToggle.types.ts` with `themeMode`, `resolvedTheme`, and `onCycle` props per data-model.md component interface
- [ ] T010 [P] [US1] Create barrel export in `src/components/ThemeToggle/index.ts`
- [ ] T011 [US1] Implement `ThemeToggle` component in `src/components/ThemeToggle/ThemeToggle.tsx`: fixed bottom-right floating button, inline SVG icons (monitor/sun/moon) for each mode, dynamic `aria-label` announcing current mode and next action, cycles theme on click via `onCycle` prop (FR-001, FR-007)
- [ ] T012 [US1] Add dark variant classes to `App` component in `src/components/App/App.tsx`: add `dark:bg-gray-900` to `<main>`, add `dark:text-slate-200` to `<h1>`, call `useTheme()` hook, render `<ThemeToggle>` with theme props per research decision R7 color palette
- [ ] T013 [P] [US1] Add dark variant classes to `PackageNameInput` in `src/components/PackageNameInput/PackageNameInput.tsx`: add `dark:bg-gray-800 dark:border-gray-600 dark:text-slate-100` to input, update focus ring with `dark:ring-blue-400` per research decision R7
- [ ] T014 [P] [US1] Add dark variant classes to `AvailabilityResult` in `src/components/AvailabilityResult/AvailabilityResult.tsx`: add `dark:text-green-400` (available), `dark:text-red-400` (taken/error), `dark:text-amber-400` (invalid), `dark:text-blue-400` and `dark:hover:text-blue-300` (links), `dark:text-slate-400` (secondary text) per research decision R7
- [ ] T015 [US1] Add flash-free inline `<script>` to `<head>` in `index.html`: synchronous localStorage read with try-catch, toggle `.dark` class on `<html>` before body renders, handle localStorage unavailability gracefully (FR-009, FR-008) per research decision R2
- [ ] T016 [US1] Update existing tests for `PackageNameInput` in `src/components/PackageNameInput/PackageNameInput.test.tsx` to maintain 100% coverage after dark variant class changes
- [ ] T017 [US1] Update existing tests for `AvailabilityResult` in `src/components/AvailabilityResult/AvailabilityResult.test.tsx` to maintain 100% coverage after dark variant class changes

**Checkpoint**: User Story 1 is fully functional — user can toggle between system/light/dark, UI updates, preference persists

---

## Phase 4: User Story 2 — System Preference Detection (Priority: P2)

**Goal**: First-time visitors see the app in their OS-preferred color scheme automatically. When set to "system" mode, the app reacts in real-time to OS theme changes without page reload.

**Independent Test**: Set OS/browser to dark mode preference, load app with no stored preference, verify it renders in dark mode. Then change OS theme while app is open and verify it updates in real-time.

**Dependencies**: Requires Phase 2 (`useTheme` hook) complete. Independent of US1 toggle UI but benefits from it.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T018 [US2] Add tests for system preference detection in `src/hooks/useTheme.test.ts`: test hook listens to `matchMedia('(prefers-color-scheme: dark)')` changes, test `resolvedTheme` updates in real-time when OS preference changes and mode is `'system'`, test OS preference is ignored when mode is explicitly `'light'` or `'dark'` (FR-005), test first visit with OS dark mode renders dark (no stored preference), test first visit with OS light mode renders light

### Implementation for User Story 2

- [ ] T019 [US2] Add `matchMedia` change listener to `useTheme` hook in `src/hooks/useTheme.ts`: subscribe to `prefers-color-scheme` changes in `useEffect`, update `resolvedTheme` in real-time when mode is `'system'`, clean up listener on unmount (FR-004)

**Checkpoint**: User Story 2 is functional — OS preference is detected on first visit and tracked in real-time when in system mode

---

## Phase 5: User Story 3 — Accessible Dark Mode Experience (Priority: P3)

**Goal**: All text, icons, status indicators, and interactive elements in dark mode maintain WCAG 2.1 AA contrast ratios. Screen readers announce the toggle's current state.

**Independent Test**: Enable dark mode, verify all text/background contrast ratios meet 4.5:1 minimum. Focus the toggle with a screen reader and verify it announces the current mode.

**Dependencies**: Requires US1 (dark theme must exist to verify contrast). Screen reader accessibility is built into ThemeToggle from US1.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [US3] Add accessibility-focused tests in `src/components/ThemeToggle/ThemeToggle.test.tsx`: test `aria-label` includes current mode name and next action description, test button element has proper accessible role, test button is reachable via Tab key focus

### Implementation for User Story 3

- [ ] T021 [US3] Audit and adjust dark variant color classes across all components for WCAG 2.1 AA compliance (4.5:1 normal text, 3:1 large text) in `src/components/App/App.tsx`, `src/components/PackageNameInput/PackageNameInput.tsx`, `src/components/AvailabilityResult/AvailabilityResult.tsx` — verify contrast ratios for all color pairs from research decision R7 (FR-006)
- [ ] T022 [US3] Verify and refine `aria-label` text on `ThemeToggle` button in `src/components/ThemeToggle/ThemeToggle.tsx` to clearly announce current state and next action for screen readers (FR-007, per research decision R8)

**Checkpoint**: All user stories are independently functional with full accessibility compliance

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, edge case handling, and quality gates

- [ ] T023 Run `npm run lint:tsc` — verify zero TypeScript errors
- [ ] T024 Run `npm run lint` — verify zero ESLint errors
- [ ] T025 Run `npm run test:ci` — verify all tests pass with 100% coverage
- [ ] T026 Run `npm run build` — verify production build succeeds
- [ ] T027 Manual visual testing: run `npm start`, verify no flash of wrong theme on page load (SC-006), verify toggle cycles correctly (SC-001), verify theme persists across reload (SC-003), verify all edge cases from spec (localStorage unavailable, rapid toggling, placeholder visibility)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001, T002) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion — can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on US1 completion (needs dark theme to audit contrast)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — independent of US1 (extends same hook)
- **User Story 3 (P3)**: Depends on US1 completion — needs dark variant classes to exist for contrast audit

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types/interfaces before components
- Hook logic before component rendering
- Core implementation before integration with App
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1** (all parallelizable after T001):

- T002, T003, T004 can run in parallel

**Phase 3 — US1** (after T009, T010 complete):

- T007, T008 can run in parallel (tests)
- T013, T014 can run in parallel (dark variants on different components)

**Cross-story**:

- US1 and US2 can be worked on in parallel after Phase 2 completes (different files: ThemeToggle vs useTheme listener)

---

## Parallel Example: User Story 1

```text
# After Phase 2 complete, launch tests in parallel:
T007: "Write ThemeToggle tests in src/components/ThemeToggle/ThemeToggle.test.tsx"
T008: "Write App dark mode integration tests in src/components/App/App.test.tsx"

# After T009, T010 complete, launch types/barrel in parallel:
T009: "Create ThemeToggleProps in src/components/ThemeToggle/ThemeToggle.types.ts"
T010: "Create barrel export in src/components/ThemeToggle/index.ts"

# After T011 complete, launch dark variant updates in parallel:
T013: "Add dark variants to PackageNameInput in src/components/PackageNameInput/PackageNameInput.tsx"
T014: "Add dark variants to AvailabilityResult in src/components/AvailabilityResult/AvailabilityResult.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational — useTheme hook (T005–T006)
3. Complete Phase 3: User Story 1 — Toggle + dark variants (T007–T017)
4. **STOP and VALIDATE**: Test toggle cycling, theme persistence, all UI elements themed
5. Deploy/demo if ready — users can manually toggle dark mode

### Incremental Delivery

1. Complete Setup + Foundational → Theme infrastructure ready
2. Add User Story 1 → Test independently → Deploy (MVP! Users can toggle dark mode)
3. Add User Story 2 → Test independently → Deploy (First-time visitors get OS-matched theme)
4. Add User Story 3 → Test independently → Deploy (Full WCAG AA accessibility compliance)
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (Red-Green-Refactor per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No new runtime dependencies — inline SVG icons, Tailwind dark: variants only
