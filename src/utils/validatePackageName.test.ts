import validatePackageName from './validatePackageName';

describe('validatePackageName', () => {
  describe('valid names', () => {
    it.each(['requests', 'my-package', 'A', 'a1', 'foo.bar', 'foo_bar'])(
      'returns valid for "%s"',
      (name) => {
        expect(validatePackageName(name)).toEqual({ valid: true });
      },
    );
  });

  describe('single valid characters', () => {
    it.each(['a', '1'])('returns valid for "%s"', (name) => {
      expect(validatePackageName(name)).toEqual({ valid: true });
    });
  });

  describe('invalid characters', () => {
    it.each(['my package', 'my@package', 'hello!'])(
      'returns invalid for "%s" with character message',
      (name) => {
        const result = validatePackageName(name);
        expect(result).toEqual({
          valid: false,
          message:
            'Package name can only contain letters, numbers, hyphens, underscores, and periods',
        });
      },
    );
  });

  describe('invalid start/end', () => {
    it.each(['-foo', 'foo-', '.bar', 'bar.'])(
      'returns invalid for "%s" with start/end message',
      (name) => {
        const result = validatePackageName(name);
        expect(result).toEqual({
          valid: false,
          message: 'Package name must start and end with a letter or number',
        });
      },
    );
  });

  describe('empty string', () => {
    it('returns valid for empty string (handled separately by hook)', () => {
      expect(validatePackageName('')).toEqual({ valid: true });
    });
  });
});
