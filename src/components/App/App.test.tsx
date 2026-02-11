import { act, fireEvent, render, screen } from '@testing-library/react';

import App from '.';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('App component', () => {
  it('renders heading and input', () => {
    render(<App />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Python Package Name Checker');

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('displays taken result after typing a taken package name', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
    render(<App />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'requests' } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(screen.getByText(/taken/i)).toBeInTheDocument();
  });

  it('displays available result after typing an available package name', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    render(<App />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'xyzzy-not-real' } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(screen.getByText(/available/i)).toBeInTheDocument();
  });

  it('shows spinner during loading', async () => {
    let resolveFetch!: (value: unknown) => void;
    mockFetch.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    render(<App />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.getByRole('status')).toBeInTheDocument();

    // Resolve the pending fetch to allow cleanup
    await act(async () => {
      resolveFetch({ ok: false, status: 404 });
      await vi.runAllTimersAsync();
    });
  });

  it('debounce prevents immediate fetch', () => {
    render(<App />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'a' } });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
