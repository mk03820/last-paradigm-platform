/**
 * PreviewHero Component Tests
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Task 7.2: Unit tests for PreviewHero component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreviewHero } from './PreviewHero';
import { getSavingsContext } from '@/lib/services/savings-calculator';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
    h1: ({ children, ...props }: React.ComponentProps<'h1'>) => (
      <h1 {...props}>{children}</h1>
    ),
    p: ({ children, ...props }: React.ComponentProps<'p'>) => (
      <p {...props}>{children}</p>
    ),
    span: ({ children, ...props }: React.ComponentProps<'span'>) => (
      <span {...props}>{children}</span>
    ),
  },
  useSpring: () => ({
    set: vi.fn(),
    jump: vi.fn(),
    on: vi.fn(() => vi.fn()),
  }),
  useTransform: () => ({
    on: vi.fn((event: string, callback: (value: string) => void) => {
      callback('$2.4M');
      return vi.fn();
    }),
  }),
  useReducedMotion: () => false,
}));

describe('PreviewHero', () => {
  const defaultProps = {
    estimatedSavings: 2400000,
    totalAlignmentTax: 4800000,
    percentOfRevenue: 5.2,
    savingsContext: getSavingsContext(5.2),
  };

  it('renders the savings headline section', () => {
    render(<PreviewHero {...defaultProps} />);

    // Check that the headline with savings-headline id exists
    const headline = document.getElementById('savings-headline');
    expect(headline).toBeInTheDocument();
  });

  it('displays "Based on your diagnostic, you could save" text', () => {
    render(<PreviewHero {...defaultProps} />);

    expect(
      screen.getByText(/Based on your diagnostic, you could save/i)
    ).toBeInTheDocument();
  });

  it('displays "annually" with amber styling', () => {
    render(<PreviewHero {...defaultProps} />);

    const annuallyText = screen.getByText('annually');
    expect(annuallyText).toBeInTheDocument();
    expect(annuallyText).toHaveClass('text-amber-500');
  });

  it('renders BookAttribution component', () => {
    render(<PreviewHero {...defaultProps} />);

    expect(
      screen.getByText(/Based on methodology from/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/The Last Paradigm/i)).toBeInTheDocument();
  });

  it('renders PersonalizedMessage component', () => {
    render(<PreviewHero {...defaultProps} />);

    // Check for severity-based messaging
    expect(
      screen.getByText('Urgent intervention required')
    ).toBeInTheDocument();
  });

  it('passes correct props to PersonalizedMessage', () => {
    render(<PreviewHero {...defaultProps} />);

    // Check that statistics are displayed
    expect(screen.getByText(/\$4\.8M/)).toBeInTheDocument();
    expect(screen.getByText(/5\.2%/)).toBeInTheDocument();
  });

  describe('theme and styling', () => {
    it('uses Executive Clarity theme colors', () => {
      const { container } = render(<PreviewHero {...defaultProps} />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-slate-900');
      expect(section).toHaveClass('text-white');
    });

    it('has correct responsive padding', () => {
      const { container } = render(<PreviewHero {...defaultProps} />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-12');
      expect(section).toHaveClass('md:py-16');
      expect(section).toHaveClass('lg:py-24');
    });

    it('has container with max-width', () => {
      const { container } = render(<PreviewHero {...defaultProps} />);

      const innerContainer = container.querySelector('.max-w-4xl');
      expect(innerContainer).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has aria-labelledby on section', () => {
      const { container } = render(<PreviewHero {...defaultProps} />);

      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'savings-headline');
    });

    it('has id on headline for aria-labelledby reference', () => {
      render(<PreviewHero {...defaultProps} />);

      const headline = document.getElementById('savings-headline');
      expect(headline).toBeInTheDocument();
    });
  });

  describe('severity variants', () => {
    it('renders normal severity correctly', () => {
      const normalProps = {
        ...defaultProps,
        percentOfRevenue: 1,
        savingsContext: getSavingsContext(1),
      };

      render(<PreviewHero {...normalProps} />);

      expect(screen.getByText('Fine-tune your operations')).toBeInTheDocument();
    });

    it('renders significant severity correctly', () => {
      const significantProps = {
        ...defaultProps,
        percentOfRevenue: 3,
        savingsContext: getSavingsContext(3),
      };

      render(<PreviewHero {...significantProps} />);

      expect(screen.getByText('Meaningful savings await')).toBeInTheDocument();
    });

    it('renders crisis severity correctly', () => {
      render(<PreviewHero {...defaultProps} />);

      expect(
        screen.getByText('Urgent intervention required')
      ).toBeInTheDocument();
    });

    it('renders existential severity correctly', () => {
      const existentialProps = {
        ...defaultProps,
        percentOfRevenue: 10,
        savingsContext: getSavingsContext(10),
      };

      render(<PreviewHero {...existentialProps} />);

      expect(
        screen.getByText('Transform or face extinction')
      ).toBeInTheDocument();
    });
  });
});
