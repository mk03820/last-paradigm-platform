import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottleneckPatternCard } from './BottleneckPatternCard';
import type { PatternDetection } from './bottleneck-patterns';

/**
 * BottleneckPatternCard Tests
 *
 * Story 10.4: Bottleneck Pattern Identification
 * Covers: AC 1, 6 (Pattern display, affected decision types)
 */

const createDetection = (
  overrides: Partial<PatternDetection> = {}
): PatternDetection => ({
  patternId: 'approval_layers',
  detected: true,
  severity: 'high',
  affectedArchetypes: ['strategic', 'hiring'],
  confidence: 'auto',
  confirmedQuestions: [],
  ...overrides,
});

describe('BottleneckPatternCard', () => {
  describe('rendering', () => {
    it('renders pattern label', () => {
      render(<BottleneckPatternCard detection={createDetection()} />);
      expect(screen.getByText('Approval Layers')).toBeInTheDocument();
    });

    it('renders pattern description', () => {
      render(<BottleneckPatternCard detection={createDetection()} />);
      expect(
        screen.getByText('Too many sign-offs required before decisions can proceed')
      ).toBeInTheDocument();
    });

    it('renders severity badge', () => {
      render(<BottleneckPatternCard detection={createDetection({ severity: 'high' })} />);
      expect(screen.getByText('High Impact')).toBeInTheDocument();
    });

    it('renders affected archetypes', () => {
      render(<BottleneckPatternCard detection={createDetection()} />);
      expect(screen.getByText(/Strategic Initiatives/)).toBeInTheDocument();
      expect(screen.getByText(/Hiring Decisions/)).toBeInTheDocument();
    });

    it('renders confirmed badge when confirmed', () => {
      render(
        <BottleneckPatternCard
          detection={createDetection({ confidence: 'confirmed' })}
        />
      );
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    it('does not render confirmed badge when auto-detected', () => {
      render(
        <BottleneckPatternCard detection={createDetection({ confidence: 'auto' })} />
      );
      expect(screen.queryByText('Confirmed')).not.toBeInTheDocument();
    });
  });

  describe('expandable details', () => {
    it('shows More button', () => {
      render(<BottleneckPatternCard detection={createDetection()} />);
      expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
    });

    it('expands to show symptoms on click', async () => {
      const user = userEvent.setup();
      render(<BottleneckPatternCard detection={createDetection()} />);

      await user.click(screen.getByRole('button', { name: 'More' }));

      expect(screen.getByText('Common Symptoms')).toBeInTheDocument();
      expect(
        screen.getByText(/Decisions stall waiting for executives/)
      ).toBeInTheDocument();
    });

    it('expands to show interventions on click', async () => {
      const user = userEvent.setup();
      render(<BottleneckPatternCard detection={createDetection()} />);

      await user.click(screen.getByRole('button', { name: 'More' }));

      expect(screen.getByText('Recommended Interventions')).toBeInTheDocument();
      expect(
        screen.getByText('Implement Decision Authority Matrix')
      ).toBeInTheDocument();
    });

    it('collapses on second click', async () => {
      const user = userEvent.setup();
      render(<BottleneckPatternCard detection={createDetection()} />);

      await user.click(screen.getByRole('button', { name: 'More' }));
      expect(screen.getByText('Common Symptoms')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Less' }));
      expect(screen.queryByText('Common Symptoms')).not.toBeInTheDocument();
    });
  });

  describe('severity colors', () => {
    it('applies high severity colors', () => {
      const { container } = render(
        <BottleneckPatternCard detection={createDetection({ severity: 'high' })} />
      );
      expect(container.firstChild).toHaveClass('bg-orange-100');
    });

    it('applies critical severity colors', () => {
      const { container } = render(
        <BottleneckPatternCard detection={createDetection({ severity: 'critical' })} />
      );
      expect(container.firstChild).toHaveClass('bg-red-100');
    });

    it('applies medium severity colors', () => {
      const { container } = render(
        <BottleneckPatternCard detection={createDetection({ severity: 'medium' })} />
      );
      expect(container.firstChild).toHaveClass('bg-yellow-100');
    });

    it('applies low severity colors', () => {
      const { container } = render(
        <BottleneckPatternCard detection={createDetection({ severity: 'low' })} />
      );
      expect(container.firstChild).toHaveClass('bg-green-100');
    });
  });

  describe('different patterns', () => {
    it('renders meeting_dependencies pattern', () => {
      render(
        <BottleneckPatternCard
          detection={createDetection({ patternId: 'meeting_dependencies' })}
        />
      );
      expect(screen.getByText('Meeting Dependencies')).toBeInTheDocument();
    });

    it('renders unclear_handoffs pattern', () => {
      render(
        <BottleneckPatternCard
          detection={createDetection({ patternId: 'unclear_handoffs' })}
        />
      );
      expect(screen.getByText('Unclear Handoffs')).toBeInTheDocument();
    });

    it('renders rework_loops pattern', () => {
      render(
        <BottleneckPatternCard
          detection={createDetection({ patternId: 'rework_loops' })}
        />
      );
      expect(screen.getByText('Rework Loops')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('renders as a region', () => {
      render(<BottleneckPatternCard detection={createDetection()} />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has aria-expanded on expand button', async () => {
      const user = userEvent.setup();
      render(<BottleneckPatternCard detection={createDetection()} />);

      const button = screen.getByRole('button', { name: 'More' });
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
