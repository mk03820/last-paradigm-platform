/**
 * CostCategoryChart Component
 *
 * Displays alignment tax by cost category with pie chart and bar chart views.
 * Supports sorting, filtering, and links to source tools.
 *
 * Story 14.4: Cost Category Breakdown Visualization
 * FR2-34: Cost category breakdown visualization
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Calendar,
  Database,
  Clock,
  RefreshCw,
  Users,
  TrendingUp,
  BarChart3,
  PieChartIcon,
  ExternalLink,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AlignmentTaxResult, CostSourceItem, CostSourceId } from './cost-constants';
import { TOOLS } from './cost-constants';
import {
  buildCostSourceItems,
  formatCurrency,
  formatPercentSmart,
} from './calculation-engine';

// ============================================================================
// Types
// ============================================================================

export interface CostCategoryChartProps {
  /** Alignment tax calculation result */
  result: AlignmentTaxResult;
  /** Initial chart view type */
  initialView?: 'pie' | 'bar';
  /** Initial sort order */
  initialSort?: 'amount' | 'percentage' | 'name';
  /** Filter to show only tool-sourced or input costs */
  filter?: 'all' | 'tool' | 'input';
  /** Callback when a category is clicked */
  onCategoryClick?: (category: CostSourceItem) => void;
  /** Additional CSS classes */
  className?: string;
}

type SortOption = 'amount' | 'percentage' | 'name';
type FilterOption = 'all' | 'tool' | 'input';

// ============================================================================
// Chart Colors - Based on interpretation severity colors
// ============================================================================

const CHART_COLORS: Record<CostSourceId, string> = {
  meetingWaste: '#f59e0b', // amber-500
  dataFriction: '#f97316', // orange-500
  projectDelays: '#ef4444', // red-500
  rework: '#8b5cf6', // violet-500
  turnover: '#ec4899', // pink-500
  opportunityCost: '#6366f1', // indigo-500
};

const getCategoryColor = (id: CostSourceId): string => {
  return CHART_COLORS[id] || '#6b7280'; // gray-500 fallback
};

// ============================================================================
// Icon Helper
// ============================================================================

function getCostSourceIcon(id: string, className?: string): React.ReactNode {
  const iconProps = { className: cn('w-4 h-4', className), 'aria-hidden': true };

  switch (id) {
    case 'meetingWaste':
      return <Calendar {...iconProps} />;
    case 'dataFriction':
      return <Database {...iconProps} />;
    case 'projectDelays':
      return <Clock {...iconProps} />;
    case 'rework':
      return <RefreshCw {...iconProps} />;
    case 'turnover':
      return <Users {...iconProps} />;
    case 'opportunityCost':
      return <TrendingUp {...iconProps} />;
    default:
      return <BarChart3 {...iconProps} />;
  }
}

// ============================================================================
// Tool Link Helper
// ============================================================================

