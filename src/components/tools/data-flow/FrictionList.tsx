/**
 * FrictionList Component
 *
 * Displays a list of friction points with grouping options.
 * Shows friction count and average severity.
 *
 * Story 12.2: Friction Point Identification
 * Covers: AC1-AC5 (list friction points with stats)
 */

'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FrictionCard } from './FrictionCard';
import type { FrictionPoint } from './friction-constants';
import type { DataStage } from './journey-constants';
import {
  calculateAverageSeverity,
  countByCategory,
  getFrictionSplit,
  getSeverityConfig,
} from './friction-constants';

export interface FrictionListProps {
  frictionPoints: FrictionPoint[];
  stages: DataStage[];
  onAdd: () => void;
  onEdit: (frictionPoint: FrictionPoint) => void;
  onDelete: (frictionPoint: FrictionPoint) => void;
  groupBy?: 'none' | 'stage' | 'category';
  className?: string;
}

export function FrictionList({
  frictionPoints,
  stages,
  onAdd,
  onEdit,
  onDelete,
  groupBy = 'none',
  className,
}: FrictionListProps) {
  // Create stage lookup map
  const stageMap = useMemo(
    () => new Map(stages.map((s) => [s.id, s])),
    [stages]
  );

  // Calculate stats
  const avgSeverity = calculateAverageSeverity(frictionPoints);
  const avgSeverityConfig = getSeverityConfig(Math.round(avgSeverity));
  const categoryBreakdown = countByCategory(frictionPoints);
  const { organizational, technical } = getFrictionSplit(frictionPoints);

  // Group friction points if needed
  const groupedPoints = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Friction Points': frictionPoints };
    }

    if (groupBy === 'stage') {
      const groups: Record<string, FrictionPoint[]> = {};
      for (const fp of frictionPoints) {
        const stage = stageMap.get(fp.stageId);
        const groupName = stage?.systemName || stage?.type || 'Unknown Stage';
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(fp);
      }
      return groups;
    }

    if (groupBy === 'category') {
      const groups: Record<string, FrictionPoint[]> = {};
      for (const fp of frictionPoints) {
        const groupName = fp.category;
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(fp);
      }
      return groups;
    }

    return { 'All Friction Points': frictionPoints };
  }, [frictionPoints, groupBy, stageMap]);

  // Empty state
  if (frictionPoints.length === 0) {
    return (
      <Card className={cn('text-center', className)}>
        <CardContent className="py-12">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="h-6 w-6 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">No Friction Points Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Document where data gets stuck, degraded, or duplicated along your
            journey. Start by identifying the biggest pain points.
          </p>
          <Button className="mt-6" onClick={onAdd}>
            Add First Friction Point
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Summary */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold">{frictionPoints.length}</div>
                <div className="text-sm text-muted-foreground">
                  Friction Points
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div
                  className={cn(
                    'text-2xl font-bold',
                    avgSeverityConfig.color
                  )}
                >
                  {avgSeverity}
                </div>
                <div className="text-sm text-muted-foreground">Avg Severity</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="text-sm">
                  <span className="font-medium">{organizational}</span>{' '}
                  <span className="text-muted-foreground">Org</span>
                  {' / '}
                  <span className="font-medium">{technical}</span>{' '}
                  <span className="text-muted-foreground">Tech</span>
                </div>
                <div className="text-sm text-muted-foreground">Split</div>
              </div>
            </div>
            <Button onClick={onAdd}>Add Friction Point</Button>
          </div>
        </CardContent>
      </Card>

      {/* Friction Point List */}
      {Object.entries(groupedPoints).map(([groupName, points]) => (
        <div key={groupName} className="space-y-4">
          {groupBy !== 'none' && (
            <h3 className="text-lg font-semibold capitalize">
              {groupName.replace('_', ' ')} ({points.length})
            </h3>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {points.map((fp) => (
              <FrictionCard
                key={fp.id}
                frictionPoint={fp}
                stage={stageMap.get(fp.stageId)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
