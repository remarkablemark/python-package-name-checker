# Data Model: Python Package Name Checker

**Feature Branch**: `001-pypi-name-checker`
**Date**: 2026-02-10

## Entities

### PackageName

Represents the user's input and its normalized form.

| Field        | Type     | Description                                                                      |
| ------------ | -------- | -------------------------------------------------------------------------------- |
| `raw`        | `string` | The exact text the user typed into the input field                               |
| `normalized` | `string` | The PEP 503-normalized form (lowercased, runs of `.-_` replaced with single `-`) |

**Validation rules** (PEP 508):

- Only ASCII letters (`A-Z`, `a-z`), digits (`0-9`), period (`.`), underscore (`_`), hyphen (`-`)
- Must start and end with a letter or digit
- Minimum length: 1 character
- Regex: `/^([A-Z0-9]|[A-Z0-9][A-Z0-9._-]*[A-Z0-9])$/i`

**Normalization** (PEP 503):

```typescript
name.replace(/[-_.]+/g, '-').toLowerCase();
```

### AvailabilityStatus

Discriminated union representing the possible states of a package name check.

```typescript
type AvailabilityStatus =
  | 'idle'
  | 'loading'
  | 'available'
  | 'taken'
  | 'error'
  | 'invalid';
```

| Value       | Description                                                       |
| ----------- | ----------------------------------------------------------------- |
| `idle`      | No check has been performed (initial state, or input is empty)    |
| `loading`   | A PyPI API request is in flight                                   |
| `available` | PyPI returned HTTP 404 — the name is not registered               |
| `taken`     | PyPI returned HTTP 200 — the name is registered                   |
| `error`     | A network error, rate limit, or server error occurred             |
| `invalid`   | The input failed client-side validation against PyPI naming rules |

### CheckResult

The return type of the `checkPyPI` utility function. Uses a discriminated
union for type-safe handling.

```typescript
interface CheckResultAvailable {
  status: 'available';
  name: string;
}

interface CheckResultTaken {
  status: 'taken';
  name: string;
  projectUrl: string;
}

interface CheckResultError {
  status: 'error';
  message: string;
}

type CheckResult = CheckResultAvailable | CheckResultTaken | CheckResultError;
```

### ValidationResult

The return type of the `validatePackageName` utility function.

```typescript
interface ValidationSuccess {
  valid: true;
}

interface ValidationFailure {
  valid: false;
  message: string;
}

type ValidationResult = ValidationSuccess | ValidationFailure;
```

### PackageCheckerState

The state managed by the `usePackageChecker` hook, exposed to components.

```typescript
interface PackageCheckerState {
  inputValue: string;
  status: AvailabilityStatus;
  message: string;
  projectUrl: string;
  normalizedName: string;
}
```

| Field            | Type                 | Description                                                                        |
| ---------------- | -------------------- | ---------------------------------------------------------------------------------- |
| `inputValue`     | `string`             | Current value of the input field                                                   |
| `status`         | `AvailabilityStatus` | Current state of the check lifecycle                                               |
| `message`        | `string`             | Display message (result text, error text, or validation message)                   |
| `projectUrl`     | `string`             | Link to `https://pypi.org/project/{name}/` when status is `taken`; empty otherwise |
| `normalizedName` | `string`             | The PEP 503-normalized name used for the lookup                                    |

## State Transitions

```
User types → idle
  │
  ├─ Input empty/whitespace → idle (no action)
  │
  ├─ Input invalid (fails PEP 508) → invalid
  │
  └─ Input valid → (debounce 300ms) → loading
       │
       ├─ HTTP 404 → available
       ├─ HTTP 200 → taken
       ├─ HTTP 429 → error ("Too many requests, please wait and try again")
       ├─ HTTP 5xx → error ("PyPI is temporarily unavailable, please try again later")
       ├─ Network failure → error ("Something went wrong, please try again")
       └─ Input changes during fetch → abort → back to debounce cycle
```

## Relationships

- `PackageNameInput` **reads** `inputValue`, `status` (for spinner)
- `PackageNameInput` **writes** `inputValue` via `onChange` handler
- `AvailabilityResult` **reads** `status`, `message`, `projectUrl`, `normalizedName`
- `usePackageChecker` **owns** all state; **calls** `validatePackageName`, `normalizePackageName`, `checkPyPI`
- `checkPyPI` **produces** `CheckResult`
- `validatePackageName` **produces** `ValidationResult`
