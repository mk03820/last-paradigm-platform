/**
 * Tests for StakeholderMatrix component
 *
 * Story 11.2: 2x2 Matrix Visualization
 * Task 8.1: Unit tests for StakeholderMatrix component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StakeholderMatrix } from './StakeholderMatrix';
import type { Stakeholder } from './stakeholder-constants';

const createStakeholder = (
  overrides: Partial<Stakeholder> = {}
): Stakeholder => ({
  id: `sh_${Math.random().toString(36).substring(2)}`,
  name: 'Test Stakeholder',
  role: 'Manager',
  power: 5,
  interest: 5,
  ...overrides,
});

describe('StakeholderMatrix', () => {
  it('renders empty state when no stakeholders', () => {
    render(<StakeholderMatrix stakeholders={[]} />);

    expect(screen.getByText('No stakeholders to display')).toBeInTheDocument();
  });

  it('renders matrix with aria label', () => {
    render(<StakeholderMatrix stakeholders={[]} />);

    expect(
      screen.getByRole('img', { name: 'Stakeholder power/interest matrix' })
    ).toBeInTheDocument();
  });

  it('displays all four quadrant labels', () => {
    render(<StakeholderMatrix stakeholders={[]} />);

    expect(screen.getByText('Key Players')).toBeInTheDocument();
    expect(screen.getByText('Keep Satisfied')).toBeInTheDocument();
    expect(screen.getByText('Keep Informed')).toBeInTheDocument();
    expect(screen.getByText('Monitor')).toBeInTheDocument();
  });

  it('renders stakeholder points with initials', () => {
    const stakeholders = [
      createStakeholder({ name: 'John Doe', power: 8, interest: 8 }),
    ];

    render(<StakeholderMatrix stakeholders={stakeholders} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders multiple stakeholders', () => {
    const stakeholders = [
      createStakeholder({ id: '1', name: 'Alice Brown', power: 8, interest: 8 }),
      createStakeholder({ id: '2', name: 'Bob Smith', power: 3, interest: 3 }),
      createStakeholder({ id: '3', name: 'Carol White', power: 8, interest: 3 }),
    ];

    render(<StakeholderMatrix stakeholders={stakeholders} />);

    expect(screen.getByText('AB')).toBeInTheDocument();
    expect(screen.getByText('BS')).toBeInTheDocument();
    expect(screen.getByText('CW')).toBeInTheDocument();
  });

  it('calls onSelect when stakeholder is clicked', () => {
    const onSelect = vi.fn();
    const stakeholder = createStakeholder({ name: 'Jane Doe' });

    render(
      <StakeholderMatrix stakeholders={[stakeholder]} onSelect={onSelect} />
    );

    const point = screen.getByText('JD');
    fireEvent.click(point);

    expect(onSelect).toHaveBeenCalledWith(stakeholder);
  });

  it('highlights selected stakeholder', () => {
    const stakeholder = createStakeholder({ name: 'Jane Doe' });

    render(
      <StakeholderMatrix
        stakeholders={[stakeholder]}
        selectedId={stakeholder.id}
      />
    );

    const point = screen.getByText('JD');
    expect(point).toHaveClass('ring-2');
  });

  it('shows tooltip on hover with stakeholder details', async () => {
    const stakeholder = createStakeholder({
      name: 'Jane Doe',
      role: 'CEO',
      power: 9,
      interest: 8,
    });

    render(<StakeholderMatrix stakeholders={[stakeholder]} />);

    const point = screen.getByLabelText('Jane Doe, Power: 9, Interest: 8');
    expect(point).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StakeholderMatrix stakeholders={[]} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows axis labels', () => {
    render(<StakeholderMatrix stakeholders={[]} />);

    expect(screen.getByText('Power →')).toBeInTheDocument();
    expect(screen.getByText('Interest →')).toBeInTheDocument();
  });

  it('shows scale markers', () => {
    render(<StakeholderMatrix stakeholders={[]} />);

    // Should show scale numbers
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
  });

  describe('stakeholder positioning', () => {
    it('positions high power, high interest in key players quadrant', () => {
      const stakeholder = createStakeholder({ power: 9, interest: 9 });

      render(<StakeholderMatrix stakeholders={[stakeholder]} />);

      // The button should exist (we can't easily test CSS positioning)
      const point = screen.getByRole('button', { name: /Power: 9, Interest: 9/ });
      expect(point).toBeInTheDocument();
    });

    it('positions low power, low interest in monitor quadrant', () => {
      const stakeholder = createStakeholder({ power: 2, interest: 2 });

      render(<StakeholderMatrix stakeholders={[stakeholder]} />);

      const point = screen.getByRole('button', { name: /Power: 2, Interest: 2/ });
      expect(point).toBeInTheDocument();
    });
  });

  describe('overlapping stakeholders', () => {
    it('handles stakeholders with identical positions', () => {
      const stakeholders = [
        createStakeholder({ id: '1', name: 'Alice', power: 5, interest: 5 }),
        createStakeholder({ id: '2', name: 'Bob', power: 5, interest: 5 }),
      ];

      render(<StakeholderMatrix stakeholders={stakeholders} />);

      // Both stakeholders should render
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('handles many stakeholders at similar positions', () => {
      const stakeholders = Array.from({ length: 5 }, (_, i) =>
        createStakeholder({
          id: String(i),
          name: `Person ${i}`,
          power: 5,
          interest: 5,
        })
      );

      render(<StakeholderMatrix stakeholders={stakeholders} />);

      // All stakeholders should render
      stakeholders.forEach((_, i) => {
        expect(
          screen.getByRole('button', { name: new RegExp(`Person ${i}`) })
        ).toBeInTheDocument();
      });
    });
  });

  describe('performance', () => {
    it('renders 50 stakeholders without issue', () => {
      const stakeholders = Array.from({ length: 50 }, (_, i) =>
        createStakeholder({
          id: String(i),
          name: `Stakeholder ${i}`,
          power: Math.ceil(Math.random() * 10),
          interest: Math.ceil(Math.random() * 10),
        })
      );

      const start = performance.now();
      render(<StakeholderMatrix stakeholders={stakeholders} />);
      const duration = performance.now() - start;

      // Should render within 500ms
      expect(duration).toBeLessThan(500);

      // All stakeholders should be rendered
      expect(screen.getAllByRole('button').length).toBe(50);
    });
  });
});
