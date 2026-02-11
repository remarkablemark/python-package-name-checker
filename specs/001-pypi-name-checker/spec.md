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
- **FR-014**: When a name shows as available, the system MUST
  display a disclaimer note (e.g., "Note: PyPI may still reject
  names too similar to existing packages") to set correct user
  expectations.
- **FR-015**: The layout MUST be mobile-first and responsive.
  Input text size and padding MUST scale down on screens below
  640px (`sm` breakpoint) while maintaining the hero-style size on
  768px+ (`md` breakpoint). Minimum supported screen width is
  320px. The input MUST be full-width on mobile.

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
  Categorized errors — 429 shows "Too many requests, please wait
  and try again", 5xx shows "PyPI is temporarily unavailable,
  please try again later", all others show "Something went wrong,
  please try again".
- Q: How should PyPI's "name too similar" rejection be handled?
  → A: Show a disclaimer when a name is available, noting that
  PyPI may still reject names too similar to existing packages.
  The API does not expose similarity data, so this is informational
  only.
- Q: How should mobile responsiveness be handled? → A:
  Mobile-first with scaled text — reduce input text size and
  padding below `sm` (640px), hero-size on `md`+ (768px+),
  minimum supported width 320px, full-width input on mobile.

## Checklist Resolutions

_Decisions documented for all items in
`checklists/comprehensive.md`. Resolved 2026-02-10._

### Requirement Completeness (CHK001–CHK009)

- **CHK001** — Exact validation messages are defined in
  `contracts/pypi-api.md`: invalid characters →
  "Package name can only contain letters, numbers, hyphens,
  underscores, and periods"; invalid start/end →
  "Package name must start and end with a letter or number".
  Empty input is handled separately (resets to idle, no message).
  **Resolved: messages enumerated in contracts.**

- **CHK002** — Retry mechanism is modifying the input. There is no
  retry button. Changing the input resets state and re-triggers the
  debounce cycle (FR-009). This is documented in data-model.md
  state transitions.
  **Resolved: retry = modify input.**

- **CHK003** — Page heading: "Python Package Name Checker" as an
  `<h1>`. Left to implementation as a simple descriptive heading.
  **Resolved: heading is "Python Package Name Checker".**

- **CHK004** — Input placeholder text: "Enter a package name"
  (concise, action-oriented).
  **Resolved: placeholder = "Enter a package name".**

- **CHK005** — Disclaimer text (FR-014): exact wording is
  "Note: PyPI may still reject names too similar to existing
  packages." The "e.g." in the spec indicated this was the intended
  text.
  **Resolved: exact wording defined.**

- **CHK006** — PyPI naming rules are enumerated in research.md (R1)
  and data-model.md: PEP 508 regex
  `/^([A-Z0-9]|[A-Z0-9][A-Z0-9._-]*[A-Z0-9])$/i`, PEP 503
  normalization. Implementer does not need to research independently.
  **Resolved: rules documented in research.md and data-model.md.**

- **CHK007** — "Taken" link visual treatment: standard anchor tag
  styled as a text link, opens in a new tab with
  `target="_blank" rel="noopener noreferrer"`. Placed inline after
  the "❌ Taken" text. No special styling beyond default link
  appearance with Tailwind.
  **Resolved: new tab, rel="noopener noreferrer", inline placement.**

- **CHK008** — Clearing the input resets to idle state. The result
  disappears immediately (no animation). Documented in data-model.md:
  "Input empty/whitespace → idle (no action)".
  **Resolved: result disappears, state resets to idle.**

- **CHK009** — Initial page state: the user sees the heading, the
  empty input with placeholder text, and nothing else. No
  instructional text beyond the placeholder.
  **Resolved: heading + empty input with placeholder.**

### Requirement Clarity (CHK010–CHK015)

- **CHK010** — "Hero-style" is defined by the Tailwind classes in
  research.md (R7): `text-2xl sm:text-3xl md:text-4xl lg:text-5xl`
  with `px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5`. The ~36–48px
  range is approximate guidance; the Tailwind scale is the
  implementation spec.
  **Resolved: Tailwind classes are the objective criteria.**

- **CHK011** — "Generous padding" is quantified by the Tailwind
  classes: `px-4 py-3` (mobile), scaling to `md:px-8 md:py-5`
  (desktop). These are the exact values.
  **Resolved: padding defined via Tailwind classes.**

- **CHK012** — "Actionable" means the message tells the user what
  to fix: "Package name can only contain…" and "Package name must
  start and end with…" (imperative, specific). This is defined in
  contracts/pypi-api.md.
  **Resolved: actionable = tells user what is wrong and what is
  allowed.**

- **CHK013** — "User-friendly error message" means the categorized
  messages in FR-008 / contracts/pypi-api.md. No technical jargon,
  no stack traces, no HTTP status codes shown to user.
  **Resolved: defined by FR-008 message catalog.**

- **CHK014** — "Standard broadband connection" in SC-005: this is a
  qualitative target, not a lab benchmark. Practically: the static
  bundle should be small enough to load in <2s on a typical home
  connection (~25 Mbps). Not measured via specific tooling for MVP.
  **Resolved: qualitative target, not a lab metric.**

- **CHK015** — "Normal network conditions" in SC-001: same as above.
  Means no simulated throttling, no offline mode. The 5s budget
  includes 300ms debounce + network RTT + render. Not a contractual
  SLA.
  **Resolved: qualitative target for typical usage.**

### Requirement Consistency (CHK016–CHK019)

- **CHK016** — FR-008 is authoritative. The exact message for 429 is
  "Too many requests, please wait and try again" as defined in
  FR-008 and contracts/pypi-api.md.
  **Resolved: FR-008 is authoritative.**

- **CHK017** — FR-008 is authoritative. The exact message for 5xx is
  "PyPI is temporarily unavailable, please try again later" as
  defined in FR-008 and contracts/pypi-api.md.
  **Resolved: FR-008 is authoritative.**

- **CHK018** — "Validation message explaining the naming rules"
  (US2) and "actionable validation error messages" (FR-007) refer to
  the same thing: the two messages defined in contracts/pypi-api.md.
  **Resolved: same requirement, consistent.**

- **CHK019** — FR-015 and the Clarifications section are consistent.
  Both reference `sm` (640px) and `md` (768px). FR-015 is the
  authoritative source; Clarifications echo it.
  **Resolved: consistent, FR-015 is authoritative.**

### Acceptance Criteria Quality (CHK020–CHK023)

- **CHK020** — SC-002 (95% first-attempt success) is a design intent
  metric, not measured via analytics. It is validated by: (a) the UX
  being a single input with auto-lookup (minimal friction), and
  (b) clear error messages guiding correction. No runtime measurement
  for a static site.
  **Resolved: design intent, validated by UX simplicity.**

- **CHK021** — SC-004 "gracefully" means: an error message from the
  FR-008 catalog is displayed, no blank screen, no unhandled
  exception, no browser error dialog. All error paths return a
  CheckResultError with a user-facing message.
  **Resolved: defined by FR-008 error catalog + no blank screen.**

- **CHK022** — SC-001's 5 seconds includes the 300ms debounce. The
  network + render budget is ~4.7s. This is acceptable for a PyPI
  API call which typically responds in <1s.
  **Resolved: yes, includes debounce.**

- **CHK023** — SC-005's 2-second load target is measured informally
  (page visually complete and input interactive). Not tied to a
  specific Lighthouse metric for MVP. The static bundle with no
  external dependencies ensures this is easily met.
  **Resolved: informal measurement, easily met by small bundle.**

### Scenario Coverage (CHK024–CHK028)

- **CHK024** — Paste triggers the same `onChange` handler as typing.
  The debounce timer starts from the paste event. Behavior is
  identical to typing the final value. No special handling needed.
  **Resolved: paste works identically to typing via onChange.**

- **CHK025** — Same name twice: the debounce fires again and a new
  fetch is made. No caching of previous results. This is simple and
  correct — PyPI state could change between checks.
  **Resolved: re-fetches, no caching.**

- **CHK026** — Transition between results: when input changes, state
  resets to idle during debounce, then to loading during fetch. The
  old result disappears when the new debounce cycle starts (state
  goes to loading). No overlap of old and new results.
  **Resolved: old result replaced by loading state.**

- **CHK027** — No URL routing. The URL does not change. No
  shareable links with pre-filled names. This is a single-screen
  app with no routing requirement.
  **Resolved: no URL routing, not in scope.**

- **CHK028** — No `<noscript>` fallback specified. The app requires
  JavaScript. This is standard for a React SPA.
  **Resolved: JavaScript required, no noscript fallback.**

### Edge Case Coverage (CHK029–CHK034)

- **CHK029** — No maximum length enforced client-side. PEP 508 does
  not specify one. If PyPI rejects an excessively long name, the
  API will return a non-200/404 response handled by FR-008 error
  categorization.
  **Resolved: no client-side max length.**

- **CHK030** — Single-character names (e.g., "a", "1") are valid per
  FR-013 and PEP 508. No special UX treatment. The lookup proceeds
  normally.
  **Resolved: treated normally, no special UX.**

- **CHK031** — Names that normalize to the same value: the
  normalized name is displayed in the AvailabilityResult component
  via the `normalizedName` prop (defined in data-model.md
  PackageCheckerState). The user sees what was actually looked up.
  **Resolved: normalized name shown in result.**

- **CHK032** — A name that normalizes to empty is impossible per
  PEP 508 validation (must start/end with letter or digit).
  Validation runs before normalization. No special handling needed.
  **Resolved: impossible, blocked by validation.**

- **CHK033** — Rapid sequential lookups: AbortController cancels
  stale requests (FR-011). Only the latest request completes. If
  PyPI rate-limits, the 429 handler displays the appropriate message.
  **Resolved: handled by AbortController + 429 error handling.**

- **CHK034** — Malformed HTTP 200 response: we do not parse the
  response body (per contracts/pypi-api.md: "We only check the HTTP
  status code"). A 200 with any body = taken. No body parsing = no
  malformed body risk.
  **Resolved: no body parsing, only status code checked.**

### Accessibility (CHK035–CHK039)

- **CHK035** — ARIA roles and labels are specified in tasks.md
  (T002, T028, T029): input gets `aria-label`, Spinner gets
  `role="status"` and `aria-label="Loading"`, result region gets
  `role="status"`.
  **Resolved: defined in tasks T002, T028, T029.**

- **CHK036** — Dynamic results announced via `aria-live="polite"`
  on the AvailabilityResult container (tasks.md T028).
  **Resolved: aria-live="polite" specified in T028.**

- **CHK037** — Keyboard navigation: the input is a standard
  `<input>` element (focusable via Tab). The PyPI link is a standard
  `<a>` element (focusable via Tab). No custom keyboard handling
  needed.
  **Resolved: standard HTML elements provide keyboard access.**

- **CHK038** — Color contrast: emoji indicators (✅/❌) are not
  color-only — they include distinct shapes. Text messages provide
  the semantic meaning. No color-only indicators are used.
  **Resolved: emoji + text, not color-only.**

- **CHK039** — Focus management: focus remains on the input at all
  times. Results appear below the input without stealing focus. The
  user continues typing without interruption.
  **Resolved: focus stays on input.**

### Performance (CHK040–CHK042)

- **CHK040** — No explicit bundle size budget for MVP. The app has
  zero additional runtime dependencies (only React + ReactDOM).
  Vite tree-shaking ensures minimal output. Can be measured
  post-build if needed.
  **Resolved: no formal budget, minimal by design.**

- **CHK041** — Slow network: the loading spinner displays
  indefinitely until the request completes or fails. No client-side
  timeout for MVP. The browser's default fetch timeout applies.
  **Resolved: no client-side timeout, spinner shows during wait.**

- **CHK042** — No explicit fetch timeout duration. The browser's
  native timeout behavior applies. AbortController handles
  cancellation on input change. A future enhancement could add a
  timeout, but YAGNI for MVP.
  **Resolved: no explicit timeout, YAGNI for MVP.**

### Security (CHK043–CHK044)

- **CHK043** — Input sanitization: PEP 508 validation restricts
  input to `[A-Za-z0-9._-]` before it reaches the URL. The name is
  interpolated into a URL path segment, not into HTML. React's JSX
  escapes all rendered text. No XSS or injection risk.
  **Resolved: validation + React escaping = safe.**

- **CHK044** — PyPI project link uses `target="_blank"` with
  `rel="noopener noreferrer"` (see CHK007 resolution).
  **Resolved: target="\_blank" rel="noopener noreferrer".**

### Dependencies & Assumptions (CHK045–CHK047)

- **CHK045** — CORS assumption: verified locally per Clarifications
  section. PyPI serves `Access-Control-Allow-Origin: *` on JSON API
  responses. This is a well-known public API behavior. Sufficient
  for a client-side app.
  **Resolved: verified, well-known public API behavior.**

- **CHK046** — API stability risk: PyPI's JSON API is a stable,
  widely-used public API. If it changes, the app would need updates.
  This is an accepted risk for any app consuming an external API.
  No mitigation needed beyond error handling (FR-008).
  **Resolved: accepted risk, mitigated by error handling.**

- **CHK047** — GitHub Pages deployment is documented in plan.md
  Technical Context: "Deployed as a static site to GitHub Pages at
  `remarkablemark.org/python-package-name-checker/`". The spec says
  "client-side static site" which is consistent.
  **Resolved: documented in plan.md, consistent with spec.**

### Ambiguities & Conflicts (CHK048–CHK050)

- **CHK048** — "No submit button is required" means no submit button
  will be implemented. The debounce-based auto-lookup is the only
  interaction model. Adding an optional button would add unnecessary
  complexity (Constitution Principle V: Simplicity).
  **Resolved: no submit button, debounce only.**

- **CHK049** — FR-004 link uses the normalized name:
  `https://pypi.org/project/{normalizedName}/`. This matches what
  PyPI expects and what was actually looked up.
  **Resolved: normalized name in URL.**

- **CHK050** — The normalized name is displayed to the user via the
  `normalizedName` field in PackageCheckerState (data-model.md).
  When the user types "My_Package", the result shows the lookup was
  for "my-package". This informs the user of the canonical form.
  **Resolved: normalized name shown in result display.**
