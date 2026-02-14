/**
 * PreviewCard Component Tests
 *
 * Story 16.4: Premium Card Interactions
 * Task 1.6: Write unit tests for hover state styling
 * Task 4.6: Write tests for touch interaction sequences
 * Task 7.7: Write keyboard navigation tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreviewCard, type PreviewToolData } from './PreviewCard';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      whileHover,
      whileTap,
      variants,
      initial,
      animate,
      transition,
      ...props
    }: React.ComponentProps<'div'> & {
      whileHover?: unknown;
      whileTap?: unknown;
      variants?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    }) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
}));

// Mock hooks
const mockUseReducedMotion = vi.fn(() => false);
const mockUseTouchDevice = vi.fn(() => false);

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}));

vi.mock('@/hooks/useTouchDevice', () => ({
  useTouchDevice: () => mockUseTouchDevice(),
}));

// Mock UnlockPromptOverlay
vi.mock('./UnlockPromptOverlay', () => ({
  UnlockPromptOverlay: ({
    isOpen,
    onClose,
    toolName,
  }: {
    isOpen: boolean;
    onClose: () => void;
    toolName?: string;
  }) =>
    isOpen ? (
      <div data-testid="unlock-overlay">
        <span>Unlock {toolName}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

describe('PreviewCard', () => {
  const mockTool: PreviewToolData = {
    id: 1,
    name: 'Decision Rights & Delegation Framework',
    shortName: 'Delegation Framework',
    description: 'Clarifies who can make which decisions without escalation.',
    category: 'Decision Making',
  };

  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
    mockUseTouchDevice.mockReturnValue(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the tool number badge', () => {
      render(<PreviewCard tool={mockTool} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should render the tool short name', () => {
      render(<PreviewCard tool={mockTool} />);

      expect(screen.getByText('Delegation Framework')).toBeInTheDocument();
    });

    it('should render the tool full name', () => {
      render(<PreviewCard tool={mockTool} />);

      expect(
        screen.getByText('Decision Rights & Delegation Framework')
      ).toBeInTheDocument();
    });

    it('should render the category tag when provided', () => {
      render(<PreviewCard tool={mockTool} />);

      expect(screen.getByText('Decision Making')).toBeInTheDocument();
    });

    it('should not render category when not provided', () => {
      const toolWithoutCategory = { ...mockTool, category: undefined };
      render(<PreviewCard tool={toolWithoutCategory} />);

      expect(screen.queryByText('Decision Making')).not.toBeInTheDocument();
    });

    it('should apply blur classes when isBlurred is true', () => {
      render(<PreviewCard tool={mockTool} isBlurred={true} />);

      const title = screen.getByText('Delegation Framework');
      expect(title).toHaveClass('blur-[2px]');
    });

    it('should not apply blur classes when isBlurred is false', () => {
      render(<PreviewCard tool={mockTool} isBlurred={false} />);

      const title = screen.getByText('Delegation Framework');
      expect(title).not.toHaveClass('blur-[2px]');
    });
  });

  describe('Accessibility', () => {
    it('should be focusable with tabIndex 0', () => {
      render(<PreviewCard tool={mockTool} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('should have appropriate aria-label', () => {
      render(<PreviewCard tool={mockTool} isBlurred={true} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute(
        'aria-label',
        'Decision Rights & Delegation Framework - Click to unlock'
      );
    });

    it('should have aria-label without unlock text when not blurred', () => {
      render(<PreviewCard tool={mockTool} isBlurred={false} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute(
        'aria-label',
        'Decision Rights & Delegation Framework'
      );
    });
  });

  describe('Keyboard interactions', () => {
    it('should open unlock prompt on Enter key when blurred', async () => {
      const user = userEvent.setup({ delay: null });
      render(<PreviewCard tool={mockTool} isBlurred={true} />);

      const card = screen.getByRole('button');
      card.focus();

      await user.keyboard('{Enter}');

      expect(screen.getByTestId('unlock-overlay')).toBeInTheDocument();
    });

    it('should open unlock prompt on Space key when blurred', async () => {
      const user = userEvent.setup({ delay: null });
      render(<PreviewCard tool={mockTool} isBlurred={true} />);

      const card = screen.getByRole('button');
      card.focus();

      await user.keyboard(' ');

      expect(screen.getByTestId('unlock-overlay')).toBeInTheDocument();
    });

    it('should not open unlock prompt when not blurred', async () => {
      const user = userEvent.setup({ delay: null });
      render(<PreviewCard tool={mockTool} isBlurred={false} />);

      const card = screen.getByRole('button');
      card.focus();

      await user.keyboard('{Enter}');

      expect(screen.queryByTestId('unlock-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Mouse interactions', () => {
    it('should show unlock prompt on click when blurred', async () => {
      const user = userEvent.setup({ delay: null });
      render(<PreviewCard tool={mockTool} isBlurred={true} />);

      const card = screen.getByRole('button');
      await user.click(card);

      expect(screen.getByTestId('unlock-overlay')).toBeInTheDocument();
    });

    it('should not show unlock prompt when not blurred', async () => {
      const user = userEvent.setup({ delay: null });
      render(<PreviewCard tool={mockTool} isBlurred={false} />);

      const card = screen.getByRole('button');
      await user.click(card);

      expect(screen.queryByTestId('unlock-overlay')).not.toBeInTheDocument();
    });

    it('should close unlock prompt when close button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<PreviewCard tool={mockTool} isBlurred={true} />);

      // Open overlay
      const card = screen.getByRole('button');
      await user.click(card);

      expect(screen.getByTestId('unlock-overlay')).toBeInTheDocument();

      // Close overlay
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(screen.queryByTestId('unlock-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Touch interactions', () => {
    beforeEach(() => {
      mockUseTouchDevice.mockReturnValue(true);
    });

    it('should show hover state on first tap', () => {
      render(<PreviewCard tool={mockTool} isBlurred={true} />);

      const card = screen.getByRole('button');
      fireEvent.touchStart(card);

      // First tap should not immediately show unlock prompt
      expect(screen.queryByTestId('unlock-overlay')).not.toBeInTheDocument();
    });

    it('should show unlock prompt on second tap', () => {
      render(<PreviewCard tool={mockTool} isBlurred={true} />);

      const card = screen.getByRole('button');

      // First tap
      fireEvent.touchStart(card);
      expect(screen.queryByTestId('unlock-overlay')).not.toBeInTheDocument();

      // Second tap
      fireEvent.touchStart(card);
      expect(screen.getByTestId('unlock-overlay')).toBeInTheDocument();
    });

    it('should reset touch state after timeout', () => {
      render(<PreviewCard tool={mockTool} isBlurred={true} />);

      const card = screen.getByRole('button');

      // First tap
      fireEvent.touchStart(card);

      // Advance timer past the 3 second timeout
      vi.advanceTimersByTime(3500);

      // Next tap should be treated as first tap again
      fireEvent.touchStart(card);
      expect(screen.queryByTestId('unlock-overlay')).not.toBeInTheDocument();
    });

    it('should not use touch behavior on non-touch devices', async () => {
      mockUseTouchDevice.mockReturnValue(false);
      const user = userEvent.setup({ delay: null });

      render(<PreviewCard tool={mockTool} isBlurred={true} />);

      const card = screen.getByRole('button');
      await user.click(card);

      // Should immediately show unlock prompt without double-tap
      expect(screen.getByTestId('unlock-overlay')).toBeInTheDocument();
    });
  });

  describe('Reduced motion support', () => {
    it('should disable animations when reduced motion is preferred', () => {
      mockUseReducedMotion.mockReturnValue(true);

      render(<PreviewCard tool={mockTool} />);

      const motionDiv = screen.getByTestId('motion-div');
      expect(motionDiv).toBeInTheDocument();
    });

    it('should pass disableAnimations prop correctly', () => {
      render(<PreviewCard tool={mockTool} disableAnimations={true} />);

      const motionDiv = screen.getByTestId('motion-div');
      expect(motionDiv).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have minimum height for touch targets', () => {
      render(<PreviewCard tool={mockTool} />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('min-h-[176px]');
    });

    it('should have cursor-pointer when blurred', () => {
      render(<PreviewCard tool={mockTool} isBlurred={true} />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should apply custom className', () => {
      render(<PreviewCard tool={mockTool} className="custom-class" />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Unlock prompt integration', () => {
    it('should pass tool name to unlock prompt', async () => {
      const user = userEvent.setup({ delay: null });
      render(<PreviewCard tool={mockTool} isBlurred={true} />);

      const card = screen.getByRole('button');
      await user.click(card);

      expect(
        screen.getByText(/Unlock Delegation Framework/)
      ).toBeInTheDocument();
    });

    it('should pass custom purchase URL to unlock prompt', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <PreviewCard
          tool={mockTool}
          isBlurred={true}
          purchaseUrl="https://custom-url.com"
        />
      );

      const card = screen.getByRole('button');
      await user.click(card);

      expect(screen.getByTestId('unlock-overlay')).toBeInTheDocument();
    });
  });
});
