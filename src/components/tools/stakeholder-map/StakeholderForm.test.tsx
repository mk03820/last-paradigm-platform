import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StakeholderForm } from './StakeholderForm';

/**
 * StakeholderForm Tests
 *
 * Story 11.1: Stakeholder Input Interface
 * Covers: AC1 (form fields), AC2 (calibration guidance)
 */

// Mock the tooltip provider
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('StakeholderForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders form title for add mode', () => {
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      // Title appears in card header, button text also matches
      expect(screen.getAllByText('Add Stakeholder').length).toBeGreaterThanOrEqual(1);
    });

    it('renders form title for edit mode', () => {
      render(
        <StakeholderForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing
          stakeholder={{
            id: '1',
            name: 'John',
            role: 'CEO',
            power: 5,
            interest: 5,
          }}
        />
      );
      expect(screen.getByText('Edit Stakeholder')).toBeInTheDocument();
    });

    it('renders name input', () => {
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('renders role input', () => {
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    });

    it('renders power slider', () => {
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      expect(screen.getByLabelText(/stakeholder power level/i)).toBeInTheDocument();
    });

    it('renders interest slider', () => {
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      expect(screen.getByLabelText(/stakeholder interest level/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      expect(screen.getByRole('button', { name: 'Add Stakeholder' })).toBeInTheDocument();
    });

    it('renders cancel button', () => {
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      // There are two cancel buttons - the X icon in header and the Cancel text button
      expect(screen.getAllByRole('button', { name: 'Cancel' }).length).toBeGreaterThanOrEqual(1);
    });

    it('populates form with existing stakeholder data', () => {
      render(
        <StakeholderForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing
          stakeholder={{
            id: '1',
            name: 'John Doe',
            role: 'CEO',
            power: 8,
            interest: 7,
          }}
        />
      );
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('CEO')).toBeInTheDocument();
    });
  });

  describe('quadrant preview', () => {
    it('shows quadrant preview based on power/interest', () => {
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      // Default power=5, interest=5 should be Monitor quadrant
      expect(screen.getByText(/quadrant:\s*monitor/i)).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('shows error when name is empty', async () => {
      const user = userEvent.setup();
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      await user.type(screen.getByLabelText(/role/i), 'CEO');
      await user.click(screen.getByRole('button', { name: 'Add Stakeholder' }));

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows error when role is empty', async () => {
      const user = userEvent.setup();
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.click(screen.getByRole('button', { name: 'Add Stakeholder' }));

      expect(screen.getByText('Role is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('calls onSubmit with form data', async () => {
      const user = userEvent.setup();
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/role/i), 'CEO');
      await user.click(screen.getByRole('button', { name: 'Add Stakeholder' }));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        role: 'CEO',
        power: 5, // default
        interest: 5, // default
      });
    });

    it('calls onCancel when cancel clicked', async () => {
      const user = userEvent.setup();
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Click the text Cancel button (not the X icon)
      const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
      await user.click(cancelButtons[cancelButtons.length - 1]);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('trims whitespace from name and role', async () => {
      const user = userEvent.setup();
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      await user.type(screen.getByLabelText(/name/i), '  John Doe  ');
      await user.type(screen.getByLabelText(/role/i), '  CEO  ');
      await user.click(screen.getByRole('button', { name: 'Add Stakeholder' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          role: 'CEO',
        })
      );
    });
  });

  describe('role autocomplete', () => {
    it('shows suggestions when typing', async () => {
      const user = userEvent.setup();
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByLabelText(/role/i));
      await user.type(screen.getByLabelText(/role/i), 'CE');

      // Should show CEO suggestion
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('CEO')).toBeInTheDocument();
    });

    it('selects suggestion on click', async () => {
      const user = userEvent.setup();
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByLabelText(/role/i));
      await user.type(screen.getByLabelText(/role/i), 'CE');

      const ceoOption = screen.getByRole('option', { name: 'CEO' });
      await user.click(ceoOption);

      expect(screen.getByDisplayValue('CEO')).toBeInTheDocument();
    });
  });

  describe('power/interest sliders', () => {
    it('shows power description based on value', () => {
      render(
        <StakeholderForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          stakeholder={{
            id: '1',
            name: 'Test',
            role: 'CEO',
            power: 10,
            interest: 5,
          }}
        />
      );

      expect(screen.getByText(/very high.*approve or veto/i)).toBeInTheDocument();
    });

    it('shows interest description based on value', () => {
      render(
        <StakeholderForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          stakeholder={{
            id: '1',
            name: 'Test',
            role: 'CEO',
            power: 5,
            interest: 10,
          }}
        />
      );

      expect(screen.getByText(/very high.*changes significantly/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has required field indicators', () => {
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Check for asterisks indicating required fields
      const container = document.body;
      const asterisks = container.querySelectorAll('.text-destructive');
      expect(asterisks.length).toBeGreaterThanOrEqual(2); // name and role
    });

    it('has help buttons for calibration', () => {
      render(
        <StakeholderForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByLabelText('Power Level Guide')).toBeInTheDocument();
      expect(screen.getByLabelText('Interest Level Guide')).toBeInTheDocument();
    });
  });
});
