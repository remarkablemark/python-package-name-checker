# Tasks: Python Package Name Checker

**Input**: Design documents from `/specs/001-pypi-name-checker/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included — Constitution Principle III (Test-First) is NON-NEGOTIABLE. 100% coverage required. Red-Green-Refactor cycle enforced.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared types and directory scaffolding needed by all stories

- [x] T001 Create shared TypeScript interfaces (AvailabilityStatus, CheckResult, CheckResultAvailable, CheckResultTaken, CheckResultError, ValidationResult, ValidationSuccess, ValidationFailure, PackageCheckerState) in src/types/pypi.ts per data-model.md
- [x] T002 [P] Create Spinner component directory with barrel export: src/components/Spinner/Spinner.types.ts (props interface: className), src/components/Spinner/Spinner.tsx renders an accessible SVG spinner animation (`role="status"`, `aria-label="Loading"`), src/components/Spinner/index.ts re-exports default
- [x] T003 [P] Write Spinner tests in src/components/Spinner/Spinner.test.tsx — verify renders SVG, has accessible role/label, accepts className prop

**Checkpoint**: Shared types and Spinner component ready — user story implementation can begin

---

## Phase 2: User Story 1 — Check Package Name Availability (Priority: P1) 🎯 MVP

**Goal**: User types a package name, system debounces input, normalizes the name per PEP 503, fetches PyPI JSON API, and displays "✅ Available" or "❌ Taken" (with link to PyPI project page). Inline spinner shows during loading. Stale requests are cancelled via AbortController.

**Independent Test**: Enter "requests" → expect "❌ Taken" with link to `https://pypi.org/project/requests/`. Enter "xyzzy-not-a-real-package-12345" → expect "✅ Available" with disclaimer note.

### Tests for User Story 1 ⚠️

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [P] [US1] Write tests for normalizePackageName in src/utils/normalizePackageName.test.ts — test cases: "My*Package"→"my-package", "Friendly-Bard"→"friendly-bard", "friendly.bard"→"friendly-bard", "FrIeNdLy-.*.-bArD"→"friendly-bard", single char "A"→"a", already normalized "foo"→"foo"
- [x] T005 [P] [US1] Write tests for checkPyPI in src/utils/checkPyPI.test.ts — mock global fetch; test cases: HTTP 200 returns `{status:'taken', name, projectUrl}`, HTTP 404 returns `{status:'available', name}`, AbortError is silently ignored (returns nothing / throws AbortError), verify fetch is called with correct URL `https://pypi.org/pypi/{name}/json` and signal
- [x] T006 [P] [US1] Write tests for AvailabilityResult in src/components/AvailabilityResult/AvailabilityResult.test.tsx — test renders "✅ Available" with disclaimer when status=available, renders "❌ Taken" with link to PyPI project page when status=taken, renders nothing when status=idle, renders nothing when status=loading
- [x] T007 [P] [US1] Write tests for PackageNameInput in src/components/PackageNameInput/PackageNameInput.test.tsx — test renders input with correct placeholder and hero styling, calls onChange handler on user typing, renders Spinner when status=loading, does not render Spinner when status is not loading, input has accessible label
- [x] T008 [US1] Write tests for usePackageChecker hook in src/hooks/usePackageChecker.test.ts — use vi.useFakeTimers(); test: initial state is idle, typing triggers debounce (no fetch before 300ms), after 300ms fetch is called with normalized name, result updates state to available/taken, changing input cancels previous request (AbortController), empty input resets to idle without fetch

### Implementation for User Story 1

- [x] T009 [P] [US1] Implement normalizePackageName in src/utils/normalizePackageName.ts — pure function: `name.replace(/[-_.]+/g, '-').toLowerCase()` per PEP 503, add TSDoc comment
- [x] T010 [P] [US1] Implement checkPyPI in src/utils/checkPyPI.ts — async function accepting (name: string, signal: AbortSignal), fetches `https://pypi.org/pypi/${name}/json`, returns CheckResult discriminated union: HTTP 200→taken (with projectUrl), HTTP 404→available, re-throws AbortError, all other errors→generic error message
- [x] T011 [P] [US1] Create AvailabilityResult component: src/components/AvailabilityResult/AvailabilityResult.types.ts (props interface: status, message, projectUrl, normalizedName), src/components/AvailabilityResult/AvailabilityResult.tsx (renders "✅ Available" + disclaimer per FR-014 when available, "❌ Taken" + link to PyPI project page per FR-004 when taken, nothing when idle/loading), src/components/AvailabilityResult/index.ts barrel export
- [x] T012 [P] [US1] Create PackageNameInput component: src/components/PackageNameInput/PackageNameInput.types.ts (props interface: inputValue, status, onChange handler), src/components/PackageNameInput/PackageNameInput.tsx (hero-style input per FR-001: text-2xl sm:text-3xl md:text-4xl lg:text-5xl, px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5, w-full max-w-[700px], renders Spinner on right side when status=loading per FR-005, accessible label, placeholder text), src/components/PackageNameInput/index.ts barrel export
- [x] T013 [US1] Implement usePackageChecker hook in src/hooks/usePackageChecker.ts — manages PackageCheckerState; on inputValue change: if empty/whitespace→set idle, if valid→debounce 300ms (FR-012) then normalize (PEP 503) then call checkPyPI with AbortController (FR-011); update status through loading→available/taken; cancel stale requests on input change; cleanup on unmount
- [x] T014 [US1] Update App component in src/components/App/App.tsx — replace existing content with: call usePackageChecker hook, render page heading, PackageNameInput (passing inputValue, status, onChange), AvailabilityResult (passing status, message, projectUrl, normalizedName); use semantic HTML (main element), center layout, mobile-first responsive per FR-015
- [x] T015 [US1] Update App tests in src/components/App/App.test.tsx — test full integration: renders heading and input, mock fetch, type package name, verify debounce triggers after 300ms, verify available/taken result displays correctly, verify stale request cancellation

