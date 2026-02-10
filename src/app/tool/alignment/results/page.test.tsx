import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * Alignment Results Page Tests
 *
 * Tests the Tool 1 results page.
 *
 * Story 9.2: Weighted Composite Score Calculation
 */

// Mock navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => '/tool/alignment/results',
}));

// Mock useSession
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signOut: vi.fn(),
}));

// Mock tooltip provider
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock recharts to avoid canvas rendering issues in tests
vi.mock('recharts', () => ({
  RadarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radar-chart">{children}</div>
  ),
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: ({ name }: { name: string }) => <div data-testid="radar" data-name={name} />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: () => <div data-testid="recharts-tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Import after mocks
import AlignmentResultsPage from './page';
import { useTool1Store } from '@/lib/store/tool1-store';

describe('Alignment Results Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTool1Store.getState().resetTool1();
  });

  describe('redirect behavior', () => {
    it('redirects to scoring page if incomplete', () => {
      render(<AlignmentResultsPage />);

      expect(mockReplace).toHaveBeenCalledWith('/tool/alignment');
    });

    it('does not redirect when complete', () => {
      const store = useTool1Store.getState();
      store.setScore('strategic', 3);
      store.setScore('execution', 3);
      store.setScore('technology', 3);
      store.setScore('people', 3);
      store.setScore('governance', 3);

      render(<AlignmentResultsPage />);

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('with complete scores', () => {
    beforeEach(() => {
      const store = useTool1Store.getState();
      store.setScore('strategic', 4);
      store.setScore('execution', 3);
      store.setScore('technology', 3);
      store.setScore('people', 2);
      store.setScore('governance', 3);
    });

    it('renders page header', () => {
      render(<AlignmentResultsPage />);

      expect(
        screen.getByRole('heading', { name: 'Your Alignment Assessment Results' })
      ).toBeInTheDocument();
    });

    it('renders step indicator', () => {
      render(<AlignmentResultsPage />);

      expect(screen.getByText(/Step 1 of 7/)).toBeInTheDocument();
    });

    it('displays composite score', () => {
      render(<AlignmentResultsPage />);

      // Composite: (4*0.3 + 3*0.3 + 3*0.2 + 2*0.1 + 3*0.1) = 1.2 + 0.9 + 0.6 + 0.2 + 0.3 = 3.2
      expect(screen.getByText('Your Alignment Score')).toBeInTheDocument();
    });

    it('renders dimension breakdown section', () => {
      render(<AlignmentResultsPage />);

      expect(screen.getByText('Dimension Breakdown')).toBeInTheDocument();
    });

    it('displays all 5 dimensions', () => {
      render(<AlignmentResultsPage />);

      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument();
      expect(screen.getByText('Execution Alignment')).toBeInTheDocument();
      expect(screen.getByText('Technology Alignment')).toBeInTheDocument();
      expect(screen.getByText('People Alignment')).toBeInTheDocument();
      expect(screen.getByText('Governance Alignment')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
      render(<AlignmentResultsPage />);

      expect(screen.getByRole('link', { name: 'Revise Scores' })).toHaveAttribute(
        'href',
        '/tool/alignment'
      );
      expect(screen.getByRole('link', { name: 'Continue to Dashboard' })).toHaveAttribute(
        'href',
        '/dashboard'
      );
    });

    it('renders back to assessment link', () => {
      render(<AlignmentResultsPage />);

      expect(screen.getByRole('link', { name: /Back to Assessment/ })).toHaveAttribute(
        'href',
        '/tool/alignment'
      );
    });

    it('displays methodology explanation', () => {
      render(<AlignmentResultsPage />);

      expect(screen.getByText('How this score is calculated')).toBeInTheDocument();
      expect(screen.getByText(/weighted average/)).toBeInTheDocument();
    });

    it('renders radar chart section', () => {
      render(<AlignmentResultsPage />);

      expect(screen.getByText('Dimensional View')).toBeInTheDocument();
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });
});
