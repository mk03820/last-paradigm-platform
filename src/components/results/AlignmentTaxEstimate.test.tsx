import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlignmentTaxEstimate } from './AlignmentTaxEstimate';

describe('AlignmentTaxEstimate', () => {
  const defaultProps = {
    meetingWaste: 50000,
    estimatedMin: 166667,
    estimatedMax: 200000,
  };

  describe('Range Calculation Display', () => {
    it('displays the estimated alignment tax range', () => {
      render(<AlignmentTaxEstimate {...defaultProps} />);

      // Should display range with proper formatting
      expect(screen.getByText(/\$166,667/)).toBeInTheDocument();
      expect(screen.getByText(/\$200,000/)).toBeInTheDocument();
    });

    it('displays range in correct format "$X - $Y"', () => {
      render(<AlignmentTaxEstimate {...defaultProps} />);

      // Find element containing the range
      const rangeElement = screen.getByText(/\$166,667.*\$200,000/);
      expect(rangeElement).toBeInTheDocument();
    });
  });

  describe('Estimate Language', () => {
    it('uses "estimated" language in heading', () => {
      render(<AlignmentTaxEstimate {...defaultProps} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent(/estimated/i);
    });

    it('labels as "Estimated Total Alignment Tax"', () => {
      render(<AlignmentTaxEstimate {...defaultProps} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent(/estimated total alignment tax/i);
    });
  });

  describe('Context Explanation', () => {
    it('explains meeting waste represents 25-30% of total', () => {
      render(<AlignmentTaxEstimate {...defaultProps} />);

      expect(screen.getByText(/25.*30%/)).toBeInTheDocument();
    });

    it('context text uses muted styling', () => {
      render(<AlignmentTaxEstimate {...defaultProps} />);

      const contextText = screen.getByText(/25.*30%/);
      expect(contextText).toHaveClass('text-muted-foreground');
    });
  });

  describe('Step 1 of 7 Framing', () => {
    it('displays Step 1 of 7 framing', () => {
      render(<AlignmentTaxEstimate {...defaultProps} />);

      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
      expect(screen.getByText(/of 7/i)).toBeInTheDocument();
    });

    it('explains this is first diagnostic component', () => {
      render(<AlignmentTaxEstimate {...defaultProps} />);

      // Should explain completing full diagnosis
      expect(screen.getByText(/diagnostic|diagnosis/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has appropriate section landmark', () => {
      render(<AlignmentTaxEstimate {...defaultProps} />);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('has accessible heading', () => {
      render(<AlignmentTaxEstimate {...defaultProps} />);

      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/alignment tax/i);
    });

    it('section has aria-labelledby', () => {
      render(<AlignmentTaxEstimate {...defaultProps} />);

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby');
    });
  });

  describe('Different Values', () => {
    it('displays correctly with different meeting waste values', () => {
      render(
        <AlignmentTaxEstimate
          meetingWaste={100000}
          estimatedMin={333333}
          estimatedMax={400000}
        />
      );

      expect(screen.getByText(/\$333,333/)).toBeInTheDocument();
      expect(screen.getByText(/\$400,000/)).toBeInTheDocument();
    });

    it('handles zero values gracefully', () => {
      render(
        <AlignmentTaxEstimate
          meetingWaste={0}
          estimatedMin={0}
          estimatedMax={0}
        />
      );

      // Should still render with $0 values
      expect(screen.getByText(/\$0.*\$0/)).toBeInTheDocument();
    });
  });
});
