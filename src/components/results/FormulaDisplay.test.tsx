import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormulaDisplay } from './FormulaDisplay';

describe('FormulaDisplay', () => {
  describe('rendering', () => {
    it('displays the section heading', () => {
      render(<FormulaDisplay />);

      expect(screen.getByText('Calculation Formula')).toBeInTheDocument();
    });

    it('displays the formula label', () => {
      render(<FormulaDisplay />);

      expect(screen.getByText('Meeting Waste =')).toBeInTheDocument();
    });

    it('displays the formula components', () => {
      render(<FormulaDisplay />);

      // Check for key formula components
      expect(
        screen.getByText(/meetings × attendees × \(duration ÷ 60\) × hourly rate × 52 weeks/)
      ).toBeInTheDocument();
    });

    it('displays explanatory text', () => {
      render(<FormulaDisplay />);

      expect(
        screen.getByText(/determines the annual cost of recurring meetings/)
      ).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('has muted background for formula display', () => {
      render(<FormulaDisplay />);

      const formulaContainer = screen
        .getByText('Meeting Waste =')
        .closest('div');
      expect(formulaContainer).toHaveClass('bg-muted/50');
    });

    it('uses monospace font for formula', () => {
      render(<FormulaDisplay />);

      const formulaContainer = screen
        .getByText('Meeting Waste =')
        .closest('div');
      expect(formulaContainer).toHaveClass('font-mono');
    });

    it('has rounded corners on formula container', () => {
      render(<FormulaDisplay />);

      const formulaContainer = screen
        .getByText('Meeting Waste =')
        .closest('div');
      expect(formulaContainer).toHaveClass('rounded-lg');
    });
  });

  describe('formula accuracy', () => {
    it('includes meetings variable', () => {
      render(<FormulaDisplay />);

      // The formula contains "meetings" - use getAllByText since it appears in multiple places
      const elements = screen.getAllByText(/meetings/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('includes attendees variable', () => {
      render(<FormulaDisplay />);

      expect(screen.getByText(/attendees/)).toBeInTheDocument();
    });

    it('includes duration conversion to hours', () => {
      render(<FormulaDisplay />);

      expect(screen.getByText(/duration ÷ 60/)).toBeInTheDocument();
    });

    it('includes hourly rate', () => {
      render(<FormulaDisplay />);

      expect(screen.getByText(/hourly rate/)).toBeInTheDocument();
    });

    it('includes 52 weeks per year', () => {
      render(<FormulaDisplay />);

      expect(screen.getByText(/52 weeks/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      render(<FormulaDisplay />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Calculation Formula');
    });
  });
});
