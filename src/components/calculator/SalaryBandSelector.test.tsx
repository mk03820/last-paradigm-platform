import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SalaryBandSelector } from './SalaryBandSelector';
import { useCalculatorStore } from '@/lib/store/calculator-store';

// Mock the store
vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: vi.fn(),
}));

const mockSetMeetingData = vi.fn();

describe('SalaryBandSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock with 10 attendees and no existing distribution
    (useCalculatorStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      meetingData: {
        meetingCount: 5,
        averageAttendees: 10,
        averageDuration: 60,
        salaryDistribution: {
          executive: 0,
          senior: 0,
          midLevel: 0,
          entry: 0,
        },
      },
      setMeetingData: mockSetMeetingData,
    });
  });

  describe('Task 1: Component renders four salary bands', () => {
    it('should render all four salary band inputs', () => {
      render(<SalaryBandSelector />);

      expect(screen.getByLabelText(/^executive/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^senior/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^mid-level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^entry/i)).toBeInTheDocument();
    });

    it('should render number inputs for each band', () => {
      render(<SalaryBandSelector />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(4);

      inputs.forEach((input) => {
        expect(input).toHaveAttribute('type', 'number');
        expect(input).toHaveAttribute('min', '0');
      });
    });

    it('should render section heading', () => {
      render(<SalaryBandSelector />);

      expect(
        screen.getByRole('heading', { name: /attendee salary distribution/i })
      ).toBeInTheDocument();
    });
  });

  describe('Task 2: Running total display', () => {
    it('should display running total vs required total', () => {
      render(<SalaryBandSelector />);

      expect(screen.getByText(/0 of 10 attendees allocated/i)).toBeInTheDocument();
    });

    it('should update running total when inputs change', () => {
      render(<SalaryBandSelector />);

      const executiveInput = screen.getByLabelText(/^executive/i);
      fireEvent.change(executiveInput, { target: { value: '2' } });

      // The mockSetMeetingData should have been called with the new distribution
      expect(mockSetMeetingData).toHaveBeenCalled();
    });

    it('should show green visual indicator when totals match', () => {
      (useCalculatorStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        meetingData: {
          meetingCount: 5,
          averageAttendees: 10,
          averageDuration: 60,
          salaryDistribution: {
            executive: 2,
            senior: 3,
            midLevel: 3,
            entry: 2,
          },
        },
        setMeetingData: mockSetMeetingData,
      });

      render(<SalaryBandSelector />);

      const statusText = screen.getByText(/10 of 10 attendees allocated/i);
      expect(statusText.closest('[data-status]')).toHaveAttribute(
        'data-status',
        'valid'
      );
    });

    it('should show red visual indicator when totals do not match', () => {
      render(<SalaryBandSelector />);

      const statusText = screen.getByText(/0 of 10 attendees allocated/i);
      expect(statusText.closest('[data-status]')).toHaveAttribute(
        'data-status',
        'invalid'
      );
    });
  });

  describe('Task 3: Validation logic', () => {
    it('should prevent negative numbers', () => {
      render(<SalaryBandSelector />);

      const executiveInput = screen.getByLabelText(/^executive/i);
      expect(executiveInput).toHaveAttribute('min', '0');
    });

    it('should show error message when totals do not match', () => {
      render(<SalaryBandSelector />);

      expect(
        screen.getByText(/total allocations must equal 10 attendees/i)
      ).toBeInTheDocument();
    });

    it('should not show error message when totals match', () => {
      (useCalculatorStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        meetingData: {
          meetingCount: 5,
          averageAttendees: 10,
          averageDuration: 60,
          salaryDistribution: {
            executive: 2,
            senior: 3,
            midLevel: 3,
            entry: 2,
          },
        },
        setMeetingData: mockSetMeetingData,
      });

      render(<SalaryBandSelector />);

      expect(
        screen.queryByText(/total allocations must equal/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Task 4: Session state integration', () => {
    it('should read averageAttendees from store', () => {
      (useCalculatorStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        meetingData: {
          meetingCount: 5,
          averageAttendees: 15,
          averageDuration: 60,
          salaryDistribution: {
            executive: 0,
            senior: 0,
            midLevel: 0,
            entry: 0,
          },
        },
        setMeetingData: mockSetMeetingData,
      });

      render(<SalaryBandSelector />);

      expect(screen.getByText(/0 of 15 attendees allocated/i)).toBeInTheDocument();
    });

    it('should call setMeetingData when distribution changes', () => {
      render(<SalaryBandSelector />);

      const seniorInput = screen.getByLabelText(/^senior/i);
      fireEvent.change(seniorInput, { target: { value: '5' } });

      expect(mockSetMeetingData).toHaveBeenCalledWith(
        expect.objectContaining({
          salaryDistribution: expect.objectContaining({
            senior: 5,
          }),
        })
      );
    });

    it('should preserve existing distribution values from store', () => {
      (useCalculatorStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        meetingData: {
          meetingCount: 5,
          averageAttendees: 10,
          averageDuration: 60,
          salaryDistribution: {
            executive: 1,
            senior: 2,
            midLevel: 3,
            entry: 4,
          },
        },
        setMeetingData: mockSetMeetingData,
      });

      render(<SalaryBandSelector />);

      expect(screen.getByLabelText(/^executive/i)).toHaveValue(1);
      expect(screen.getByLabelText(/^senior/i)).toHaveValue(2);
      expect(screen.getByLabelText(/^mid-level/i)).toHaveValue(3);
      expect(screen.getByLabelText(/^entry/i)).toHaveValue(4);
    });
  });

  describe('Task 5: Accessibility', () => {
    it('should have proper labels for each band input', () => {
      render(<SalaryBandSelector />);

      const executiveInput = screen.getByLabelText(/^executive/i);
      const seniorInput = screen.getByLabelText(/^senior/i);
      const midLevelInput = screen.getByLabelText(/^mid-level/i);
      const entryInput = screen.getByLabelText(/^entry/i);

      expect(executiveInput).toHaveAccessibleName();
      expect(seniorInput).toHaveAccessibleName();
      expect(midLevelInput).toHaveAccessibleName();
      expect(entryInput).toHaveAccessibleName();
    });

    it('should have aria-describedby for running total status', () => {
      render(<SalaryBandSelector />);

      const runningTotalStatus = screen.getByRole('status');
      expect(runningTotalStatus).toBeInTheDocument();
    });

    it('should announce validation errors to screen readers', () => {
      render(<SalaryBandSelector />);

      const errorMessage = screen.getByText(/total allocations must equal/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should support keyboard navigation', () => {
      render(<SalaryBandSelector />);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input) => {
        expect(input).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Task 6: Required Field Indicators (Story 2-3)', () => {
    it('should display red asterisk (*) next to all form labels', () => {
      render(<SalaryBandSelector />);

      const labels = screen.getAllByText(/^(executive|senior|mid-level|entry)$/i);
      labels.forEach((label) => {
        expect(label.closest('label')).toHaveTextContent('*');
      });
    });

    it('should display "* Required" legend', () => {
      render(<SalaryBandSelector />);

      expect(screen.getByText(/Required/i)).toBeInTheDocument();
    });

    it('should style asterisks with destructive/red color', () => {
      render(<SalaryBandSelector />);

      const asterisks = screen.getAllByText('*');
      asterisks.forEach((asterisk) => {
        expect(asterisk).toHaveClass('text-destructive');
      });
    });

    it('should style error messages with text-destructive class', () => {
      render(<SalaryBandSelector />);

      const errorMessage = screen.getByText(/total allocations must equal/i);
      expect(errorMessage).toHaveClass('text-destructive');
    });
  });

  describe('Edge cases', () => {
    it('should handle no meeting data gracefully', () => {
      (useCalculatorStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        meetingData: null,
        setMeetingData: mockSetMeetingData,
      });

      render(<SalaryBandSelector />);

      // Should show 0 of 0 attendees or handle null gracefully
      expect(screen.getByText(/0 of 0 attendees allocated/i)).toBeInTheDocument();
    });

    it('should handle empty string input as 0', () => {
      render(<SalaryBandSelector />);

      const executiveInput = screen.getByLabelText(/^executive/i);
      fireEvent.change(executiveInput, { target: { value: '' } });

      expect(mockSetMeetingData).toHaveBeenCalledWith(
        expect.objectContaining({
          salaryDistribution: expect.objectContaining({
            executive: 0,
          }),
        })
      );
    });
  });
});
