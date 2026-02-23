import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalculateButton } from './CalculateButton';

describe('CalculateButton', () => {
  describe('Task 4: Calculate Button with Validation', () => {
    it('should render "Calculate Meeting Waste" button', () => {
      render(<CalculateButton />);

      expect(
        screen.getByRole('button', { name: /calculate meeting waste/i })
      ).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<CalculateButton disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not be disabled when disabled prop is false', () => {
      render(<CalculateButton disabled={false} onClick={() => {}} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should show loading state during calculation', async () => {
      const mockOnClick = vi.fn(
        (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<CalculateButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText(/calculating/i)).toBeInTheDocument();
      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText(/calculate meeting waste/i)).toBeInTheDocument();
      });
    });

    it('should call onClick handler when clicked', async () => {
      const mockOnClick = vi.fn();

      render(<CalculateButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call onClick when disabled', () => {
      const mockOnClick = vi.fn();

      render(<CalculateButton disabled onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should have aria-busy when loading', async () => {
      const mockOnClick = vi.fn(
        (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<CalculateButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toHaveAttribute('aria-busy', 'true');

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-busy', 'false');
      });
    });

    it('should have proper size and styling', () => {
      render(<CalculateButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
      expect(button).toHaveClass('h-14');
    });
  });
});