**Checkpoint**: User Story 1 complete — user can check package name availability end-to-end. Run `npm run test:ci` to verify 100% coverage. Run `npm start` to manually test with real PyPI API.

---

## Phase 3: User Story 2 — Input Validation & Error Feedback (Priority: P2)

**Goal**: Invalid package names are caught client-side before any network request. Validation messages explain PyPI naming rules. Empty/whitespace input silently resets to idle.

**Independent Test**: Enter "my package!" → expect validation error about invalid characters. Enter "-invalid" → expect validation error about start/end characters. Enter "valid-name" → expect no validation error, lookup proceeds.

### Tests for User Story 2 ⚠️

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T016 [P] [US2] Write tests for validatePackageName in src/utils/validatePackageName.test.ts — test cases: valid names ("requests", "my-package", "A", "a1", "foo.bar", "foo_bar"), invalid characters ("my package", "my@package", "hello!"), invalid start/end ("-foo", "foo-", ".bar", "bar."), empty string returns valid:true (empty handled separately by hook, not by validator), single valid char ("a", "1")
- [x] T017 [US2] Write additional usePackageChecker tests in src/hooks/usePackageChecker.test.ts — test: invalid input sets status to 'invalid' with validation message, no fetch is called for invalid input, whitespace-only input sets status to idle, transitioning from invalid to valid input triggers lookup

### Implementation for User Story 2

- [x] T018 [P] [US2] Implement validatePackageName in src/utils/validatePackageName.ts — pure function: test against PEP 508 regex `/^([A-Z0-9]|[A-Z0-9][A-Z0-9._-]*[A-Z0-9])$/i`, return ValidationResult discriminated union with specific messages: invalid chars→"Package name can only contain letters, numbers, hyphens, underscores, and periods", invalid start/end→"Package name must start and end with a letter or number"
- [x] T019 [US2] Update usePackageChecker hook in src/hooks/usePackageChecker.ts — add validation step: after debounce, before fetch, call validatePackageName; if invalid→set status to 'invalid' with message, do not call checkPyPI; if valid→proceed with normalize+fetch pipeline
- [x] T020 [US2] Update AvailabilityResult component in src/components/AvailabilityResult/AvailabilityResult.tsx — render validation error message when status=invalid (FR-007: actionable message)
- [x] T021 [US2] Write AvailabilityResult test for invalid status in src/components/AvailabilityResult/AvailabilityResult.test.tsx — test renders validation message when status=invalid

**Checkpoint**: User Story 2 complete — invalid input is caught before network requests. Run `npm run test:ci` to verify coverage.

---

## Phase 4: User Story 3 — Network Error Handling (Priority: P3)

**Goal**: Network failures, rate limiting (429), and server errors (5xx) display categorized error messages per FR-008. User can retry by modifying input.

**Independent Test**: Simulate network failure → expect "Something went wrong, please try again". Simulate 429 → expect "Too many requests, please wait and try again". Simulate 500 → expect "PyPI is temporarily unavailable, please try again later".

### Tests for User Story 3 ⚠️

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T022 [P] [US3] Write additional checkPyPI tests in src/utils/checkPyPI.test.ts — test error categorization: HTTP 429→"Too many requests, please wait and try again", HTTP 500→"PyPI is temporarily unavailable, please try again later", HTTP 503→"PyPI is temporarily unavailable, please try again later", network error (fetch throws TypeError)→"Something went wrong, please try again", unexpected status (e.g., 301)→"Something went wrong, please try again"
- [x] T023 [P] [US3] Write additional usePackageChecker tests in src/hooks/usePackageChecker.test.ts — test: error result sets status to 'error' with categorized message, modifying input after error resets state and triggers new lookup (retry via input change per FR-009)
- [x] T024 [P] [US3] Write AvailabilityResult test for error status in src/components/AvailabilityResult/AvailabilityResult.test.tsx — test renders error message when status=error

