import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DecisionSampleForm } from './DecisionSampleForm';

/**
 * DecisionSampleForm Tests
 *
 * Story 10.1: Decision Sample Input Interface
 */

describe('DecisionSampleForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all form fields', () => {
      render(<DecisionSampleForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Decision Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Request Date/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Decision Date/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Implementation Date/)).toBeInTheDocument();
    });

    it('renders Add Decision button for new sample', () => {
      render(<DecisionSampleForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: 'Add Decision' })).toBeInTheDocument();
    });

    it('renders Update button when editing', () => {
      const sample = {
        id: '1',
        description: 'Test decision',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      };
      render(
        <DecisionSampleForm
          sample={sample}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isEditing
        />
      );

      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('renders Delete button when editing', () => {
      const sample = {
        id: '1',
        description: 'Test decision',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      };
      render(
        <DecisionSampleForm
          sample={sample}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
          isEditing
        />
      );

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('pre-fills form when editing existing sample', () => {
      const sample = {
        id: '1',
        description: 'Test decision',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
        implementationDate: '2024-06-20',
      };
      render(
        <DecisionSampleForm
          sample={sample}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isEditing
        />
      );

      expect(screen.getByLabelText(/Decision Description/)).toHaveValue('Test decision');
      expect(screen.getByLabelText(/Request Date/)).toHaveValue('2024-06-01');
      expect(screen.getByLabelText(/Decision Date/)).toHaveValue('2024-06-15');
      expect(screen.getByLabelText(/Implementation Date/)).toHaveValue('2024-06-20');
    });
  });

  describe('validation', () => {
    it('shows error when description is empty', async () => {
      const user = userEvent.setup();
      render(<DecisionSampleForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      await user.click(screen.getByRole('button', { name: 'Add Decision' }));

      expect(screen.getByRole('alert')).toHaveTextContent('Description is required');
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('shows error when description is too short', async () => {
      const user = userEvent.setup();
      render(<DecisionSampleForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Decision Description/), 'Test');
      await user.click(screen.getByRole('button', { name: 'Add Decision' }));

      expect(screen.getByRole('alert')).toHaveTextContent('at least 5 characters');
    });

    it('shows error when request date is missing', async () => {
      const user = userEvent.setup();
      render(<DecisionSampleForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Decision Description/), 'Valid description');
      await user.click(screen.getByRole('button', { name: 'Add Decision' }));

      expect(screen.getByRole('alert')).toHaveTextContent('Request date is required');
    });

    it('shows error when decision date is before request date', async () => {
      const user = userEvent.setup();
      render(<DecisionSampleForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Decision Description/), 'Valid description');
      fireEvent.change(screen.getByLabelText(/Request Date/), {
        target: { value: '2024-06-15' },
      });
      fireEvent.change(screen.getByLabelText(/Decision Date/), {
        target: { value: '2024-06-01' },
      });
      await user.click(screen.getByRole('button', { name: 'Add Decision' }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Decision date must be on or after request date'
      );
    });
  });

  describe('submission', () => {
    it('calls onSave with valid data', async () => {
      const user = userEvent.setup();
      render(<DecisionSampleForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Decision Description/), 'Valid description');
      fireEvent.change(screen.getByLabelText(/Request Date/), {
        target: { value: '2024-06-01' },
      });
      fireEvent.change(screen.getByLabelText(/Decision Date/), {
        target: { value: '2024-06-15' },
      });
      await user.click(screen.getByRole('button', { name: 'Add Decision' }));

      expect(mockOnSave).toHaveBeenCalledWith({
        description: 'Valid description',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
        implementationDate: undefined,
      });
    });

    it('calls onCancel when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<DecisionSampleForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('calls onDelete when Delete is clicked', async () => {
      const user = userEvent.setup();
      const sample = {
        id: '1',
        description: 'Test decision',
        requestDate: '2024-06-01',
        decisionDate: '2024-06-15',
      };
      render(
        <DecisionSampleForm
          sample={sample}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
          isEditing
        />
      );

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      expect(mockOnDelete).toHaveBeenCalled();
    });
  });

  describe('character count', () => {
    it('displays character count', async () => {
      const user = userEvent.setup();
      render(<DecisionSampleForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByText(/\(0\/200\)/)).toBeInTheDocument();

      await user.type(screen.getByLabelText(/Decision Description/), 'Test');

      expect(screen.getByText(/\(4\/200\)/)).toBeInTheDocument();
    });
  });
});
