/**
 * Tests for JourneyForm component
 *
 * Story 12.1: Data Journey Mapping Interface
 * Task 9.3: Unit tests for JourneyForm component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JourneyForm } from './JourneyForm';

describe('JourneyForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders journey name input', () => {
    render(<JourneyForm {...defaultProps} />);

    expect(screen.getByLabelText('Journey Name')).toBeInTheDocument();
  });

  it('renders template selector for create mode', () => {
    render(<JourneyForm {...defaultProps} />);

    expect(screen.getByLabelText('Start From Template')).toBeInTheDocument();
  });

  it('hides template selector in edit mode', () => {
    render(<JourneyForm {...defaultProps} isEdit />);

    expect(screen.queryByLabelText('Start From Template')).not.toBeInTheDocument();
  });

  it('pre-fills name when provided', () => {
    render(<JourneyForm {...defaultProps} initialName="Existing Journey" />);

    expect(screen.getByLabelText('Journey Name')).toHaveValue('Existing Journey');
  });

  it('shows error when submitting without name', async () => {
    render(<JourneyForm {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Create Journey/i }));

    expect(await screen.findByText('Journey name is required')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with name when valid', async () => {
    const onSubmit = vi.fn();
    render(<JourneyForm {...defaultProps} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Journey Name'), 'My Journey');
    fireEvent.click(screen.getByRole('button', { name: /Create Journey/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'My Journey',
      templateId: undefined,
    });
  });

  it('calls onSubmit with name only for blank journey', async () => {
    const onSubmit = vi.fn();
    render(<JourneyForm {...defaultProps} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Journey Name'), 'My Custom Journey');
    fireEvent.click(screen.getByRole('button', { name: /Create Journey/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'My Custom Journey',
      templateId: undefined,
    });
  });

  it('renders template selector with options', () => {
    render(<JourneyForm {...defaultProps} />);

    // Template selector should be present
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders template options text', () => {
    render(<JourneyForm {...defaultProps} />);

    // Template selector label should be present
    expect(screen.getByText('Start From Template')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<JourneyForm {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows Save Changes button in edit mode', () => {
    render(<JourneyForm {...defaultProps} isEdit />);

    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });

  it('shows Create Journey button in create mode', () => {
    render(<JourneyForm {...defaultProps} />);

    expect(screen.getByRole('button', { name: /Create Journey/i })).toBeInTheDocument();
  });

  it('clears error when name is typed', async () => {
    render(<JourneyForm {...defaultProps} />);

    // Submit empty to show error
    fireEvent.click(screen.getByRole('button', { name: /Create Journey/i }));
    expect(await screen.findByText('Journey name is required')).toBeInTheDocument();

    // Type in name
    await userEvent.type(screen.getByLabelText('Journey Name'), 'Valid Name');

    // Error should be cleared
    expect(screen.queryByText('Journey name is required')).not.toBeInTheDocument();
  });

  it('trims whitespace from name', async () => {
    const onSubmit = vi.fn();
    render(<JourneyForm {...defaultProps} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Journey Name'), '  Padded Name  ');
    fireEvent.click(screen.getByRole('button', { name: /Create Journey/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Padded Name',
      templateId: undefined,
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <JourneyForm {...defaultProps} className="custom-class" />
    );

    expect(container.querySelector('form')).toHaveClass('custom-class');
  });

  it('keeps initial name when provided', () => {
    render(<JourneyForm {...defaultProps} initialName="My Custom Name" />);

    // Should have the initial name
    expect(screen.getByLabelText('Journey Name')).toHaveValue('My Custom Name');
  });
});