### Implementation for User Story 3

- [x] T025 [US3] Update checkPyPI in src/utils/checkPyPI.ts — add error categorization: HTTP 429→CheckResultError with rate limit message, HTTP 500-599→CheckResultError with unavailable message, network errors (catch block)→CheckResultError with generic message, AbortError→re-throw (not an error result)
- [x] T026 [US3] Update usePackageChecker hook in src/hooks/usePackageChecker.ts — handle CheckResultError from checkPyPI: set status to 'error' with message; ensure modifying input resets error state and re-triggers debounce cycle (retry mechanism per FR-009)
- [x] T027 [US3] Update AvailabilityResult component in src/components/AvailabilityResult/AvailabilityResult.tsx — render error message when status=error with appropriate styling

**Checkpoint**: User Story 3 complete — all error paths handled gracefully. Run `npm run test:ci` to verify coverage. SC-004: application never shows blank screen or unhandled exception.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsive polish, and final quality gates

- [x] T028 [P] Add aria-live="polite" region to AvailabilityResult in src/components/AvailabilityResult/AvailabilityResult.tsx for screen reader announcements of dynamic results
- [x] T029 [P] Add accessible labels to all interactive elements: input field aria-label, Spinner aria-hidden when not loading, result region role="status"
- [x] T030 [P] Verify responsive design at 320px, 640px, 768px, 1024px breakpoints — ensure hero input scales correctly per FR-015 (adjust Tailwind classes if needed in src/components/PackageNameInput/PackageNameInput.tsx)
- [x] T031 Run all quality gates: `npm run lint`, `npm run lint:tsc`, `npm run test:ci`, `npm run build` — fix any issues
- [x] T032 Run quickstart.md validation — follow steps in specs/001-pypi-name-checker/quickstart.md to verify end-to-end developer experience

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **User Story 1 (Phase 2)**: Depends on Phase 1 (shared types + Spinner)
- **User Story 2 (Phase 3)**: Depends on Phase 2 (extends hook + result component from US1)
- **User Story 3 (Phase 4)**: Depends on Phase 2 (extends checkPyPI + hook + result component from US1)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 1 — no dependencies on other stories
- **User Story 2 (P2)**: Extends US1's hook and result component — start after US1 is complete
- **User Story 3 (P3)**: Extends US1's checkPyPI and hook — can start after US1 is complete, can run in parallel with US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Red-Green-Refactor)
- Utility functions before components
- Components before hook integration
- Hook before App integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel (Spinner component + tests)
- **Phase 2 tests**: T004, T005, T006, T007 can all run in parallel (different files)
- **Phase 2 impl**: T009, T010, T011, T012 can all run in parallel (different files)
- **Phase 3**: US2 and US3 can run in parallel after US1 completes (different concerns)
- **Phase 3 tests**: T016 can run in parallel with T017
- **Phase 4 tests**: T022, T023, T024 can all run in parallel
- **Phase 5**: T028, T029, T030 can all run in parallel

---

## Parallel Example: User Story 1

```text
# After Phase 1 completes, launch all US1 tests in parallel:
T004: normalizePackageName tests in src/utils/normalizePackageName.test.ts
T005: checkPyPI tests in src/utils/checkPyPI.test.ts
T006: AvailabilityResult tests in src/components/AvailabilityResult/AvailabilityResult.test.tsx
T007: PackageNameInput tests in src/components/PackageNameInput/PackageNameInput.test.tsx

# Then launch all US1 utility + component implementations in parallel:
T009: normalizePackageName in src/utils/normalizePackageName.ts
T010: checkPyPI in src/utils/checkPyPI.ts
T011: AvailabilityResult component in src/components/AvailabilityResult/
T012: PackageNameInput component in src/components/PackageNameInput/

# Then sequential integration:
T013: usePackageChecker hook (depends on T009, T010)
T014: App integration (depends on T011, T012, T013)
T015: App tests (depends on T014)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + Spinner)
2. Complete Phase 2: User Story 1 (core lookup)
3. **STOP and VALIDATE**: Run `npm run test:ci` + manual test with `npm start`
4. Deploy/demo if ready — app can check names even without validation or error handling

### Incremental Delivery

1. Phase 1 → Shared infrastructure ready
2. Phase 2 (US1) → Core lookup works → Test independently → **MVP!**
3. Phase 3 (US2) → Input validation added → Test independently
4. Phase 4 (US3) → Error handling added → Test independently
5. Phase 5 → Polish, accessibility, final gates
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Constitution Principle III: Write failing tests FIRST, then implement
- All PyPI API calls MUST be mocked in tests (vi.mock global fetch)
- Use vi.useFakeTimers() for debounce testing
- Use @testing-library/user-event for simulating user typing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Run `npm run test:ci` after each phase to verify 100% coverage
