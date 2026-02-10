/**
 * Tests for EngagementActionTable component
 *
 * Story 11.4: Engagement Strategy Generation
 * Task 8.4: Unit tests for EngagementActionTable component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EngagementActionTable } from './EngagementActionTable';
import type { Stakeholder } from './stakeholder-constants';

// Helper to create stakeholders
function createStakeholder(
  overrides: Partial<Stakeholder> = {}
): Stakeholder {
  return {
    id: `sh_${Math.random().toString(36).slice(2)}`,
    name: 'Test Stakeholder',
    role: 'Manager',
    power: 5,
    interest: 5,
    ...overrides,
  };
}

describe('EngagementActionTable', () => {
  const mockOnOwnerChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table title', () => {
    render(
      <EngagementActionTable
        stakeholders={[]}
        owners={{}}
        onOwnerChange={mockOnOwnerChange}
      />
    );

    expect(screen.getByText('Engagement Action Plan')).toBeInTheDocument();
  });

  it('shows empty state when no stakeholders', () => {
    render(
      <EngagementActionTable
        stakeholders={[]}
        owners={{}}
        onOwnerChange={mockOnOwnerChange}
      />
    );

    expect(screen.getByText(/no stakeholders to display/i)).toBeInTheDocument();
  });

  it('renders export button', () => {
    render(
      <EngagementActionTable
        stakeholders={[]}
        owners={{}}
        onOwnerChange={mockOnOwnerChange}
      />
    );

    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
  });

  it('displays stakeholder name and role', () => {
    const stakeholder = createStakeholder({
      name: 'John Doe',
      role: 'CEO',
    });

    render(
      <EngagementActionTable
        stakeholders={[stakeholder]}
        owners={{}}
        onOwnerChange={mockOnOwnerChange}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('CEO')).toBeInTheDocument();
  });

  it('displays quadrant badge', () => {
    const stakeholder = createStakeholder({
      power: 9,
      interest: 9,
    });

    render(
      <EngagementActionTable
        stakeholders={[stakeholder]}
        owners={{}}
        onOwnerChange={mockOnOwnerChange}
      />
    );

    expect(screen.getByText('Key Players')).toBeInTheDocument();
  });

  it('displays sentiment indicator', () => {
    const stakeholder = createStakeholder({
      sentiment: 'supporter',
    });

    render(
      <EngagementActionTable
        stakeholders={[stakeholder]}
        owners={{}}
        onOwnerChange={mockOnOwnerChange}
      />
    );

    expect(screen.getByText('Supporter')).toBeInTheDocument();
  });

  it('shows dash when no sentiment', () => {
    const stakeholder = createStakeholder();

    render(
      <EngagementActionTable
        stakeholders={[stakeholder]}
        owners={{}}
        onOwnerChange={mockOnOwnerChange}
      />
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('displays recommended action', () => {
    const stakeholder = createStakeholder({
      power: 9,
      interest: 9,
    });

    render(
      <EngagementActionTable
        stakeholders={[stakeholder]}
        owners={{}}
        onOwnerChange={mockOnOwnerChange}
      />
    );

    expect(screen.getByText(/weekly/i)).toBeInTheDocument();
  });

  it('displays owner when assigned', () => {
    const stakeholder = createStakeholder({ id: 'sh_1' });

    render(
      <EngagementActionTable
        stakeholders={[stakeholder]}
        owners={{ sh_1: 'Jane Smith' }}
        onOwnerChange={mockOnOwnerChange}
      />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows "Assign owner" when no owner', () => {
    const stakeholder = createStakeholder();

    render(
      <EngagementActionTable
        stakeholders={[stakeholder]}
        owners={{}}
        onOwnerChange={mockOnOwnerChange}
      />
    );

    expect(screen.getByText('Assign owner')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EngagementActionTable
        stakeholders={[]}
        owners={{}}
        onOwnerChange={mockOnOwnerChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  describe('owner editing', () => {
    it('opens editor when clicking owner cell', async () => {
      const user = userEvent.setup();
      const stakeholder = createStakeholder({ id: 'sh_1' });

      render(
        <EngagementActionTable
          stakeholders={[stakeholder]}
          owners={{}}
          onOwnerChange={mockOnOwnerChange}
        />
      );

      await user.click(screen.getByText('Assign owner'));

      expect(screen.getByPlaceholderText('Enter owner')).toBeInTheDocument();
    });

    it('calls onOwnerChange when saving', async () => {
      const user = userEvent.setup();
      const stakeholder = createStakeholder({ id: 'sh_1' });

      render(
        <EngagementActionTable
          stakeholders={[stakeholder]}
          owners={{}}
          onOwnerChange={mockOnOwnerChange}
        />
      );

      await user.click(screen.getByText('Assign owner'));
      await user.type(screen.getByPlaceholderText('Enter owner'), 'New Owner');
      await user.click(screen.getByLabelText('Save owner'));

      expect(mockOnOwnerChange).toHaveBeenCalledWith('sh_1', 'New Owner');
    });

    it('cancels editing on cancel button', async () => {
      const user = userEvent.setup();
      const stakeholder = createStakeholder({ id: 'sh_1' });

      render(
        <EngagementActionTable
          stakeholders={[stakeholder]}
          owners={{}}
          onOwnerChange={mockOnOwnerChange}
        />
      );

      await user.click(screen.getByText('Assign owner'));
      await user.type(screen.getByPlaceholderText('Enter owner'), 'New Owner');
      await user.click(screen.getByLabelText('Cancel editing'));

      expect(mockOnOwnerChange).not.toHaveBeenCalled();
      expect(screen.getByText('Assign owner')).toBeInTheDocument();
    });

    it('saves on Enter key', async () => {
      const user = userEvent.setup();
      const stakeholder = createStakeholder({ id: 'sh_1' });

      render(
        <EngagementActionTable
          stakeholders={[stakeholder]}
          owners={{}}
          onOwnerChange={mockOnOwnerChange}
        />
      );

      await user.click(screen.getByText('Assign owner'));
      await user.type(screen.getByPlaceholderText('Enter owner'), 'New Owner{Enter}');

      expect(mockOnOwnerChange).toHaveBeenCalledWith('sh_1', 'New Owner');
    });

    it('cancels on Escape key', async () => {
      const user = userEvent.setup();
      const stakeholder = createStakeholder({ id: 'sh_1' });

      render(
        <EngagementActionTable
          stakeholders={[stakeholder]}
          owners={{}}
          onOwnerChange={mockOnOwnerChange}
        />
      );

      await user.click(screen.getByText('Assign owner'));
      await user.type(screen.getByPlaceholderText('Enter owner'), 'New Owner{Escape}');

      expect(mockOnOwnerChange).not.toHaveBeenCalled();
    });

    it('pre-fills input with current owner', async () => {
      const user = userEvent.setup();
      const stakeholder = createStakeholder({ id: 'sh_1' });

      render(
        <EngagementActionTable
          stakeholders={[stakeholder]}
          owners={{ sh_1: 'Existing Owner' }}
          onOwnerChange={mockOnOwnerChange}
        />
      );

      await user.click(screen.getByText('Existing Owner'));

      expect(screen.getByDisplayValue('Existing Owner')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('sorts by name when clicking Name header', async () => {
      const user = userEvent.setup();
      const stakeholders = [
        createStakeholder({ id: '1', name: 'Zoe' }),
        createStakeholder({ id: '2', name: 'Alice' }),
        createStakeholder({ id: '3', name: 'Mike' }),
      ];

      render(
        <EngagementActionTable
          stakeholders={stakeholders}
          owners={{}}
          onOwnerChange={mockOnOwnerChange}
        />
      );

      await user.click(screen.getByLabelText('Sort by Name'));

      const rows = screen.getAllByRole('row').slice(1); // Skip header
      expect(rows[0]).toHaveTextContent('Alice');
      expect(rows[2]).toHaveTextContent('Zoe');
    });

    it('toggles sort direction on second click', async () => {
      const user = userEvent.setup();
      const stakeholders = [
        createStakeholder({ id: '1', name: 'Zoe' }),
        createStakeholder({ id: '2', name: 'Alice' }),
      ];

      render(
        <EngagementActionTable
          stakeholders={stakeholders}
          owners={{}}
          onOwnerChange={mockOnOwnerChange}
        />
      );

      // First click - ascending
      await user.click(screen.getByLabelText('Sort by Name'));
      let rows = screen.getAllByRole('row').slice(1);
      expect(rows[0]).toHaveTextContent('Alice');

      // Second click - descending
      await user.click(screen.getByLabelText('Sort by Name'));
      rows = screen.getAllByRole('row').slice(1);
      expect(rows[0]).toHaveTextContent('Zoe');
    });

    it('sorts by quadrant by default', () => {
      const stakeholders = [
        createStakeholder({ id: '1', name: 'Monitor', power: 3, interest: 3 }),
        createStakeholder({ id: '2', name: 'Key Player', power: 9, interest: 9 }),
      ];

      render(
        <EngagementActionTable
          stakeholders={stakeholders}
          owners={{}}
          onOwnerChange={mockOnOwnerChange}
        />
      );

      const rows = screen.getAllByRole('row').slice(1);
      expect(rows[0]).toHaveTextContent('Key Player');
      expect(rows[1]).toHaveTextContent('Monitor');
    });
  });
});
