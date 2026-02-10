/**
 * Tests for QuadrantStrategy component
 *
 * Story 11.4: Engagement Strategy Generation
 * Task 8.2: Unit tests for QuadrantStrategy component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuadrantStrategy } from './QuadrantStrategy';

describe('QuadrantStrategy', () => {
  it('renders quadrant label', () => {
    render(<QuadrantStrategy quadrant="key_players" stakeholderCount={5} />);

    expect(screen.getByText('Key Players')).toBeInTheDocument();
  });

  it('displays stakeholder count', () => {
    render(<QuadrantStrategy quadrant="key_players" stakeholderCount={5} />);

    expect(screen.getByText('5 stakeholders')).toBeInTheDocument();
  });

  it('uses singular form for one stakeholder', () => {
    render(<QuadrantStrategy quadrant="key_players" stakeholderCount={1} />);

    expect(screen.getByText('1 stakeholder')).toBeInTheDocument();
  });

  it('displays blocker count when provided', () => {
    render(
      <QuadrantStrategy
        quadrant="key_players"
        stakeholderCount={5}
        blockerCount={2}
      />
    );

    expect(screen.getByText('2 blockers')).toBeInTheDocument();
  });

  it('uses singular form for one blocker', () => {
    render(
      <QuadrantStrategy
        quadrant="key_players"
        stakeholderCount={5}
        blockerCount={1}
      />
    );

    expect(screen.getByText('1 blocker')).toBeInTheDocument();
  });

  it('does not show blocker badge when count is 0', () => {
    render(
      <QuadrantStrategy
        quadrant="key_players"
        stakeholderCount={5}
        blockerCount={0}
      />
    );

    expect(screen.queryByText(/blocker/)).not.toBeInTheDocument();
  });

  it('displays cadence for key_players', () => {
    render(<QuadrantStrategy quadrant="key_players" stakeholderCount={3} />);

    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('displays cadence for monitor', () => {
    render(<QuadrantStrategy quadrant="monitor" stakeholderCount={3} />);

    expect(screen.getByText('Quarterly')).toBeInTheDocument();
  });

  it('displays time investment', () => {
    render(<QuadrantStrategy quadrant="key_players" stakeholderCount={3} />);

    // CSS capitalize is used, so we check for lowercase in the HTML
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('displays strategy description', () => {
    render(<QuadrantStrategy quadrant="key_players" stakeholderCount={3} />);

    expect(screen.getByText(/engage closely/i)).toBeInTheDocument();
  });

  it('displays content types', () => {
    render(<QuadrantStrategy quadrant="key_players" stakeholderCount={3} />);

    expect(screen.getByText('Status updates')).toBeInTheDocument();
    expect(screen.getByText('Decision previews')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuadrantStrategy
        quadrant="key_players"
        stakeholderCount={3}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  describe('quadrant-specific content', () => {
    it('shows keep_satisfied strategy', () => {
      render(<QuadrantStrategy quadrant="keep_satisfied" stakeholderCount={2} />);

      expect(screen.getByText('Keep Satisfied')).toBeInTheDocument();
      expect(screen.getByText('Monthly')).toBeInTheDocument();
      expect(screen.getByText(/major milestones/i)).toBeInTheDocument();
    });

    it('shows keep_informed strategy', () => {
      render(<QuadrantStrategy quadrant="keep_informed" stakeholderCount={2} />);

      expect(screen.getByText('Keep Informed')).toBeInTheDocument();
      expect(screen.getByText('Bi-weekly')).toBeInTheDocument();
    });

    it('shows monitor strategy', () => {
      render(<QuadrantStrategy quadrant="monitor" stakeholderCount={2} />);

      expect(screen.getByText('Monitor')).toBeInTheDocument();
      expect(screen.getByText('Quarterly')).toBeInTheDocument();
      expect(screen.getByText(/minimal effort/i)).toBeInTheDocument();
    });
  });
});
