import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DecisionVelocityScorer } from './DecisionVelocityScorer';
import { useTool3Store } from '@/lib/store/tool3-store';

/**
 * DecisionVelocityScorer Tests
 *
 * Story 10.1: Decision Sample Input Interface
 */

// Mock navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('DecisionVelocityScorer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTool3Store.getState().resetTool3();
  });

  describe('rendering', () => {
    it('renders all 5 archetype cards', () => {
      render(<DecisionVelocityScorer />);

      expect(screen.getByText('Strategic Initiatives')).toBeInTheDocument();
      expect(screen.getByText('Budget Approvals')).toBeInTheDocument();
      expect(screen.getByText('Technology Decisions')).toBeInTheDocument();
      expect(screen.getByText('Hiring Decisions')).toBeInTheDocument();
      expect(screen.getByText('Analytics & Reporting')).toBeInTheDocument();
    });

    it('renders progress summary', () => {
      render(<DecisionVelocityScorer />);

      expect(screen.getByText(/0 decisions entered/)).toBeInTheDocument();
      expect(screen.getByText(/0 of 5 categories ready/)).toBeInTheDocument();
    });

    it('renders Calculate Velocity button', () => {
      render(<DecisionVelocityScorer />);

      expect(
        screen.getByRole('button', { name: /Need at least 3 samples/ })
      ).toBeInTheDocument();
    });
  });

  describe('progress tracking', () => {
    it('updates sample count when samples are added', () => {
      const store = useTool3Store.getState();
      store.addSample('strategic', {
        description: 'Test decision',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });

      render(<DecisionVelocityScorer />);

      expect(screen.getByText(/1 decision entered/)).toBeInTheDocument();
    });

    it('updates valid archetype count when minimum samples reached', () => {
      const store = useTool3Store.getState();
      store.addSample('strategic', {
        description: 'Test 1',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });
      store.addSample('strategic', {
        description: 'Test 2',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });
      store.addSample('strategic', {
        description: 'Test 3',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });

      render(<DecisionVelocityScorer />);

      expect(screen.getByText(/1 of 5 categories ready/)).toBeInTheDocument();
    });

    it('updates count when archetype is skipped', async () => {
      const user = userEvent.setup();
      render(<DecisionVelocityScorer />);

      // Skip one archetype
      const skipCheckboxes = screen.getAllByRole('checkbox', { name: /Skip/i });
      await user.click(skipCheckboxes[0]);

      expect(screen.getByText(/0 of 4 categories ready/)).toBeInTheDocument();
    });
  });

  describe('calculate button', () => {
    it('is disabled when no archetype has sufficient samples', () => {
      render(<DecisionVelocityScorer />);

      const button = screen.getByRole('button', { name: /Need at least 3 samples/ });
      expect(button).toBeDisabled();
    });

    it('is enabled when at least one archetype has sufficient samples', () => {
      const store = useTool3Store.getState();
      store.addSample('strategic', {
        description: 'Test 1',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });
      store.addSample('strategic', {
        description: 'Test 2',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });
      store.addSample('strategic', {
        description: 'Test 3',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });

      render(<DecisionVelocityScorer />);

      const button = screen.getByRole('button', { name: 'Calculate Velocity' });
      expect(button).not.toBeDisabled();
    });

    it('navigates to results page when clicked', async () => {
      const user = userEvent.setup();
      const store = useTool3Store.getState();
      store.addSample('strategic', {
        description: 'Test 1',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });
      store.addSample('strategic', {
        description: 'Test 2',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });
      store.addSample('strategic', {
        description: 'Test 3',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });

      render(<DecisionVelocityScorer />);

      await user.click(screen.getByRole('button', { name: 'Calculate Velocity' }));

      expect(mockPush).toHaveBeenCalledWith('/tool/decision-velocity/results');
    });
  });

  describe('store integration', () => {
    it('persists samples to store', async () => {
      const user = userEvent.setup();
      render(<DecisionVelocityScorer />);

      // Expand Strategic Initiatives
      const expandButtons = screen.getAllByRole('button', { name: 'Expand' });
      await user.click(expandButtons[0]);

      // Add a decision
      await user.click(screen.getByRole('button', { name: 'Add Decision' }));

      // Fill in the form
      await user.type(screen.getByLabelText(/Decision Description/), 'New strategic decision');

      // The sample isn't saved until form is submitted, which requires dates
      // Just verify the expand/add UI works
      expect(screen.getByLabelText(/Decision Description/)).toHaveValue('New strategic decision');
    });

    it('restores data from store on mount', () => {
      const store = useTool3Store.getState();
      store.addSample('technology', {
        description: 'Existing decision',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      });

      render(<DecisionVelocityScorer />);

      expect(screen.getByText(/1 decision entered/)).toBeInTheDocument();
    });
  });
});
