import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * Alignment Assessment Page Tests
 *
 * Tests the Tool 1 page structure and components.
 *
 * Story 9.1: Alignment Dimension Scoring Interface
 */

// Mock navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/tool/alignment',
}));

// Mock useSession
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signOut: vi.fn(),
}));

// Mock the tooltip provider
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Import after mocks
import AlignmentAssessmentPage from './page';
import { useTool1Store } from '@/lib/store/tool1-store';

describe('Alignment Assessment Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTool1Store.getState().resetTool1();
  });

  describe('layout', () => {
    it('renders header', () => {
      render(<AlignmentAssessmentPage />);

      expect(screen.getByText('The Last Paradigm')).toBeInTheDocument();
    });

    it('renders back to diagnostic hub link', () => {
      render(<AlignmentAssessmentPage />);

      const backLink = screen.getByRole('link', { name: /back to diagnostic hub/i });
      expect(backLink).toHaveAttribute('href', '/diagnostic');
    });

    it('renders progress stepper', () => {
      render(<AlignmentAssessmentPage />);

      // ProgressStepper component renders tool navigation
      expect(screen.getByText('Organizational Alignment Assessment')).toBeInTheDocument();
    });
  });

  describe('page content', () => {
    it('renders page title', () => {
      render(<AlignmentAssessmentPage />);

      expect(
        screen.getByRole('heading', { name: 'Organizational Alignment Assessment' })
      ).toBeInTheDocument();
    });

    it('renders page description', () => {
      render(<AlignmentAssessmentPage />);

      expect(
        screen.getByText(/Score your organization across 5 key alignment dimensions/)
      ).toBeInTheDocument();
    });

    it('renders scoring instructions', () => {
      render(<AlignmentAssessmentPage />);

      expect(screen.getByText('How to Score')).toBeInTheDocument();
      expect(screen.getByText(/1 - Chaos:/)).toBeInTheDocument();
      expect(screen.getByText(/4 - Integrated:/)).toBeInTheDocument();
    });

    it('renders hover instruction', () => {
      render(<AlignmentAssessmentPage />);

      expect(
        screen.getByText(/Hover or tap each score button to see the full description/)
      ).toBeInTheDocument();
    });
  });

  describe('alignment scorer', () => {
    it('renders all 5 dimensions', () => {
      render(<AlignmentAssessmentPage />);

      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument();
      expect(screen.getByText('Execution Alignment')).toBeInTheDocument();
      expect(screen.getByText('Technology Alignment')).toBeInTheDocument();
      expect(screen.getByText('People Alignment')).toBeInTheDocument();
      expect(screen.getByText('Governance Alignment')).toBeInTheDocument();
    });

    it('renders progress indicator', () => {
      render(<AlignmentAssessmentPage />);

      expect(screen.getByText('0 of 5 dimensions scored')).toBeInTheDocument();
    });

    it('renders See Results button (disabled initially)', () => {
      render(<AlignmentAssessmentPage />);

      const button = screen.getByRole('button', { name: /5 dimensions remaining/i });
      expect(button).toBeDisabled();
    });
  });
});
