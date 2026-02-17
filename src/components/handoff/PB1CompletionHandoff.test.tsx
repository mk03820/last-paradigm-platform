/**
 * PB1CompletionHandoff Component Tests
 *
 * Story 15.6: PB1 Completion Handoff Prompt
 * Task 6: Write tests (AC: all)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PB1CompletionHandoff } from './PB1CompletionHandoff';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock analytics
const mockTrack = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/analytics', () => ({
  analytics: {
    track: (event: unknown) => mockTrack(event),
  },
}));

import { useSession } from 'next-auth/react';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe('PB1CompletionHandoff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('visibility (AC7)', () => {
    it('should not render when user is authenticated', () => {
      vi.mocked(useSession).mockReturnValue({
        data: { user: { id: '1', email: 'test@example.com' }, expires: '' },
        status: 'authenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);

      const { container } = render(<PB1CompletionHandoff />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should not render when session is loading', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'loading',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);

      const { container } = render(<PB1CompletionHandoff />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should not render when already dismissed', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue('true');

      const { container } = render(<PB1CompletionHandoff />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should render for anonymous users who have not dismissed (AC1)', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);

      render(<PB1CompletionHandoff />);
      expect(screen.getByText(/save your diagnostic results/i)).toBeInTheDocument();
    });
  });

  describe('value proposition content (AC2)', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    it('should display headline', () => {
      render(<PB1CompletionHandoff />);
      expect(screen.getByRole('heading', { name: /save your diagnostic results/i })).toBeInTheDocument();
    });

    it('should display "Save Results Permanently" benefit', () => {
      render(<PB1CompletionHandoff />);
      expect(screen.getByText(/save results permanently/i)).toBeInTheDocument();
    });

    it('should display "See Your Personalized Roadmap" benefit', () => {
      render(<PB1CompletionHandoff />);
      expect(screen.getByText(/see your personalized roadmap/i)).toBeInTheDocument();
    });

    it('should display "Access Playbook 2 Preview" benefit', () => {
      render(<PB1CompletionHandoff />);
      expect(screen.getByText(/access playbook 2 preview/i)).toBeInTheDocument();
    });

    it('should display dynamic alignment tax value when provided', () => {
      render(<PB1CompletionHandoff totalAlignmentTax={2500000} />);
      expect(screen.getByText('$2,500,000')).toBeInTheDocument();
    });

    it('should display estimated savings when provided', () => {
      render(<PB1CompletionHandoff totalAlignmentTax={2500000} estimatedSavings={750000} />);
      expect(screen.getByText('$750,000')).toBeInTheDocument();
    });

    it('should personalize save message with alignment tax value', () => {
      render(<PB1CompletionHandoff totalAlignmentTax={1500000} />);
      expect(screen.getByText(/never lose your \$1,500,000 alignment tax analysis/i)).toBeInTheDocument();
    });
  });

  describe('book attribution (AC6)', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    it('should display The Last Paradigm attribution', () => {
      render(<PB1CompletionHandoff />);
      expect(screen.getByText(/the last paradigm/i)).toBeInTheDocument();
    });

    it('should display methodology text', () => {
      render(<PB1CompletionHandoff />);
      expect(screen.getByText(/methodology for organizational transformation/i)).toBeInTheDocument();
    });
  });

  describe('non-blocking layout (AC3)', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    it('should render as complementary section, not modal', () => {
      render(<PB1CompletionHandoff />);
      const section = screen.getByRole('complementary');
      expect(section).toBeInTheDocument();
      expect(section.tagName).toBe('SECTION');
    });

    it('should not have modal-related ARIA attributes', () => {
      render(<PB1CompletionHandoff />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('CTA styling (AC4, AC5)', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    it('should have primary CTA with "Create Account" text', () => {
      render(<PB1CompletionHandoff />);
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should have primary CTA with Gold accent styling (bg-amber-600)', () => {
      render(<PB1CompletionHandoff />);
      const button = screen.getByRole('button', { name: /create account/i });
      expect(button).toHaveClass('bg-amber-600');
    });

    it('should have minimum 48px touch target', () => {
      render(<PB1CompletionHandoff />);
      const button = screen.getByRole('button', { name: /create account/i });
      expect(button).toHaveClass('min-h-[48px]');
    });

    it('should have secondary "Continue without account" option', () => {
      render(<PB1CompletionHandoff />);
      expect(screen.getByRole('button', { name: /continue without account/i })).toBeInTheDocument();
    });

    it('should have de-emphasized styling for secondary option', () => {
      render(<PB1CompletionHandoff />);
      const secondaryButton = screen.getByRole('button', { name: /continue without account/i });
      expect(secondaryButton).toHaveClass('text-slate-400');
    });
  });

  describe('navigation (Task 4)', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    it('should navigate to /auth/register with callbackUrl=/preview when Create Account is clicked', async () => {
      const user = userEvent.setup();
      render(<PB1CompletionHandoff />);

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(mockPush).toHaveBeenCalledWith('/auth/register?callbackUrl=/preview');
    });

    it('should call onCreateAccount callback when provided', async () => {
      const user = userEvent.setup();
      const onCreateAccount = vi.fn();
      render(<PB1CompletionHandoff onCreateAccount={onCreateAccount} />);

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(onCreateAccount).toHaveBeenCalled();
    });

    it('should call onContinueWithout callback when provided', async () => {
      const user = userEvent.setup();
      const onContinueWithout = vi.fn();
      render(<PB1CompletionHandoff onContinueWithout={onContinueWithout} />);

      await user.click(screen.getByRole('button', { name: /continue without account/i }));

      expect(onContinueWithout).toHaveBeenCalled();
    });
  });

  describe('dismissal persistence (Task 4.2, 4.3)', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    it('should set sessionStorage flag when dismissed', async () => {
      const user = userEvent.setup();
      render(<PB1CompletionHandoff />);

      await user.click(screen.getByRole('button', { name: /continue without account/i }));

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'pb1-handoff-dismissed',
        'true'
      );
    });

    it('should hide component after dismissal', async () => {
      const user = userEvent.setup();
      render(<PB1CompletionHandoff />);

      await user.click(screen.getByRole('button', { name: /continue without account/i }));

      expect(screen.queryByText(/save your diagnostic results/i)).not.toBeInTheDocument();
    });

    it('should check sessionStorage on mount', () => {
      render(<PB1CompletionHandoff />);
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('pb1-handoff-dismissed');
    });
  });

  describe('analytics tracking (Task 5)', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    it('should track "handoff_prompt_viewed" event on render', async () => {
      render(<PB1CompletionHandoff totalAlignmentTax={1000000} />);

      await waitFor(() => {
        expect(mockTrack).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'handoff_prompt_viewed',
            properties: expect.objectContaining({
              totalAlignmentTax: 1000000,
            }),
          })
        );
      });
    });

    it('should track "handoff_create_account_clicked" event', async () => {
      const user = userEvent.setup();
      render(<PB1CompletionHandoff totalAlignmentTax={1000000} estimatedSavings={300000} />);

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(mockTrack).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'handoff_create_account_clicked',
          properties: expect.objectContaining({
            totalAlignmentTax: 1000000,
            estimatedSavings: 300000,
          }),
        })
      );
    });

    it('should track "handoff_continue_without_clicked" event', async () => {
      const user = userEvent.setup();
      render(<PB1CompletionHandoff totalAlignmentTax={1000000} estimatedSavings={300000} />);

      await user.click(screen.getByRole('button', { name: /continue without account/i }));

      expect(mockTrack).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'handoff_continue_without_clicked',
          properties: expect.objectContaining({
            totalAlignmentTax: 1000000,
            estimatedSavings: 300000,
          }),
        })
      );
    });

    it('should only track view event once', async () => {
      const { rerender } = render(<PB1CompletionHandoff totalAlignmentTax={1000000} />);

      // Wait for initial tracking
      await waitFor(() => {
        expect(mockTrack).toHaveBeenCalled();
      });

      const initialCallCount = mockTrack.mock.calls.filter(
        (call) => call[0]?.name === 'handoff_prompt_viewed'
      ).length;

      // Re-render component
      rerender(<PB1CompletionHandoff totalAlignmentTax={1000000} />);

      // View event should not be tracked again
      const finalCallCount = mockTrack.mock.calls.filter(
        (call) => call[0]?.name === 'handoff_prompt_viewed'
      ).length;

      expect(finalCallCount).toBe(initialCallCount);
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    it('should have proper heading structure', () => {
      render(<PB1CompletionHandoff />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should have aria-labelledby pointing to heading', () => {
      render(<PB1CompletionHandoff />);
      const section = screen.getByRole('complementary');
      expect(section).toHaveAttribute('aria-labelledby', 'handoff-heading');
    });

    it('should have icons marked as decorative', () => {
      render(<PB1CompletionHandoff />);
      // Icons with aria-hidden should not be exposed to assistive technology
      const section = screen.getByRole('complementary');
      const svgElements = section.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  describe('className prop', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    it('should apply custom className', () => {
      render(<PB1CompletionHandoff className="my-custom-class" />);
      const section = screen.getByRole('complementary');
      expect(section).toHaveClass('my-custom-class');
    });
  });

  describe('completion badge', () => {
    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    it('should display "Diagnostic Complete" badge', () => {
      render(<PB1CompletionHandoff />);
      expect(screen.getByText(/diagnostic complete/i)).toBeInTheDocument();
    });
  });
});
