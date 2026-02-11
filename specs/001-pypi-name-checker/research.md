# Research: Python Package Name Checker

**Feature Branch**: `001-pypi-name-checker`
**Date**: 2026-02-10

## R1: PyPI Package Naming Rules

**Decision**: Validate names using the PEP 508 regex, normalize using PEP 503 rules.

**Rationale**: These are the official Python packaging specifications. PyPI
enforces them server-side, and we should enforce them client-side to prevent
unnecessary API calls and give immediate feedback.

**Validation regex** (case-insensitive):

```
^([A-Z0-9]|[A-Z0-9][A-Z0-9._-]*[A-Z0-9])$
```

Rules:

- Only ASCII letters, digits, period (`.`), underscore (`_`), and hyphen (`-`)
- Must start and end with a letter or digit
- Minimum length: 1 character (single letter or digit is valid)
- No maximum length specified by PEP 508 (PyPI may enforce practical limits)

**Normalization** (PEP 503): Lowercase the name, then replace all runs of
`.`, `-`, or `_` with a single `-`:

```typescript
function normalize(name: string): string {
  return name.replace(/[-_.]+/g, '-').toLowerCase();
}
```

Equivalent names: `Friendly-Bard`, `friendly_bard`, `friendly.bard`,
`FRIENDLY-BARD` all normalize to `friendly-bard`.

**Alternatives considered**:

- No validation (just send to API): Rejected — wastes network requests and
  provides poor UX for obviously invalid names.
- Custom validation rules: Rejected — PEP 508 is the authoritative source.

**Source**: https://packaging.python.org/en/latest/specifications/name-normalization/

## R2: PyPI JSON API Behavior

**Decision**: Use `GET https://pypi.org/pypi/{name}/json` for availability checks.

**Rationale**: This is the official PyPI JSON API endpoint. It returns project
metadata and is publicly accessible without authentication.

**Key behaviors**:

- **HTTP 200**: Package exists (name is taken). Response body is JSON with
  project metadata.
- **HTTP 404**: Package does not exist (name is available).
- **HTTP 429**: Rate limited — too many requests.
- **HTTP 5xx**: Server error — PyPI is temporarily unavailable.
- **CORS**: PyPI serves appropriate CORS headers, allowing direct browser
  fetch without a proxy. Verified in spec clarifications.

**Request considerations**:

- The API normalizes the project name in the URL, so
  `/pypi/My_Package/json` and `/pypi/my-package/json` resolve to the same
  project. We still normalize client-side to show the user the canonical form.
- No authentication or API key required.
- No rate limit documentation is published; we handle 429 gracefully.

**Alternatives considered**:

- PyPI Simple/Index API: Rejected — returns HTML/JSON index of all versions,
  heavier than needed for an existence check.
- PyPI XML-RPC API: Rejected — deprecated by PyPI.
- Third-party APIs (libraries.io, etc.): Rejected — adds unnecessary
  dependency and potential CORS issues.

**Source**: https://docs.pypi.org/api/json/

## R3: Debounce Implementation

**Decision**: Implement debounce using `setTimeout`/`clearTimeout` in a
custom React hook. 300ms delay per spec.

**Rationale**: No external library needed. The pattern is simple:

- On each input change, clear the previous timeout and set a new one.
- When the timeout fires, trigger the validation + fetch pipeline.
- On unmount, clear any pending timeout.

**Implementation pattern**:

```typescript
// Inside usePackageChecker hook
useEffect(() => {
  const timer = setTimeout(() => {
    // validate, normalize, fetch
  }, 300);
  return () => clearTimeout(timer);
}, [inputValue]);
```

**Alternatives considered**:

- `lodash.debounce`: Rejected — adds a dependency for a trivial pattern.
  Constitution principle V (Simplicity) says dependencies must be justified.
- `use-debounce` package: Rejected — same reasoning; built-in is sufficient.
- `requestIdleCallback`: Rejected — not universally supported and
  semantically different from debounce.

## R4: Stale Request Cancellation

**Decision**: Use `AbortController` to cancel in-flight fetch requests when
input changes.

