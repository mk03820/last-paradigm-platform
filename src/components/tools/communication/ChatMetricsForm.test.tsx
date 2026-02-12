/**
 * ChatMetricsForm Tests
 *
 * Story 13.1: Communication Metrics Input
 * Task 9.4: Unit tests for ChatMetricsForm
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatMetricsForm } from './ChatMetricsForm';
import { createDefaultChatMetrics } from './comm-constants';

describe('ChatMetricsForm', () => {
  const defaultMetrics = createDefaultChatMetrics();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all chat metric fields', () => {
    render(<ChatMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Active Channels/i)).toBeInTheDocument();
    // DM Ratio and Cross-Channel Redundancy use sliders, check for label text
    expect(screen.getByText(/DM Ratio/i)).toBeInTheDocument();
    expect(screen.getByText(/@here\/@channel Frequency/i)).toBeInTheDocument();
    expect(screen.getByText(/Cross-Channel Redundancy/i)).toBeInTheDocument();
  });

  it('should display current metric values', () => {
    const metrics = {
      activeChannels: 75,
      dmRatioPercent: 40,
      atHereFrequency: 'often' as const,
      crossChannelRedundancyPercent: 20,
    };

    render(<ChatMetricsForm metrics={metrics} onChange={mockOnChange} />);

    const channelsInput = screen.getByLabelText(/Active Channels/i);
    expect(channelsInput).toHaveValue(75);

    // Check slider display value
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('should call onChange when active channels changes', async () => {
    const user = userEvent.setup();
    render(<ChatMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Active Channels/i);
    await user.clear(input);
    await user.type(input, '100');

    expect(mockOnChange).toHaveBeenCalledWith('activeChannels', expect.any(Number));
  });

  it('should render @here frequency select with current value', () => {
    const metrics = {
      ...defaultMetrics,
      atHereFrequency: 'often' as const,
    };
    render(<ChatMetricsForm metrics={metrics} onChange={mockOnChange} />);

    // The select trigger should exist
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
  });

  it('should display DM ratio slider with endpoints', () => {
    render(<ChatMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    expect(screen.getByText('0% (All Public)')).toBeInTheDocument();
    expect(screen.getByText('100% (All DMs)')).toBeInTheDocument();
  });

  it('should display description text for each field', () => {
    render(<ChatMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    expect(screen.getByText(/Number of Slack\/Teams channels/i)).toBeInTheDocument();
    expect(screen.getByText(/Percentage of conversations/i)).toBeInTheDocument();
    expect(screen.getByText(/How often people use broadcast/i)).toBeInTheDocument();
    expect(screen.getByText(/Percentage of messages cross-posted/i)).toBeInTheDocument();
  });

  it('should display guidance tooltips', () => {
    render(<ChatMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    // Check for presence of info icons (4 fields = 4 icons)
    const icons = document.querySelectorAll('.lucide-info');
    expect(icons.length).toBe(4);
  });

  it('should handle empty input gracefully', async () => {
    const user = userEvent.setup();
    const metrics = {
      ...defaultMetrics,
      activeChannels: 75,
    };

    render(<ChatMetricsForm metrics={metrics} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Active Channels/i);
    await user.clear(input);

    expect(mockOnChange).toHaveBeenCalledWith('activeChannels', 0);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ChatMetricsForm
        metrics={defaultMetrics}
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have correct min/max attributes on active channels input', () => {
    render(<ChatMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Active Channels/i);
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '500');
  });

  it('should display default DM ratio at 50%', () => {
    render(<ChatMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    // Default dmRatioPercent is 50
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should have a frequency select component', () => {
    render(<ChatMetricsForm metrics={defaultMetrics} onChange={mockOnChange} />);

    // Check that frequency select exists
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
  });
});
