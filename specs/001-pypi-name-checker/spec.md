# Feature Specification: Python Package Name Checker

**Feature Branch**: `001-pypi-name-checker`
**Created**: 2026-02-10
**Status**: Draft
**Input**: User description: "Python package name checker"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Check Package Name Availability (Priority: P1)

A developer wants to check whether a specific Python package name is
available on PyPI before starting a new project. They visit the site
and begin typing a package name into a search field. After a brief
pause in typing (debounce), the system automatically checks PyPI and
displays whether the name is taken or available — no submit button
is required.

**Why this priority**: This is the core value proposition of the
entire application. Without this, the tool has no purpose.

**Independent Test**: Can be fully tested by entering a known
existing package name (e.g., "requests") and a known non-existent
name (e.g., "xyzzy-not-a-real-package-12345") and verifying the
correct availability status is displayed.

**Acceptance Scenarios**:

1. **Given** the user is on the home page, **When** they type a
   package name and pause typing (debounce period elapses), **Then**
   the system automatically checks PyPI and displays whether the
   name is available or taken.
2. **Given** the user types a known existing package name (e.g.,
   "requests") and pauses, **When** the lookup completes, **Then**
   the system indicates the name is taken.
3. **Given** the user types a name that does not exist on PyPI and
   pauses, **When** the lookup completes, **Then** the system
   indicates the name is available.
4. **Given** the user has typed a name, **When** the debounced
   lookup is in progress, **Then** the system displays a loading
   indicator so the user knows the request is being processed.
5. **Given** the user is still actively typing, **When** the
   debounce period has not yet elapsed, **Then** no lookup request
   is made.

---

### User Story 2 - Input Validation & Error Feedback (Priority: P2)

A developer enters an invalid package name (e.g., empty string,
special characters not allowed by PyPI naming rules, or excessively
long names). The system validates the input and provides clear,
actionable error messages before making any network request.

**Why this priority**: Prevents wasted API calls and gives users
immediate feedback, improving the experience and reducing confusion.

**Independent Test**: Can be tested by entering various invalid
inputs (empty, special characters, spaces) and verifying that
appropriate validation messages appear without any network request
being made.

**Acceptance Scenarios**:

1. **Given** the input field is empty or contains only whitespace,
   **When** the debounce period elapses, **Then** no lookup is
   triggered and no error is displayed.
2. **Given** the user types a name with invalid characters (e.g.,
   characters not permitted by PyPI naming rules), **When** the
   debounce period elapses, **Then** the system displays a
   validation message explaining the naming rules without making a
   network request.
3. **Given** the user types a valid package name, **When** the
   debounce period elapses, **Then** no validation error is shown
   and the lookup proceeds automatically.

---

### User Story 3 - Network Error Handling (Priority: P3)

A developer checks a package name but the PyPI lookup fails due to
network issues, rate limiting, or the PyPI service being unavailable.
The system displays a clear error message and allows the user to
retry.

**Why this priority**: Graceful error handling is essential for a
reliable user experience, but it is secondary to the core lookup
functionality.

**Independent Test**: Can be tested by simulating a network failure
or timeout and verifying the error message is displayed with a retry
option.

**Acceptance Scenarios**:

1. **Given** a debounced lookup is triggered for a valid package
   name, **When** the network request fails (timeout, server error,
   no connectivity), **Then** the system displays a user-friendly
   error message.
2. **Given** an error message is displayed, **When** the user
   modifies the input or triggers a retry action, **Then** the
   system re-attempts the lookup.

---

### Edge Cases

- What happens when the user enters a name that is normalized
  differently by PyPI (e.g., underscores vs. hyphens, mixed case)?
  The system MUST normalize the name according to PyPI conventions
  before lookup.
- What happens when the user types rapidly and the input changes
  before a pending request completes? The system MUST cancel stale
  requests and only display the result for the most recent input.
- What happens when the PyPI response is unexpectedly malformed?
  The system MUST handle it gracefully and display a generic error
  rather than crashing.
- What happens when the user submits a name that is a reserved or
  prohibited PyPI name? The system MUST treat the PyPI response
  accurately regardless of reservation status.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a large, hero-style text input
  field centered on the page for entering a Python package name.
  The input MUST use extra-large text (~36–48px), generous padding,
  and span up to ~700px wide (full-width on mobile). It MUST be
  the dominant visual element on the page.
- **FR-002**: System MUST automatically trigger the availability
  check after the user pauses typing (debounced input). No explicit
  submit button is required.
