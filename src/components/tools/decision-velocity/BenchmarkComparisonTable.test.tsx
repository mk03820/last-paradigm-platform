import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BenchmarkComparisonTable } from './BenchmarkComparisonTable';
import type { ArchetypeMetrics } from './calculations';

/**
 * BenchmarkComparisonTable Tests
 *
 * Story 10.3: Benchmark Comparison Table
 * Covers: AC 1, 4 (Table layout, sortable by gap)
 */

const createMetrics = (
  archetypeId: string,
  label: string,
  median: number
): ArchetypeMetrics => ({
  archetypeId: archetypeId as ArchetypeMetrics['archetypeId'],
  archetypeLabel: label,
  sampleCount: 5,
  decisionLatency: { median, p90: median + 10, sampleCount: 5 },
  executionLatency: null,
  totalCycleTime: null,
});

const multipleMetrics = [
  createMetrics('strategic', 'Strategic Initiatives', 45), // avg performance, gap=31
  createMetrics('hiring', 'Hiring Decisions', 10), // fast performance, gap=0
  createMetrics('technology', 'Technology Decisions', 60), // crisis performance, gap=53
];

describe('BenchmarkComparisonTable', () => {
  describe('rendering', () => {
    it('renders table with all rows', () => {
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      expect(screen.getByText('Strategic Initiatives')).toBeInTheDocument();
      expect(screen.getByText('Hiring Decisions')).toBeInTheDocument();
      expect(screen.getByText('Technology Decisions')).toBeInTheDocument();
    });

    it('renders column headers', () => {
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      expect(screen.getByText(/Category/)).toBeInTheDocument();
      expect(screen.getByText(/Your Median/)).toBeInTheDocument();
      // Fast/Average/Slow/Crisis appear in both legend and headers, use getAllByText
      expect(screen.getAllByText('Fast').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Average').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Slow').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Crisis').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/Gap to Fast/)).toBeInTheDocument();
    });

    it('renders legend with all performance levels', () => {
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      expect(screen.getByText('Performance levels:')).toBeInTheDocument();
    });

    it('renders explanation text', () => {
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      expect(screen.getByText(/Click column headers to sort/)).toBeInTheDocument();
    });
  });

  describe('default sorting', () => {
    it('sorts by gap descending by default (worst first)', () => {
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      const rows = screen.getAllByRole('row');
      // First row is header, data rows start at index 1
      const dataRows = rows.slice(1);

      // Technology (gap=53) should be first, Strategic (gap=31) second, Hiring (gap=0) last
      expect(within(dataRows[0]).getByText('Technology Decisions')).toBeInTheDocument();
      expect(within(dataRows[1]).getByText('Strategic Initiatives')).toBeInTheDocument();
      expect(within(dataRows[2]).getByText('Hiring Decisions')).toBeInTheDocument();
    });
  });

  describe('sorting functionality', () => {
    it('sorts by category alphabetically when header clicked', async () => {
      const user = userEvent.setup();
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      await user.click(screen.getByText(/Category/));

      const rows = screen.getAllByRole('row').slice(1);
      // Alphabetical: Hiring, Strategic, Technology
      expect(within(rows[0]).getByText('Hiring Decisions')).toBeInTheDocument();
      expect(within(rows[1]).getByText('Strategic Initiatives')).toBeInTheDocument();
      expect(within(rows[2]).getByText('Technology Decisions')).toBeInTheDocument();
    });

    it('reverses sort direction when same header clicked twice', async () => {
      const user = userEvent.setup();
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      // Click category twice for descending alphabetical
      await user.click(screen.getByText(/Category/));
      await user.click(screen.getByText(/Category/));

      const rows = screen.getAllByRole('row').slice(1);
      // Reverse alphabetical: Technology, Strategic, Hiring
      expect(within(rows[0]).getByText('Technology Decisions')).toBeInTheDocument();
      expect(within(rows[1]).getByText('Strategic Initiatives')).toBeInTheDocument();
      expect(within(rows[2]).getByText('Hiring Decisions')).toBeInTheDocument();
    });

    it('sorts by median when Your Median header clicked', async () => {
      const user = userEvent.setup();
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      await user.click(screen.getByText(/Your Median/));

      const rows = screen.getAllByRole('row').slice(1);
      // Ascending median: Hiring (10), Strategic (45), Technology (60)
      expect(within(rows[0]).getByText('Hiring Decisions')).toBeInTheDocument();
      expect(within(rows[1]).getByText('Strategic Initiatives')).toBeInTheDocument();
      expect(within(rows[2]).getByText('Technology Decisions')).toBeInTheDocument();
    });

    it('sorts by gap ascending when Gap header clicked once from default desc', async () => {
      const user = userEvent.setup();
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      // Click Gap once to toggle from descending to ascending (best performers first)
      await user.click(screen.getByText(/Gap to Fast/));

      const rows = screen.getAllByRole('row').slice(1);
      // Ascending gap: Hiring (0), Strategic (31), Technology (53)
      expect(within(rows[0]).getByText('Hiring Decisions')).toBeInTheDocument();
      expect(within(rows[1]).getByText('Strategic Initiatives')).toBeInTheDocument();
      expect(within(rows[2]).getByText('Technology Decisions')).toBeInTheDocument();
    });

    it('shows sort indicator on active column', async () => {
      const user = userEvent.setup();
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      // Default is gap descending
      expect(screen.getByText(/Gap to Fast.*↓/)).toBeInTheDocument();

      await user.click(screen.getByText(/Category/));
      expect(screen.getByText(/Category.*↑/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has aria-sort attributes on sortable columns', () => {
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      const gapHeader = screen.getByRole('columnheader', { name: /Gap to Fast/ });
      expect(gapHeader).toHaveAttribute('aria-sort', 'descending');
    });

    it('updates aria-sort when sort changes', async () => {
      const user = userEvent.setup();
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      await user.click(screen.getByText(/Category/));

      const categoryHeader = screen.getByRole('columnheader', { name: /Category/ });
      expect(categoryHeader).toHaveAttribute('aria-sort', 'ascending');
    });
  });

  describe('budget threshold handling', () => {
    it('passes budget threshold to rows', () => {
      const budgetMetrics = [
        createMetrics('budget', 'Budget Approvals', 15),
        createMetrics('strategic', 'Strategic Initiatives', 30),
      ];

      render(<BenchmarkComparisonTable metrics={budgetMetrics} budgetThreshold="tier1" />);

      // For tier1, fast is ≤5d, so 15d has gap of 10
      // The row should show +10d
      expect(screen.getByText('+10d')).toBeInTheDocument();
    });

    it('shows note about budget benchmarks when threshold provided', () => {
      render(<BenchmarkComparisonTable metrics={multipleMetrics} budgetThreshold="tier2" />);

      expect(screen.getByText(/Budget benchmarks are based on your selected threshold tier/)).toBeInTheDocument();
    });

    it('does not show budget note when no threshold provided', () => {
      render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      expect(screen.queryByText(/Budget benchmarks/)).not.toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    it('has horizontal scroll container', () => {
      const { container } = render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('has minimum width on table', () => {
      const { container } = render(<BenchmarkComparisonTable metrics={multipleMetrics} />);

      const table = container.querySelector('table');
      expect(table).toHaveClass('min-w-[700px]');
    });
  });

  describe('with single metric', () => {
    it('renders correctly with one row', () => {
      const singleMetric = [createMetrics('strategic', 'Strategic Initiatives', 30)];

      render(<BenchmarkComparisonTable metrics={singleMetric} />);

      expect(screen.getByText('Strategic Initiatives')).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(2); // header + 1 data row
    });
  });

  describe('with many metrics', () => {
    it('renders all 5 archetypes correctly', () => {
      const allMetrics = [
        createMetrics('strategic', 'Strategic Initiatives', 30),
        createMetrics('budget', 'Budget Approvals', 20),
        createMetrics('technology', 'Technology Decisions', 15),
        createMetrics('hiring', 'Hiring Decisions', 25),
        createMetrics('analytics', 'Analytics & Reporting', 5),
      ];

      render(<BenchmarkComparisonTable metrics={allMetrics} />);

      expect(screen.getAllByRole('row')).toHaveLength(6); // header + 5 data rows
    });
  });
});
