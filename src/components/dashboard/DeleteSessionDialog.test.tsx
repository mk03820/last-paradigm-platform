import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteSessionDialog } from './DeleteSessionDialog';

describe('DeleteSessionDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <DeleteSessionDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders dialog when open', () => {
    render(
      <DeleteSessionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    // Check for the dialog title (heading) and description
    expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
    // Both title and button have "Delete Session" - check for the heading
    expect(screen.getAllByText('Delete Session')).toHaveLength(2);
  });

  it('displays warning message', () => {
    render(
      <DeleteSessionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    expect(screen.getByText(/permanently removed/i)).toBeInTheDocument();
  });

  it('has Cancel and Delete buttons', () => {
    render(
      <DeleteSessionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete session/i })).toBeInTheDocument();
  });

  it('calls onOpenChange when Cancel is clicked', () => {
    render(
      <DeleteSessionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onConfirm when Delete is clicked', () => {
    render(
      <DeleteSessionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /delete session/i }));

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('shows loading state when loading', () => {
    render(
      <DeleteSessionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        loading={true}
      />
    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('disables buttons when loading', () => {
    render(
      <DeleteSessionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        loading={true}
      />
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
  });
});
