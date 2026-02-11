import type { ValidationResult } from 'src/types/pypi';

const VALID_CHARS = /^[A-Za-z0-9._-]+$/;
const VALID_NAME = /^([A-Z0-9]|[A-Z0-9][A-Z0-9._-]*[A-Z0-9])$/i;

/**
 * Validates a package name against PEP 508 naming rules.
 *
 * @param name - Raw user input
 * @returns ValidationResult
 */
export default function validatePackageName(name: string): ValidationResult {
  if (name === '') {
    return { valid: true };
  }

  if (!VALID_CHARS.test(name)) {
    return {
      valid: false,
      message:
        'Package name can only contain letters, numbers, hyphens, underscores, and periods',
    };
  }

  if (!VALID_NAME.test(name)) {
    return {
      valid: false,
      message: 'Package name must start and end with a letter or number',
    };
  }

  return { valid: true };
}
