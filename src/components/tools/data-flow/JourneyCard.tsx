/**
 * JourneyCard Component
 *
 * Summary card for a data journey showing name, stage count,
 * and total latency with edit/delete actions.
 *
 * Story 12.1: Data Journey Mapping Interface
 * Covers: AC4 (journey list display)
 */

'use client';

import * as React from 'react';
import { Pencil, Trash2, Clock, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DataJourney } from './journey-constants';
import { calculateTotalLatency, formatLatency } from './journey-constants';
import { StagePipeline } from './StagePipeline';

export interface JourneyCardProps {
  journey: DataJourney;
  /** Callback when edit is clicked */
  onEdit: () => void;
  /** Callback when delete is clicked */
  onDelete: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const JourneyCard = React.memo(function JourneyCard({
  journey,
  onEdit,
  onDelete,
  className,
}: JourneyCardProps) {
  const totalLatencyHours = React.useMemo(
    () => calculateTotalLatency(journey.stages),
    [journey.stages]
  );

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold line-clamp-1">
            {journey.name}
          </CardTitle>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
              aria-label={`Edit ${journey.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              aria-label={`Delete ${journey.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {journey.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {journey.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-2">
        {/* Stage Pipeline Preview */}
        <div className="mb-3 -mx-2">
          <StagePipeline stages={journey.stages} compact />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span>
              {journey.stages.length}{' '}
              {journey.stages.length === 1 ? 'stage' : 'stages'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{formatLatency(totalLatencyHours)} total</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
