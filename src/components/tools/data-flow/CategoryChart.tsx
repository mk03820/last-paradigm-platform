/**
 * CategoryChart Component
 *
 * Displays a pie chart showing friction cost by category.
 * Uses recharts library for visualization.
 *
 * Story 12.4: Friction Category Breakdown and Recommendations
 * Task 2: Create CategoryChart component (AC: 1)
 */

'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { FrictionCategory } from './friction-constants';
import { FRICTION_CATEGORIES, getFrictionCategoryInfo } from './friction-constants';
import { formatCurrency } from './cost-constants';
import { cn } from '@/lib/utils';

interface CategoryChartProps {
  costByCategory: Record<FrictionCategory, number>;
  className?: string;
}

// Colors for pie chart segments (matching category colors)
const CHART_COLORS: Record<FrictionCategory, string> = {
  access_bureaucracy: '#f97316', // orange-500
  quality_degradation: '#ef4444', // red-500
  multiple_sources: '#a855f7', // purple-500
  technical_debt: '#3b82f6', // blue-500
};

interface ChartDataItem {
  name: string;
  value: number;
  category: FrictionCategory;
  percentage: number;
}

export function CategoryChart({ costByCategory, className }: CategoryChartProps) {
  const { data, total } = useMemo(() => {
    const totalCost = Object.values(costByCategory).reduce((sum, cost) => sum + cost, 0);

    const chartData: ChartDataItem[] = FRICTION_CATEGORIES.map((cat) => ({
      name: cat.label,
      value: costByCategory[cat.id],
      category: cat.id,
      percentage: totalCost > 0 ? Math.round((costByCategory[cat.id] / totalCost) * 100) : 0,
    })).filter((item) => item.value > 0);

    return { data: chartData, total: totalCost };
  }, [costByCategory]);

  if (total === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8', className)}>
        <p className="text-muted-foreground text-center">
          No cost data available. Add cost estimates to friction points to see the breakdown.
        </p>
      </div>
    );
  }

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
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(item.value)} ({item.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = () => {
    return (
      <div className="flex flex-col gap-2">
        {data.map((item) => {
          const categoryInfo = getFrictionCategoryInfo(item.category);
          return (
            <div
              key={item.category}
              className="flex items-center justify-between gap-4 rounded-md border p-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[item.category] }}
                />
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({categoryInfo.isOrganizational ? 'Org' : 'Tech'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                <span className="text-sm text-muted-foreground">({item.percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col gap-6 lg:flex-row lg:items-start', className)}>
      {/* Pie Chart */}
      <div className="h-[250px] w-full lg:w-1/2">
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
              label={({ payload }) => `${(payload as ChartDataItem).percentage}%`}
              labelLine={false}
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.category}`}
                  fill={CHART_COLORS[entry.category]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="w-full lg:w-1/2">{renderLegend()}</div>
    </div>
  );
}
