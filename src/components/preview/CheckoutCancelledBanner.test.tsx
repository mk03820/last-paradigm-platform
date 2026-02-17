/**
 * CheckoutCancelledBanner Component Tests
 *
 * Story 17.2: Stripe Checkout Integration
 * Task 5: Create cancel return handler
 * Covers: AC6 (appropriate messaging when user returns from cancelled checkout)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckoutCancelledBanner } from './CheckoutCancelledBanner';

// Mock next/navigation
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('CheckoutCancelledBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('checkout');
  });

  describe('Visibility', () => {
    it('should not render when checkout param is not present', () => {
      const { container } = render(<CheckoutCancelledBanner />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when checkout param is not "cancelled"', () => {
      mockSearchParams.set('checkout', 'success');
      const { container } = render(<CheckoutCancelledBanner />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when checkout param is "cancelled"', () => {
      mockSearchParams.set('checkout', 'cancelled');
      render(<CheckoutCancelledBanner />);
      expect(
        screen.getByText(/your checkout was cancelled/i)
      ).toBeInTheDocument();
    });
  });

  describe('Content (AC6)', () => {
    beforeEach(() => {
      mockSearchParams.set('checkout', 'cancelled');
    });

    it('should display reassuring message', () => {
      render(<CheckoutCancelledBanner />);
      expect(
        screen.getByText(/your progress is saved/i)
      ).toBeInTheDocument();
    });

    it('should indicate user can continue anytime', () => {
      render(<CheckoutCancelledBanner />);
      expect(
        screen.getByText(/you can continue anytime/i)
      ).toBeInTheDocument();
    });

    it('should show continue to checkout button on larger screens', () => {
      render(<CheckoutCancelledBanner />);
      expect(
        screen.getByRole('button', { name: /continue to checkout/i })
      ).toBeInTheDocument();
    });

    it('should show dismiss button', () => {
      render(<CheckoutCancelledBanner />);
      expect(
        screen.getByRole('button', { name: /dismiss message/i })
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockSearchParams.set('checkout', 'cancelled');
    });

    it('should have role="alert" for screen readers', () => {
      render(<CheckoutCancelledBanner />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      render(<CheckoutCancelledBanner />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('should have accessible dismiss button label', () => {
      render(<CheckoutCancelledBanner />);
      const dismissButton = screen.getByRole('button', {
        name: /dismiss message/i,
      });
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss message');
    });
  });

  describe('Dismiss Behavior', () => {
    beforeEach(() => {
      mockSearchParams.set('checkout', 'cancelled');
      // Mock window.location for URL cleanup test
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/preview',
        },
        writable: true,
      });
    });

    it('should hide banner when dismiss button is clicked', () => {
      render(<CheckoutCancelledBanner />);

      const dismissButton = screen.getByRole('button', {
        name: /dismiss message/i,
      });
      fireEvent.click(dismissButton);

      expect(
        screen.queryByText(/your checkout was cancelled/i)
      ).not.toBeInTheDocument();
    });

    it('should update URL to remove checkout param when dismissed', () => {
      render(<CheckoutCancelledBanner />);

      const dismissButton = screen.getByRole('button', {
        name: /dismiss message/i,
      });
      fireEvent.click(dismissButton);

      expect(mockReplace).toHaveBeenCalledWith('/preview', { scroll: false });
    });

    it('should preserve other URL params when dismissed', () => {
      mockSearchParams.set('other', 'value');
      render(<CheckoutCancelledBanner />);

      const dismissButton = screen.getByRole('button', {
        name: /dismiss message/i,
      });
      fireEvent.click(dismissButton);

      // Should keep 'other' param but remove 'checkout'
      expect(mockReplace).toHaveBeenCalledWith('/preview?other=value', {
        scroll: false,
      });
    });
  });

  describe('Continue to Checkout', () => {
    beforeEach(() => {
      mockSearchParams.set('checkout', 'cancelled');
    });

    it('should scroll to purchase CTA when continue button is clicked', () => {
      // Create mock CTA element
      const mockCta = document.createElement('div');
      mockCta.setAttribute('data-purchase-cta', '');
      mockCta.scrollIntoView = vi.fn();
      document.body.appendChild(mockCta);

      render(<CheckoutCancelledBanner />);

      const continueButton = screen.getByRole('button', {
        name: /continue to checkout/i,
      });
      fireEvent.click(continueButton);

      expect(mockCta.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });

      // Cleanup
      document.body.removeChild(mockCta);
    });

    it('should dismiss banner after continue button click', () => {
      render(<CheckoutCancelledBanner />);

      const continueButton = screen.getByRole('button', {
        name: /continue to checkout/i,
      });
      fireEvent.click(continueButton);

      expect(
        screen.queryByText(/your checkout was cancelled/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    beforeEach(() => {
      mockSearchParams.set('checkout', 'cancelled');
    });

    it('should apply custom className', () => {
      render(<CheckoutCancelledBanner className="custom-class" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-class');
    });

    it('should have animation class for slide-in effect', () => {
      render(<CheckoutCancelledBanner />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('animate-in');
    });
  });
});
