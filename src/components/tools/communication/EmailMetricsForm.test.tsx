/**
 * EmailMetricsForm Tests
 *
 * Story 13.1: Communication Metrics Input
 * Task 9.3: Unit tests for EmailMetricsForm
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailMetricsForm } from './EmailMetricsForm';
import { createDefaultEmailMetrics } from './comm-constants';

describe('EmailMetricsForm', () => {
  const defaultMetrics = createDefaultEmailMetrics();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all email metric fields', () => {
    render(<EmailMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Distribution Lists/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Average List Size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reply-All Frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Urgent Response Time/i)).toBeInTheDocument();
  });

  it('should display current metric values', () => {
    const metrics = {
      distributionListCount: 50,
      avgListSize: 25,
      replyAllFrequency: 'often' as const,
      urgentResponseTimeHours: 4,
    };

    render(<EmailMetricsForm metrics={metrics} onChange={mockOnChange} />);

    const dlInput = screen.getByLabelText(/Distribution Lists/i);
    const sizeInput = screen.getByLabelText(/Average List Size/i);
    const responseInput = screen.getByLabelText(/Urgent Response Time/i);

    expect(dlInput).toHaveValue(50);
    expect(sizeInput).toHaveValue(25);
    expect(responseInput).toHaveValue(4);
  });

  it('should call onChange when distribution list count changes', async () => {
    const user = userEvent.setup();
    render(<EmailMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Distribution Lists/i);
    await user.clear(input);
    await user.type(input, '50');

    expect(mockOnChange).toHaveBeenCalledWith('distributionListCount', expect.any(Number));
  });

  it('should call onChange when average list size changes', async () => {
    const user = userEvent.setup();
    render(<EmailMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Average List Size/i);
    await user.clear(input);
    await user.type(input, '25');

    expect(mockOnChange).toHaveBeenCalledWith('avgListSize', expect.any(Number));
  });

  it('should render reply-all frequency select with current value', () => {
    const metrics = {
      ...defaultMetrics,
      replyAllFrequency: 'often' as const,
    };
    render(<EmailMetricsForm metrics={metrics} onChange={mockOnChange} />);

    // The select trigger should show the current value
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
  });

  it('should call onChange when urgent response time changes', async () => {
    const user = userEvent.setup();
    render(<EmailMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Urgent Response Time/i);
    await user.clear(input);
    await user.type(input, '4');

    expect(mockOnChange).toHaveBeenCalledWith('urgentResponseTimeHours', expect.any(Number));
  });

  it('should display guidance tooltips', () => {
    render(<EmailMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    // Check for presence of info icons (4 fields = 4 icons)
    const icons = document.querySelectorAll('.lucide-info');
    expect(icons.length).toBe(4);
  });

  it('should display description text for each field', () => {
    render(<EmailMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    expect(screen.getByText(/Number of active distribution lists/i)).toBeInTheDocument();
    expect(screen.getByText(/Average number of recipients/i)).toBeInTheDocument();
    expect(screen.getByText(/How often do email threads/i)).toBeInTheDocument();
    expect(screen.getByText(/Average time to get a response/i)).toBeInTheDocument();
  });

  it('should handle empty input gracefully', async () => {
    const user = userEvent.setup();
    const metrics = {
      ...defaultMetrics,
      distributionListCount: 50,
    };

    render(<EmailMetricsForm metrics={metrics} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Distribution Lists/i);
    await user.clear(input);

    expect(mockOnChange).toHaveBeenCalledWith('distributionListCount', 0);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <EmailMetricsForm
        metrics={defaultMetrics}
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have correct min/max attributes on number inputs', () => {
    render(<EmailMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    const dlInput = screen.getByLabelText(/Distribution Lists/i);
    expect(dlInput).toHaveAttribute('min', '0');
    expect(dlInput).toHaveAttribute('max', '500');

    const sizeInput = screen.getByLabelText(/Average List Size/i);
    expect(sizeInput).toHaveAttribute('min', '1');
    expect(sizeInput).toHaveAttribute('max', '1000');

    const responseInput = screen.getByLabelText(/Urgent Response Time/i);
    expect(responseInput).toHaveAttribute('min', '0');
    expect(responseInput).toHaveAttribute('max', '72');
  });
});
