import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * Decision Velocity Page Tests
 *
 * Tests the Tool 3 decision velocity input page.
 *
 * Story 10.1: Decision Sample Input Interface
 */

// Mock navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/tool/decision-velocity',
}));

// Mock useSession
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signOut: vi.fn(),
}));

// Import after mocks
import DecisionVelocityPage from './page';
import { useTool3Store } from '@/lib/store/tool3-store';

describe('Decision Velocity Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTool3Store.getState().resetTool3();
  });

  describe('layout', () => {
    it('renders header', () => {
      render(<DecisionVelocityPage />);

      expect(screen.getByText('The Last Paradigm')).toBeInTheDocument();
    });

    it('renders back to dashboard link', () => {
      render(<DecisionVelocityPage />);

      expect(screen.getByRole('link', { name: /Back to Dashboard/ })).toHaveAttribute(
        'href',
        '/dashboard'
      );
    });

    it('renders step indicator', () => {
      render(<DecisionVelocityPage />);

      expect(screen.getByText(/Step 3 of 7/)).toBeInTheDocument();
    });
  });

  describe('page content', () => {
    it('renders page title', () => {
      render(<DecisionVelocityPage />);

      expect(
        screen.getByRole('heading', { name: 'Decision Velocity Scorecard' })
      ).toBeInTheDocument();
    });

    it('renders page description', () => {
      render(<DecisionVelocityPage />);

      expect(
        screen.getByText(/Measure how long decisions take/)
      ).toBeInTheDocument();
    });

    it('renders instructions section', () => {
      render(<DecisionVelocityPage />);

      expect(screen.getByText('How to Use This Tool')).toBeInTheDocument();
      expect(screen.getByText(/Choose categories/)).toBeInTheDocument();
      expect(screen.getByText(/Enter decisions/)).toBeInTheDocument();
    });
  });

  describe('decision velocity scorer', () => {
    it('renders all 5 archetypes', () => {
      render(<DecisionVelocityPage />);

      expect(screen.getByText('Strategic Initiatives')).toBeInTheDocument();
      expect(screen.getByText('Budget Approvals')).toBeInTheDocument();
      expect(screen.getByText('Technology Decisions')).toBeInTheDocument();
      expect(screen.getByText('Hiring Decisions')).toBeInTheDocument();
      expect(screen.getByText('Analytics & Reporting')).toBeInTheDocument();
    });

    it('renders progress indicator', () => {
      render(<DecisionVelocityPage />);

      expect(screen.getByText(/0 decisions entered/)).toBeInTheDocument();
    });

    it('renders calculate button (disabled initially)', () => {
      render(<DecisionVelocityPage />);

      const button = screen.getByRole('button', { name: /Need at least 3 samples/ });
      expect(button).toBeDisabled();
    });
  });
});
