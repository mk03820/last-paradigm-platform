/**
 * DiagnosticPreviewCard Component Tests
 *
 * Story 16.3: Preview Cards with Blur Effect
 * Task 9: Write comprehensive tests
 * Covers: AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiagnosticPreviewCard } from './DiagnosticPreviewCard';
import { getPB2Tool } from '@/lib/pb2-tools/tool-catalog';
import type { DiagnosticData, LockedContent } from './PreviewCardTypes';

// Test data
const mockTool = getPB2Tool(3)!; // Decision Rights & Delegation Framework

const mockDiagnosticData: DiagnosticData = {
  metricLabel: 'Decision Velocity',
  metricValue: '21 days',
  issuesSummary: '3.0x slower than the benchmark of 7 days',
  sourceToolId: 3,
  benchmarkValue: '7 days',
};

const mockLockedContent: LockedContent = {
  previewText:
    'The Decision Rights Matrix maps decision types to authority levels with clear delegation criteria...',
  methodologySteps: [
    'Decision Type Categorization',
    'Authority Level Assignment',
    'Delegation Criteria Definition',
  ],
  templatePreview: 'Decision_Rights_Matrix.xlsx with pre-built formulas...',
};

describe('DiagnosticPreviewCard', () => {
  describe('Task 9.1: Unit tests for PreviewCard component rendering', () => {
    it('should render the card with all required elements', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      // Card should exist
      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();

      // Tool name should be visible
      expect(screen.getByText(/Tool 3:/)).toBeInTheDocument();
      expect(screen.getByText('Delegation Framework')).toBeInTheDocument();
    });

    it('should render with default locked content when not provided', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      // Should show default content from PreviewCardTypes
      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    it('should render with custom locked content when provided', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
          lockedContent={mockLockedContent}
        />
      );

      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Task 9.2: Test visible zone displays user diagnostic data correctly (AC2)', () => {
    it('should display the metric label', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      expect(screen.getByText(/Decision Velocity:/)).toBeInTheDocument();
    });

    it('should display the metric value', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      expect(screen.getByText('21 days')).toBeInTheDocument();
    });

    it('should display the benchmark value when provided', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      expect(screen.getByText(/benchmark: 7 days/)).toBeInTheDocument();
    });

    it('should display the issues summary', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      expect(
        screen.getByText('3.0x slower than the benchmark of 7 days')
      ).toBeInTheDocument();
    });

    it('should format numeric values as currency', () => {
      const currencyData: DiagnosticData = {
        metricLabel: 'Data Friction Cost',
        metricValue: 8000000,
        sourceToolId: 5,
      };

      render(
        <DiagnosticPreviewCard
          tool={getPB2Tool(6)!}
          diagnosticData={currencyData}
        />
      );

      expect(screen.getByText('$8.0M')).toBeInTheDocument();
    });

    it('should handle missing benchmark gracefully (Task 5.4)', () => {
      const noBenchmarkData: DiagnosticData = {
        metricLabel: 'Decision Velocity',
        metricValue: '21 days',
        sourceToolId: 3,
      };

      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={noBenchmarkData}
        />
      );

      expect(screen.queryByText(/benchmark:/)).not.toBeInTheDocument();
    });

    it('should handle missing issues summary gracefully (Task 5.4)', () => {
      const noSummaryData: DiagnosticData = {
        metricLabel: 'Decision Velocity',
        metricValue: '21 days',
        sourceToolId: 3,
      };

      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={noSummaryData}
        />
      );

      // Should not crash and card should render
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('Task 9.3: Test blurred zone has correct CSS classes applied (AC3)', () => {
    it('should apply blur class to locked content', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      // Find blurred content zone by aria-hidden and blur class
      const blurredZone = container.querySelector('[aria-hidden="true"].blur-\\[6px\\]');
      expect(blurredZone).toBeInTheDocument();
    });

    it('should apply select-none class to prevent text selection', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      const blurredZone = container.querySelector('.select-none');
      expect(blurredZone).toBeInTheDocument();
    });

    it('should apply pointer-events-none class to prevent interaction', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      const blurredZone = container.querySelector('.pointer-events-none.blur-\\[6px\\]');
      expect(blurredZone).toBeInTheDocument();
    });
  });

  describe('Task 9.4: Test UnlockOverlay displays with correct messaging (AC5)', () => {
    it('should display lock icon', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      // Look for SVG lock icon
      const lockIcon = container.querySelector('svg[aria-hidden="true"]');
      expect(lockIcon).toBeInTheDocument();
    });

    it('should display unlock CTA text', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      expect(screen.getByText('Unlock with Playbook 2')).toBeInTheDocument();
    });
  });

  describe('Task 9.5: Test accessibility attributes (AC7)', () => {
    it('should have aria-hidden on blurred content zone', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      const blurredZone = container.querySelector('[aria-hidden="true"][role="presentation"]');
      expect(blurredZone).toBeInTheDocument();
    });

    it('should have screen reader text for locked content', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      // Find sr-only text
      const srOnlyText = screen.getByText(/Content locked - purchase Playbook 2/);
      expect(srOnlyText).toHaveClass('sr-only');
    });

    it('should have proper aria-label on the card', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute(
        'aria-label',
        `Preview of Tool 3: ${mockTool.name}`
      );
    });

    it('should be keyboard navigable when onClick is provided', async () => {
      const handleClick = vi.fn();
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('tabindex', '0');

      // Focus the card and press Enter
      card.focus();
      await userEvent.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger onClick on Space key', async () => {
      const handleClick = vi.fn();
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('article');
      card.focus();
      await userEvent.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Priority and rank styling (AC6)', () => {
    it('should display rank indicator when provided', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
          rank={1}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByLabelText('Rank 1')).toBeInTheDocument();
    });

    it('should apply gold styling for rank 1', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
          rank={1}
        />
      );

      const rankBadge = screen.getByLabelText('Rank 1');
      expect(rankBadge).toHaveClass('bg-amber-600');
    });

    it('should display priority badge when provided', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
          priority="critical"
        />
      );

      expect(screen.getByText('critical')).toBeInTheDocument();
    });

    it('should apply critical priority border', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
          priority="critical"
        />
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('border-l-red-600');
    });

    it('should apply high priority border', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
          priority="high"
        />
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('border-l-amber-500');
    });

    it('should apply moderate priority border', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
          priority="moderate"
        />
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('border-l-blue-500');
    });
  });

  describe('Tool information display (AC1)', () => {
    it('should display tool ID and short name', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      expect(screen.getByText(/Tool 3:/)).toBeInTheDocument();
      expect(screen.getByText('Delegation Framework')).toBeInTheDocument();
    });

    it('should display full tool name', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      expect(
        screen.getByText('Decision Rights & Delegation Framework')
      ).toBeInTheDocument();
    });

    it('should display tool description', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      expect(
        screen.getByText(/Clarifies who can make which decisions/)
      ).toBeInTheDocument();
    });

    it('should display book chapter reference', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      expect(screen.getByText(/Based on Chapter 10: Decision Velocity/)).toBeInTheDocument();
    });
  });

  describe('Visual boundary (AC4)', () => {
    it('should have visual boundary between visible and blurred zones', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      // Look for the dashed border divider
      const divider = container.querySelector('.border-dashed');
      expect(divider).toBeInTheDocument();
    });

    it('should have gradient fade at boundary', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      // Look for gradient element
      const gradient = container.querySelector('.bg-gradient-to-b');
      expect(gradient).toBeInTheDocument();
    });
  });

  describe('Click handling', () => {
    it('should call onClick when card is clicked', async () => {
      const handleClick = vi.fn();
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('article');
      await userEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply cursor-pointer when onClick is provided', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
          onClick={() => {}}
        />
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should not have tabIndex when onClick is not provided', () => {
      render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
        />
      );

      const card = screen.getByRole('article');
      expect(card).not.toHaveAttribute('tabindex');
    });
  });

  describe('Task 9.7: Snapshot tests for consistent card rendering', () => {
    it('should match snapshot with all props', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={mockDiagnosticData}
          lockedContent={mockLockedContent}
          priority="critical"
          rank={1}
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with minimal props', () => {
      const { container } = render(
        <DiagnosticPreviewCard
          tool={mockTool}
          diagnosticData={{ metricLabel: 'Test', metricValue: 'Value', sourceToolId: 1 }}
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
