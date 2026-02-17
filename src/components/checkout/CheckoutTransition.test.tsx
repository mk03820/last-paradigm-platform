/**
 * CheckoutTransition Component Tests
 *
 * Story 17.3: Checkout Transition Experience
 * Task 6: Write comprehensive tests
 *
 * Tests cover:
 * - AC1: Full-screen branded loading overlay displays on checkout
 * - AC2: Last Paradigm branding consistent with design system
 * - AC3: Loading indicator and reassuring status text
 * - AC4: Guarantee reminder for trust reinforcement
 * - AC5: Overlay remains visible until browser navigates away
 * - AC6: Error state handling with graceful dismissal
 * - AC7: Respects prefers-reduced-motion
 * - AC8: Full viewport coverage, proper centering on all sizes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutTransition } from './CheckoutTransition';

// Mock useReducedMotion hook
const mockUseReducedMotion = vi.fn(() => false);
vi.mock('@/hooks', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}));

// Mock framer-motion to avoid animation timing issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({
        children,
        className,
        role,
        'aria-modal': ariaModal,
        'aria-labelledby': ariaLabelledby,
        'aria-describedby': ariaDescribedby,
        'aria-live': ariaLive,
        ...props
      }: React.HTMLAttributes<HTMLDivElement> & { variants?: unknown; transition?: unknown }) => (
        <div
          className={className}
          role={role}
          aria-modal={ariaModal}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          aria-live={ariaLive}
          {...props}
        >
          {children}
        </div>
      ),
    },
  };
});

describe('CheckoutTransition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseReducedMotion.mockReturnValue(false);
    document.body.style.overflow = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Visibility (AC1, AC5)', () => {
    it('renders overlay when isVisible is true', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render overlay when isVisible is false', () => {
      render(
        <CheckoutTransition
          isVisible={false}
          status="initiating"
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('covers full viewport with fixed positioning', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('fixed', 'inset-0');
    });

    it('has high z-index to appear above all content', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('z-[100]');
    });

    it('prevents body scroll when visible', () => {
      const { unmount } = render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Branding (AC2)', () => {
    it('displays Last Paradigm logo', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      expect(screen.getByText('Last')).toBeInTheDocument();
      expect(screen.getByText('Paradigm')).toBeInTheDocument();
    });

    it('uses Executive Clarity theme colors (slate-900 background)', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('bg-slate-900');
    });

    it('uses amber accent color for Paradigm text', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      const paradigmText = screen.getByText('Paradigm');
      expect(paradigmText).toHaveClass('text-amber-500');
    });
  });

  describe('Loading State (AC3)', () => {
    it('displays loading spinner in initiating state', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      // The Loader2 icon should be present
      const loaderContainer = document.querySelector('.text-amber-500');
      expect(loaderContainer).toBeInTheDocument();
    });

    it('displays appropriate status text for initiating state', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      expect(screen.getByText('Preparing your secure checkout...')).toBeInTheDocument();
      expect(screen.getByText("You'll be redirected to our secure payment page")).toBeInTheDocument();
    });

    it('displays appropriate status text for redirecting state', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="redirecting"
        />
      );

      expect(screen.getByText('Redirecting to secure payment...')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we connect you to Stripe')).toBeInTheDocument();
    });

    it('has centered content layout', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });
  });

  describe('Trust Reinforcement (AC4)', () => {
    it('displays 30-Day Money-Back Guarantee badge in loading states', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      expect(screen.getByText('30-Day Money-Back Guarantee')).toBeInTheDocument();
    });

    it('displays Stripe secure checkout badge in loading states', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      expect(screen.getByText('Secure checkout powered by Stripe')).toBeInTheDocument();
    });

    it('does not display trust badges in error state', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onClose={() => {}}
        />
      );

      expect(screen.queryByText('30-Day Money-Back Guarantee')).not.toBeInTheDocument();
      expect(screen.queryByText('Secure checkout powered by Stripe')).not.toBeInTheDocument();
    });

    it('guarantee badge has green color for positive reinforcement', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      const guaranteeText = screen.getByText('30-Day Money-Back Guarantee');
      expect(guaranteeText.closest('div')).toHaveClass('text-green-400');
    });
  });

  describe('Error State (AC6)', () => {
    it('displays error icon and title', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onClose={() => {}}
        />
      );

      expect(screen.getByText('Unable to Start Checkout')).toBeInTheDocument();
    });

    it('displays custom error message when provided', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          errorMessage="Payment service unavailable"
          onClose={() => {}}
        />
      );

      expect(screen.getByText('Payment service unavailable')).toBeInTheDocument();
    });

    it('displays default error message when none provided', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onClose={() => {}}
        />
      );

      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });

    it('renders Try Again button when onRetry is provided', () => {
      const onRetry = vi.fn();

      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onRetry={onRetry}
          onClose={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('renders Close button when onClose is provided', () => {
      const onClose = vi.fn();

      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onClose={onClose}
        />
      );

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('calls onRetry when Try Again button is clicked', async () => {
      const onRetry = vi.fn();
      const user = userEvent.setup();

      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onRetry={onRetry}
          onClose={() => {}}
        />
      );

      await user.click(screen.getByRole('button', { name: /try again/i }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Close button is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onClose={onClose}
        />
      );

      await user.click(screen.getByRole('button', { name: /close/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed in error state', () => {
      const onClose = vi.fn();

      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onClose={onClose}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on Escape in loading state', () => {
      const onClose = vi.fn();

      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
          onClose={onClose}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('error message has alert role for screen readers', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          errorMessage="Test error"
          onClose={() => {}}
        />
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Test error');
    });
  });

  describe('Reduced Motion (AC7)', () => {
    it('respects prefers-reduced-motion preference', () => {
      mockUseReducedMotion.mockReturnValue(true);

      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      // Component should still render, just without animations
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Preparing your secure checkout...')).toBeInTheDocument();
    });

    it('shows static loader icon when reduced motion is preferred', () => {
      mockUseReducedMotion.mockReturnValue(true);

      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      // The loader should be present but not animated
      const loaderContainer = document.querySelector('.text-amber-500');
      expect(loaderContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility (AC8)', () => {
    it('has proper dialog role and aria attributes', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'checkout-transition-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'checkout-transition-description');
    });

    it('has aria-live for status announcements', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-live', 'polite');
    });

    it('has screen reader status announcement in loading state', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      expect(screen.getByRole('status')).toHaveTextContent('Creating checkout session. Please wait.');
    });

    it('announces different message for redirecting state', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="redirecting"
        />
      );

      expect(screen.getByRole('status')).toHaveTextContent('Redirecting to secure checkout. Please wait.');
    });

    it('heading has proper id for aria-labelledby reference', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'checkout-transition-title');
    });

    it('description has proper id for aria-describedby reference', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      const description = document.getElementById('checkout-transition-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent("You'll be redirected to our secure payment page");
    });

    it('buttons have proper focus styles', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onRetry={() => {}}
          onClose={() => {}}
        />
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton.className).toContain('focus-visible:ring-2');
    });
  });

  describe('Focus Management', () => {
    it('focuses first button in error state', async () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onRetry={() => {}}
          onClose={() => {}}
        />
      );

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /try again/i });
        expect(document.activeElement).toBe(retryButton);
      });
    });

    it('focuses close button if no retry button', async () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onClose={() => {}}
        />
      );

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(document.activeElement).toBe(closeButton);
      });
    });
  });

  describe('Responsive Design (AC8)', () => {
    it('has responsive text sizing for logo', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      const logoText = screen.getByText('Last').parentElement;
      expect(logoText).toHaveClass('text-2xl', 'md:text-3xl');
    });

    it('has padding for small screens', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      // Loading state content has px-4 for mobile padding
      const loadingContent = screen.getByText('Preparing your secure checkout...').closest('div');
      expect(loadingContent).toHaveClass('px-4');
    });

    it('constrains content width for readability', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          errorMessage="Test error"
          onClose={() => {}}
        />
      );

      const errorContent = screen.getByText('Unable to Start Checkout').closest('div');
      expect(errorContent).toHaveClass('max-w-md');
    });
  });

  describe('Visual Design', () => {
    it('Try Again button uses amber styling', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onRetry={() => {}}
          onClose={() => {}}
        />
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toHaveClass('bg-amber-600');
    });

    it('Close button uses outline variant', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onClose={() => {}}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveClass('border-slate-600');
    });

    it('error icon has red background', () => {
      render(
        <CheckoutTransition
          isVisible={true}
          status="error"
          onClose={() => {}}
        />
      );

      const errorIconContainer = document.querySelector('.bg-red-900\\/50');
      expect(errorIconContainer).toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('transitions from initiating to redirecting state', () => {
      const { rerender } = render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      expect(screen.getByText('Preparing your secure checkout...')).toBeInTheDocument();

      rerender(
        <CheckoutTransition
          isVisible={true}
          status="redirecting"
        />
      );

      expect(screen.getByText('Redirecting to secure payment...')).toBeInTheDocument();
    });

    it('transitions from loading to error state', () => {
      const { rerender } = render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      expect(screen.getByText('Preparing your secure checkout...')).toBeInTheDocument();

      rerender(
        <CheckoutTransition
          isVisible={true}
          status="error"
          errorMessage="Failed to create checkout"
          onClose={() => {}}
        />
      );

      expect(screen.getByText('Unable to Start Checkout')).toBeInTheDocument();
      expect(screen.getByText('Failed to create checkout')).toBeInTheDocument();
    });

    it('hides overlay when isVisible changes to false', () => {
      const { rerender } = render(
        <CheckoutTransition
          isVisible={true}
          status="initiating"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(
        <CheckoutTransition
          isVisible={false}
          status="initiating"
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
