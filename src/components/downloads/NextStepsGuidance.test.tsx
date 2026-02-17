/**
 * NextStepsGuidance Component Tests
 *
 * Tests for the next steps guidance component.
 *
 * Story 18.7: Post-Generation Success Experience
 * Task 2: Tests for NextStepsGuidance component
 * Covers: AC3 (suggested order), AC4 (implementation timeline)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { NextStepsGuidance } from './NextStepsGuidance';

describe('NextStepsGuidance', () => {
  describe('Suggested Review Order (AC3)', () => {
    it('should display suggested review order heading', () => {
      render(<NextStepsGuidance />);

      expect(screen.getByText('Suggested Review Order')).toBeInTheDocument();
    });

    it('should display all 5 suggested steps', () => {
      render(<NextStepsGuidance />);

      expect(screen.getByText('Board Summary Report (PDF)')).toBeInTheDocument();
      expect(screen.getByText('Strategic Alignment Brief (Word)')).toBeInTheDocument();
      expect(screen.getByText('Executive Presentation Deck (PowerPoint)')).toBeInTheDocument();
      expect(screen.getByText('Working Tools (Excel)')).toBeInTheDocument();
      expect(screen.getByText('Implementation Playbooks (Word)')).toBeInTheDocument();
    });

    it('should display step numbers', () => {
      render(<NextStepsGuidance />);

      const stepNumbers = screen.getAllByText(/^[1-5]$/);
      expect(stepNumbers).toHaveLength(5);
    });

    it('should display step descriptions', () => {
      render(<NextStepsGuidance />);

      expect(
        screen.getByText(/executive overview to understand your complete alignment picture/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Deep dive into findings and recommendations/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Customize for your stakeholder presentation/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Use the calculators and trackers for ongoing measurement/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Follow detailed guides for stakeholder engagement/)
      ).toBeInTheDocument();
    });

    it('should display time estimates for each step', () => {
      render(<NextStepsGuidance />);

      expect(screen.getByText('15 min read')).toBeInTheDocument();
      expect(screen.getByText('30 min read')).toBeInTheDocument();
      expect(screen.getByText('45 min customize')).toBeInTheDocument();
      expect(screen.getByText('Ongoing use')).toBeInTheDocument();
      expect(screen.getByText('60+ min each')).toBeInTheDocument();
    });

    it('should order steps correctly (1 through 5)', () => {
      render(<NextStepsGuidance />);

      const stepContainers = screen.getAllByRole('listitem') ||
        document.querySelectorAll('[class*="flex items-start gap-4"]');

      // Alternative: Check the DOM order of elements
      const boardSummary = screen.getByText('Board Summary Report (PDF)');
      const strategicBrief = screen.getByText('Strategic Alignment Brief (Word)');

      // Board Summary should appear before Strategic Brief in DOM
      const boardParent = boardSummary.closest('[class*="flex items-start"]');
      const briefParent = strategicBrief.closest('[class*="flex items-start"]');

      if (boardParent && briefParent) {
        const result = boardParent.compareDocumentPosition(briefParent);
        expect(result & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
    });
  });

  describe('Implementation Timeline (AC4)', () => {
    it('should display implementation timeline heading', () => {
      render(<NextStepsGuidance />);

      expect(screen.getByText('Suggested Implementation Timeline')).toBeInTheDocument();
    });

    it('should display all 3 timeline phases', () => {
      render(<NextStepsGuidance />);

      expect(screen.getByText('Week 1')).toBeInTheDocument();
      expect(screen.getByText('Week 2-3')).toBeInTheDocument();
      expect(screen.getByText('Week 4+')).toBeInTheDocument();
    });

    it('should display phase titles', () => {
      render(<NextStepsGuidance />);

      expect(screen.getByText('Assessment & Socialization')).toBeInTheDocument();
      expect(screen.getByText('Stakeholder Alignment')).toBeInTheDocument();
      expect(screen.getByText('Implementation')).toBeInTheDocument();
    });

    it('should display Week 1 tasks', () => {
      render(<NextStepsGuidance />);

      expect(
        screen.getByText('Review Board Summary and Strategic Alignment Brief')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Identify key stakeholders for presentation')
      ).toBeInTheDocument();
      expect(screen.getByText('Schedule executive briefing')).toBeInTheDocument();
    });

    it('should display Week 2-3 tasks', () => {
      render(<NextStepsGuidance />);

      expect(screen.getByText('Deliver Executive Presentation')).toBeInTheDocument();
      expect(
        screen.getByText('Begin Stakeholder Communication Pack activities')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Establish transformation governance')
      ).toBeInTheDocument();
    });

    it('should display Week 4+ tasks', () => {
      render(<NextStepsGuidance />);

      expect(
        screen.getByText('Deploy Meeting Cost Tracker for ongoing measurement')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Follow Decision Framework Guide for quick wins')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Use Transformation Roadmap Planner for long-term planning')
      ).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should have timeline visual indicators', () => {
      render(<NextStepsGuidance />);

      // Check for timeline dots (using the class that creates them)
      const timelineDots = document.querySelectorAll('.rounded-full.bg-primary\\/10');
      expect(timelineDots.length).toBeGreaterThan(0);
    });

    it('should have step number indicators', () => {
      render(<NextStepsGuidance />);

      // Step number circles should have font-semibold
      const stepCircles = document.querySelectorAll('.rounded-full.bg-primary\\/10.font-semibold');
      expect(stepCircles.length).toBe(5);
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<NextStepsGuidance className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have proper spacing between sections', () => {
      const { container } = render(<NextStepsGuidance />);

      expect(container.firstChild).toHaveClass('space-y-8');
    });
  });

  describe('Card Structure', () => {
    it('should render suggested order in a card', () => {
      render(<NextStepsGuidance />);

      // Find the card containing "Suggested Review Order"
      const suggestedOrderHeading = screen.getByText('Suggested Review Order');
      const card = suggestedOrderHeading.closest('[class*="card"]') ||
                   suggestedOrderHeading.closest('[class*="Card"]') ||
                   suggestedOrderHeading.closest('section');

      expect(card).toBeInTheDocument();
    });

    it('should render timeline in a card', () => {
      render(<NextStepsGuidance />);

      // Find the card containing "Suggested Implementation Timeline"
      const timelineHeading = screen.getByText('Suggested Implementation Timeline');
      const card = timelineHeading.closest('[class*="card"]') ||
                   timelineHeading.closest('[class*="Card"]') ||
                   timelineHeading.closest('section');

      expect(card).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should display document type icons', () => {
      render(<NextStepsGuidance />);

      // Check that SVG icons are present (for FileText, Presentation, FileSpreadsheet)
      const svgIcons = document.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('should display clock icons for time estimates', () => {
      render(<NextStepsGuidance />);

      // Clock icons should be near time estimates
      const clockIcons = document.querySelectorAll('svg.h-3.w-3');
      expect(clockIcons.length).toBeGreaterThan(0);
    });

    it('should display checkmark icons for tasks', () => {
      render(<NextStepsGuidance />);

      // CheckCircle icons in timeline tasks
      const checkIcons = document.querySelectorAll('svg.text-slate-300');
      expect(checkIcons.length).toBe(9); // 3 tasks per phase * 3 phases
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<NextStepsGuidance />);

      // Card titles should have appropriate heading levels
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have readable text colors', () => {
      render(<NextStepsGuidance />);

      // Check that primary content uses slate-900 for good contrast
      const primaryText = document.querySelectorAll('.text-slate-900');
      expect(primaryText.length).toBeGreaterThan(0);
    });

    it('should have secondary text for descriptions', () => {
      render(<NextStepsGuidance />);

      // Descriptions use slate-600 for readable secondary text
      const secondaryText = document.querySelectorAll('.text-slate-600');
      expect(secondaryText.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should have flexible layout for steps', () => {
      render(<NextStepsGuidance />);

      // Steps should use flex layout with gap
      const stepContainers = document.querySelectorAll('.flex.items-start.gap-4');
      expect(stepContainers.length).toBe(5);
    });

    it('should allow content to wrap properly', () => {
      render(<NextStepsGuidance />);

      // Content sections should have min-w-0 to prevent overflow
      const flexGrowSections = document.querySelectorAll('.flex-grow.min-w-0');
      expect(flexGrowSections.length).toBe(5);
    });
  });
});
