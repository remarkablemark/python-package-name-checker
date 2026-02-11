import { render, screen } from '@testing-library/react';

import AvailabilityResult from '.';

describe('AvailabilityResult component', () => {
  it('renders "Available" with disclaimer when status is available', () => {
    render(
      <AvailabilityResult
        message=""
        normalizedName="my-package"
        projectUrl=""
        status="available"
      />,
    );

    expect(screen.getByText(/available/i)).toBeInTheDocument();
    expect(
      screen.getByText(/availability does not guarantee/i),
    ).toBeInTheDocument();
  });

  it('renders "Taken" with link to PyPI project page when status is taken', () => {
    render(
      <AvailabilityResult
        message=""
        normalizedName="requests"
        projectUrl="https://pypi.org/project/requests/"
        status="taken"
      />,
    );

    expect(screen.getByText(/taken/i)).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://pypi.org/project/requests/');
  });

  it('renders nothing when status is idle', () => {
    const { container } = render(
      <AvailabilityResult
        message=""
        normalizedName=""
        projectUrl=""
        status="idle"
      />,
    );

    expect(container.textContent).toBe('');
  });

  it('renders nothing when status is loading', () => {
    const { container } = render(
      <AvailabilityResult
        message=""
        normalizedName=""
        projectUrl=""
        status="loading"
      />,
    );

    expect(container.textContent).toBe('');
  });
});
