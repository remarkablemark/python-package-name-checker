import normalizePackageName from './normalizePackageName';

describe('normalizePackageName', () => {
  it('replaces underscores with hyphens and lowercases', () => {
    expect(normalizePackageName('My_Package')).toBe('my-package');
  });

  it('lowercases and keeps hyphens', () => {
    expect(normalizePackageName('Friendly-Bard')).toBe('friendly-bard');
  });

  it('replaces periods with hyphens', () => {
    expect(normalizePackageName('friendly.bard')).toBe('friendly-bard');
  });

  it('replaces mixed runs of separators with a single hyphen', () => {
    expect(normalizePackageName('FrIeNdLy-._.-bArD')).toBe('friendly-bard');
  });

  it('lowercases a single character', () => {
    expect(normalizePackageName('A')).toBe('a');
  });

  it('returns already normalized names unchanged', () => {
    expect(normalizePackageName('foo')).toBe('foo');
  });

  it('replaces multiple underscores with a single hyphen', () => {
    expect(normalizePackageName('my__package')).toBe('my-package');
  });
});
