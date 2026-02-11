# API Contract: PyPI JSON API (External)

**Feature Branch**: `001-pypi-name-checker`
**Date**: 2026-02-10

This application consumes the PyPI JSON API as a read-only external
dependency. There is no backend or custom API to define. This contract
documents the external API surface we depend on.

## Endpoint: Check Package Existence

### Request

```
GET https://pypi.org/pypi/{name}/json
```

| Parameter | Location | Type     | Description                     |
| --------- | -------- | -------- | ------------------------------- |
| `name`    | URL path | `string` | PEP 503-normalized package name |

**Headers**: None required. PyPI serves CORS headers allowing browser fetch.

### Responses

#### 200 OK — Package Exists (Name Taken)

The package is registered on PyPI.

```json
{
  "info": {
    "name": "requests",
    "version": "2.31.0",
    "summary": "Python HTTP for Humans.",
    ...
  },
  ...
}
```

**Our usage**: We only check the HTTP status code. We do not parse the
response body. A 200 means the name is taken.

#### 404 Not Found — Package Does Not Exist (Name Available)

The package name is not registered on PyPI.

**Our usage**: A 404 means the name is available.

#### 429 Too Many Requests — Rate Limited

Too many requests from this client.

**Our handling**: Display "Too many requests, please wait and try again".

#### 5xx Server Error — PyPI Unavailable

PyPI is experiencing issues.

**Our handling**: Display "PyPI is temporarily unavailable, please try
again later".

## Internal Function Contract: `checkPyPI`

```typescript
/**
 * Checks whether a package name is available on PyPI.
 *
 * @param name - PEP 503-normalized package name
 * @param signal - AbortSignal for request cancellation
 * @returns CheckResult discriminated union
 */
function checkPyPI(name: string, signal: AbortSignal): Promise<CheckResult>;
```

### Return Types

```typescript
// Name is available (HTTP 404)
{ status: 'available', name: 'my-package' }

// Name is taken (HTTP 200)
{ status: 'taken', name: 'requests', projectUrl: 'https://pypi.org/project/requests/' }

// Error occurred
{ status: 'error', message: 'Too many requests, please wait and try again' }
{ status: 'error', message: 'PyPI is temporarily unavailable, please try again later' }
{ status: 'error', message: 'Something went wrong, please try again' }
```

### Error Mapping

| Condition       | `message` value                                             |
| --------------- | ----------------------------------------------------------- |
| HTTP 429        | `"Too many requests, please wait and try again"`            |
| HTTP 500–599    | `"PyPI is temporarily unavailable, please try again later"` |
| Network error   | `"Something went wrong, please try again"`                  |
| `AbortError`    | Not returned — silently ignored (expected cancellation)     |
| Any other error | `"Something went wrong, please try again"`                  |

## Internal Function Contract: `validatePackageName`

```typescript
/**
 * Validates a package name against PEP 508 naming rules.
 *
 * @param name - Raw user input
 * @returns ValidationResult
 */
function validatePackageName(name: string): ValidationResult;
```

### Return Types

```typescript
// Valid name
{ valid: true }

// Invalid name
{ valid: false, message: 'Package name can only contain letters, numbers, hyphens, underscores, and periods' }
{ valid: false, message: 'Package name must start and end with a letter or number' }
```

## Internal Function Contract: `normalizePackageName`

```typescript
/**
 * Normalizes a package name per PEP 503.
 * Lowercases and replaces runs of .-_ with a single hyphen.
 *
 * @param name - Raw or validated package name
 * @returns Normalized package name
 */
function normalizePackageName(name: string): string;
```

### Examples

| Input                 | Output            |
| --------------------- | ----------------- |
| `"My_Package"`        | `"my-package"`    |
| `"Friendly-Bard"`     | `"friendly-bard"` |
| `"friendly.bard"`     | `"friendly-bard"` |
| `"FrIeNdLy-._.-bArD"` | `"friendly-bard"` |
