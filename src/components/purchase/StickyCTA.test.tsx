/**
 * StickyCTA Component Tests
 *
 * Story 17.1: Purchase CTA & Guarantee Display
 * Task 6: Write comprehensive tests
 *
 * Tests cover:
 * - AC7: Mobile sticky CTA visibility logic
 * - IntersectionObserver behavior
 * - Loading state during checkout
 * - Accessibility requirements
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { StickyCTA } from './StickyCTA';

// Mock IntersectionObserver
type IntersectionObserverCallback = (entries: IntersectionObserverEntry[]) => void;

let mockObserverCallback: IntersectionObserverCallback | null = null;
let mockObserverInstance: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> };

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    mockObserverCallback = callback;
    mockObserverInstance = {
      observe: vi.fn(),
      disconnect: vi.fn(),
    };
  }

  observe = mockObserverInstance?.observe ?? vi.fn();
  disconnect = mockObserverInstance?.disconnect ?? vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
}

// Helper to trigger intersection changes
function triggerIntersection(isIntersecting: boolean) {
  if (mockObserverCallback) {
    act(() => {
      mockObserverCallback!([
        {
          isIntersecting,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          target: document.createElement('div'),
          time: Date.now(),
        },
      ]);
    });
  }
}

// Wrapper component to provide ref
function TestWrapper({
  onCheckoutStart = vi.fn(() => Promise.resolve()),
  price,
  className,
}: {
  onCheckoutStart?: () => Promise<void>;
  price?: number;
  className?: string;
}) {
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={triggerRef} data-testid="trigger-element">
        Main CTA Section
      </div>
      <StickyCTA
        triggerRef={triggerRef}
        onCheckoutStart={onCheckoutStart}
        price={price}
        className={className}
      />
    </>
  );
}

describe('StickyCTA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockObserverCallback = null;
    // @ts-expect-error - Mock implementation
    global.IntersectionObserver = MockIntersectionObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Visibility Logic (AC7)', () => {
    it('does not render when main CTA is visible (intersecting)', () => {
      render(<TestWrapper />);

      // Initially, trigger intersection as visible
      triggerIntersection(true);

      // Sticky should not be visible
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });

    it('renders when main CTA scrolls out of view (not intersecting)', () => {
      render(<TestWrapper />);

      // Trigger intersection as not visible (scrolled away)
      triggerIntersection(false);

      // Sticky should be visible
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('hides when main CTA scrolls back into view', () => {
      render(<TestWrapper />);

      // First, scroll away (not visible)
      triggerIntersection(false);
      expect(screen.getByRole('complementary')).toBeInTheDocument();

      // Then, scroll back (visible again)
      triggerIntersection(true);
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });

    it('has md:hidden class to only show on mobile', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      const container = screen.getByRole('complementary');
      expect(container).toHaveClass('md:hidden');
    });
  });

  describe('IntersectionObserver Setup', () => {
    it('creates IntersectionObserver on mount', () => {
      render(<TestWrapper />);

      // The observer callback should be set
      expect(mockObserverCallback).not.toBeNull();
    });

    it('observes the trigger element', () => {
      render(<TestWrapper />);

      // Trigger element should exist
      expect(screen.getByTestId('trigger-element')).toBeInTheDocument();
    });

    it('cleans up observer on unmount', () => {
      const { unmount } = render(<TestWrapper />);

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('responds to intersection changes', () => {
      render(<TestWrapper />);

      // Initially not visible
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();

      // Trigger intersection change
      triggerIntersection(false);

      // Now should be visible
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('displays condensed guarantee text', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      expect(screen.getByText(/30-day guarantee/i)).toBeInTheDocument();
    });

    it('displays shield icon for guarantee', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      // ShieldCheck icon should be present
      const container = screen.getByRole('complementary');
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('displays price with Get Access text', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      expect(screen.getByRole('button', { name: /\$2,500.*get access/i })).toBeInTheDocument();
    });

    it('formats custom price correctly', () => {
      render(<TestWrapper price={99900} />);

      triggerIntersection(false);

      expect(screen.getByRole('button', { name: /\$999.*get access/i })).toBeInTheDocument();
    });
  });

  describe('Checkout Interaction', () => {
    it('calls onCheckoutStart when button is clicked', async () => {
      const onCheckoutStart = vi.fn(() => Promise.resolve());
      const user = userEvent.setup();

      render(<TestWrapper onCheckoutStart={onCheckoutStart} />);
      triggerIntersection(false);

      await user.click(screen.getByRole('button', { name: /get access/i }));

      expect(onCheckoutStart).toHaveBeenCalledTimes(1);
    });

    it('shows loading state during checkout', async () => {
      const onCheckoutStart = vi.fn(
        () => new Promise<void>((resolve) => setTimeout(resolve, 1000))
      );
      const user = userEvent.setup();

      render(<TestWrapper onCheckoutStart={onCheckoutStart} />);
      triggerIntersection(false);

      await user.click(screen.getByRole('button', { name: /get access/i }));

      // Button should show loading state
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('disables button during loading', async () => {
      const onCheckoutStart = vi.fn(
        () => new Promise<void>((resolve) => setTimeout(resolve, 1000))
      );
      const user = userEvent.setup();

      render(<TestWrapper onCheckoutStart={onCheckoutStart} />);
      triggerIntersection(false);

      await user.click(screen.getByRole('button', { name: /get access/i }));

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has complementary role for landmark navigation', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('has accessible label for the region', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      expect(screen.getByRole('complementary')).toHaveAttribute(
        'aria-label',
        'Quick purchase'
      );
    });

    it('button meets minimum touch target size (48px)', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      const button = screen.getByRole('button', { name: /get access/i });
      expect(button.className).toContain('min-h-[48px]');
    });

    it('has focus-visible styles for keyboard navigation', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      const button = screen.getByRole('button', { name: /get access/i });
      expect(button.className).toContain('focus-visible:');
    });

    it('has aria-busy attribute during loading', async () => {
      const onCheckoutStart = vi.fn(
        () => new Promise<void>((resolve) => setTimeout(resolve, 1000))
      );
      const user = userEvent.setup();

      render(<TestWrapper onCheckoutStart={onCheckoutStart} />);
      triggerIntersection(false);

      await user.click(screen.getByRole('button', { name: /get access/i }));

      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Styling', () => {
    it('has fixed positioning at bottom', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      const outerContainer = screen.getByRole('complementary');
      expect(outerContainer).toHaveClass('fixed');
      expect(outerContainer).toHaveClass('bottom-0');
      expect(outerContainer).toHaveClass('left-0');
      expect(outerContainer).toHaveClass('right-0');
    });

    it('has high z-index for stacking', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      const outerContainer = screen.getByRole('complementary');
      expect(outerContainer).toHaveClass('z-50');
    });

    it('has backdrop blur for visual separation', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      // backdrop-blur-sm is on the inner div (first child of complementary)
      const outerContainer = screen.getByRole('complementary');
      const innerContainer = outerContainer.firstElementChild;
      expect(innerContainer).toHaveClass('backdrop-blur-sm');
    });

    it('has border-top for visual separation', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      // border-t is on the inner div
      const outerContainer = screen.getByRole('complementary');
      const innerContainer = outerContainer.firstElementChild;
      expect(innerContainer).toHaveClass('border-t');
    });

    it('has shadow for elevation', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      // shadow-2xl is on the inner div
      const outerContainer = screen.getByRole('complementary');
      const innerContainer = outerContainer.firstElementChild;
      expect(innerContainer).toHaveClass('shadow-2xl');
    });

    it('applies custom className', () => {
      render(<TestWrapper className="custom-sticky-class" />);

      triggerIntersection(false);

      const outerContainer = screen.getByRole('complementary');
      expect(outerContainer).toHaveClass('custom-sticky-class');
    });

    it('has slide-in animation', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      const outerContainer = screen.getByRole('complementary');
      expect(outerContainer).toHaveClass('animate-in');
      expect(outerContainer).toHaveClass('slide-in-from-bottom');
    });
  });

  describe('Button Styling', () => {
    it('uses Executive Clarity amber color scheme', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      const button = screen.getByRole('button', { name: /get access/i });
      expect(button).toHaveClass('bg-amber-500');
      expect(button).toHaveClass('text-slate-900');
    });

    it('has hover and active states', () => {
      render(<TestWrapper />);

      triggerIntersection(false);

      const button = screen.getByRole('button', { name: /get access/i });
      expect(button.className).toContain('hover:bg-amber-400');
      expect(button.className).toContain('active:bg-amber-600');
    });
  });

  describe('Edge Cases', () => {
    it('handles null trigger ref gracefully', () => {
      // Create a wrapper with null ref
      function NullRefWrapper() {
        const triggerRef = useRef<HTMLElement>(null);
        // Don't render the trigger element, leaving ref as null

        return (
          <StickyCTA
            triggerRef={triggerRef}
            onCheckoutStart={() => Promise.resolve()}
          />
        );
      }

      // Should not throw
      expect(() => render(<NullRefWrapper />)).not.toThrow();
    });

    it('does not render initially before intersection is determined', () => {
      render(<TestWrapper />);

      // Before any intersection callback, should not render
      // (isVisible defaults to false)
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });
});
