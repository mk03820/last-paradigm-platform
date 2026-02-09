import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Track navigation calls
let navigatedTo = '';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (path: string) => {
      navigatedTo = path;
    },
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/calculator',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth (needed by SessionLoader)
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock store values
const mockMeetingData = vi.fn();
const mockSetMeetingData = vi.fn();
const mockSetResults = vi.fn();
const mockSetIsCalculating = vi.fn();
const mockIsCalculating = vi.fn();

vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: () => ({
    meetingData: mockMeetingData(),
    setMeetingData: mockSetMeetingData,
    setResults: mockSetResults,
    setIsCalculating: mockSetIsCalculating,
    isCalculating: mockIsCalculating(),
  }),
}));

// Import component after mocks are set up
import CalculatorPage from './page';

describe('CalculatorPage', () => {
  beforeEach(() => {
    navigatedTo = '';
    vi.clearAllMocks();
    mockIsCalculating.mockReturnValue(false);
    // Mock fetch for API call
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    beforeEach(() => {
      mockMeetingData.mockReturnValue({
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 2,
          midLevel: 1,
          entry: 1,
        },
      });
    });

    it('displays the page title', () => {
      render(<CalculatorPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Meeting Audit Calculator'
      );
    });

    it('displays a Calculate button', () => {
      render(<CalculatorPage />);

      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      expect(calculateButton).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    beforeEach(() => {
      mockMeetingData.mockReturnValue({
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 1,
          senior: 2,
          midLevel: 1,
          entry: 1,
        },
      });
    });

    it('calls API and navigates to results on successful submission', async () => {
      const user = userEvent.setup();
      const mockResult = {
        success: true,
        data: {
          meetingWaste: 250000,
          estimatedAlignmentTaxMin: 200000,
          estimatedAlignmentTaxMax: 300000,
          inputs: mockMeetingData(),
          calculatedAt: new Date().toISOString(),
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      render(<CalculatorPage />);

      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      await user.click(calculateButton);

      expect(global.fetch).toHaveBeenCalledWith('/api/calculate/meeting-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockMeetingData()),
      });

      // Verify setResults was called with data containing the meeting waste
      expect(mockSetResults).toHaveBeenCalledWith(
        expect.objectContaining({
          meetingWaste: 250000,
          inputs: expect.objectContaining({
            meetingCount: 10,
            averageAttendees: 5,
          }),
        })
      );
      expect(navigatedTo).toBe('/results');
    });

    it('shows loading state while calculating', async () => {
      const user = userEvent.setup();

      // Make fetch never resolve to test loading state
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => new Promise(() => {})
      );

      render(<CalculatorPage />);

      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      await user.click(calculateButton);

      expect(mockSetIsCalculating).toHaveBeenCalledWith(true);
    });

    it('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<CalculatorPage />);

      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      await user.click(calculateButton);

      expect(mockSetIsCalculating).toHaveBeenCalledWith(false);
      expect(navigatedTo).toBe('');

      consoleSpy.mockRestore();
    });

    it('shows validation error and disables button after invalid submission', async () => {
      const user = userEvent.setup();
      mockMeetingData.mockReturnValue({
        meetingCount: 10,
        averageAttendees: 5,
        averageDuration: 60,
        salaryDistribution: {
          executive: 0,
          senior: 0,
          midLevel: 0,
          entry: 0, // Total is 0, but averageAttendees is 5
        },
      });

      render(<CalculatorPage />);

      const calculateButton = screen.getByRole('button', { name: /calculate/i });

      // First click - validation runs, button becomes disabled afterward
      await user.click(calculateButton);

      // API should not have been called due to validation failure
      expect(global.fetch).not.toHaveBeenCalled();

      // After failed submission, button should be disabled
      expect(calculateButton).toBeDisabled();
    });
  });
});
