/**
 * Tests for QuadrantSummary component
 *
 * Story 11.2: 2x2 Matrix Visualization
 * Task 8.3: Unit tests for QuadrantSummary component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuadrantSummary } from './QuadrantSummary';
import type { StakeholderQuadrant } from './stakeholder-constants';

const createCounts = (
  overrides: Partial<Record<StakeholderQuadrant, number>> = {}
): Record<StakeholderQuadrant, number> => ({
  key_players: 0,
  keep_satisfied: 0,
  keep_informed: 0,
  monitor: 0,
  ...overrides,
});

describe('QuadrantSummary', () => {
  it('displays all quadrant labels', () => {
    render(<QuadrantSummary counts={createCounts()} />);

    expect(screen.getByText('Key Players')).toBeInTheDocument();
    expect(screen.getByText('Keep Satisfied')).toBeInTheDocument();
    expect(screen.getByText('Keep Informed')).toBeInTheDocument();
    expect(screen.getByText('Monitor')).toBeInTheDocument();
  });

  it('displays count for each quadrant', () => {
    const counts = createCounts({
      key_players: 5,
      keep_satisfied: 3,
      keep_informed: 2,
      monitor: 1,
    });

    render(<QuadrantSummary counts={counts} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays total stakeholder count', () => {
    const counts = createCounts({
      key_players: 5,
      keep_satisfied: 3,
      keep_informed: 2,
      monitor: 1,
    });

    render(<QuadrantSummary counts={counts} />);

    expect(screen.getByText('11 stakeholders mapped')).toBeInTheDocument();
  });

  it('displays singular form for one stakeholder', () => {
    const counts = createCounts({ key_players: 1 });

    render(<QuadrantSummary counts={counts} />);

    expect(screen.getByText('1 stakeholder mapped')).toBeInTheDocument();
  });

  it('displays engagement guidance for each quadrant', () => {
    render(<QuadrantSummary counts={createCounts()} />);

    expect(
      screen.getByText(/Engage closely and regularly/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Keep informed on major milestones/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Regular updates and involvement/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Minimal effort required/i)
    ).toBeInTheDocument();
  });

  it('highlights quadrant with most stakeholders', () => {
    const counts = createCounts({
      key_players: 5,
      keep_satisfied: 2,
      keep_informed: 3,
      monitor: 1,
    });

    const { container } = render(<QuadrantSummary counts={counts} />);

    // The Key Players quadrant should have ring styling
    const keyPlayersSection = container.querySelector('.ring-2');
    expect(keyPlayersSection).toBeInTheDocument();
  });

  it('shows empty state message when no stakeholders', () => {
    render(<QuadrantSummary counts={createCounts()} />);

    expect(
      screen.getByText(/Add stakeholders to see their distribution/i)
    ).toBeInTheDocument();
  });

  it('does not show empty state when stakeholders exist', () => {
    const counts = createCounts({ key_players: 1 });

    render(<QuadrantSummary counts={counts} />);

    expect(
      screen.queryByText(/Add stakeholders to see their distribution/i)
    ).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuadrantSummary counts={createCounts()} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders header with title', () => {
    render(<QuadrantSummary counts={createCounts()} />);

    expect(screen.getByText('Quadrant Summary')).toBeInTheDocument();
  });

  describe('quadrant highlighting', () => {
    it('does not highlight when all counts are zero', () => {
      const { container } = render(<QuadrantSummary counts={createCounts()} />);

      const highlighted = container.querySelector('.ring-2');
      expect(highlighted).not.toBeInTheDocument();
    });

    it('highlights key_players when it has most stakeholders', () => {
      const counts = createCounts({ key_players: 5, monitor: 2 });
      const { container } = render(<QuadrantSummary counts={counts} />);

      const highlighted = container.querySelector('.ring-2');
      expect(highlighted).toHaveTextContent('Key Players');
    });

    it('highlights monitor when it has most stakeholders', () => {
      const counts = createCounts({ monitor: 5, key_players: 2 });
      const { container } = render(<QuadrantSummary counts={counts} />);

      const highlighted = container.querySelector('.ring-2');
      expect(highlighted).toHaveTextContent('Monitor');
    });
  });
});
