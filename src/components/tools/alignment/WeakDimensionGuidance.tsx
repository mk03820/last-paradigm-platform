'use client';

import { useMemo } from 'react';
import { ALIGNMENT_DIMENSIONS, type DimensionId } from './constants';

/**
 * WeakDimensionGuidance Component
 *
 * Identifies the weakest 1-2 dimensions and displays specific improvement guidance.
 *
 * Story 9.4: Score Interpretation and Next Steps
 * Covers: AC2 (Guidance based on weakest dimensions)
 */

export interface WeakDimensionGuidanceProps {
  scores: Record<DimensionId, number>;
}

const DIMENSION_GUIDANCE: Record<
  DimensionId,
  { weak: string; focus: string }
> = {
  strategic: {
    weak: 'Strategic clarity is your biggest opportunity. Consider a strategy cascade workshop to ensure all teams understand how their work connects to organizational goals.',
    focus: 'Strategy Communication',
  },
  execution: {
    weak: 'Execution friction is limiting your delivery. Map your end-to-end delivery process to identify handoff points where work stalls.',
    focus: 'Delivery Process',
  },
  technology: {
    weak: 'Technology fragmentation is creating data silos. Prioritize integration over new tools.',
    focus: 'System Integration',
  },
  people: {
    weak: 'People alignment issues suggest cultural or communication challenges. Focus on psychological safety and knowledge sharing.',
    focus: 'Culture & Communication',
  },
  governance: {
    weak: 'Governance issues indicate decision bottlenecks. Clarify decision rights and empower teams closer to the work.',
    focus: 'Decision Rights',
  },
};

export function WeakDimensionGuidance({ scores }: WeakDimensionGuidanceProps) {
  const weakDimensions = useMemo(() => {
    // Sort dimensions by score (ascending) and take the lowest 1-2
    const sorted = ALIGNMENT_DIMENSIONS.map((dim) => ({
      dimension: dim,
      score: scores[dim.id],
    })).sort((a, b) => a.score - b.score);

    // Take the weakest dimension, and second if it's also low (<=2)
    const weakest = [sorted[0]];
    if (sorted[1] && sorted[1].score <= 2) {
      weakest.push(sorted[1]);
    }

    return weakest;
  }, [scores]);

  if (weakDimensions.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-xl border bg-card p-6"
      role="region"
      aria-labelledby="guidance-heading"
    >
      <h3
        id="guidance-heading"
        className="text-lg font-semibold mb-4 flex items-center gap-2"
      >
        <span aria-hidden="true">🎯</span>
        Priority Focus Areas
      </h3>
      <div className="space-y-4">
        {weakDimensions.map(({ dimension, score }) => {
          const guidance = DIMENSION_GUIDANCE[dimension.id];
          return (
            <div
              key={dimension.id}
              className="p-4 rounded-lg bg-muted/50 border"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">
                  {dimension.label}
                </h4>
                <span className="text-sm text-muted-foreground">
                  Score: {score}/4
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {guidance.weak}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                  Focus: {guidance.focus}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
