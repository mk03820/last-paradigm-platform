/**
 * StagePipeline Component
 *
 * Displays data journey stages in a horizontal pipeline visualization
 * with connectors between stages.
 *
 * Story 12.1: Data Journey Mapping Interface
 * Covers: AC2, AC3 (stage visualization)
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
}: {
  stage: DataStage;
  compact?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const typeInfo = getStageTypeInfo(stage.type);
  const latencyHours =
    stage.latencyUnit === 'days' ? stage.latency * 24 : stage.latency;

  return (
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
      }`}
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
            onClick={onStageClick ? () => onStageClick(stage.id) : undefined}
          />
        </React.Fragment>
      ))}
    </div>
  );
});
