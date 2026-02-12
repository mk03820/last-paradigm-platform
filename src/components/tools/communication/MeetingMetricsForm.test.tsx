/**
 * MeetingMetricsForm Tests
 *
 * Story 13.1: Communication Metrics Input
 * Task 9.5: Unit tests for MeetingMetricsForm
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MeetingMetricsForm } from './MeetingMetricsForm';
import { createDefaultMeetingMetrics } from './comm-constants';
import { useCalculatorStore } from '@/lib/store/calculator-store';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock calculator store
vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: {
    getState: vi.fn(() => ({
      results: null,
      meetingData: null,
    })),
  },
}));

describe('MeetingMetricsForm', () => {
  const defaultMetrics = createDefaultMeetingMetrics();
  const mockOnChange = vi.fn();
  const mockOnPullFromTool2 = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCalculatorStore.getState).mockReturnValue({
      results: null,
      meetingData: null,
    } as unknown as ReturnType<typeof useCalculatorStore.getState>);
  });

  describe('manual entry mode', () => {
    it('should render all meeting metric fields', () => {
      render(
        <MeetingMetricsForm
          metrics={defaultMetrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      expect(screen.getByLabelText(/Info Cascade Meetings/i)).toBeInTheDocument();
      // Decision Documentation Rate uses a slider, check for its label text
      expect(screen.getByText(/Decision Documentation Rate/i)).toBeInTheDocument();
    });

    it('should display current metric values', () => {
      const metrics = {
        infoCascadeMeetingsPerWeek: 5,
        decisionDocumentationRatePercent: 30,
        pulledFromTool2: false,
      };

      render(
        <MeetingMetricsForm
          metrics={metrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      const meetingsInput = screen.getByLabelText(/Info Cascade Meetings/i);
      expect(meetingsInput).toHaveValue(5);

      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('should call onChange when info cascade meetings changes', async () => {
      const user = userEvent.setup();
      render(
        <MeetingMetricsForm
          metrics={defaultMetrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      const input = screen.getByLabelText(/Info Cascade Meetings/i);
      await user.clear(input);
      await user.type(input, '5');

      expect(mockOnChange).toHaveBeenCalledWith('infoCascadeMeetingsPerWeek', expect.any(Number));
    });

    it('should show link to Tool 2 when Tool 2 not complete', () => {
      render(
        <MeetingMetricsForm
          metrics={defaultMetrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      expect(screen.getByText(/Complete the Meeting Audit/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Go to Tool 2/i })).toHaveAttribute(
        'href',
        '/tool/calculator'
      );
    });

    it('should display description text for each field', () => {
      render(
        <MeetingMetricsForm
          metrics={defaultMetrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      expect(screen.getByText(/Weekly meetings that could have been/i)).toBeInTheDocument();
      expect(screen.getByText(/Percentage of meeting decisions/i)).toBeInTheDocument();
    });

    it('should display slider endpoints for documentation rate', () => {
      render(
        <MeetingMetricsForm
          metrics={defaultMetrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      expect(screen.getByText('0% (Never)')).toBeInTheDocument();
      expect(screen.getByText('100% (Always)')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <MeetingMetricsForm
          metrics={defaultMetrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Tool 2 integration', () => {
    it('should show import button when Tool 2 has data', () => {
      vi.mocked(useCalculatorStore.getState).mockReturnValue({
        results: { totalCost: 100000 },
        meetingData: { meetingCount: 20, averageAttendees: 8, averageDuration: 60, salaryDistribution: { executive: 5, senior: 15, midLevel: 30, entry: 50 } },
      } as unknown as ReturnType<typeof useCalculatorStore.getState>);

      render(
        <MeetingMetricsForm
          metrics={defaultMetrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      expect(screen.getByText(/Meeting Audit data available/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Import from Tool 2/i })).toBeInTheDocument();
    });

    it('should call onPullFromTool2 when import button clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(useCalculatorStore.getState).mockReturnValue({
        results: { totalCost: 100000 },
        meetingData: { meetingCount: 20, averageAttendees: 8, averageDuration: 60, salaryDistribution: { executive: 5, senior: 15, midLevel: 30, entry: 50 } },
      } as unknown as ReturnType<typeof useCalculatorStore.getState>);

      mockOnPullFromTool2.mockReturnValue(true);

      render(
        <MeetingMetricsForm
          metrics={defaultMetrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      const importButton = screen.getByRole('button', { name: /Import from Tool 2/i });
      await user.click(importButton);

      expect(mockOnPullFromTool2).toHaveBeenCalled();
    });
  });

  describe('imported data view', () => {
    it('should show imported badge when data pulled from Tool 2', () => {
      const metrics = {
        infoCascadeMeetingsPerWeek: 6,
        decisionDocumentationRatePercent: 20,
        pulledFromTool2: true,
      };

      render(
        <MeetingMetricsForm
          metrics={metrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      expect(screen.getByText(/Imported from Meeting Audit/i)).toBeInTheDocument();
    });

    it('should display imported values as read-only', () => {
      const metrics = {
        infoCascadeMeetingsPerWeek: 6,
        decisionDocumentationRatePercent: 20,
        pulledFromTool2: true,
      };

      render(
        <MeetingMetricsForm
          metrics={metrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      expect(screen.getByText('6 per week')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
    });

    it('should show option to enter manually instead', () => {
      const metrics = {
        infoCascadeMeetingsPerWeek: 6,
        decisionDocumentationRatePercent: 20,
        pulledFromTool2: true,
      };

      render(
        <MeetingMetricsForm
          metrics={metrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      expect(screen.getByRole('button', { name: /Enter manually instead/i })).toBeInTheDocument();
    });

    it('should switch to manual mode when "Enter manually" clicked', async () => {
      const user = userEvent.setup();
      const metrics = {
        infoCascadeMeetingsPerWeek: 6,
        decisionDocumentationRatePercent: 20,
        pulledFromTool2: true,
      };

      render(
        <MeetingMetricsForm
          metrics={metrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      const manualButton = screen.getByRole('button', { name: /Enter manually instead/i });
      await user.click(manualButton);

      expect(mockOnChange).toHaveBeenCalledWith('pulledFromTool2', false);
    });
  });

  describe('input validation', () => {
    it('should have correct min/max attributes on info cascade input', () => {
      render(
        <MeetingMetricsForm
          metrics={defaultMetrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      const input = screen.getByLabelText(/Info Cascade Meetings/i);
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '50');
    });

    it('should handle empty input gracefully', async () => {
      const user = userEvent.setup();
      const metrics = {
        ...defaultMetrics,
        infoCascadeMeetingsPerWeek: 5,
      };

      render(
        <MeetingMetricsForm
          metrics={metrics}
          onChange={mockOnChange}
          onPullFromTool2={mockOnPullFromTool2}
        />
      );

      const input = screen.getByLabelText(/Info Cascade Meetings/i);
      await user.clear(input);

      expect(mockOnChange).toHaveBeenCalledWith('infoCascadeMeetingsPerWeek', 0);
    });
  });
});
