import checkPyPI from './checkPyPI';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

afterEach(() => {
  vi.clearAllMocks();
});

describe('checkPyPI', () => {
  it('returns taken with projectUrl for HTTP 200', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    const controller = new AbortController();

    const result = await checkPyPI('requests', controller.signal);

    expect(result).toEqual({
      status: 'taken',
      name: 'requests',
      projectUrl: 'https://pypi.org/project/requests/',
    });
  });

  it('returns available for HTTP 404', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const controller = new AbortController();

    const result = await checkPyPI('xyzzy-not-real', controller.signal);

    expect(result).toEqual({
      status: 'available',
      name: 'xyzzy-not-real',
    });
  });

  it('silently re-throws AbortError', async () => {
    const abortError = new DOMException(
      'The operation was aborted',
      'AbortError',
    );
    mockFetch.mockRejectedValueOnce(abortError);
    const controller = new AbortController();

    await expect(checkPyPI('test', controller.signal)).rejects.toThrow(
      'The operation was aborted',
    );
  });

  it('calls fetch with correct URL and signal', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const controller = new AbortController();

    await checkPyPI('my-package', controller.signal);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://pypi.org/pypi/my-package/json',
      { signal: controller.signal },
    );
  });
});
