import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlignmentRadarChart } from './AlignmentRadarChart';
import type { DimensionId } from './constants';

/**
 * AlignmentRadarChart Tests
 *
 * Tests the radar chart visualization component.
 *
 * Story 9.3: Radar Chart Visualization
 */

// Mock recharts to avoid canvas rendering issues in tests
vi.mock('recharts', () => ({
  RadarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radar-chart">{children}</div>
  ),
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="polar-angle-axis" data-key={dataKey} />
  ),
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: ({ name, dataKey }: { name: string; dataKey: string }) => (
    <div data-testid={`radar-${dataKey}`} data-name={name} />
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

const mockScores: Record<DimensionId, number> = {
  strategic: 3,
  execution: 2,
  technology: 4,
  people: 3,
  governance: 2,
};

describe('AlignmentRadarChart', () => {
  describe('rendering', () => {
    it('renders the radar chart', () => {
      render(<AlignmentRadarChart scores={mockScores} />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('renders responsive container', () => {
      render(<AlignmentRadarChart scores={mockScores} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('renders polar grid', () => {
      render(<AlignmentRadarChart scores={mockScores} />);

      expect(screen.getByTestId('polar-grid')).toBeInTheDocument();
    });

    it('renders user scores radar', () => {
      render(<AlignmentRadarChart scores={mockScores} />);

      const scoreRadar = screen.getByTestId('radar-score');
      expect(scoreRadar).toBeInTheDocument();
      expect(scoreRadar).toHaveAttribute('data-name', 'Your Scores');
    });

    it('renders tooltip', () => {
      render(<AlignmentRadarChart scores={mockScores} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('benchmark overlay', () => {
    it('renders benchmark radar when showBenchmark=true', () => {
      render(<AlignmentRadarChart scores={mockScores} showBenchmark={true} />);

      const benchmarkRadar = screen.getByTestId('radar-benchmark');
      expect(benchmarkRadar).toBeInTheDocument();
      expect(benchmarkRadar).toHaveAttribute('data-name', 'Benchmark (Coordinated)');
    });

    it('renders legend when showBenchmark=true', () => {
      render(<AlignmentRadarChart scores={mockScores} showBenchmark={true} />);

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('does not render benchmark when showBenchmark=false', () => {
      render(<AlignmentRadarChart scores={mockScores} showBenchmark={false} />);

      expect(screen.queryByTestId('radar-benchmark')).not.toBeInTheDocument();
    });

    it('does not render legend when showBenchmark=false', () => {
      render(<AlignmentRadarChart scores={mockScores} showBenchmark={false} />);

      expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('renders as figure with role img', () => {
      render(<AlignmentRadarChart scores={mockScores} />);

      const figure = screen.getByRole('img');
      expect(figure).toBeInTheDocument();
    });

    it('has accessible aria-label describing the chart', () => {
      render(<AlignmentRadarChart scores={mockScores} />);

      const figure = screen.getByRole('img');
      expect(figure).toHaveAttribute('aria-label');
      expect(figure.getAttribute('aria-label')).toContain('Strategic Alignment: 3');
      expect(figure.getAttribute('aria-label')).toContain('Execution Alignment: 2');
    });

    it('includes screen reader description in figcaption', () => {
      render(<AlignmentRadarChart scores={mockScores} />);

      // The figcaption has sr-only class but should be in the document
      const figcaption = document.querySelector('figcaption');
      expect(figcaption).toBeInTheDocument();
      expect(figcaption?.textContent).toContain('Strategic Alignment: 3');
    });

    it('mentions benchmark in description when shown', () => {
      render(<AlignmentRadarChart scores={mockScores} showBenchmark={true} />);

      const figcaption = document.querySelector('figcaption');
      expect(figcaption?.textContent).toContain('Benchmark');
    });
  });

  describe('data transformation', () => {
    it('uses short names for axis labels', () => {
      render(<AlignmentRadarChart scores={mockScores} />);

      const angleAxis = screen.getByTestId('polar-angle-axis');
      expect(angleAxis).toHaveAttribute('data-key', 'shortName');
    });
  });
});
