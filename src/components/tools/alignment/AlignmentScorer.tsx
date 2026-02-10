'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTool1Store } from '@/lib/store/tool1-store';
import { AlignmentDimensionCard } from './AlignmentDimensionCard';
import { ALIGNMENT_DIMENSIONS } from './constants';
import type { DimensionId } from './constants';

const TOTAL_DIMENSIONS = 5;

/**
 * AlignmentScorer Component
 *
 * Container component for scoring all 5 alignment dimensions.
 * Displays progress and enables navigation to results when complete.
 *
 * Story 9.1: Alignment Dimension Scoring Interface
 * Covers: AC1 (5 dimensions), AC4 (independent scoring), AC5 (auto-save), AC6 (completion validation)
 */
export function AlignmentScorer() {
  const router = useRouter();
  const { scores, setScore, isComplete, getScoredCount } = useTool1Store();

  const scoredCount = getScoredCount();
  const progressPercent = (scoredCount / TOTAL_DIMENSIONS) * 100;
  const allComplete = isComplete();

  const handleScoreSelect = (dimensionId: DimensionId, score: number) => {
    setScore(dimensionId, score);
  };

  const handleViewResults = () => {
    if (allComplete) {
      router.push('/tool/alignment/results');
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {scoredCount} of {TOTAL_DIMENSIONS} dimensions scored
          </span>
          <span className="font-medium">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" aria-label="Scoring progress" />
      </div>

      {/* Dimension Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {ALIGNMENT_DIMENSIONS.map((dimension) => (
          <AlignmentDimensionCard
            key={dimension.id}
            dimension={dimension}
            selectedScore={scores[dimension.id]}
            onScoreSelect={handleScoreSelect}
          />
        ))}
      </div>

      {/* Results Button */}
      <div className="flex flex-col items-center gap-4 pt-4">
        {!allComplete && (
          <p className="text-sm text-muted-foreground text-center">
            Score all {TOTAL_DIMENSIONS} dimensions to see your results
          </p>
        )}
        <Button
          size="lg"
          disabled={!allComplete}
          onClick={handleViewResults}
          className="w-full sm:w-auto"
        >
          {allComplete ? 'See Results' : `${TOTAL_DIMENSIONS - scoredCount} dimensions remaining`}
        </Button>
      </div>
    </div>
  );
}
