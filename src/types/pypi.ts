/** Possible states of a package name availability check. */
type AvailabilityStatus =
  | 'idle'
  | 'loading'
  | 'available'
  | 'taken'
  | 'error'
  | 'invalid';

/** Result when the package name is available on PyPI (HTTP 404). */
interface CheckResultAvailable {
  status: 'available';
  name: string;
}

/** Result when the package name is taken on PyPI (HTTP 200). */
interface CheckResultTaken {
  status: 'taken';
  name: string;
  projectUrl: string;
}

/** Result when an error occurred during the PyPI check. */
interface CheckResultError {
  status: 'error';
  message: string;
}

/** Discriminated union of all possible check results. */
type CheckResult = CheckResultAvailable | CheckResultTaken | CheckResultError;

/** Result when validation succeeds. */
interface ValidationSuccess {
  valid: true;
}

/** Result when validation fails. */
interface ValidationFailure {
  valid: false;
  message: string;
}

/** Discriminated union of validation outcomes. */
type ValidationResult = ValidationSuccess | ValidationFailure;

/** State managed by the usePackageChecker hook. */
interface PackageCheckerState {
  inputValue: string;
  status: AvailabilityStatus;
  message: string;
  projectUrl: string;
  normalizedName: string;
}

export type {
  AvailabilityStatus,
  CheckResult,
  CheckResultAvailable,
  CheckResultError,
  CheckResultTaken,
  PackageCheckerState,
  ValidationFailure,
  ValidationResult,
  ValidationSuccess,
};
