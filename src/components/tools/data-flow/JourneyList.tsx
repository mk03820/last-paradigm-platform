/**
 * JourneyList Component
 *
 * Grid of journey cards with add button and empty state.
 *
 * Story 12.1: Data Journey Mapping Interface
 * Covers: AC4 (journey list with 3-5 journeys)
 */

'use client';

import * as React from 'react';
import { Plus, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { DataJourney } from './journey-constants';
import {
  MAX_JOURNEYS,
  RECOMMENDED_MIN_JOURNEYS,
  RECOMMENDED_MAX_JOURNEYS,
  JOURNEY_TEMPLATES,
} from './journey-constants';
import { JourneyCard } from './JourneyCard';

export interface JourneyListProps {
  journeys: DataJourney[];
  /** Callback when add journey is clicked */
  onAddJourney: () => void;
  /** Callback when edit journey is clicked */
  onEditJourney: (journeyId: string) => void;
  /** Callback when delete journey is clicked */
  onDeleteJourney: (journeyId: string) => void;
  /** Callback when a template quick-start is clicked */
  onQuickStart?: (templateId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Empty state with template quick-start options
 */
function EmptyState({
  onAddJourney,
  onQuickStart,
}: {
  onAddJourney: () => void;
  onQuickStart?: (templateId: string) => void;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Database
          className="h-12 w-12 text-muted-foreground/50 mb-4"
          aria-hidden="true"
        />
        <h3 className="text-lg font-semibold mb-1">No journeys mapped yet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Map 3-5 critical data journeys to identify where data gets stuck or
          degraded in your organization.
        </p>

        {/* Quick Start Templates */}
        {onQuickStart && (
          <div className="w-full max-w-md mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2 text-center">
              Quick start with a template:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {JOURNEY_TEMPLATES.slice(0, 4).map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickStart(template.id)}
                  className="text-xs justify-start"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Button onClick={onAddJourney}>
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Journey
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Add journey card placeholder
 */
function AddJourneyCard({
  onAdd,
  disabled,
}: {
  onAdd: () => void;
  disabled: boolean;
}) {
  return (
    <Card
      className={cn(
        'border-dashed flex items-center justify-center min-h-[180px]',
        disabled && 'opacity-50'
      )}
    >
      <Button
        variant="ghost"
        onClick={onAdd}
        disabled={disabled}
        className="flex flex-col items-center gap-2 h-auto py-6 px-8"
      >
        <Plus className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm font-medium">Add Journey</span>
      </Button>
    </Card>
  );
}

/**
 * Main JourneyList component
 */
export const JourneyList = React.memo(function JourneyList({
  journeys,
  onAddJourney,
  onEditJourney,
  onDeleteJourney,
  onQuickStart,
  className,
}: JourneyListProps) {
  const canAddMore = journeys.length < MAX_JOURNEYS;
  const isAtRecommendedMin = journeys.length >= RECOMMENDED_MIN_JOURNEYS;
  const isAtRecommendedMax = journeys.length >= RECOMMENDED_MAX_JOURNEYS;

  // Empty state
  if (journeys.length === 0) {
    return (
      <div className={className}>
        <EmptyState onAddJourney={onAddJourney} onQuickStart={onQuickStart} />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Journey Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {journeys.length} of {RECOMMENDED_MAX_JOURNEYS} journeys mapped
          {!isAtRecommendedMin && (
            <span className="text-yellow-600 dark:text-yellow-400">
              {' '}
              (minimum {RECOMMENDED_MIN_JOURNEYS} recommended)
            </span>
          )}
          {isAtRecommendedMax && (
            <span className="text-green-600 dark:text-green-400">
              {' '}
              (comprehensive coverage)
            </span>
          )}
        </p>
      </div>

      {/* Journey Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {journeys.map((journey) => (
          <JourneyCard
            key={journey.id}
            journey={journey}
            onEdit={() => onEditJourney(journey.id)}
            onDelete={() => onDeleteJourney(journey.id)}
          />
        ))}

        {/* Add button card */}
        {canAddMore && (
          <AddJourneyCard onAdd={onAddJourney} disabled={!canAddMore} />
        )}
      </div>

      {/* Max limit warning */}
      {!canAddMore && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          Maximum of {MAX_JOURNEYS} journeys reached.
        </p>
      )}
    </div>
  );
});
