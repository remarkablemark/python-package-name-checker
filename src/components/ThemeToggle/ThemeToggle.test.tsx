import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ThemeToggle from '.';

describe('ThemeToggle component', () => {
  it('renders monitor icon when mode is system', () => {
    render(
      <ThemeToggle
        onCycle={vi.fn()}
        resolvedTheme="light"
        themeMode="system"
      />,
    );

    const button = screen.getByRole('button');
    expect(button.querySelector('[data-icon="monitor"]')).toBeInTheDocument();
  });

  it('renders sun icon when mode is light', () => {
    render(
      <ThemeToggle onCycle={vi.fn()} resolvedTheme="light" themeMode="light" />,
    );

    const button = screen.getByRole('button');
    expect(button.querySelector('[data-icon="sun"]')).toBeInTheDocument();
  });

  it('renders moon icon when mode is dark', () => {
    render(
      <ThemeToggle onCycle={vi.fn()} resolvedTheme="dark" themeMode="dark" />,
    );

    const button = screen.getByRole('button');
    expect(button.querySelector('[data-icon="moon"]')).toBeInTheDocument();
  });

  it('calls onCycle when button is clicked', async () => {
    const user = userEvent.setup();
    const handleCycle = vi.fn();

    render(
      <ThemeToggle
        onCycle={handleCycle}
        resolvedTheme="light"
        themeMode="system"
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleCycle).toHaveBeenCalledOnce();
  });

  it('has correct aria-label for system mode', () => {
    render(
      <ThemeToggle
        onCycle={vi.fn()}
        resolvedTheme="light"
        themeMode="system"
      />,
    );

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Theme: system. Click to switch to light.',
    );
  });

  it('has correct aria-label for light mode', () => {
    render(
      <ThemeToggle onCycle={vi.fn()} resolvedTheme="light" themeMode="light" />,
    );

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Theme: light. Click to switch to dark.',
    );
  });

  it('has correct aria-label for dark mode', () => {
    render(
      <ThemeToggle onCycle={vi.fn()} resolvedTheme="dark" themeMode="dark" />,
    );

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Theme: dark. Click to switch to system.',
    );
  });

  // T020: Accessibility tests
  it('button element has proper accessible role', () => {
    render(
      <ThemeToggle
        onCycle={vi.fn()}
        resolvedTheme="light"
        themeMode="system"
      />,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('button is reachable via Tab key focus', async () => {
    const user = userEvent.setup();

    render(
      <ThemeToggle
        onCycle={vi.fn()}
        resolvedTheme="light"
        themeMode="system"
      />,
    );

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('button is activatable via keyboard', async () => {
    const user = userEvent.setup();
    const handleCycle = vi.fn();

    render(
      <ThemeToggle
        onCycle={handleCycle}
        resolvedTheme="light"
        themeMode="system"
      />,
    );

    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleCycle).toHaveBeenCalledOnce();
  });
});
