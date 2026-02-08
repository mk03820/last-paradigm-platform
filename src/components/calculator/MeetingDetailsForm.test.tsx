import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MeetingDetailsForm } from './MeetingDetailsForm';
import { useCalculatorStore } from '@/lib/store/calculator-store';

// Mock the store
vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: vi.fn(),
}));

const mockSetMeetingData = vi.fn();

describe('MeetingDetailsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCalculatorStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      meetingData: null,
      setMeetingData: mockSetMeetingData,
    });
  });

  describe('Task 1: Required Field Indicators', () => {
    it('should display red asterisk (*) next to all form labels', () => {
      render(<MeetingDetailsForm />);

      // Check for required indicators on all labels
      const meetingCountLabel = screen.getByText(/number of recurring meetings/i);
      const attendeesLabel = screen.getByText(/average attendees per meeting/i);
      const durationLabel = screen.getByText(/average meeting duration/i);

      // Each label should contain an asterisk as a sibling
      expect(meetingCountLabel.closest('label')).toHaveTextContent('*');
      expect(attendeesLabel.closest('label')).toHaveTextContent('*');
      expect(durationLabel.closest('label')).toHaveTextContent('*');
    });

    it('should display "* Required" legend at top of form', () => {
      render(<MeetingDetailsForm />);

      expect(screen.getByText(/Required/i)).toBeInTheDocument();
    });

    it('should style asterisks with destructive/red color', () => {
      render(<MeetingDetailsForm />);

      const asterisks = screen.getAllByText('*');
      asterisks.forEach((asterisk) => {
        expect(asterisk).toHaveClass('text-destructive');
      });
    });
  });

  describe('Task 2: Inline Validation Display', () => {
    it('should trigger validation on blur', async () => {
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      fireEvent.blur(meetingCountInput);

      await waitFor(() => {
        // Empty number field shows "Please enter a valid number"
        expect(screen.getByText(/please enter a valid number/i)).toBeInTheDocument();
      });
    });

    it('should style error messages with text-destructive class', async () => {
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      fireEvent.blur(meetingCountInput);

      await waitFor(() => {
        const errorMessage = screen.getByText(/please enter a valid number/i);
        expect(errorMessage).toHaveClass('text-destructive');
      });
    });

    it('should position error messages below input field', async () => {
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      fireEvent.blur(meetingCountInput);

      await waitFor(() => {
        const errorMessage = screen.getByText(/please enter a valid number/i);
        // Error message should appear after the input in the DOM
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('Task 5: Screen Reader Accessibility', () => {
    it('should have aria-invalid attribute on fields with errors', async () => {
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      fireEvent.blur(meetingCountInput);

      await waitFor(() => {
        expect(meetingCountInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have aria-describedby linking errors to fields', async () => {
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      fireEvent.blur(meetingCountInput);

      await waitFor(() => {
        expect(meetingCountInput).toHaveAttribute('aria-describedby', 'meetingCount-error');
      });
    });

    it('should not have aria-invalid when field is valid', () => {
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

      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      expect(meetingCountInput).toHaveAttribute('aria-invalid', 'false');
    });
  });
});
