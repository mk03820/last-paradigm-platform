/**
 * Tests for CategoryChart component
 *
 * Story 12.4: Friction Category Breakdown and Recommendations
 * Task 8.1: Unit tests for CategoryChart component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryChart } from './CategoryChart';
import type { FrictionCategory } from './friction-constants';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('CategoryChart', () => {
  const mockCostByCategory: Record<FrictionCategory, number> = {
    access_bureaucracy: 45000,
    quality_degradation: 38000,
    multiple_sources: 22000,
    technical_debt: 15000,
  };

  const emptyCostByCategory: Record<FrictionCategory, number> = {
    access_bureaucracy: 0,
    quality_degradation: 0,
    multiple_sources: 0,
    technical_debt: 0,
  };

  it('renders pie chart when data exists', () => {
    render(<CategoryChart costByCategory={mockCostByCategory} />);

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders legend with category labels', () => {
    render(<CategoryChart costByCategory={mockCostByCategory} />);

    expect(screen.getByText('Access Bureaucracy')).toBeInTheDocument();
    expect(screen.getByText('Quality Degradation')).toBeInTheDocument();
    expect(screen.getByText('Multiple Sources of Truth')).toBeInTheDocument();
    expect(screen.getByText('Technical Debt')).toBeInTheDocument();
  });

  it('shows dollar amounts in legend', () => {
    render(<CategoryChart costByCategory={mockCostByCategory} />);

    expect(screen.getByText('$45,000')).toBeInTheDocument();
    expect(screen.getByText('$38,000')).toBeInTheDocument();
    expect(screen.getByText('$22,000')).toBeInTheDocument();
    expect(screen.getByText('$15,000')).toBeInTheDocument();
  });

  it('shows percentages in legend', () => {
    const { container } = render(<CategoryChart costByCategory={mockCostByCategory} />);

    // Total: 120,000
    // Access: 45000/120000 = 38%
    // Quality: 38000/120000 = 32%
    // Multiple: 22000/120000 = 18%
    // Technical: 15000/120000 = 12.5% rounds to 13%
    // Text may be split across elements, check container textContent
    const legendText = container.textContent;
    expect(legendText).toContain('38%');
    expect(legendText).toContain('32%');
    expect(legendText).toContain('18%');
    expect(legendText).toContain('13%');
  });

  it('shows organizational/technical type in legend', () => {
    render(<CategoryChart costByCategory={mockCostByCategory} />);

    // 3 organizational categories + 1 technical
    expect(screen.getAllByText('(Org)').length).toBe(3);
    expect(screen.getAllByText('(Tech)').length).toBe(1);
  });

  it('shows empty state when no cost data', () => {
    render(<CategoryChart costByCategory={emptyCostByCategory} />);

    expect(screen.getByText(/No cost data available/)).toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
  });

  it('filters out zero-value categories from chart', () => {
    const partialData: Record<FrictionCategory, number> = {
      access_bureaucracy: 50000,
      quality_degradation: 0,
      multiple_sources: 0,
      technical_debt: 50000,
    };

    render(<CategoryChart costByCategory={partialData} />);

    // Should only show non-zero categories
    expect(screen.getByText('Access Bureaucracy')).toBeInTheDocument();
    expect(screen.getByText('Technical Debt')).toBeInTheDocument();
    expect(screen.queryByText('Quality Degradation')).not.toBeInTheDocument();
    expect(screen.queryByText('Multiple Sources of Truth')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CategoryChart costByCategory={mockCostByCategory} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
