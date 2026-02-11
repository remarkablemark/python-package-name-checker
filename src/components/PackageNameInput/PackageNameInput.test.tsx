import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PackageNameInput from '.';

describe('PackageNameInput component', () => {
  it('renders input with placeholder text', () => {
    render(<PackageNameInput inputValue="" onChange={vi.fn()} status="idle" />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder');
  });

  it('calls onChange handler on user typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <PackageNameInput inputValue="" onChange={handleChange} status="idle" />,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'a');

    expect(handleChange).toHaveBeenCalledWith('a');
  });

  it('renders Spinner when status is loading', () => {
    render(
      <PackageNameInput
        inputValue="test"
        onChange={vi.fn()}
        status="loading"
      />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not render Spinner when status is not loading', () => {
    render(<PackageNameInput inputValue="" onChange={vi.fn()} status="idle" />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('has an accessible label', () => {
    render(<PackageNameInput inputValue="" onChange={vi.fn()} status="idle" />);

    expect(screen.getByLabelText(/package name/i)).toBeInTheDocument();
  });
});
