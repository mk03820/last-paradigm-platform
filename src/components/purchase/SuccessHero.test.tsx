/**
 * SuccessHero Component Tests
 *
 * Story 17.6: Purchase Success Page
 * Task 7.1: Unit tests for SuccessHero component
 *
 * Tests cover:
 * - AC2: Celebration moment with visual feedback
 * - Confetti animation
 * - Success icon display
 * - Personalized headline
 * - Reduced motion support
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SuccessHero } from './SuccessHero';

// Mock react-confetti
vi.mock('react-confetti', () => ({
  default: vi.fn(({ width, height }: { width: number; height: number }) => (
    <div data-testid="confetti" data-width={width} data-height={height} />
  )),
}));

// Mock framer-motion to simplify testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock hooks
const mockUseReducedMotion = vi.fn(() => false);
const mockUseWindowSize = vi.fn(() => ({ width: 1024, height: 768 }));

vi.mock('@/hooks', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
  useWindowSize: () => mockUseWindowSize(),
}));

describe('SuccessHero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockUseReducedMotion.mockReturnValue(false);
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering (AC2)', () => {
    it('renders with personalized greeting', () => {
      render(<SuccessHero userName="Matt" />);

      expect(
        screen.getByRole('heading', { name: /congratulations, matt!/i })
      ).toBeInTheDocument();
    });

    it('displays success message about transformation journey', () => {
      render(<SuccessHero userName="Test User" />);

      expect(
        screen.getByText(/your transformation journey begins now/i)
      ).toBeInTheDocument();
    });

    it('displays Playbook 2 access message', () => {
      render(<SuccessHero userName="Test User" />);

      expect(
        screen.getByText(/full access to playbook 2 and all 10 diagnostic tools/i)
      ).toBeInTheDocument();
    });

    it('renders success checkmark icon', () => {
      render(<SuccessHero userName="Test User" />);

      // Check for the CheckCircle2 icon's parent container
      const iconContainer = document.querySelector('.bg-green-500\\/20');
      expect(iconContainer).toBeInTheDocument();
    });

    it('has proper aria-labelledby on section', () => {
      const { container } = render(<SuccessHero userName="Test User" />);

      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'success-headline');
    });

    it('has matching id on heading', () => {
      render(<SuccessHero userName="Test User" />);

      const heading = screen.getByRole('heading', { name: /congratulations/i });
      expect(heading).toHaveAttribute('id', 'success-headline');
    });
  });

  describe('Confetti Animation', () => {
    it('shows confetti initially when motion is not reduced', () => {
      mockUseReducedMotion.mockReturnValue(false);
      render(<SuccessHero userName="Test User" />);

      expect(screen.getByTestId('confetti')).toBeInTheDocument();
    });

    it('hides confetti after 5 seconds', async () => {
      mockUseReducedMotion.mockReturnValue(false);
      render(<SuccessHero userName="Test User" />);

      // Confetti should be visible initially
      expect(screen.getByTestId('confetti')).toBeInTheDocument();

      // Advance time by 5 seconds
      vi.advanceTimersByTime(5000);

      // Confetti should be hidden
      await waitFor(() => {
        expect(screen.queryByTestId('confetti')).not.toBeInTheDocument();
      });
    });

    it('passes window dimensions to confetti', () => {
      mockUseWindowSize.mockReturnValue({ width: 1920, height: 1080 });
      render(<SuccessHero userName="Test User" />);

      const confetti = screen.getByTestId('confetti');
      expect(confetti).toHaveAttribute('data-width', '1920');
      expect(confetti).toHaveAttribute('data-height', '1080');
    });
  });

  describe('Reduced Motion Support', () => {
    it('does not show confetti when reduced motion is preferred', () => {
      mockUseReducedMotion.mockReturnValue(true);
      render(<SuccessHero userName="Test User" />);

      expect(screen.queryByTestId('confetti')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('uses Executive Clarity theme (responsive text sizing)', () => {
      render(<SuccessHero userName="Test User" />);

      const heading = screen.getByRole('heading', { name: /congratulations/i });
      expect(heading.className).toContain('text-3xl');
      expect(heading.className).toContain('sm:text-4xl');
      expect(heading.className).toContain('md:text-5xl');
    });

    it('has white text on headline', () => {
      render(<SuccessHero userName="Test User" />);

      const heading = screen.getByRole('heading', { name: /congratulations/i });
      expect(heading.className).toContain('text-white');
    });

    it('has slate-300 text on description', () => {
      render(<SuccessHero userName="Test User" />);

      const description = screen.getByText(
        /your transformation journey begins now/i
      );
      expect(description.className).toContain('text-slate-300');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty user name gracefully', () => {
      render(<SuccessHero userName="" />);

      expect(
        screen.getByRole('heading', { name: /congratulations, !/i })
      ).toBeInTheDocument();
    });

    it('handles long user names', () => {
      render(<SuccessHero userName="Alexander Benjamin Christopher" />);

      expect(
        screen.getByRole('heading', {
          name: /congratulations, alexander benjamin christopher!/i,
        })
      ).toBeInTheDocument();
    });
  });
});
