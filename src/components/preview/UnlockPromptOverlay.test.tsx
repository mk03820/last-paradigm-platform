/**
 * UnlockPromptOverlay Component Tests
 *
 * Story 16.4: Premium Card Interactions
 * Task 3.9: Write component tests for overlay behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnlockPromptOverlay } from './UnlockPromptOverlay';

// Mock Framer Motion to avoid animation timing issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the hooks
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

vi.mock('@/hooks/useTouchDevice', () => ({
  useTouchDevice: () => false,
}));

describe('UnlockPromptOverlay', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    // Reset body overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Clean up
    document.body.style.overflow = '';
  });

  it('should not render when closed', () => {
    render(<UnlockPromptOverlay isOpen={false} onClose={mockOnClose} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display the default headline', () => {
    render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Unlock this tool with Playbook 2/)
    ).toBeInTheDocument();
  });

  it('should display custom tool name in headline', () => {
    render(
      <UnlockPromptOverlay
        isOpen={true}
        onClose={mockOnClose}
        toolName="Decision Matrix"
      />
    );

    expect(
      screen.getByText(/Unlock "Decision Matrix" with Playbook 2/)
    ).toBeInTheDocument();
  });

  it('should display the default price', () => {
    render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('$2,500')).toBeInTheDocument();
  });

  it('should display custom price', () => {
    render(
      <UnlockPromptOverlay
        isOpen={true}
        onClose={mockOnClose}
        price="$1,999"
      />
    );

    expect(screen.getByText('$1,999')).toBeInTheDocument();
  });

  it('should display the CTA button', () => {
    render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByRole('link', { name: /Purchase Playbook 2/i })
    ).toBeInTheDocument();
  });

  it('should have correct purchase URL on CTA', () => {
    render(
      <UnlockPromptOverlay
        isOpen={true}
        onClose={mockOnClose}
        purchaseUrl="https://example.com/purchase"
      />
    );

    const ctaButton = screen.getByRole('link', { name: /Purchase Playbook 2/i });
    expect(ctaButton).toHaveAttribute('href', 'https://example.com/purchase');
  });

  it('should display close button', () => {
    render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /Close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

    // Click on the backdrop (the dialog container)
    const dialog = screen.getByRole('dialog');
    await user.click(dialog);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when clicking inside the modal content', async () => {
    const user = userEvent.setup();
    render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

    // Click on the price text inside the modal
    const price = screen.getByText('$2,500');
    await user.click(price);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'unlock-prompt-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'unlock-prompt-description');
  });

  it('should focus the close button when opened', async () => {
    render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

    // Wait for focus to be set
    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /Close/i });
      expect(document.activeElement).toBe(closeButton);
    });
  });

  describe('Focus trapping', () => {
    it('should trap focus within the modal', async () => {
      const user = userEvent.setup();
      render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /Close/i });
      const ctaLink = screen.getByRole('link', { name: /Purchase Playbook 2/i });

      // Focus should start on close button
      await waitFor(() => {
        expect(document.activeElement).toBe(closeButton);
      });

      // Tab to CTA
      await user.tab();
      expect(document.activeElement).toBe(ctaLink);

      // Tab should wrap back to close button
      await user.tab();
      expect(document.activeElement).toBe(closeButton);
    });

    it('should handle Shift+Tab focus wrapping', async () => {
      const user = userEvent.setup();
      render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /Close/i });
      const ctaLink = screen.getByRole('link', { name: /Purchase Playbook 2/i });

      // Focus should start on close button
      await waitFor(() => {
        expect(document.activeElement).toBe(closeButton);
      });

      // Shift+Tab should wrap to last element
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(ctaLink);
    });
  });

  describe('Body scroll prevention', () => {
    it('should prevent body scroll when open', () => {
      render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = render(
        <UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<UnlockPromptOverlay isOpen={false} onClose={mockOnClose} />);

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Description content', () => {
    it('should display the description text', () => {
      render(<UnlockPromptOverlay isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(/Get full access to all 5 diagnostic tools/)
      ).toBeInTheDocument();
    });
  });
});
