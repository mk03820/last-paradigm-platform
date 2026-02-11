/**
 * StagePipeline Component
 *
 * Displays data journey stages in a horizontal pipeline visualization
 * with connectors between stages.
 *
 * Story 12.1: Data Journey Mapping Interface
 * Covers: AC2, AC3 (stage visualization)
 *
 * Story 12.2: Friction Point Identification
 * Covers: Task 7 (friction count badges on stages)
 */

'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DataStage } from './journey-constants';
import { getStageTypeInfo, formatLatency } from './journey-constants';

export interface StagePipelineProps {
  stages: DataStage[];
  /** Show compact version without latency */
  compact?: boolean;
  /** Callback when a stage is clicked */
  onStageClick?: (stageId: string) => void;
  /** Currently selected stage ID */
  selectedStageId?: string;
  /** Friction counts by stage ID for displaying badges */
  frictionCounts?: Record<string, number>;
  /** Whether stages are clickable (enables hover states) */
  clickable?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Single stage in the pipeline
 */
function PipelineStage({
  stage,
  compact,
  isSelected,
  onClick,
  frictionCount,
}: {
  stage: DataStage;
  compact?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  frictionCount?: number;
}) {
  const typeInfo = getStageTypeInfo(stage.type);
  const latencyHours =
    stage.latencyUnit === 'days' ? stage.latency * 24 : stage.latency;

  return (
    <div className="relative">
      {/* Friction count badge */}
      {frictionCount !== undefined && frictionCount > 0 && (
        <span
          className={cn(
            'absolute -top-2 -right-2 z-10',
            'flex h-5 w-5 items-center justify-center',
            'rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground'
          )}
          aria-label={`${frictionCount} friction point${frictionCount !== 1 ? 's' : ''}`}
        >
          {frictionCount}
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          'flex flex-col items-center text-center transition-all',
          'rounded-lg border-2 p-2',
          compact ? 'min-w-[60px] max-w-[80px]' : 'min-w-[100px] max-w-[140px]',
          typeInfo.bgColor,
          isSelected ? 'ring-2 ring-primary ring-offset-2' : typeInfo.borderColor,
          onClick && 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring',
          !onClick && 'cursor-default'
        )}
        aria-label={`${typeInfo.label}: ${stage.systemName || 'Not configured'}${
          !compact ? `, latency: ${formatLatency(latencyHours)}` : ''
        }${frictionCount ? `, ${frictionCount} friction points` : ''}`}
      >
        <span
          className={cn(
            'text-[10px] font-semibold uppercase tracking-wide',
            typeInfo.color
          )}
        >
          {typeInfo.shortLabel}
        </span>
        <span
          className={cn(
            'text-xs font-medium truncate w-full mt-0.5',
            stage.systemName ? 'text-foreground' : 'text-muted-foreground italic'
          )}
          title={stage.systemName || 'Not configured'}
        >
          {stage.systemName || '...'}
        </span>
        {!compact && (
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {formatLatency(latencyHours)}
          </span>
        )}
      </button>
    </div>
  );
}

/**
 * Connector arrow between stages
 */
function StageConnector({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center px-0.5', className)}>
      <ArrowRight
        className="h-4 w-4 text-muted-foreground/50"
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Main StagePipeline component
 */
export const StagePipeline = React.memo(function StagePipeline({
  stages,
  compact = false,
  onStageClick,
  selectedStageId,
  frictionCounts,
  clickable = false,
  className,
}: StagePipelineProps) {
  // Sort stages by order
  const sortedStages = React.useMemo(
    () => [...stages].sort((a, b) => a.order - b.order),
    [stages]
  );

  if (sortedStages.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center py-4 text-sm text-muted-foreground',
          className
        )}
      >
        No stages defined
      </div>
    );
  }

  // Determine if stages should be clickable
  const isClickable = clickable || !!onStageClick;

  return (
    <div
      className={cn(
        'flex items-center overflow-x-auto py-2',
        className
      )}
      role="list"
      aria-label="Data journey stages"
    >
      {sortedStages.map((stage, index) => (
        <React.Fragment key={stage.id}>
          {index > 0 && <StageConnector />}
          <PipelineStage
            stage={stage}
            compact={compact}
            isSelected={stage.id === selectedStageId}
            onClick={isClickable && onStageClick ? () => onStageClick(stage.id) : undefined}
            frictionCount={frictionCounts?.[stage.id]}
          />
        </React.Fragment>
      ))}
    </div>
  );
});