function getToolPath(toolNumber: number | undefined): string | null {
  if (!toolNumber) return null;
  const tool = TOOLS.find((t) => t.number === toolNumber);
  return tool?.path || null;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Displays alignment tax by cost category with interactive visualization
 *
 * Features:
 * - Toggle between pie chart and bar chart views
 * - Sort by amount, percentage, or name
 * - Filter by source type (tool vs manual input)
 * - Click to navigate to source tool
 * - Responsive layout
 * - Accessible with ARIA labels
 */
export function CostCategoryChart({
  result,
  initialView = 'pie',
  initialSort = 'amount',
  filter: initialFilter = 'all',
  onCategoryClick,
  className,
}: CostCategoryChartProps) {
  const [view, setView] = React.useState<'pie' | 'bar'>(initialView);
  const [sort, setSort] = React.useState<SortOption>(initialSort);
  const [filter, setFilter] = React.useState<FilterOption>(initialFilter);

  // Build and process data
  const { data, filteredData } = React.useMemo(() => {
    const items = buildCostSourceItems(result);

    // Apply filter
    let filtered = items;
    if (filter === 'tool') {
      filtered = items.filter((item) => item.source === 'tool');
    } else if (filter === 'input') {
      filtered = items.filter((item) => item.source === 'input');
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'amount':
          return b.amount - a.amount;
        case 'percentage':
          return b.percentage - a.percentage;
        case 'name':
          return a.label.localeCompare(b.label);
        default:
          return 0;
      }
    });

    return { data: items, filteredData: sorted };
  }, [result, filter, sort]);

  // Check if we have data
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No cost data available. Complete diagnostic tools or add additional costs to see the breakdown.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Chart data format
  const chartData = filteredData.map((item) => ({
    ...item,
    name: item.label,
    value: item.amount,
    fill: getCategoryColor(item.id),
  }));

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5" aria-hidden="true" />
          Cost Category Breakdown
        </CardTitle>
        <CardAction>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div
              className="flex rounded-md border"
              role="group"
              aria-label="Chart view type"
            >
              <Button
                variant={view === 'pie' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-r-none border-r"
                onClick={() => setView('pie')}
                aria-pressed={view === 'pie'}
              >
                <PieChartIcon className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Pie chart view</span>
              </Button>
              <Button
                variant={view === 'bar' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setView('bar')}
                aria-pressed={view === 'bar'}
              >
                <BarChart3 className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Bar chart view</span>
              </Button>
            </div>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Sort:</span>
            <div className="flex gap-1">
              {(['amount', 'percentage', 'name'] as SortOption[]).map((option) => (
                <Button
                  key={option}
                  variant={sort === option ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSort(option)}
                  className="h-7 px-2 text-xs capitalize"
                  aria-pressed={sort === option}
                >
                  {option === 'percentage' ? '%' : option}
                </Button>
              ))}
            </div>
          </div>

          {/* Filter Control */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Show:</span>
            <div className="flex gap-1">
              {(['all', 'tool', 'input'] as FilterOption[]).map((option) => (
                <Button
                  key={option}
                  variant={filter === option ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(option)}
                  className="h-7 px-2 text-xs capitalize"
                  aria-pressed={filter === option}
                >
                  {option === 'tool' ? 'From Tools' : option === 'input' ? 'Manual' : 'All'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No categories match the current filter.
          </p>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Chart */}
            <div
              className="h-[280px] w-full lg:w-1/2"
              role="img"
              aria-label={`${view === 'pie' ? 'Pie' : 'Bar'} chart showing cost category breakdown`}
            >
              {view === 'pie' ? (
                <PieChartView data={chartData} />
              ) : (
                <BarChartView data={chartData} />
              )}
            </div>

            {/* Legend / List */}
            <div className="w-full lg:w-1/2">
              <CategoryList
                items={filteredData}
                onCategoryClick={onCategoryClick}
              />
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {data.length} categories
            </span>
            <span className="font-semibold text-lg">
              Total: {formatCurrency(result.total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Pie Chart View
// ============================================================================

interface ChartDataItem extends CostSourceItem {
  name: string;
  value: number;
  fill: string;
}

function PieChartView({ data }: { data: ChartDataItem[] }) {
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: ChartDataItem }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            {getCostSourceIcon(item.id)}
            <span className="font-medium">{item.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(item.amount)} ({formatPercentSmart(item.percentage)})
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {item.source === 'tool' ? `From Tool ${item.toolNumber}` : 'Manual Input'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ payload }) => `${formatPercentSmart((payload as ChartDataItem).percentage)}`}
          labelLine={false}
        >
          {data.map((entry) => (
            <Cell
              key={`cell-${entry.id}`}
              fill={entry.fill}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// Bar Chart View
// ============================================================================

function BarChartView({ data }: { data: ChartDataItem[] }) {
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: ChartDataItem }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            {getCostSourceIcon(item.id)}
            <span className="font-medium">{item.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(item.amount)} ({formatPercentSmart(item.percentage)})
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={`cell-${entry.id}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// Category List with Links
// ============================================================================

function CategoryList({
  items,
  onCategoryClick,
}: {
  items: CostSourceItem[];
  onCategoryClick?: (category: CostSourceItem) => void;
}) {
  return (
    <ul className="space-y-2" role="list" aria-label="Cost categories">
      {items.map((item) => {
        const toolPath = getToolPath(item.toolNumber);
        const hasLink = item.source === 'tool' && toolPath;

        const content = (
          <div
            className={cn(
              'flex items-center justify-between gap-4 rounded-md border p-3 transition-colors',
              hasLink && 'hover:bg-muted/50 cursor-pointer'
            )}
            onClick={() => onCategoryClick?.(item)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getCategoryColor(item.id) }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {getCostSourceIcon(item.id)}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
                {item.source === 'tool' && (
                  <span className="text-xs text-muted-foreground">
                    (Tool {item.toolNumber})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">{formatCurrency(item.amount)}</div>
                <div className="text-xs text-muted-foreground">
                  {formatPercentSmart(item.percentage)}
                </div>
              </div>
              {hasLink && (
                <ExternalLink
                  className="w-4 h-4 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        );

        return (
          <li key={item.id}>
            {hasLink ? (
              <Link
                href={toolPath}
                className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                aria-label={`${item.label}: ${formatCurrency(item.amount)} (${formatPercentSmart(item.percentage)}). Click to view Tool ${item.toolNumber}`}
              >
                {content}
              </Link>
            ) : (
              <div
                aria-label={`${item.label}: ${formatCurrency(item.amount)} (${formatPercentSmart(item.percentage)}). Manual input`}
              >
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ============================================================================
// Compact Chart (for embedding in results page)
// ============================================================================

export interface CostCategoryMiniChartProps {
  /** Alignment tax calculation result */
  result: AlignmentTaxResult;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Compact pie chart for embedding in the results page
 */
export function CostCategoryMiniChart({
  result,
  className,
}: CostCategoryMiniChartProps) {
  const items = React.useMemo(() => buildCostSourceItems(result), [result]);

  if (items.length === 0) {
    return null;
  }

  const chartData = items.map((item) => ({
    ...item,
    name: item.label,
    value: item.amount,
    fill: getCategoryColor(item.id),
  }));

  return (
    <div className={cn('h-[150px] w-[150px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={1}
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.id}`}
                fill={entry.fill}
                stroke="transparent"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
