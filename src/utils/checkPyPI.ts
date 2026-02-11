import type { CheckResult } from 'src/types/pypi';

/**
 * Checks whether a package name is available on PyPI.
 *
 * @param name - PEP 503-normalized package name
 * @param signal - AbortSignal for request cancellation
 * @returns CheckResult discriminated union
 */
export default async function checkPyPI(
  name: string,
  signal: AbortSignal,
): Promise<CheckResult> {
  const response = await fetch(`https://pypi.org/pypi/${name}/json`, {
    signal,
  });

  if (response.status === 200) {
    return {
      status: 'taken',
      name,
      projectUrl: `https://pypi.org/project/${name}/`,
    };
  }

  if (response.status === 404) {
    return { status: 'available', name };
  }

  if (response.status === 429) {
    return {
      status: 'error',
      message: 'Too many requests, please wait and try again',
    };
  }

  if (response.status >= 500 && response.status < 600) {
    return {
      status: 'error',
      message: 'PyPI is temporarily unavailable, please try again later',
    };
  }

  return {
    status: 'error',
    message: 'Something went wrong, please try again',
  };
}
