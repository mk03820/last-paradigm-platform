import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * Decision Velocity Results Page Tests
 *
 * Story 10.2: Latency Calculation and Display
 */

// Mock navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => '/tool/decision-velocity/results',
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
import DecisionVelocityResultsPage from './page';
import { useTool3Store } from '@/lib/store/tool3-store';

describe('Decision Velocity Results Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTool3Store.getState().resetTool3();
  });

  describe('redirect behavior', () => {
    it('redirects to input page if no valid data', () => {
      render(<DecisionVelocityResultsPage />);

      expect(mockReplace).toHaveBeenCalledWith('/tool/decision-velocity');
    });

    it('does not redirect when valid data exists', () => {
      const store = useTool3Store.getState();
      store.addSample('strategic', {
        description: 'Test 1',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });
      store.addSample('strategic', {
        description: 'Test 2',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-20',
      });
      store.addSample('strategic', {
        description: 'Test 3',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-25',
      });

      render(<DecisionVelocityResultsPage />);

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('with valid data', () => {
    beforeEach(() => {
      const store = useTool3Store.getState();
      store.addSample('strategic', {
        description: 'Strategic decision 1',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });
      store.addSample('strategic', {
        description: 'Strategic decision 2',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-20',
      });
      store.addSample('strategic', {
        description: 'Strategic decision 3',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-25',
      });
    });

    it('renders page header', () => {
      render(<DecisionVelocityResultsPage />);

      expect(
        screen.getByRole('heading', { name: 'Your Decision Velocity Results' })
      ).toBeInTheDocument();
    });

    it('renders step indicator', () => {
      render(<DecisionVelocityResultsPage />);

      expect(screen.getByText(/Step 3 of 7/)).toBeInTheDocument();
    });

    it('shows sample count in header', () => {
      render(<DecisionVelocityResultsPage />);

      expect(screen.getByText(/3 decisions/)).toBeInTheDocument();
    });

    it('renders velocity summary', () => {
      render(<DecisionVelocityResultsPage />);

      expect(screen.getByText('Decision Velocity Overview')).toBeInTheDocument();
    });

    it('renders category section', () => {
      render(<DecisionVelocityResultsPage />);

      expect(screen.getByText('By Category')).toBeInTheDocument();
    });

    it('shows Strategic Initiatives metrics', () => {
      render(<DecisionVelocityResultsPage />);

      // May appear multiple times (in summary and category card)
      expect(screen.getAllByText('Strategic Initiatives').length).toBeGreaterThanOrEqual(1);
    });

    it('renders navigation links', () => {
      render(<DecisionVelocityResultsPage />);

      expect(screen.getByRole('link', { name: 'Revise Data' })).toHaveAttribute(
        'href',
        '/tool/decision-velocity'
      );
      expect(screen.getByRole('link', { name: 'Continue to Dashboard' })).toHaveAttribute(
        'href',
        '/dashboard'
      );
    });

    it('renders back to input link', () => {
      render(<DecisionVelocityResultsPage />);

      expect(screen.getByRole('link', { name: /Back to Input/ })).toHaveAttribute(
        'href',
        '/tool/decision-velocity'
      );
    });

    it('displays methodology explanation', () => {
      render(<DecisionVelocityResultsPage />);

      expect(screen.getByText('How metrics are calculated')).toBeInTheDocument();
    });

    it('renders benchmark comparison section', () => {
      render(<DecisionVelocityResultsPage />);

      expect(screen.getByText('Industry Benchmark Comparison')).toBeInTheDocument();
    });

    it('renders benchmark comparison table', () => {
      render(<DecisionVelocityResultsPage />);

      // Should see benchmark column headers (appear in legend and headers)
      expect(screen.getAllByText('Fast').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Average').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Slow').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Crisis').length).toBeGreaterThanOrEqual(2);
    });

    it('marks tool as complete on render', () => {
      render(<DecisionVelocityResultsPage />);

      const store = useTool3Store.getState();
      expect(store.completion).not.toBeNull();
      expect(store.completion?.completedAt).toBeDefined();
    });
  });

  describe('with multiple categories', () => {
    beforeEach(() => {
      const store = useTool3Store.getState();
      // Add strategic samples (slow)
      store.addSample('strategic', {
        description: 'Strategic 1',
        requestDate: '2024-06-01',
        decisionDate: '2024-07-01', // 30 days
      });
      store.addSample('strategic', {
        description: 'Strategic 2',
        requestDate: '2024-06-01',
        decisionDate: '2024-07-10', // 39 days
      });
      store.addSample('strategic', {
        description: 'Strategic 3',
        requestDate: '2024-06-01',
        decisionDate: '2024-07-15', // 44 days
      });

      // Add hiring samples (fast)
      store.addSample('hiring', {
        description: 'Hiring 1',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-05', // 4 days
      });
      store.addSample('hiring', {
        description: 'Hiring 2',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-08', // 7 days
      });
      store.addSample('hiring', {
        description: 'Hiring 3',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-10', // 9 days
      });
    });

    it('renders both category cards', () => {
      render(<DecisionVelocityResultsPage />);

      // Categories may appear multiple times (in summary and individual cards)
      expect(screen.getAllByText('Strategic Initiatives').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Hiring Decisions').length).toBeGreaterThanOrEqual(1);
    });

    it('shows total decisions across categories', () => {
      render(<DecisionVelocityResultsPage />);

      expect(screen.getByText(/6 decisions/)).toBeInTheDocument();
    });
  });
});
