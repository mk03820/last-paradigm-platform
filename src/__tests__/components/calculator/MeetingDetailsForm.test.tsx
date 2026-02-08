import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MeetingDetailsForm } from '@/components/calculator/MeetingDetailsForm';
import { useCalculatorStore } from '@/lib/store/calculator-store';

// Reset store before each test
beforeEach(() => {
  useCalculatorStore.getState().clearSession();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('MeetingDetailsForm', () => {
  describe('rendering', () => {
    it('should render all form fields', () => {
      render(<MeetingDetailsForm />);

      // Use regex to match labels with required indicator (*)
      expect(screen.getByLabelText(/number of recurring meetings/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/average attendees per meeting/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/average meeting duration/i)).toBeInTheDocument();
    });

    it('should render inputs with 48px height (h-12 class)', () => {
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      const attendeesInput = screen.getByLabelText(/average attendees per meeting/i);
      const durationInput = screen.getByLabelText(/average meeting duration/i);

      expect(meetingCountInput).toHaveClass('h-12');
      expect(attendeesInput).toHaveClass('h-12');
      expect(durationInput).toHaveClass('h-12');
    });

    it('should render inputs with number type', () => {
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      const attendeesInput = screen.getByLabelText(/average attendees per meeting/i);
      const durationInput = screen.getByLabelText(/average meeting duration/i);

      expect(meetingCountInput).toHaveAttribute('type', 'number');
      expect(attendeesInput).toHaveAttribute('type', 'number');
      expect(durationInput).toHaveAttribute('type', 'number');
    });
  });

  describe('accessibility', () => {
    it('should have labels with htmlFor attributes', () => {
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      const attendeesInput = screen.getByLabelText(/average attendees per meeting/i);
      const durationInput = screen.getByLabelText(/average meeting duration/i);

      expect(meetingCountInput).toHaveAttribute('id', 'meetingCount');
      expect(attendeesInput).toHaveAttribute('id', 'averageAttendees');
      expect(durationInput).toHaveAttribute('id', 'averageDuration');
    });

    it('should have aria-invalid=false by default', () => {
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      expect(meetingCountInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('should support keyboard navigation (Tab)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      const attendeesInput = screen.getByLabelText(/average attendees per meeting/i);
      const durationInput = screen.getByLabelText(/average meeting duration/i);

      // Focus first input
      meetingCountInput.focus();
      expect(document.activeElement).toBe(meetingCountInput);

      // Tab to next input
      await user.tab();
      expect(document.activeElement).toBe(attendeesInput);

      // Tab to next input
      await user.tab();
      expect(document.activeElement).toBe(durationInput);
    });
  });

  describe('session state integration', () => {
    it('should load existing data from store on mount', () => {
      // Pre-populate store
      useCalculatorStore.getState().setMeetingData({
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 30,
        salaryDistribution: {
          executive: 0,
          senior: 0,
          midLevel: 0,
          entry: 0,
        },
      });

      render(<MeetingDetailsForm />);

      expect(screen.getByLabelText(/number of recurring meetings/i)).toHaveValue(10);
      expect(screen.getByLabelText(/average attendees per meeting/i)).toHaveValue(5);
      expect(screen.getByLabelText(/average meeting duration/i)).toHaveValue(30);
    });

    it('should save to store when typing (debounced)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      await user.type(meetingCountInput, '15');

      // Advance past debounce timer within act
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      await waitFor(() => {
        const storeData = useCalculatorStore.getState().meetingData;
        expect(storeData?.meetingCount).toBe(15);
      });
    });

    it('should update multiple fields in store', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);
      const attendeesInput = screen.getByLabelText(/average attendees per meeting/i);
      const durationInput = screen.getByLabelText(/average meeting duration/i);

      await user.type(meetingCountInput, '20');
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      await user.type(attendeesInput, '8');
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      await user.type(durationInput, '60');
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      await waitFor(() => {
        const storeData = useCalculatorStore.getState().meetingData;
        expect(storeData?.meetingCount).toBe(20);
        expect(storeData?.averageAttendees).toBe(8);
        expect(storeData?.averageDuration).toBe(60);
      });
    });
  });

  describe('validation display', () => {
    it('should show error message for invalid input on blur', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);

      // Type zero (invalid)
      await user.type(meetingCountInput, '0');
      await user.tab(); // Trigger blur validation

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Number of meetings must be greater than 0');
      });
    });

    it('should set aria-invalid to true when field has error', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);

      await user.type(meetingCountInput, '0');
      await user.tab();

      await waitFor(() => {
        expect(meetingCountInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should link error message with aria-describedby', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<MeetingDetailsForm />);

      const meetingCountInput = screen.getByLabelText(/number of recurring meetings/i);

      await user.type(meetingCountInput, '0');
      await user.tab();

      await waitFor(() => {
        expect(meetingCountInput).toHaveAttribute('aria-describedby', 'meetingCount-error');
        expect(screen.getByRole('alert')).toHaveAttribute('id', 'meetingCount-error');
      });
    });
  });
});
