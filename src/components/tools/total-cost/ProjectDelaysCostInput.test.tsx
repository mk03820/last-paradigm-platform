/**
 * ProjectDelaysCostInput Tests
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 10.2: Unit tests for cost input components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectDelaysCostInput } from './ProjectDelaysCostInput';
import { createDefaultProjectDelaysCostInput } from './cost-constants';

describe('ProjectDelaysCostInput', () => {
  const defaultData = createDefaultProjectDelaysCostInput();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all input fields', () => {
    render(<ProjectDelaysCostInput data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Failed\/Delayed Projects/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Average Project Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Impact Percentage/i)).toBeInTheDocument();
  });

  it('should display current values', () => {
    const data = {
      failedProjectsCount: 3,
      avgProjectValue: 250000,
      delayImpactPercent: 50,
      subtotal: 375000,
    };

    render(<ProjectDelaysCostInput data={data} onChange={mockOnChange} />);

    const countInput = screen.getByLabelText(/Failed\/Delayed Projects/i);
    const valueInput = screen.getByLabelText(/Average Project Value/i);
    const percentInput = screen.getByLabelText(/Impact Percentage/i);

    expect(countInput).toHaveValue(3);
    expect(valueInput).toHaveValue(250000);
    expect(percentInput).toHaveValue(50);
  });

  it('should call onChange when failed projects count changes', async () => {
    const user = userEvent.setup();
    render(<ProjectDelaysCostInput data={defaultData} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Failed\/Delayed Projects/i);
    await user.clear(input);
    await user.type(input, '5');

    expect(mockOnChange).toHaveBeenCalledWith({ failedProjectsCount: expect.any(Number) });
  });

  it('should call onChange when average project value changes', async () => {
    const user = userEvent.setup();
    render(<ProjectDelaysCostInput data={defaultData} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Average Project Value/i);
    await user.clear(input);
    await user.type(input, '100000');

    expect(mockOnChange).toHaveBeenCalledWith({ avgProjectValue: expect.any(Number) });
  });

  it('should call onChange when impact percentage changes', async () => {
    const user = userEvent.setup();
    render(<ProjectDelaysCostInput data={defaultData} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Impact Percentage/i);
    await user.clear(input);
    await user.type(input, '75');

    expect(mockOnChange).toHaveBeenCalledWith({ delayImpactPercent: expect.any(Number) });
  });

  it('should display subtotal', () => {
    const data = {
      failedProjectsCount: 2,
      avgProjectValue: 500000,
      delayImpactPercent: 30,
      subtotal: 300000,
    };

    render(<ProjectDelaysCostInput data={data} onChange={mockOnChange} />);

    expect(screen.getByText('$300K')).toBeInTheDocument();
  });

  it('should display guidance tooltip icons', () => {
    render(<ProjectDelaysCostInput data={defaultData} onChange={mockOnChange} />);

    // Check for presence of info icons (4 icons: title area + 3 fields)
    const icons = document.querySelectorAll('.lucide-info');
    expect(icons.length).toBeGreaterThanOrEqual(3);
  });

  it('should render title and description', () => {
    render(<ProjectDelaysCostInput data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByText('Project Delays & Failures')).toBeInTheDocument();
    expect(screen.getByText(/Cost of projects that failed/i)).toBeInTheDocument();
  });

  it('should show calculation breakdown when subtotal > 0', () => {
    const data = {
      failedProjectsCount: 3,
      avgProjectValue: 100000,
      delayImpactPercent: 50,
      subtotal: 150000,
    };

    render(<ProjectDelaysCostInput data={data} onChange={mockOnChange} />);

    expect(screen.getByText(/3 projects/i)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ProjectDelaysCostInput
        data={defaultData}
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
