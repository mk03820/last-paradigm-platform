/**
 * PurchaseConfirmation Component Tests
 *
 * Story 17.6: Purchase Success Page
 * Task 7.2: Unit tests for PurchaseConfirmation component
 *
 * Tests cover:
 * - AC3: Purchase confirmation with receipt details
 * - Amount formatting
 * - Date formatting
 * - Email display
 * - Optional order ID
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PurchaseConfirmation } from './PurchaseConfirmation';

describe('PurchaseConfirmation', () => {
  const defaultProps = {
    amount: 250000, // $2,500 in cents
    currency: 'usd',
    purchasedAt: new Date('2026-02-14T14:30:00Z'),
    email: 'user@example.com',
  };

  describe('Rendering (AC3)', () => {
    it('renders the section with proper heading', () => {
      render(<PurchaseConfirmation {...defaultProps} />);

      expect(
        screen.getByRole('heading', { name: /purchase confirmation/i })
      ).toBeInTheDocument();
    });

    it('has proper aria-labelledby on section', () => {
      const { container } = render(<PurchaseConfirmation {...defaultProps} />);

      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'confirmation-heading');
    });
  });

  describe('Amount Display (AC3)', () => {
    it('displays formatted amount', () => {
      render(<PurchaseConfirmation {...defaultProps} />);

      expect(screen.getByText('$2,500')).toBeInTheDocument();
    });

    it('formats different amounts correctly', () => {
      render(
        <PurchaseConfirmation {...defaultProps} amount={199900} />
      );

      expect(screen.getByText('$1,999')).toBeInTheDocument();
    });

    it('shows Amount Paid label', () => {
      render(<PurchaseConfirmation {...defaultProps} />);

      expect(screen.getByText('Amount Paid')).toBeInTheDocument();
    });
  });

  describe('Date Display (AC3)', () => {
    it('displays formatted date', () => {
      render(<PurchaseConfirmation {...defaultProps} />);

      // Date format is "Friday, February 14, 2026 at X:XX AM/PM"
      expect(screen.getByText(/february 14, 2026/i)).toBeInTheDocument();
    });

    it('shows Purchase Date label', () => {
      render(<PurchaseConfirmation {...defaultProps} />);

      expect(screen.getByText('Purchase Date')).toBeInTheDocument();
    });
  });

  describe('Email Display (AC3)', () => {
    it('displays the email address', () => {
      render(<PurchaseConfirmation {...defaultProps} />);

      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    it('shows Receipt Sent To label', () => {
      render(<PurchaseConfirmation {...defaultProps} />);

      expect(screen.getByText('Receipt Sent To')).toBeInTheDocument();
    });

    it('displays receipt confirmation message', () => {
      render(<PurchaseConfirmation {...defaultProps} />);

      expect(
        screen.getByText(/a detailed receipt has been sent to your email address/i)
      ).toBeInTheDocument();
    });
  });

  describe('Order ID Display (AC3)', () => {
    it('does not show order ID section when not provided', () => {
      render(<PurchaseConfirmation {...defaultProps} />);

      expect(screen.queryByText('Order Reference')).not.toBeInTheDocument();
    });

    it('shows order ID when provided', () => {
      render(
        <PurchaseConfirmation {...defaultProps} orderId="ord_abc123xyz" />
      );

      expect(screen.getByText('Order Reference')).toBeInTheDocument();
      expect(screen.getByText('ord_abc123xyz')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('uses Executive Clarity theme (slate background)', () => {
      const { container } = render(<PurchaseConfirmation {...defaultProps} />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-slate-800/50');
    });

    it('card has proper border styling', () => {
      const { container } = render(<PurchaseConfirmation {...defaultProps} />);

      const card = container.querySelector('.bg-slate-800.rounded-lg');
      expect(card).toHaveClass('border', 'border-slate-700');
    });

    it('amount is bold and emphasized', () => {
      render(<PurchaseConfirmation {...defaultProps} />);

      const amount = screen.getByText('$2,500');
      expect(amount.className).toContain('font-bold');
      expect(amount.className).toContain('text-white');
    });
  });

  describe('Accessibility', () => {
    it('has proper icon aria-hidden attributes', () => {
      const { container } = render(<PurchaseConfirmation {...defaultProps} />);

      // Check that decorative icons are hidden from screen readers
      const icons = container.querySelectorAll('[aria-hidden="true"]');
      // Should have Receipt, Calendar, Mail icons, plus dividers
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles very small amounts', () => {
      render(<PurchaseConfirmation {...defaultProps} amount={100} />);

      expect(screen.getByText('$1')).toBeInTheDocument();
    });

    it('handles very large amounts', () => {
      render(<PurchaseConfirmation {...defaultProps} amount={1000000000} />);

      expect(screen.getByText('$10,000,000')).toBeInTheDocument();
    });

    it('handles long email addresses', () => {
      render(
        <PurchaseConfirmation
          {...defaultProps}
          email="very.long.email.address.that.might.overflow@example.company.com"
        />
      );

      expect(
        screen.getByText(
          'very.long.email.address.that.might.overflow@example.company.com'
        )
      ).toBeInTheDocument();
    });
  });
});
