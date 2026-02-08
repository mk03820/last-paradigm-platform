import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalculatorForm } from './CalculatorForm';
import { useCalculatorStore } from '@/lib/store/calculator-store';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock the store
vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: vi.fn(),
}));

const mockSetMeetingData = vi.fn();
const mockSetResults = vi.fn();
const mockSetIsCalculating = vi.fn();

describe('CalculatorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCalculatorStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      meetingData: null,
      setMeetingData: mockSetMeetingData,
      setResults: mockSetResults,
      setIsCalculating: mockSetIsCalculating,
    });
  });

  describe('Task 3: Form-Level Validation Summary', () => {
    it('should not show validation summary before first submit', () => {
      render(<CalculatorForm />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show validation summary after submit with errors', async () => {
      render(<CalculatorForm />);

      const submitButton = screen.getByRole('button', {
        name: /calculate meeting waste/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should list all validation errors in summary', async () => {
      render(<CalculatorForm />);

      const submitButton = screen.getByRole('button', {
        name: /calculate meeting waste/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please fix the following errors/i)).toBeInTheDocument();
      });
    });
  });

  describe('Task 4: Calculate Button with Validation', () => {
    it('should render calculate button', () => {
      render(<CalculatorForm />);

      expect(
        screen.getByRole('button', { name: /calculate meeting waste/i })
      ).toBeInTheDocument();
    });

    it('should disable button after submit with invalid form', async () => {
      render(<CalculatorForm />);

      const submitButton = screen.getByRole('button', {
        name: /calculate meeting waste/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should not disable button when form is valid', async () => {
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              meetingWaste: 100000,
              estimatedAlignmentTaxMin: 333333,
              estimatedAlignmentTaxMax: 400000,
              inputs: {},
              calculatedAt: new Date().toISOString(),
            },
          }),
      });

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
        setResults: mockSetResults,
        setIsCalculating: mockSetIsCalculating,
      });

      render(<CalculatorForm />);

      const submitButton = screen.getByRole('button', {
        name: /calculate meeting waste/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Integration', () => {
    it('should render MeetingDetailsForm section', () => {
      render(<CalculatorForm />);

      expect(screen.getByText(/number of recurring meetings/i)).toBeInTheDocument();
    });

    it('should render SalaryBandSelector section', () => {
      render(<CalculatorForm />);

      expect(screen.getByText(/attendee salary distribution/i)).toBeInTheDocument();
    });

    it('should not show validation summary when form is valid and submitted', async () => {
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              meetingWaste: 100000,
              estimatedAlignmentTaxMin: 333333,
              estimatedAlignmentTaxMax: 400000,
              inputs: {},
              calculatedAt: new Date().toISOString(),
            },
          }),
      });

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
        setResults: mockSetResults,
        setIsCalculating: mockSetIsCalculating,
      });

      render(<CalculatorForm />);

      const submitButton = screen.getByRole('button', {
        name: /calculate meeting waste/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/please fix the following errors/i)).not.toBeInTheDocument();
      });
    });
  });
});
