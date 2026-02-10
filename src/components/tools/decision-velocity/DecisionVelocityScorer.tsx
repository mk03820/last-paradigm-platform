'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DecisionArchetypeCard } from './DecisionArchetypeCard';
import { DECISION_ARCHETYPES, type DecisionSample, type BudgetThresholdId } from './constants';
import { useTool3Store } from '@/lib/store/tool3-store';

/**
 * DecisionVelocityScorer Component
 *
 * Main container for entering decision samples across all archetypes.
 * Shows progress and enables navigation to results when ready.
 *
 * Story 10.1: Decision Sample Input Interface
 * Covers: AC1-8 (all acceptance criteria)
 */

export function DecisionVelocityScorer() {
  const router = useRouter();
  const {
    archetypes,
    addSample,
    updateSample,
    removeSample,
    setSkipped,
    setBudgetThreshold,
    getTotalSamples,
    getValidArchetypeCount,
    canProceed,
  } = useTool3Store();

  const totalSamples = getTotalSamples();
  const validCount = getValidArchetypeCount();
  const canCalculate = canProceed();

  // Count active (non-skipped) archetypes
  const activeCount = Object.values(archetypes).filter((a) => !a.skipped).length;
  const progressPercent = activeCount > 0 ? (validCount / activeCount) * 100 : 0;

  const handleAddSample = useCallback(
    (archetypeId: string) => (sample: Omit<DecisionSample, 'id'>) => {
      addSample(archetypeId as keyof typeof archetypes, sample);
    },
    [addSample]
  );

  const handleUpdateSample = useCallback(
    (archetypeId: string) => (sampleId: string, updates: Partial<DecisionSample>) => {
      updateSample(archetypeId as keyof typeof archetypes, sampleId, updates);
    },
    [updateSample]
  );

  const handleRemoveSample = useCallback(
    (archetypeId: string) => (sampleId: string) => {
      removeSample(archetypeId as keyof typeof archetypes, sampleId);
    },
    [removeSample]
  );

  const handleSetSkipped = useCallback(
    (archetypeId: string) => (skipped: boolean) => {
      setSkipped(archetypeId as keyof typeof archetypes, skipped);
    },
    [setSkipped]
  );

  const handleSetBudgetThreshold = useCallback(
    (threshold: BudgetThresholdId) => {
      setBudgetThreshold(threshold);
    },
    [setBudgetThreshold]
  );

  const handleCalculate = useCallback(() => {
    router.push('/tool/decision-velocity/results');
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium">
              {totalSamples} decision{totalSamples !== 1 ? 's' : ''} entered
            </p>
            <p className="text-xs text-muted-foreground">
              {validCount} of {activeCount} categories ready for analysis
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {Math.round(progressPercent)}%
            </p>
          </div>
        </div>
        <Progress
          value={progressPercent}
          className="h-2"
          aria-label={`${validCount} of ${activeCount} categories complete`}
        />
      </div>

      {/* Archetype Cards */}
      <div className="space-y-4">
        {DECISION_ARCHETYPES.map((archetype) => (
          <DecisionArchetypeCard
            key={archetype.id}
            archetype={archetype}
            data={archetypes[archetype.id]}
            onAddSample={handleAddSample(archetype.id)}
            onUpdateSample={handleUpdateSample(archetype.id)}
            onRemoveSample={handleRemoveSample(archetype.id)}
            onSetSkipped={handleSetSkipped(archetype.id)}
            onSetBudgetThreshold={
              archetype.hasThresholds ? handleSetBudgetThreshold : undefined
            }
          />
        ))}
      </div>

      {/* Calculate Button */}
      <div className="pt-4">
        <Button
          onClick={handleCalculate}
          disabled={!canCalculate}
          className="w-full sm:w-auto"
          size="lg"
        >
          {canCalculate
            ? 'Calculate Velocity'
            : `Need at least 3 samples in 1 category`}
        </Button>
        {!canCalculate && (
          <p className="text-sm text-muted-foreground mt-2">
            Enter at least 3 decisions in any category to see your velocity analysis.
          </p>
        )}
      </div>
    </div>
  );
}
