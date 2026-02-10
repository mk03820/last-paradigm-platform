import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StakeholderInput } from './StakeholderInput';
import { useTool4Store } from '@/lib/store/tool4-store';

/**
 * StakeholderInput Tests
 *
 * Story 11.1: Stakeholder Input Interface
 * Covers: All ACs (form, list, progress, validation)
 */

// Mock the tooltip provider
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('StakeholderInput', () => {
  const mockOnProceed = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTool4Store.getState().resetTool4();
  });

  describe('initial state', () => {
    it('shows add stakeholder button', () => {
      render(<StakeholderInput onProceed={mockOnProceed} />);
      expect(screen.getByRole('button', { name: /add stakeholder/i })).toBeInTheDocument();
    });

    it('shows progress indicator at 0', () => {
      render(<StakeholderInput onProceed={mockOnProceed} />);
      expect(screen.getByText('0 of 50 stakeholders')).toBeInTheDocument();
    });

    it('shows empty state in list', () => {
      render(<StakeholderInput onProceed={mockOnProceed} />);
      expect(screen.getByText('No Stakeholders Added')).toBeInTheDocument();
    });

    it('does not show proceed button when empty', () => {
      render(<StakeholderInput onProceed={mockOnProceed} />);
      expect(screen.queryByRole('button', { name: /view stakeholder matrix/i })).not.toBeInTheDocument();
    });
  });

  describe('adding stakeholders', () => {
    it('shows form when add button clicked', async () => {
      const user = userEvent.setup();
      render(<StakeholderInput onProceed={mockOnProceed} />);

      await user.click(screen.getByRole('button', { name: /add stakeholder/i }));

      // Form title and input both appear
      expect(screen.getAllByText('Add Stakeholder').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    });

    it('hides add button when form is open', async () => {
      const user = userEvent.setup();
      render(<StakeholderInput onProceed={mockOnProceed} />);

      await user.click(screen.getByRole('button', { name: /add stakeholder/i }));

      // The form should be visible (has the name input)
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      // The icon button with "Add Stakeholder" should not be in the document anymore
      // (only the submit button remains)
      const addButtons = screen.queryAllByRole('button', { name: /add stakeholder/i });
      // Should only find the form submit button
      expect(addButtons.length).toBe(1);
      expect(addButtons[0].getAttribute('type')).toBe('submit');
    });

    it('adds stakeholder to list on submit', async () => {
      const user = userEvent.setup();
      render(<StakeholderInput onProceed={mockOnProceed} />);

      await user.click(screen.getByRole('button', { name: /add stakeholder/i }));
      await user.type(screen.getByRole('textbox', { name: /name/i }), 'John Doe');
      await user.type(screen.getByRole('textbox', { name: /role/i }), 'CEO');

      // Submit button is the one in the form
      const submitButton = screen.getByRole('button', { name: 'Add Stakeholder' });
      await user.click(submitButton);

      // Check both views have the name
      expect(screen.getAllByText('John Doe').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('1 of 50 stakeholders')).toBeInTheDocument();
    });

    it('closes form after successful submit', async () => {
      const user = userEvent.setup();
      render(<StakeholderInput onProceed={mockOnProceed} />);

      await user.click(screen.getByRole('button', { name: /add stakeholder/i }));
      await user.type(screen.getByRole('textbox', { name: /name/i }), 'John Doe');
      await user.type(screen.getByRole('textbox', { name: /role/i }), 'CEO');
      await user.click(screen.getByRole('button', { name: 'Add Stakeholder' }));

      // Form input should be gone
      expect(screen.queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
    });

    it('closes form on cancel', async () => {
      const user = userEvent.setup();
      render(<StakeholderInput onProceed={mockOnProceed} />);

      await user.click(screen.getByRole('button', { name: /add stakeholder/i }));
      // Click the text Cancel button (last one)
      const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
      await user.click(cancelButtons[cancelButtons.length - 1]);

      expect(screen.queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
    });
  });

  describe('progress tracking', () => {
    it('shows warning when below minimum', async () => {
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });

      render(<StakeholderInput onProceed={mockOnProceed} />);

      expect(screen.getByText(/add at least 2 more stakeholders/i)).toBeInTheDocument();
    });

    it('shows ready message when at minimum', () => {
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'B', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'C', role: 'R', power: 5, interest: 5 });

      render(<StakeholderInput onProceed={mockOnProceed} />);

      expect(screen.getByText('Ready for analysis')).toBeInTheDocument();
    });

    it('updates count when stakeholders added', () => {
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'B', role: 'R', power: 5, interest: 5 });

      render(<StakeholderInput onProceed={mockOnProceed} />);

      expect(screen.getByText('2 of 50 stakeholders')).toBeInTheDocument();
    });
  });

  describe('proceed button', () => {
    it('shows proceed button when stakeholders added', () => {
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });

      render(<StakeholderInput onProceed={mockOnProceed} />);

      expect(screen.getByRole('button', { name: /view stakeholder matrix/i })).toBeInTheDocument();
    });

    it('disables proceed button when below minimum', () => {
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });

      render(<StakeholderInput onProceed={mockOnProceed} />);

      expect(screen.getByRole('button', { name: /view stakeholder matrix/i })).toBeDisabled();
    });

    it('enables proceed button at minimum', () => {
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'B', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'C', role: 'R', power: 5, interest: 5 });

      render(<StakeholderInput onProceed={mockOnProceed} />);

      expect(screen.getByRole('button', { name: /view stakeholder matrix/i })).not.toBeDisabled();
    });

    it('calls onProceed when proceed button clicked', async () => {
      const user = userEvent.setup();
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'B', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'C', role: 'R', power: 5, interest: 5 });

      render(<StakeholderInput onProceed={mockOnProceed} />);

      await user.click(screen.getByRole('button', { name: /view stakeholder matrix/i }));

      expect(mockOnProceed).toHaveBeenCalled();
    });
  });

  describe('editing stakeholders', () => {
    it('shows edit form when edit clicked', async () => {
      const user = userEvent.setup();
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'John Doe', role: 'CEO', power: 5, interest: 5 });

      render(<StakeholderInput onProceed={mockOnProceed} />);

      // Click the first edit button (desktop view)
      const editButtons = screen.getAllByLabelText('Edit John Doe');
      await user.click(editButtons[0]);

      expect(screen.getByText('Edit Stakeholder')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    it('updates stakeholder on edit submit', async () => {
      const user = userEvent.setup();
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'John Doe', role: 'CEO', power: 5, interest: 5 });

      render(<StakeholderInput onProceed={mockOnProceed} />);

      const editButtons = screen.getAllByLabelText('Edit John Doe');
      await user.click(editButtons[0]);

      const nameInput = screen.getByRole('textbox', { name: /name/i });
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Doe');

      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      // Both views should update
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  describe('deleting stakeholders', () => {
    it('removes stakeholder after confirmation', async () => {
      const user = userEvent.setup();
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'John Doe', role: 'CEO', power: 5, interest: 5 });

      render(<StakeholderInput onProceed={mockOnProceed} />);

      // First click shows confirm (use desktop view)
      const deleteButtons = screen.getAllByLabelText('Delete John Doe');
      await user.click(deleteButtons[0]);
      // Second click confirms
      const confirmButtons = screen.getAllByLabelText('Confirm delete John Doe');
      await user.click(confirmButtons[0]);

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('0 of 50 stakeholders')).toBeInTheDocument();
    });
  });

  describe('max stakeholders limit', () => {
    it('disables add button at limit', () => {
      const store = useTool4Store.getState();
      // Add 50 stakeholders
      for (let i = 0; i < 50; i++) {
        store.addStakeholder({ name: `S${i}`, role: 'R', power: 5, interest: 5 });
      }

      render(<StakeholderInput onProceed={mockOnProceed} />);

      expect(screen.getByRole('button', { name: /add stakeholder/i })).toBeDisabled();
    });

    it('shows limit warning at max', () => {
      const store = useTool4Store.getState();
      for (let i = 0; i < 50; i++) {
        store.addStakeholder({ name: `S${i}`, role: 'R', power: 5, interest: 5 });
      }

      render(<StakeholderInput onProceed={mockOnProceed} />);

      expect(screen.getByText(/maximum of 50 stakeholders reached/i)).toBeInTheDocument();
    });
  });
});
