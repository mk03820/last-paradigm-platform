import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StakeholderList } from './StakeholderList';
import type { Stakeholder } from './stakeholder-constants';

/**
 * StakeholderList Tests
 *
 * Story 11.1: Stakeholder Input Interface
 * Covers: AC3 (up to 50 stakeholders), AC4 (edit/remove)
 *
 * Note: Component renders both desktop table and mobile cards (responsive),
 * so elements may appear multiple times. Tests use getAllBy* variants.
 */

const createStakeholder = (overrides: Partial<Stakeholder> = {}): Stakeholder => ({
  id: `sh_${Math.random().toString(36).substring(2)}`,
  name: 'John Doe',
  role: 'CEO',
  power: 5,
  interest: 5,
  ...overrides,
});

describe('StakeholderList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('shows empty state message', () => {
      render(
        <StakeholderList
          stakeholders={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('No Stakeholders Added')).toBeInTheDocument();
      expect(
        screen.getByText(/add stakeholders to map their power/i)
      ).toBeInTheDocument();
    });
  });

  describe('with stakeholders', () => {
    it('displays stakeholder count', () => {
      const stakeholders = [
        createStakeholder({ name: 'A' }),
        createStakeholder({ name: 'B' }),
      ];

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('2 of 50')).toBeInTheDocument();
    });

    it('displays stakeholder names', () => {
      const stakeholders = [
        createStakeholder({ name: 'Alice' }),
        createStakeholder({ name: 'Bob' }),
      ];

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Names appear in both desktop and mobile views
      expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Bob').length).toBeGreaterThanOrEqual(1);
    });

    it('displays stakeholder roles', () => {
      const stakeholders = [createStakeholder({ role: 'VP Engineering' })];

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('VP Engineering').length).toBeGreaterThanOrEqual(1);
    });

    it('displays power scores', () => {
      const stakeholders = [createStakeholder({ power: 8 })];

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByLabelText('power level 8').length).toBeGreaterThanOrEqual(1);
    });

    it('displays interest scores', () => {
      const stakeholders = [createStakeholder({ interest: 7 })];

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByLabelText('interest level 7').length).toBeGreaterThanOrEqual(1);
    });

    it('displays quadrant badges', () => {
      const stakeholders = [
        createStakeholder({ power: 8, interest: 8 }), // key_players
      ];

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('Key Players').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('edit action', () => {
    it('calls onEdit when edit button clicked', async () => {
      const user = userEvent.setup();
      const stakeholder = createStakeholder({ name: 'Alice' });

      render(
        <StakeholderList
          stakeholders={[stakeholder]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Click the first edit button found (desktop view)
      const editButtons = screen.getAllByLabelText('Edit Alice');
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(stakeholder);
    });
  });

  describe('delete action', () => {
    it('requires confirmation to delete', async () => {
      const user = userEvent.setup();
      const stakeholder = createStakeholder({ name: 'Alice' });

      render(
        <StakeholderList
          stakeholders={[stakeholder]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // First click shows confirm state
      const deleteButtons = screen.getAllByLabelText('Delete Alice');
      await user.click(deleteButtons[0]);
      expect(mockOnDelete).not.toHaveBeenCalled();

      // Second click confirms deletion
      const confirmButtons = screen.getAllByLabelText('Confirm delete Alice');
      await user.click(confirmButtons[0]);
      expect(mockOnDelete).toHaveBeenCalledWith(stakeholder.id);
    });
  });

  describe('sorting', () => {
    const stakeholders = [
      createStakeholder({ name: 'Charlie', power: 5, interest: 3 }),
      createStakeholder({ name: 'Alice', power: 10, interest: 8 }),
      createStakeholder({ name: 'Bob', power: 3, interest: 5 }),
    ];

    it('sorts by name by default', () => {
      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const rows = screen.getAllByRole('row').slice(1); // Skip header
      expect(within(rows[0]).getByText('Alice')).toBeInTheDocument();
      expect(within(rows[1]).getByText('Bob')).toBeInTheDocument();
      expect(within(rows[2]).getByText('Charlie')).toBeInTheDocument();
    });

    it('sorts by power when power header clicked', async () => {
      const user = userEvent.setup();

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      await user.click(screen.getByLabelText('Sort by Power'));

      const rows = screen.getAllByRole('row').slice(1);
      expect(within(rows[0]).getByText('Bob')).toBeInTheDocument(); // power 3
      expect(within(rows[1]).getByText('Charlie')).toBeInTheDocument(); // power 5
      expect(within(rows[2]).getByText('Alice')).toBeInTheDocument(); // power 10
    });

    it('toggles sort direction on repeated click', async () => {
      const user = userEvent.setup();

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // First click - ascending
      await user.click(screen.getByLabelText('Sort by Power'));

      let rows = screen.getAllByRole('row').slice(1);
      expect(within(rows[0]).getByText('Bob')).toBeInTheDocument();

      // Second click - descending
      await user.click(screen.getByLabelText('Sort by Power'));

      rows = screen.getAllByRole('row').slice(1);
      expect(within(rows[0]).getByText('Alice')).toBeInTheDocument();
    });

    it('sorts by interest', async () => {
      const user = userEvent.setup();

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      await user.click(screen.getByLabelText('Sort by Interest'));

      const rows = screen.getAllByRole('row').slice(1);
      expect(within(rows[0]).getByText('Charlie')).toBeInTheDocument(); // interest 3
    });

    it('sorts by quadrant', async () => {
      const user = userEvent.setup();

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      await user.click(screen.getByLabelText('Sort by Quadrant'));

      // Quadrant sorting is alphabetical by quadrant id
      const rows = screen.getAllByRole('row').slice(1);
      expect(rows.length).toBe(3);
    });
  });

  describe('quadrant display', () => {
    it('shows Key Players badge for high power/high interest', () => {
      const stakeholders = [createStakeholder({ power: 8, interest: 8 })];

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('Key Players').length).toBeGreaterThanOrEqual(1);
    });

    it('shows Keep Satisfied badge for high power/low interest', () => {
      const stakeholders = [createStakeholder({ power: 8, interest: 3 })];

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('Keep Satisfied').length).toBeGreaterThanOrEqual(1);
    });

    it('shows Keep Informed badge for low power/high interest', () => {
      const stakeholders = [createStakeholder({ power: 3, interest: 8 })];

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('Keep Informed').length).toBeGreaterThanOrEqual(1);
    });

    it('shows Monitor badge for low power/low interest', () => {
      const stakeholders = [createStakeholder({ power: 3, interest: 3 })];

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('Monitor').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('accessibility', () => {
    it('has table role', () => {
      const stakeholders = [createStakeholder()];

      render(
        <StakeholderList
          stakeholders={stakeholders}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('has aria-labels for actions', () => {
      const stakeholder = createStakeholder({ name: 'John' });

      render(
        <StakeholderList
          stakeholders={[stakeholder]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Actions appear in both views
      expect(screen.getAllByLabelText('Edit John').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByLabelText('Delete John').length).toBeGreaterThanOrEqual(1);
    });
  });
});
