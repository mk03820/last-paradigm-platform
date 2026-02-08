import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidationSummary, type ValidationError } from './ValidationSummary';

describe('ValidationSummary', () => {
  const mockErrors: ValidationError[] = [
    { field: 'Meeting Count', message: 'Number of meetings is required', fieldId: 'meetingCount' },
    { field: 'Average Attendees', message: 'Please enter a valid number', fieldId: 'averageAttendees' },
  ];

  describe('Task 3: Form-Level Validation Summary', () => {
    it('should not render when no errors exist', () => {
      render(<ValidationSummary errors={[]} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should render error summary when errors exist', () => {
      render(<ValidationSummary errors={mockErrors} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/please fix the following errors/i)).toBeInTheDocument();
    });

    it('should list all validation errors', () => {
      render(<ValidationSummary errors={mockErrors} />);

      expect(screen.getByText(/meeting count/i)).toBeInTheDocument();
      expect(screen.getByText(/number of meetings is required/i)).toBeInTheDocument();
      expect(screen.getByText(/average attendees/i)).toBeInTheDocument();
    });

    it('should have clickable links to scroll to error fields', () => {
      render(<ValidationSummary errors={mockErrors} />);

      const errorButtons = screen.getAllByRole('button');
      expect(errorButtons.length).toBe(2);
    });

    it('should scroll and focus on field when error link is clicked', () => {
      // Create a mock element
      const mockElement = document.createElement('input');
      mockElement.id = 'meetingCount';
      mockElement.scrollIntoView = vi.fn();
      mockElement.focus = vi.fn();
      document.body.appendChild(mockElement);

      render(<ValidationSummary errors={mockErrors} />);

      const firstErrorButton = screen.getAllByRole('button')[0];
      fireEvent.click(firstErrorButton);

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
      expect(mockElement.focus).toHaveBeenCalled();

      document.body.removeChild(mockElement);
    });

    it('should have destructive/red styling', () => {
      render(<ValidationSummary errors={mockErrors} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-destructive/50');
      expect(alert).toHaveClass('bg-destructive/10');
    });
  });

  describe('Task 5: Screen Reader Accessibility', () => {
    it('should have role="alert" for screen reader announcement', () => {
      render(<ValidationSummary errors={mockErrors} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-labelledby linking to heading', () => {
      render(<ValidationSummary errors={mockErrors} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-labelledby', 'validation-summary-heading');
    });
  });
});
