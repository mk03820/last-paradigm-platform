import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetThresholdSelector } from './BudgetThresholdSelector';

/**
 * BudgetThresholdSelector Tests
 *
 * Story 10.1: Decision Sample Input Interface
 */

describe('BudgetThresholdSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all 4 budget tiers', () => {
      render(<BudgetThresholdSelector value="tier2" onChange={mockOnChange} />);

      expect(screen.getByText('<$50K')).toBeInTheDocument();
      expect(screen.getByText('$50K-$500K')).toBeInTheDocument();
      expect(screen.getByText('$500K-$5M')).toBeInTheDocument();
      expect(screen.getByText('>$5M')).toBeInTheDocument();
    });

    it('renders label', () => {
      render(<BudgetThresholdSelector value="tier2" onChange={mockOnChange} />);

      expect(screen.getByText('Budget Range')).toBeInTheDocument();
    });

    it('renders helper text', () => {
      render(<BudgetThresholdSelector value="tier2" onChange={mockOnChange} />);

      expect(
        screen.getByText(/Select the typical budget range/)
      ).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('shows selected tier as checked', () => {
      render(<BudgetThresholdSelector value="tier2" onChange={mockOnChange} />);

      const radios = screen.getAllByRole('radio');
      expect(radios[1]).toBeChecked(); // tier2 is second
    });

    it('calls onChange when tier is selected', () => {
      render(<BudgetThresholdSelector value="tier2" onChange={mockOnChange} />);

      const tier3Label = screen.getByText('$500K-$5M');
      fireEvent.click(tier3Label);

      expect(mockOnChange).toHaveBeenCalledWith('tier3');
    });
  });

  describe('disabled state', () => {
    it('disables all radio buttons when disabled', () => {
      render(
        <BudgetThresholdSelector
          value="tier2"
          onChange={mockOnChange}
          disabled
        />
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('does not call onChange when disabled', () => {
      render(
        <BudgetThresholdSelector
          value="tier2"
          onChange={mockOnChange}
          disabled
        />
      );

      const tier3Label = screen.getByText('$500K-$5M');
      fireEvent.click(tier3Label);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has radiogroup role', () => {
      render(<BudgetThresholdSelector value="tier2" onChange={mockOnChange} />);

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has screen reader descriptions for each tier', () => {
      render(<BudgetThresholdSelector value="tier2" onChange={mockOnChange} />);

      // Check that full labels are available for screen readers
      expect(screen.getByText('Under $50K')).toBeInTheDocument();
      expect(screen.getByText('$50K - $500K')).toBeInTheDocument();
    });
  });
});
