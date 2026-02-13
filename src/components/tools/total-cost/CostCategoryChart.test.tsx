/**
 * Tests for CostCategoryChart component
 *
 * Story 14.4: Cost Category Breakdown Visualization
 * FR2-34: Cost category breakdown visualization
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CostCategoryChart, CostCategoryMiniChart } from './CostCategoryChart';
import type { AlignmentTaxResult, InterpretationThreshold } from './cost-constants';

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
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar">{children}</div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  ),
}));

describe('CostCategoryChart', () => {
  const mockInterpretation: InterpretationThreshold = {
    level: 'significant',
    minPercent: 2,
    maxPercent: 4,
    label: 'Significant',
    description: 'Your alignment tax is above average.',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    icon: 'alert-triangle',
  };

  const mockResult: AlignmentTaxResult = {
    meetingWaste: 1200000,
    dataFriction: 450000,
    projectDelays: 350000,
    rework: 600000,
    turnover: 200000,
    opportunityCost: 100000,
    toolsSubtotal: 1650000,
    additionalSubtotal: 1250000,
    total: 2900000,
    revenue: 70000000,
    percentOfRevenue: 4.14,
    interpretation: mockInterpretation,
  };

  const emptyResult: AlignmentTaxResult = {
    meetingWaste: 0,
    dataFriction: 0,
    projectDelays: 0,
    rework: 0,
    turnover: 0,
    opportunityCost: 0,
    toolsSubtotal: 0,
    additionalSubtotal: 0,
    total: 0,
    revenue: 70000000,
    percentOfRevenue: 0,
    interpretation: mockInterpretation,
  };

  describe('rendering', () => {
    it('renders pie chart by default', () => {
      render(<CostCategoryChart result={mockResult} />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    it('renders bar chart when initialView is bar', () => {
      render(<CostCategoryChart result={mockResult} initialView="bar" />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
      render(<CostCategoryChart result={emptyResult} />);

      expect(screen.getByText(/No cost data available/)).toBeInTheDocument();
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    });

    it('renders chart title', () => {
      render(<CostCategoryChart result={mockResult} />);

      expect(screen.getByText('Cost Category Breakdown')).toBeInTheDocument();
    });
  });

  describe('category labels', () => {
    it('displays all cost category labels', () => {
      render(<CostCategoryChart result={mockResult} />);

      expect(screen.getByText('Meeting Waste')).toBeInTheDocument();
      expect(screen.getByText('Data Friction')).toBeInTheDocument();
      expect(screen.getByText('Project Delays')).toBeInTheDocument();
      expect(screen.getByText('Rework')).toBeInTheDocument();
      expect(screen.getByText('Excess Turnover')).toBeInTheDocument();
      expect(screen.getByText('Opportunity Cost')).toBeInTheDocument();
    });

    it('shows dollar amounts for each category', () => {
      render(<CostCategoryChart result={mockResult} />);

      expect(screen.getByText('$1.2M')).toBeInTheDocument();
      expect(screen.getByText('$450K')).toBeInTheDocument();
      expect(screen.getByText('$350K')).toBeInTheDocument();
      expect(screen.getByText('$600K')).toBeInTheDocument();
      expect(screen.getByText('$200K')).toBeInTheDocument();
      expect(screen.getByText('$100K')).toBeInTheDocument();
    });

    it('shows percentages for each category', () => {
      const { container } = render(<CostCategoryChart result={mockResult} />);

      // Total: 2,900,000
      // Meeting: 1,200,000 / 2,900,000 = 41.4% (formatted as 41% by formatPercentSmart)
      const content = container.textContent;
      expect(content).toContain('41%');
    });

    it('shows tool number for tool-sourced categories', () => {
      render(<CostCategoryChart result={mockResult} />);

      expect(screen.getByText('(Tool 2)')).toBeInTheDocument();
      expect(screen.getByText('(Tool 5)')).toBeInTheDocument();
    });
  });

  describe('view toggle', () => {
    it('switches to bar chart when bar button clicked', () => {
      render(<CostCategoryChart result={mockResult} />);

      const barButton = screen.getByRole('button', { name: /bar chart view/i });
      fireEvent.click(barButton);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    });

    it('switches to pie chart when pie button clicked', () => {
      render(<CostCategoryChart result={mockResult} initialView="bar" />);

      const pieButton = screen.getByRole('button', { name: /pie chart view/i });
      fireEvent.click(pieButton);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('renders sort controls', () => {
      render(<CostCategoryChart result={mockResult} />);

      expect(screen.getByText('Sort:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /amount/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /%/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /name/i })).toBeInTheDocument();
    });

    it('changes sort when button clicked', () => {
      render(<CostCategoryChart result={mockResult} />);

      const nameButton = screen.getByRole('button', { name: /name/i });
      fireEvent.click(nameButton);

      // Button should be pressed
      expect(nameButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('filtering', () => {
    it('renders filter controls', () => {
      render(<CostCategoryChart result={mockResult} />);

      expect(screen.getByText('Show:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /from tools/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /manual/i })).toBeInTheDocument();
    });

    it('filters to show only tool-sourced when clicked', () => {
      render(<CostCategoryChart result={mockResult} />);

      const toolButton = screen.getByRole('button', { name: /from tools/i });
      fireEvent.click(toolButton);

      // Should show tool-sourced categories
      expect(screen.getByText('Meeting Waste')).toBeInTheDocument();
      expect(screen.getByText('Data Friction')).toBeInTheDocument();

      // Should not show manual input categories
      expect(screen.queryByText('Project Delays')).not.toBeInTheDocument();
      expect(screen.queryByText('Rework')).not.toBeInTheDocument();
    });

    it('filters to show only manual input when clicked', () => {
      render(<CostCategoryChart result={mockResult} />);

      const manualButton = screen.getByRole('button', { name: /manual/i });
      fireEvent.click(manualButton);

      // Should show manual input categories
      expect(screen.getByText('Project Delays')).toBeInTheDocument();
      expect(screen.getByText('Rework')).toBeInTheDocument();

      // Should not show tool-sourced categories
      expect(screen.queryByText('Meeting Waste')).not.toBeInTheDocument();
      expect(screen.queryByText('Data Friction')).not.toBeInTheDocument();
    });

    it('shows message when filter returns no results', () => {
      const toolOnlyResult: AlignmentTaxResult = {
        ...emptyResult,
        meetingWaste: 100000,
        toolsSubtotal: 100000,
        total: 100000,
      };

      render(<CostCategoryChart result={toolOnlyResult} filter="input" />);

      expect(screen.getByText(/No categories match the current filter/)).toBeInTheDocument();
    });
  });

  describe('tool links', () => {
    it('renders links for tool-sourced categories', () => {
      render(<CostCategoryChart result={mockResult} />);

      const links = screen.getAllByTestId('next-link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('links to correct tool paths', () => {
      render(<CostCategoryChart result={mockResult} />);

      // Tool 2 (Meeting Audit) should link to /tool/meeting-audit
      const links = screen.getAllByTestId('next-link');
      const hrefs = links.map((link) => link.getAttribute('href'));

      expect(hrefs).toContain('/tool/meeting-audit');
      expect(hrefs).toContain('/tool/data-flow');
    });
  });

  describe('accessibility', () => {
    it('has accessible chart container', () => {
      render(<CostCategoryChart result={mockResult} />);

      expect(screen.getByRole('img', { name: /pie chart showing cost category breakdown/i })).toBeInTheDocument();
    });

    it('has accessible category list', () => {
      render(<CostCategoryChart result={mockResult} />);

      expect(screen.getByRole('list', { name: /cost categories/i })).toBeInTheDocument();
    });

    it('has aria-pressed on toggle buttons', () => {
      render(<CostCategoryChart result={mockResult} />);

      const pieButton = screen.getByRole('button', { name: /pie chart view/i });
      expect(pieButton).toHaveAttribute('aria-pressed', 'true');

      const barButton = screen.getByRole('button', { name: /bar chart view/i });
      expect(barButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('summary', () => {
    it('shows total amount', () => {
      render(<CostCategoryChart result={mockResult} />);

      expect(screen.getByText(/Total:/)).toBeInTheDocument();
      // Total is formatted by formatCurrency - check the value is displayed
      const totalText = screen.getByText(/Total:/).parentElement?.textContent;
      expect(totalText).toContain('$2.9M');
    });

    it('shows category count', () => {
      render(<CostCategoryChart result={mockResult} />);

      expect(screen.getByText(/Showing 6 of 6 categories/)).toBeInTheDocument();
    });

    it('updates count when filtered', () => {
      render(<CostCategoryChart result={mockResult} />);

      const toolButton = screen.getByRole('button', { name: /from tools/i });
      fireEvent.click(toolButton);

      expect(screen.getByText(/Showing 2 of 6 categories/)).toBeInTheDocument();
    });
  });

  describe('callback', () => {
    it('calls onCategoryClick when category clicked', () => {
      const handleClick = vi.fn();
      render(<CostCategoryChart result={mockResult} onCategoryClick={handleClick} />);

      // Click on a category row
      const meetingRow = screen.getByText('Meeting Waste').closest('div');
      if (meetingRow) {
        fireEvent.click(meetingRow);
      }

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CostCategoryChart result={mockResult} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('CostCategoryMiniChart', () => {
  const mockInterpretation: InterpretationThreshold = {
    level: 'significant',
    minPercent: 2,
    maxPercent: 4,
    label: 'Significant',
    description: 'Your alignment tax is above average.',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    icon: 'alert-triangle',
  };

  const mockResult: AlignmentTaxResult = {
    meetingWaste: 1200000,
    dataFriction: 450000,
    projectDelays: 0,
    rework: 0,
    turnover: 0,
    opportunityCost: 0,
    toolsSubtotal: 1650000,
    additionalSubtotal: 0,
    total: 1650000,
    revenue: 70000000,
    percentOfRevenue: 2.36,
    interpretation: mockInterpretation,
  };

  const emptyResult: AlignmentTaxResult = {
    meetingWaste: 0,
    dataFriction: 0,
    projectDelays: 0,
    rework: 0,
    turnover: 0,
    opportunityCost: 0,
    toolsSubtotal: 0,
    additionalSubtotal: 0,
    total: 0,
    revenue: 70000000,
    percentOfRevenue: 0,
    interpretation: mockInterpretation,
  };

  it('renders pie chart', () => {
    render(<CostCategoryMiniChart result={mockResult} />);

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('returns null when no data', () => {
    const { container } = render(<CostCategoryMiniChart result={emptyResult} />);

    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CostCategoryMiniChart result={mockResult} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
