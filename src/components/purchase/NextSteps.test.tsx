/**
 * NextSteps Component Tests
 *
 * Story 17.6: Purchase Success Page
 * Task 7.3: Unit tests for NextSteps component
 *
 * Tests cover:
 * - AC4: Numbered action list showing how to begin
 * - Step numbering
 * - Step icons and titles
 * - Actionable links
 * - Reduced motion support
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextSteps } from './NextSteps';

// Mock framer-motion
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

// Mock useReducedMotion hook
const mockUseReducedMotion = vi.fn(() => false);
vi.mock('@/hooks', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}));

describe('NextSteps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseReducedMotion.mockReturnValue(false);
  });

  describe('Rendering (AC4)', () => {
    it('renders the section with proper heading', () => {
      render(<NextSteps />);

      expect(
        screen.getByRole('heading', { name: /what's next\?/i })
      ).toBeInTheDocument();
    });

    it('has proper aria-labelledby on section', () => {
      const { container } = render(<NextSteps />);

      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'next-steps-heading');
    });

    it('renders all three steps', () => {
      render(<NextSteps />);

      expect(screen.getByText('Explore Your Tools')).toBeInTheDocument();
      expect(screen.getByText('Review Your Roadmap')).toBeInTheDocument();
      expect(screen.getByText('Start Your First Assessment')).toBeInTheDocument();
    });
  });

  describe('Step Numbers (AC4)', () => {
    it('displays step numbers 1, 2, 3', () => {
      render(<NextSteps />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('step numbers are styled as amber badges', () => {
      render(<NextSteps />);

      const stepOne = screen.getByText('1');
      expect(stepOne.className).toContain('text-amber-500');
      expect(stepOne.className).toContain('font-bold');
    });
  });

  describe('Step Content', () => {
    it('displays descriptions for each step', () => {
      render(<NextSteps />);

      expect(
        screen.getByText(/access all 10 diagnostic tools/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/personalized transformation roadmap/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/begin with the recommended tool/i)
      ).toBeInTheDocument();
    });
  });

  describe('Actionable Links (AC4)', () => {
    it('renders View Tools link', () => {
      render(<NextSteps />);

      // Desktop version (multiple instances due to responsive design)
      const viewToolsLinks = screen.getAllByRole('link', { name: /view tools/i });
      expect(viewToolsLinks.length).toBeGreaterThan(0);
      expect(viewToolsLinks[0]).toHaveAttribute('href', '/pb2/tools');
    });

    it('renders View Roadmap link', () => {
      render(<NextSteps />);

      const viewRoadmapLinks = screen.getAllByRole('link', { name: /view roadmap/i });
      expect(viewRoadmapLinks.length).toBeGreaterThan(0);
      expect(viewRoadmapLinks[0]).toHaveAttribute('href', '/pb2/roadmap');
    });

    it('renders Get Started link', () => {
      render(<NextSteps />);

      const getStartedLinks = screen.getAllByRole('link', { name: /get started/i });
      expect(getStartedLinks.length).toBeGreaterThan(0);
      expect(getStartedLinks[0]).toHaveAttribute('href', '/pb2/tools/1');
    });
  });

  describe('Styling', () => {
    it('uses Executive Clarity theme on cards', () => {
      const { container } = render(<NextSteps />);

      const cards = container.querySelectorAll('.bg-slate-800\\/50');
      expect(cards.length).toBe(3);
    });

    it('cards have hover state', () => {
      const { container } = render(<NextSteps />);

      const cards = container.querySelectorAll('.hover\\:border-slate-600');
      expect(cards.length).toBe(3);
    });

    it('links have amber styling', () => {
      render(<NextSteps />);

      const links = screen.getAllByRole('link');
      // At least one link should have amber styling
      const hasAmberLink = links.some(
        (link) =>
          link.className.includes('text-amber-500') ||
          link.className.includes('amber')
      );
      expect(hasAmberLink).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('icons are hidden from screen readers', () => {
      const { container } = render(<NextSteps />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      // Should have icons for each step (step icon + arrow icon) = 6 total
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });

    it('all links are keyboard accessible', () => {
      render(<NextSteps />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Reduced Motion', () => {
    it('renders correctly with reduced motion preference', () => {
      mockUseReducedMotion.mockReturnValue(true);
      render(<NextSteps />);

      // Should still render all steps
      expect(screen.getByText('Explore Your Tools')).toBeInTheDocument();
      expect(screen.getByText('Review Your Roadmap')).toBeInTheDocument();
      expect(screen.getByText('Start Your First Assessment')).toBeInTheDocument();
    });
  });
});
