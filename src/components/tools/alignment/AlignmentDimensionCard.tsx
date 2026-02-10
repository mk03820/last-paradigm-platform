'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { AlignmentDimension, DimensionId } from './constants';

interface AlignmentDimensionCardProps {
  dimension: AlignmentDimension;
  selectedScore?: number;
  onScoreSelect: (dimensionId: DimensionId, score: number) => void;
}

/**
 * AlignmentDimensionCard Component
 *
 * Displays a single alignment dimension with 4 score level buttons.
 * Each button shows a tooltip with the full description on hover/focus.
 *
 * Story 9.1: Alignment Dimension Scoring Interface
 * Covers: AC2 (4-level scale), AC3 (hover tooltips), AC4 (independent scoring)
 */
export function AlignmentDimensionCard({
  dimension,
  selectedScore,
  onScoreSelect,
}: AlignmentDimensionCardProps) {
  const handleKeyDown = (
    event: React.KeyboardEvent,
    currentScore: 1 | 2 | 3 | 4
  ) => {
    const scores = dimension.levels.map((l) => l.score);
    const currentIndex = scores.indexOf(currentScore);

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = Math.min(currentIndex + 1, scores.length - 1);
      onScoreSelect(dimension.id, scores[nextIndex]);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = Math.max(currentIndex - 1, 0);
      onScoreSelect(dimension.id, scores[prevIndex]);
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{dimension.label}</CardTitle>
        <CardDescription>{dimension.description}</CardDescription>
        <span className="text-xs text-muted-foreground">
          Weight: {Math.round(dimension.weight * 100)}%
        </span>
      </CardHeader>
      <CardContent>
        <div
          role="radiogroup"
          aria-label={`Score for ${dimension.label}`}
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {dimension.levels.map((level) => {
            const isSelected = selectedScore === level.score;

            return (
              <Tooltip key={level.score}>
                <TooltipTrigger asChild>
                  <Button
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${level.label}: ${level.description}`}
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      'h-12 flex-col gap-0.5 relative',
                      isSelected && 'ring-2 ring-primary ring-offset-2'
                    )}
                    onClick={() => onScoreSelect(dimension.id, level.score)}
                    onKeyDown={(e) => handleKeyDown(e, level.score)}
                  >
                    <span className="text-xs font-bold">{level.score}</span>
                    <span className="text-[10px] leading-tight">{level.label}</span>
                    {isSelected && (
                      <Check
                        className="absolute -top-1 -right-1 h-4 w-4 text-primary-foreground bg-primary rounded-full p-0.5"
                        aria-hidden="true"
                      />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-[250px] text-center"
                >
                  <p className="font-semibold">{level.label}</p>
                  <p className="text-sm">{level.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        {selectedScore && (
          <p
            className="mt-3 text-sm text-muted-foreground text-center"
            aria-live="polite"
          >
            Selected: {dimension.levels.find((l) => l.score === selectedScore)?.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
