/**
 * Normalizes a package name per PEP 503.
 * Lowercases and replaces runs of `.-_` with a single hyphen.
 *
 * @param name - Raw or validated package name
 * @returns Normalized package name
 */
export default function normalizePackageName(name: string): string {
  return name.replace(/[-_.]+/g, '-').toLowerCase();
}
