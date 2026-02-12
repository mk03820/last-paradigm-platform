/**
 * HealthIndicatorsTable Component
 *
 * Displays all health indicators in a table grouped by category.
 *
 * Story 13.3: Health Indicators Dashboard
 * Task 4: Create HealthIndicatorsTable component (AC: 1, 2, 3)
 */

'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HealthIndicatorResult, IndicatorCategory } from './comm-constants';
import { HEALTH_INDICATORS, getHealthIndicatorsByCategory } from './comm-constants';
import { HealthIndicatorRow, HealthIndicatorCard } from './HealthIndicatorRow';

export interface HealthIndicatorsTableProps {
  results: HealthIndicatorResult[];
}

const CATEGORY_CONFIG: Record<IndicatorCategory, { title: string; icon: string }> = {
  email: { title: 'Email', icon: '📧' },
  chat: { title: 'Chat/Messaging', icon: '💬' },
  meetings: { title: 'Meetings', icon: '📅' },
};

const CATEGORIES: IndicatorCategory[] = ['email', 'chat', 'meetings'];

export function HealthIndicatorsTable({ results }: HealthIndicatorsTableProps) {
  // Create a map for quick result lookup
  const resultMap = new Map(results.map((r) => [r.indicatorId, r]));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span aria-hidden="true">📈</span>
          Health Indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Metric</TableHead>
                <TableHead>My Value</TableHead>
                <TableHead className="text-green-700 dark:text-green-400">Healthy</TableHead>
                <TableHead className="text-yellow-700 dark:text-yellow-400">Warning</TableHead>
                <TableHead className="text-red-700 dark:text-red-400">Crisis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CATEGORIES.map((category) => {
                const categoryIndicators = getHealthIndicatorsByCategory(category);
                const config = CATEGORY_CONFIG[category];

                return (
                  <React.Fragment key={category}>
                    {/* Category Header Row */}
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableCell
                        colSpan={5}
                        className="font-semibold text-sm"
                      >
                        <span aria-hidden="true" className="mr-2">
                          {config.icon}
                        </span>
                        {config.title}
                      </TableCell>
                    </TableRow>

                    {/* Indicator Rows for this Category */}
                    {categoryIndicators.map((indicator) => {
                      const result = resultMap.get(indicator.id);
                      if (!result) return null;

                      return (
                        <HealthIndicatorRow
                          key={indicator.id}
                          indicator={indicator}
                          result={result}
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-6">
          {CATEGORIES.map((category) => {
            const categoryIndicators = getHealthIndicatorsByCategory(category);
            const config = CATEGORY_CONFIG[category];

            return (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <span aria-hidden="true">{config.icon}</span>
                  {config.title}
                </h3>
                <div className="space-y-3">
                  {categoryIndicators.map((indicator) => {
                    const result = resultMap.get(indicator.id);
                    if (!result) return null;

                    return (
                      <HealthIndicatorCard
                        key={indicator.id}
                        indicator={indicator}
                        result={result}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Summary of indicator counts by status
 */
export function IndicatorStatusSummary({ results }: HealthIndicatorsTableProps) {
  const validResults = results.filter((r) => r.value !== null);
  const healthyCount = validResults.filter((r) => r.status === 'healthy').length;
  const warningCount = validResults.filter((r) => r.status === 'warning').length;
  const crisisCount = validResults.filter((r) => r.status === 'crisis').length;

  return (
    <div className="flex gap-4 text-sm">
      <div className="flex items-center gap-1">
        <span aria-hidden="true">🟢</span>
        <span>{healthyCount} Healthy</span>
      </div>
      <div className="flex items-center gap-1">
        <span aria-hidden="true">🟡</span>
        <span>{warningCount} Warning</span>
      </div>
      <div className="flex items-center gap-1">
        <span aria-hidden="true">🔴</span>
        <span>{crisisCount} Crisis</span>
      </div>
    </div>
  );
}