- **FR-003**: System MUST query the PyPI JSON API at
  `https://pypi.org/pypi/{name}/json` to determine whether the
  entered package name is registered. An HTTP 200 response indicates
  the name is taken; an HTTP 404 indicates it is available.
- **FR-004**: System MUST display a text status message after the
  lookup completes: "✅ Available" when the name is free, or
  "❌ Taken" when it exists. When the name is taken, the result
  MUST include a link to `https://pypi.org/project/{name}/`.
- **FR-005**: System MUST display an inline spinner icon on the
  right side of the input field while the lookup is in progress.
- **FR-006**: System MUST validate the package name against PyPI
  naming rules before making a network request.
- **FR-007**: System MUST display actionable validation error
  messages for invalid input.
- **FR-008**: System MUST handle errors with categorized messages:
  HTTP 429 MUST display "Too many requests, please wait and try
  again"; HTTP 5xx MUST display "PyPI is temporarily unavailable,
  please try again later"; network failures and all other
  unexpected errors MUST display a generic "Something went wrong,
  please try again" message.
- **FR-009**: System MUST allow the user to retry after a failed
  lookup.
- **FR-010**: System MUST normalize package names (hyphens,
  underscores, case) according to PyPI conventions before lookup.
- **FR-011**: System MUST cancel stale requests when the user's
  input changes before a pending lookup completes.
- **FR-012**: System MUST debounce the input so that lookups are
  only triggered after the user stops typing for 300ms.
- **FR-013**: System MUST trigger a lookup for any non-empty valid
  input, regardless of length (no minimum character threshold).

### Key Entities

- **Package Name**: The user-provided string representing a desired
  Python package name. Key attributes: raw input value, normalized
  value (after applying PyPI naming rules).
- **Availability Result**: The outcome of a PyPI lookup. Key
  attributes: package name checked, availability status (available,
  taken), timestamp of check.
- **Validation Error**: A client-side error produced when the input
  does not conform to PyPI naming rules. Key attributes: error
  message, the invalid input that triggered it.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can check a package name's availability in under
  5 seconds end-to-end (input to result displayed), assuming normal
  network conditions.
- **SC-002**: 95% of users successfully complete a package name
  check on their first attempt without encountering confusion or
  unhandled errors.
- **SC-003**: Invalid input is caught and communicated to the user
  before any network request is made, with zero false positives on
  valid PyPI names.
- **SC-004**: Network errors are handled gracefully 100% of the
  time — the application never displays a blank screen, unhandled
  exception, or browser error to the user.
- **SC-005**: The application loads and becomes interactive in under
  2 seconds on a standard broadband connection.

### Assumptions

- The application is a client-side static site with no backend
  server. All PyPI lookups happen directly from the browser.
- PyPI provides a publicly accessible JSON API at
  `https://pypi.org/pypi/{name}/json` that can be called directly
  from the browser without CORS issues or authentication. No proxy
  is required. HTTP 200 = name taken, HTTP 404 = name available.
- The application does not store or persist any user data or search
  history.

## Clarifications

### Session 2026-02-10

- Q: Should the lookup be triggered by a submit button or
  automatically as the user types? → A: Realtime check with
  debounce — no submit button. The system automatically queries
  PyPI after the user pauses typing.
- Q: What should the debounce delay duration be? → A: 300ms
  (industry standard balance of responsiveness vs. request
  reduction).
- Q: How should the app access the PyPI API from the browser
  (CORS proxy, direct fetch, etc.)? → A: Direct fetch — no CORS
  proxy needed. Verified locally that PyPI API calls work directly
  from the browser.
- Q: What is the minimum input length before triggering a lookup?
  → A: No minimum — trigger lookup for any non-empty valid input
  (1 character is sufficient).
- Q: What PyPI endpoint should be used for the lookup? → A:
  `https://pypi.org/pypi/{name}/json` — HTTP 200 means taken,
  HTTP 404 means available.
- Q: What should the availability result display show? → A:
  Text status with emoji ("✅ Available" / "❌ Taken") plus a
  link to the PyPI project page when the name is taken.
- Q: What size should the text input be? → A: Extra-large
  hero-style search input (~36–48px text, ~700px wide, generous
  padding), centered on the page as the dominant visual element.
- Q: What style of loading indicator should be used? → A: Inline
  spinner inside the input field (right side).
- Q: How should non-200/404 HTTP responses be handled? → A:
  Categorized errors — 429 shows "Please wait and try again",
  5xx shows "PyPI temporarily unavailable", all others show a
  generic error message.
