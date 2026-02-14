/**
 * AnimatedNumber Component Tests
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Task 7.2: Unit tests for PreviewHero component (includes AnimatedNumber)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedNumber } from './AnimatedNumber';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    span: ({
      children,
      ...props
    }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  },
  useSpring: () => ({
    set: vi.fn(),
    jump: vi.fn(),
    on: vi.fn(() => vi.fn()),
  }),
  useTransform: (spring: unknown, formatter: (val: number) => string) => ({
    on: vi.fn((event: string, callback: (value: string) => void) => {
      // Simulate calling the callback with a formatted value
      callback(formatter(1000000));
      return vi.fn();
    }),
  }),
  useReducedMotion: () => false,
}));

describe('AnimatedNumber', () => {
  describe('currency format', () => {
    it('renders with currency format', () => {
      render(<AnimatedNumber value={2400000} format="currency" />);

      // The mock returns formatted value
      const span = screen.getByRole('status');
      expect(span).toBeInTheDocument();
    });

    it('applies tabular-nums class for consistent digit width', () => {
      render(<AnimatedNumber value={2400000} format="currency" />);

      const span = screen.getByRole('status');
      expect(span).toHaveClass('tabular-nums');
    });
  });

  describe('percent format', () => {
    it('renders with percent format', () => {
      render(<AnimatedNumber value={5.2} format="percent" />);

      const span = screen.getByRole('status');
      expect(span).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has aria-live for screen reader announcements', () => {
      render(<AnimatedNumber value={1000000} format="currency" />);

      const span = screen.getByRole('status');
      expect(span).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-atomic for complete value announcement', () => {
      render(<AnimatedNumber value={1000000} format="currency" />);

      const span = screen.getByRole('status');
      expect(span).toHaveAttribute('aria-atomic', 'true');
    });

    it('has role status', () => {
      render(<AnimatedNumber value={1000000} format="currency" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('custom props', () => {
    it('applies custom className', () => {
      render(
        <AnimatedNumber
          value={1000000}
          format="currency"
          className="custom-class"
        />
      );

      const span = screen.getByRole('status');
      expect(span).toHaveClass('custom-class');
    });

    it('accepts custom duration', () => {
      // Duration is used internally, just verify component renders
      render(
        <AnimatedNumber value={1000000} format="currency" duration={2} />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});

describe('AnimatedNumber with reduced motion', () => {
  vi.mock('framer-motion', () => ({
    motion: {
      span: ({
        children,
        ...props
      }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
    },
    useSpring: () => ({
      set: vi.fn(),
      jump: vi.fn(),
      on: vi.fn(() => vi.fn()),
    }),
    useTransform: () => ({
      on: vi.fn(() => vi.fn()),
    }),
    useReducedMotion: () => true, // User prefers reduced motion
  }));

  it('renders without animation when user prefers reduced motion', () => {
    render(<AnimatedNumber value={1000000} format="currency" />);

    // Should still render the status element
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
