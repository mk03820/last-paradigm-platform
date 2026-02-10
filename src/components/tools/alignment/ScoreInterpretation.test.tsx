import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreInterpretation } from './ScoreInterpretation';

/**
 * ScoreInterpretation Tests
 *
 * Tests the score interpretation component that displays messaging
 * based on the user's composite score category.
 *
 * Story 9.4: Score Interpretation and Next Steps
 */

describe('ScoreInterpretation', () => {
  describe('Chaos category (score < 1.8)', () => {
    it('displays Chaos headline', () => {
      render(<ScoreInterpretation score={1.5} />);

      expect(
        screen.getByText('Critical Alignment Gaps Detected')
      ).toBeInTheDocument();
    });

    it('displays immediate action urgency', () => {
      render(<ScoreInterpretation score={1.0} />);

      expect(screen.getByText('Immediate action recommended')).toBeInTheDocument();
    });

    it('displays stabilization recommendation', () => {
      render(<ScoreInterpretation score={1.7} />);

      expect(
        screen.getByText(/Focus on stabilizing one dimension/)
      ).toBeInTheDocument();
    });
  });

  describe('Siloed category (1.8 <= score < 2.5)', () => {
    it('displays Siloed headline', () => {
      render(<ScoreInterpretation score={2.0} />);

      expect(
        screen.getByText('Departmental Silos Limiting Performance')
      ).toBeInTheDocument();
    });

    it('displays strategic intervention urgency', () => {
      render(<ScoreInterpretation score={2.2} />);

      expect(screen.getByText('Strategic intervention needed')).toBeInTheDocument();
    });

    it('displays cross-functional recommendation', () => {
      render(<ScoreInterpretation score={1.8} />);

      expect(
        screen.getByText(/Prioritize cross-functional alignment/)
      ).toBeInTheDocument();
    });
  });

  describe('Coordinated category (2.5 <= score < 3.3)', () => {
    it('displays Coordinated headline', () => {
      render(<ScoreInterpretation score={3.0} />);

      expect(
        screen.getByText('Good Foundation with Room to Improve')
      ).toBeInTheDocument();
    });

    it('displays optimization urgency', () => {
      render(<ScoreInterpretation score={2.8} />);

      expect(screen.getByText('Optimization opportunity')).toBeInTheDocument();
    });

    it('displays friction points recommendation', () => {
      render(<ScoreInterpretation score={2.5} />);

      expect(
        screen.getByText(/Focus on eliminating remaining friction points/)
      ).toBeInTheDocument();
    });
  });

  describe('Integrated category (score >= 3.3)', () => {
    it('displays Integrated headline', () => {
      render(<ScoreInterpretation score={3.5} />);

      expect(
        screen.getByText('Strong Organizational Alignment')
      ).toBeInTheDocument();
    });

    it('displays maintain urgency', () => {
      render(<ScoreInterpretation score={4.0} />);

      expect(screen.getByText('Maintain and refine')).toBeInTheDocument();
    });

    it('displays monitoring recommendation', () => {
      render(<ScoreInterpretation score={3.3} />);

      expect(
        screen.getByText(/Continue monitoring alignment/)
      ).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('renders as a region', () => {
      render(<ScoreInterpretation score={2.5} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has accessible heading', () => {
      render(<ScoreInterpretation score={2.0} />);

      expect(
        screen.getByRole('heading', { level: 3 })
      ).toBeInTheDocument();
    });
  });

  describe('boundary values', () => {
    it('handles score at 1.8 (Siloed boundary)', () => {
      render(<ScoreInterpretation score={1.8} />);

      expect(
        screen.getByText('Departmental Silos Limiting Performance')
      ).toBeInTheDocument();
    });

    it('handles score at 2.5 (Coordinated boundary)', () => {
      render(<ScoreInterpretation score={2.5} />);

      expect(
        screen.getByText('Good Foundation with Room to Improve')
      ).toBeInTheDocument();
    });

    it('handles score at 3.3 (Integrated boundary)', () => {
      render(<ScoreInterpretation score={3.3} />);

      expect(
        screen.getByText('Strong Organizational Alignment')
      ).toBeInTheDocument();
    });
  });
});
