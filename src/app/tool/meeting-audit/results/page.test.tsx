import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Track redirect calls
let redirectCalled = false;
let redirectTarget = '';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/tool/meeting-audit/results',
  redirect: (path: string) => {
    redirectCalled = true;
    redirectTarget = path;
    throw new Error('NEXT_REDIRECT');
  },
}));

// Mock next-auth (needed by SaveProgressPrompt)
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the calculator store
const mockResults = vi.fn();
vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: () => mockResults(),
}));

// Import component after mocks are set up
import ResultsPage from './page';

describe('ResultsPage', () => {
  beforeEach(() => {
    redirectCalled = false;
    redirectTarget = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('when results are available', () => {
    beforeEach(() => {
      mockResults.mockReturnValue({
        results: {
          meetingWaste: 250000,
          estimatedAlignmentTaxMin: 200000,
          estimatedAlignmentTaxMax: 300000,
          inputs: {
            meetingCount: 10,
            averageAttendees: 5,
            averageDuration: 60,
            salaryDistribution: {
              executive: 1,
              senior: 2,
              midLevel: 1,
              entry: 1,
            },
          },
          calculatedAt: new Date().toISOString(),
        },
        meetingData: {
          meetingCount: 10,
          averageAttendees: 5,
          averageDuration: 60,
          salaryDistribution: {
            executive: 1,
            senior: 2,
            midLevel: 1,
            entry: 1,
          },
        },
      });
    });

    it('displays the page title', () => {
      render(<ResultsPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Your Meeting Waste Analysis'
      );
    });

    it('displays the CostBreakdown component with meeting waste amount', () => {
      render(<ResultsPage />);

      expect(screen.getByText('$250,000')).toBeInTheDocument();
      expect(screen.getByText('per year')).toBeInTheDocument();
    });

    it('displays a Recalculate button', () => {
      render(<ResultsPage />);

      const recalculateLink = screen.getByRole('link', { name: /recalculate/i });
      expect(recalculateLink).toBeInTheDocument();
      expect(recalculateLink).toHaveAttribute('href', '/tool/meeting-audit');
    });

    it('has aria-live region for screen reader announcement', () => {
      render(<ResultsPage />);

      // Find the region that has aria-live="polite" (the CostBreakdown announcement region)
      const regions = screen.getAllByRole('region');
      const liveRegion = regions.find((r) => r.hasAttribute('aria-live'));
      expect(liveRegion).toBeDefined();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('includes context in the screen reader announcement', () => {
      render(<ResultsPage />);

      // Find the region with aria-live that contains the announcement
      const regions = screen.getAllByRole('region');
      const liveRegion = regions.find((r) => r.hasAttribute('aria-live'));
      expect(liveRegion).toBeDefined();
      expect(liveRegion?.getAttribute('aria-label')).toContain('$250,000');
    });
  });

  describe('when no results are available', () => {
    beforeEach(() => {
      mockResults.mockReturnValue({
        results: null,
        meetingData: null,
      });
    });

    it('redirects to /tool/meeting-audit when no results', () => {
      expect(() => render(<ResultsPage />)).toThrow('NEXT_REDIRECT');
      expect(redirectCalled).toBe(true);
      expect(redirectTarget).toBe('/tool/meeting-audit');
    });
  });
});
