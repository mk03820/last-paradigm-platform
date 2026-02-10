/**
 * Tests for StakeholderDetailPanel component
 *
 * Story 11.2: 2x2 Matrix Visualization
 * Task 8.2: Unit tests for StakeholderDetailPanel component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StakeholderDetailPanel } from './StakeholderDetailPanel';
import type { Stakeholder } from './stakeholder-constants';

const createStakeholder = (
  overrides: Partial<Stakeholder> = {}
): Stakeholder => ({
  id: 'test-id',
  name: 'Jane Doe',
  role: 'CEO',
  power: 9,
  interest: 8,
  ...overrides,
});

describe('StakeholderDetailPanel', () => {
  it('displays stakeholder name and role', () => {
    const stakeholder = createStakeholder();

    render(<StakeholderDetailPanel stakeholder={stakeholder} />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('CEO')).toBeInTheDocument();
  });

  it('displays power score with bar', () => {
    const stakeholder = createStakeholder({ power: 8, interest: 5 });

    render(<StakeholderDetailPanel stakeholder={stakeholder} />);

    expect(screen.getByText('Power')).toBeInTheDocument();
    expect(screen.getByText('8/10')).toBeInTheDocument();
  });

  it('displays interest score with bar', () => {
    const stakeholder = createStakeholder({ power: 5, interest: 7 });

    render(<StakeholderDetailPanel stakeholder={stakeholder} />);

    expect(screen.getByText('Interest')).toBeInTheDocument();
    expect(screen.getByText('7/10')).toBeInTheDocument();
  });

  it('displays correct quadrant badge for key player', () => {
    const stakeholder = createStakeholder({ power: 9, interest: 9 });

    render(<StakeholderDetailPanel stakeholder={stakeholder} />);

    expect(screen.getByText('Key Players')).toBeInTheDocument();
  });

  it('displays correct quadrant badge for keep satisfied', () => {
    const stakeholder = createStakeholder({ power: 9, interest: 3 });

    render(<StakeholderDetailPanel stakeholder={stakeholder} />);

    expect(screen.getByText('Keep Satisfied')).toBeInTheDocument();
  });

  it('displays correct quadrant badge for keep informed', () => {
    const stakeholder = createStakeholder({ power: 3, interest: 9 });

    render(<StakeholderDetailPanel stakeholder={stakeholder} />);

    expect(screen.getByText('Keep Informed')).toBeInTheDocument();
  });

  it('displays correct quadrant badge for monitor', () => {
    const stakeholder = createStakeholder({ power: 3, interest: 3 });

    render(<StakeholderDetailPanel stakeholder={stakeholder} />);

    expect(screen.getByText('Monitor')).toBeInTheDocument();
  });

  it('displays power level guidance', () => {
    const stakeholder = createStakeholder({ power: 9, interest: 3 });

    render(<StakeholderDetailPanel stakeholder={stakeholder} />);

    // Should show power level description
    expect(screen.getByText(/Power: Very High/)).toBeInTheDocument();
  });

  it('displays interest level guidance', () => {
    const stakeholder = createStakeholder({ power: 3, interest: 9 });

    render(<StakeholderDetailPanel stakeholder={stakeholder} />);

    // Should show interest level description
    expect(screen.getByText(/Interest: Very High/)).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = vi.fn();
    const stakeholder = createStakeholder();

    render(<StakeholderDetailPanel stakeholder={stakeholder} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /Edit Stakeholder/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalled();
  });

  it('does not show Edit button when onEdit is not provided', () => {
    const stakeholder = createStakeholder();

    render(<StakeholderDetailPanel stakeholder={stakeholder} />);

    expect(
      screen.queryByRole('button', { name: /Edit Stakeholder/i })
    ).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    const stakeholder = createStakeholder();

    render(<StakeholderDetailPanel stakeholder={stakeholder} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /Close details/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('does not show close button when onClose is not provided', () => {
    const stakeholder = createStakeholder();

    render(<StakeholderDetailPanel stakeholder={stakeholder} />);

    expect(
      screen.queryByRole('button', { name: /Close details/i })
    ).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const stakeholder = createStakeholder();
    const { container } = render(
      <StakeholderDetailPanel stakeholder={stakeholder} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
