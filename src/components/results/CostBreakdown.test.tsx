import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CostBreakdown } from './CostBreakdown';

describe('CostBreakdown', () => {
  describe('rendering', () => {
    it('displays the headline number formatted as currency', () => {
      render(<CostBreakdown amount={123456} />);

      expect(screen.getByText('$123,456')).toBeInTheDocument();
    });

    it('displays "per year" label below the number', () => {
      render(<CostBreakdown amount={100000} />);

      expect(screen.getByText('per year')).toBeInTheDocument();
    });

    it('formats large amounts with commas', () => {
      render(<CostBreakdown amount={1234567} />);

      expect(screen.getByText('$1,234,567')).toBeInTheDocument();
    });

    it('rounds decimal amounts to whole dollars', () => {
      render(<CostBreakdown amount={100000.99} />);

      expect(screen.getByText('$100,001')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('has 48px font size for headline number', () => {
      render(<CostBreakdown amount={100000} />);

      const headline = screen.getByText('$100,000');
      expect(headline).toHaveClass('text-[48px]');
    });

    it('uses gold accent color (#b45309) for headline number', () => {
      render(<CostBreakdown amount={100000} />);

      const headline = screen.getByText('$100,000');
      // The color is applied via text-[#b45309] or similar tailwind class
      expect(headline).toHaveClass('text-[#b45309]');
    });

    it('uses bold font weight for headline number', () => {
      render(<CostBreakdown amount={100000} />);

      const headline = screen.getByText('$100,000');
      expect(headline).toHaveClass('font-bold');
    });

    it('uses muted styling for "per year" label', () => {
      render(<CostBreakdown amount={100000} />);

      const label = screen.getByText('per year');
      expect(label).toHaveClass('text-muted-foreground');
    });
  });

  describe('accessibility', () => {
    it('has aria-live="polite" region for screen reader announcement', () => {
      render(<CostBreakdown amount={100000} />);

      const liveRegion = screen.getByRole('region');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('includes accessible label for the result', () => {
      render(<CostBreakdown amount={100000} />);

      const liveRegion = screen.getByRole('region');
      expect(liveRegion).toHaveAttribute('aria-label');
    });

    it('includes context in the aria-label', () => {
      render(<CostBreakdown amount={100000} />);

      const liveRegion = screen.getByRole('region');
      expect(liveRegion.getAttribute('aria-label')).toContain('$100,000');
      expect(liveRegion.getAttribute('aria-label')).toContain('per year');
    });
  });

  describe('edge cases', () => {
    it('handles zero amount', () => {
      render(<CostBreakdown amount={0} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('handles small amounts', () => {
      render(<CostBreakdown amount={50} />);

      expect(screen.getByText('$50')).toBeInTheDocument();
    });
  });
});
