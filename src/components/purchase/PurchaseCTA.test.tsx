/**
 * PurchaseCTA Component Tests
 *
 * Story 17.1: Purchase CTA & Guarantee Display
 * Task 6: Write comprehensive tests
 *
 * Tests cover:
 * - AC1: CTA button with $2,500 pricing
 * - AC4: Minimum touch target size (48px), high-contrast colors
 * - AC5: Hover and focus states
 * - AC6: Value proposition text
 * - AC8: Loading state and click handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PurchaseCTA } from './PurchaseCTA';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('PurchaseCTA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering (AC1, AC6)', () => {
    it('renders the section with proper heading', () => {
      render(<PurchaseCTA />);

      expect(
        screen.getByRole('heading', { name: /ready to transform your organization/i })
      ).toBeInTheDocument();
    });

    it('displays the value proposition description', () => {
      render(<PurchaseCTA />);

      expect(
        screen.getByText(/get instant access to all 10 diagnostic tools/i)
      ).toBeInTheDocument();
    });

    it('displays the benefits list', () => {
      render(<PurchaseCTA />);

      expect(screen.getByText('Complete 10-tool diagnostic suite')).toBeInTheDocument();
      expect(screen.getByText('Personalized transformation roadmap')).toBeInTheDocument();
      expect(screen.getByText('Executive-ready reports & insights')).toBeInTheDocument();
      expect(screen.getByText('Lifetime access to your results')).toBeInTheDocument();
    });

    it('renders the CTA button with default price ($2,500)', () => {
      render(<PurchaseCTA />);

      const button = screen.getByRole('button', { name: /unlock your transformation.*\$2,500/i });
      expect(button).toBeInTheDocument();
    });

    it('renders the GuaranteeBadge component', () => {
      render(<PurchaseCTA />);

      expect(screen.getByText(/30-day money-back guarantee/i)).toBeInTheDocument();
    });

    it('formats custom price correctly', () => {
      render(<PurchaseCTA price={199900} />);

      expect(screen.getByRole('button', { name: /\$1,999/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility (AC4, AC5)', () => {
    it('has proper aria-labelledby on section', () => {
      const { container } = render(<PurchaseCTA />);

      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'purchase-cta-heading');
    });

    it('has id on heading for aria-labelledby reference', () => {
      render(<PurchaseCTA />);

      const heading = screen.getByRole('heading', { name: /ready to transform/i });
      expect(heading).toHaveAttribute('id', 'purchase-cta-heading');
    });

    it('button meets minimum touch target size (48px)', () => {
      render(<PurchaseCTA />);

      const button = screen.getByRole('button', { name: /unlock your transformation/i });
      expect(button.className).toContain('min-h-[48px]');
    });

    it('button has focus-visible styles for keyboard navigation', () => {
      render(<PurchaseCTA />);

      const button = screen.getByRole('button', { name: /unlock your transformation/i });
      expect(button.className).toContain('focus-visible:');
    });

    it('button has high-contrast amber color scheme', () => {
      render(<PurchaseCTA />);

      const button = screen.getByRole('button', { name: /unlock your transformation/i });
      expect(button.className).toContain('bg-amber-500');
      expect(button.className).toContain('text-slate-900');
    });

    it('button has aria-busy when loading', async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const user = userEvent.setup();
      render(<PurchaseCTA />);

      const button = screen.getByRole('button', { name: /unlock your transformation/i });
      await user.click(button);

      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('has screen reader text during loading state', async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const user = userEvent.setup();
      render(<PurchaseCTA />);

      await user.click(screen.getByRole('button', { name: /unlock your transformation/i }));

      expect(screen.getByText(/please wait while we process your request/i)).toBeInTheDocument();
    });
  });

  describe('Hover and Focus States (AC5)', () => {
    it('has hover state transition classes', () => {
      render(<PurchaseCTA />);

      const button = screen.getByRole('button', { name: /unlock your transformation/i });
      expect(button.className).toContain('hover:bg-amber-400');
      expect(button.className).toContain('hover:shadow-xl');
      expect(button.className).toContain('transition-all');
      expect(button.className).toContain('duration-200');
    });

    it('has active state for press feedback', () => {
      render(<PurchaseCTA />);

      const button = screen.getByRole('button', { name: /unlock your transformation/i });
      expect(button.className).toContain('active:bg-amber-600');
    });

    it('has focus ring with offset for visibility on dark background', () => {
      render(<PurchaseCTA />);

      const button = screen.getByRole('button', { name: /unlock your transformation/i });
      expect(button.className).toContain('focus-visible:ring-2');
      expect(button.className).toContain('focus-visible:ring-amber-400');
      expect(button.className).toContain('focus-visible:ring-offset-slate-900');
    });
  });

  describe('Click Handler and Loading State (AC8)', () => {
    it('calls onCheckoutStart when button is clicked', async () => {
      const onCheckoutStart = vi.fn();
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ url: 'https://checkout.stripe.com/session' }),
      });

      const user = userEvent.setup();
      render(<PurchaseCTA onCheckoutStart={onCheckoutStart} />);

      await user.click(screen.getByRole('button', { name: /unlock your transformation/i }));

      expect(onCheckoutStart).toHaveBeenCalledTimes(1);
    });

    it('displays loading state with spinner during checkout', async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const user = userEvent.setup();
      render(<PurchaseCTA />);

      const button = screen.getByRole('button', { name: /unlock your transformation/i });
      await user.click(button);

      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });

    it('disables button during loading to prevent double-clicks', async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const user = userEvent.setup();
      render(<PurchaseCTA />);

      const button = screen.getByRole('button', { name: /unlock your transformation/i });
      await user.click(button);

      expect(button).toBeDisabled();
    });

    it('calls onCheckoutComplete with URL on success', async () => {
      const checkoutUrl = 'https://checkout.stripe.com/session/123';
      const onCheckoutComplete = vi.fn();

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ url: checkoutUrl }),
      });

      const user = userEvent.setup();
      render(<PurchaseCTA onCheckoutComplete={onCheckoutComplete} />);

      await user.click(screen.getByRole('button', { name: /unlock your transformation/i }));

      await waitFor(() => {
        expect(onCheckoutComplete).toHaveBeenCalledWith(checkoutUrl);
      });
    });

    it('redirects to Stripe checkout URL on success', async () => {
      const checkoutUrl = 'https://checkout.stripe.com/session/123';

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ url: checkoutUrl }),
      });

      const user = userEvent.setup();
      render(<PurchaseCTA />);

      await user.click(screen.getByRole('button', { name: /unlock your transformation/i }));

      await waitFor(() => {
        expect(mockLocation.href).toBe(checkoutUrl);
      });
    });

    it('makes POST request to checkout session API', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ url: 'https://checkout.stripe.com/session' }),
      });

      const user = userEvent.setup();
      render(<PurchaseCTA />);

      await user.click(screen.getByRole('button', { name: /unlock your transformation/i }));

      expect(mockFetch).toHaveBeenCalledWith('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: 'price_playbook2' }),
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when checkout fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Payment service unavailable' }),
      });

      const user = userEvent.setup();
      render(<PurchaseCTA />);

      await user.click(screen.getByRole('button', { name: /unlock your transformation/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/payment service unavailable/i);
      });
    });

    it('calls onCheckoutError when checkout fails', async () => {
      const onCheckoutError = vi.fn();

      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Network error' }),
      });

      const user = userEvent.setup();
      render(<PurchaseCTA onCheckoutError={onCheckoutError} />);

      await user.click(screen.getByRole('button', { name: /unlock your transformation/i }));

      await waitFor(() => {
        expect(onCheckoutError).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    it('re-enables button after error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Error' }),
      });

      const user = userEvent.setup();
      render(<PurchaseCTA />);

      const button = screen.getByRole('button', { name: /unlock your transformation/i });
      await user.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it('handles network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network request failed'));

      const user = userEvent.setup();
      render(<PurchaseCTA />);

      await user.click(screen.getByRole('button', { name: /unlock your transformation/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('handles missing checkout URL in response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}), // Missing URL
      });

      const user = userEvent.setup();
      render(<PurchaseCTA />);

      await user.click(screen.getByRole('button', { name: /unlock your transformation/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/no checkout url/i);
      });
    });
  });

  describe('Disabled State', () => {
    it('respects disabled prop', () => {
      render(<PurchaseCTA disabled />);

      const button = screen.getByRole('button', { name: /unlock your transformation/i });
      expect(button).toBeDisabled();
    });

    it('does not call onCheckoutStart when disabled', async () => {
      const onCheckoutStart = vi.fn();

      const user = userEvent.setup();
      render(<PurchaseCTA disabled onCheckoutStart={onCheckoutStart} />);

      const button = screen.getByRole('button', { name: /unlock your transformation/i });
      await user.click(button);

      expect(onCheckoutStart).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('uses Executive Clarity theme colors (slate-900 background)', () => {
      const { container } = render(<PurchaseCTA />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-slate-900');
    });

    it('applies custom className', () => {
      const { container } = render(<PurchaseCTA className="custom-class" />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-class');
    });

    it('has responsive padding', () => {
      const { container } = render(<PurchaseCTA />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-12');
      expect(section).toHaveClass('md:py-16');
      expect(section).toHaveClass('lg:py-20');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to section element', () => {
      const ref = { current: null } as React.RefObject<HTMLElement | null>;
      render(<PurchaseCTA ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('SECTION');
    });
  });
});