**Rationale**: Built into the browser Fetch API. When the user types a new
character before the previous request completes, the old request should be
aborted to prevent stale results from overwriting newer ones.

**Implementation pattern**:

```typescript
useEffect(() => {
  const controller = new AbortController();
  // ... debounce logic ...
  fetch(url, { signal: controller.signal })
    .then(/* handle response */)
    .catch((error) => {
      if (error.name === 'AbortError') return; // expected, ignore
      // handle real errors
    });
  return () => controller.abort();
}, [normalizedName]);
```

**Alternatives considered**:

- Tracking request IDs and ignoring stale responses: Rejected — doesn't
  actually cancel the network request, wasting bandwidth.
- `axios` with cancel tokens: Rejected — adds a dependency; native
  `AbortController` is sufficient.

## R5: Error Categorization Strategy

**Decision**: Map HTTP status codes to user-friendly messages as defined in
FR-008.

**Rationale**: Different failure modes require different user guidance.

| Condition                                         | Message                                                   |
| ------------------------------------------------- | --------------------------------------------------------- |
| HTTP 429                                          | "Too many requests, please wait and try again"            |
| HTTP 5xx                                          | "PyPI is temporarily unavailable, please try again later" |
| Network failure / AbortError (non-cancel) / other | "Something went wrong, please try again"                  |
| Malformed response                                | "Something went wrong, please try again"                  |

**Implementation**: A single `checkPyPI` utility function handles the fetch
and returns a discriminated union type:

```typescript
interface CheckSuccess {
  status: 'available' | 'taken';
  name: string;
}

interface CheckError {
  status: 'error';
  message: string;
}

type CheckResult = CheckSuccess | CheckError;
```

**Alternatives considered**:

- Throwing exceptions for errors: Rejected — discriminated unions are more
  type-safe and easier to handle in React state.
- Retry logic with exponential backoff: Rejected for now — YAGNI. The user
  can retry by modifying input. Could be added later if needed.

## R6: Component Architecture

**Decision**: Four components + one custom hook + three utility functions.

| Artifact               | Responsibility                                                       |
| ---------------------- | -------------------------------------------------------------------- |
| `App`                  | Root layout, renders heading + PackageNameInput + AvailabilityResult |
| `PackageNameInput`     | Hero input field, renders Spinner when loading                       |
| `AvailabilityResult`   | Displays check result (available/taken/error/validation)             |
| `Spinner`              | SVG spinner animation for loading state                              |
| `usePackageChecker`    | Hook: manages input state, debounce, validation, fetch, cancellation |
| `validatePackageName`  | Pure function: validates against PEP 508 regex                       |
| `normalizePackageName` | Pure function: PEP 503 normalization                                 |
| `checkPyPI`            | Async function: fetches PyPI API, returns CheckResult                |

**Data flow**:

1. `App` renders `PackageNameInput` and `AvailabilityResult`
2. `usePackageChecker` hook is called in `App`, providing state + handlers
3. User types → `PackageNameInput` calls `onChange` handler
4. Hook debounces → validates → normalizes → calls `checkPyPI`
5. Result flows to `AvailabilityResult` via props

**Alternatives considered**:

- Single monolithic component: Rejected — violates Constitution Principle I
  (Component-First) and makes testing harder.
- Context/Redux for state: Rejected — overkill for a single-screen app with
  one piece of state. Props are sufficient.
- Separate validation component: Rejected — validation messages are part of
  the result display; a separate component would fragment the UI.

## R7: Responsive Design Approach

**Decision**: Tailwind CSS mobile-first with breakpoint-based scaling.

**Rationale**: Spec requires mobile-first (FR-015), min 320px width, hero-size
on md+ (768px+), scaled down below sm (640px).

**Tailwind classes pattern**:

```
// Input field
text-2xl sm:text-3xl md:text-4xl lg:text-5xl
px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5
w-full max-w-[700px]
```

**Alternatives considered**:

- CSS Grid/Flexbox with custom media queries: Rejected — Tailwind responsive
  prefixes are cleaner and enforced by constitution.
- Container queries: Rejected — unnecessary complexity for a single-column
  layout.
