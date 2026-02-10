'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DecisionSampleForm } from './DecisionSampleForm';
import { DecisionSampleList } from './DecisionSampleList';
import { BudgetThresholdSelector } from './BudgetThresholdSelector';
import {
  type DecisionArchetype,
  type ArchetypeData,
  type DecisionSample,
  type BudgetThresholdId,
} from './constants';

/**
 * DecisionArchetypeCard Component
 *
 * Card for entering decision samples for a single archetype.
 * Includes sample count, skip toggle, and collapsible sample list.
 *
 * Story 10.1: Decision Sample Input Interface
 * Covers: AC1, AC5, AC6, AC8
 */

export interface DecisionArchetypeCardProps {
  archetype: DecisionArchetype;
  data: ArchetypeData;
  onAddSample: (sample: Omit<DecisionSample, 'id'>) => void;
  onUpdateSample: (sampleId: string, updates: Partial<DecisionSample>) => void;
  onRemoveSample: (sampleId: string) => void;
  onSetSkipped: (skipped: boolean) => void;
  onSetBudgetThreshold?: (threshold: BudgetThresholdId) => void;
}

export function DecisionArchetypeCard({
  archetype,
  data,
  onAddSample,
  onUpdateSample,
  onRemoveSample,
  onSetSkipped,
  onSetBudgetThreshold,
}: DecisionArchetypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const sampleCount = data.samples.length;
  const hasMinimum = sampleCount >= archetype.minSamples;
  const isComplete = sampleCount >= archetype.maxSamples;
  const showWarning = !data.skipped && sampleCount > 0 && !hasMinimum;

  const getStatusColor = () => {
    if (data.skipped) return 'border-muted bg-muted/30';
    if (hasMinimum) return 'border-green-200 bg-green-50';
    if (sampleCount > 0) return 'border-orange-200 bg-orange-50';
    return 'border-border bg-card';
  };

  const getStatusBadge = () => {
    if (data.skipped) return { label: 'Skipped', className: 'bg-muted text-muted-foreground' };
    if (hasMinimum) return { label: 'Ready', className: 'bg-green-100 text-green-800' };
    if (sampleCount > 0) return { label: 'Need more', className: 'bg-orange-100 text-orange-800' };
    return null;
  };

  const statusBadge = getStatusBadge();

  return (
    <div className={`rounded-xl border p-4 ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold">{archetype.label}</h3>
            {statusBadge && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {archetype.description}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Examples: {archetype.examples}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={data.skipped}
              onChange={(e) => onSetSkipped(e.target.checked)}
              className="rounded border-gray-300"
              aria-describedby={`skip-${archetype.id}-desc`}
            />
            <span>Skip</span>
          </label>
          <span id={`skip-${archetype.id}-desc`} className="sr-only">
            Skip this category if not relevant to your organization
          </span>
        </div>
      </div>

      {!data.skipped && (
        <>
          {/* Sample Count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {sampleCount} of {archetype.minSamples}-{archetype.maxSamples} samples
              </span>
              {showWarning && (
                <span className="text-xs text-orange-600">
                  (need {archetype.minSamples - sampleCount} more for analysis)
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls={`samples-${archetype.id}`}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                hasMinimum ? 'bg-green-500' : 'bg-orange-400'
              }`}
              style={{
                width: `${Math.min((sampleCount / archetype.maxSamples) * 100, 100)}%`,
              }}
              role="progressbar"
              aria-valuenow={sampleCount}
              aria-valuemin={0}
              aria-valuemax={archetype.maxSamples}
              aria-label={`${sampleCount} of ${archetype.maxSamples} samples entered`}
            />
          </div>

          {/* Expandable Content */}
          {isExpanded && (
            <div id={`samples-${archetype.id}`} className="mt-4 space-y-4">
              {/* Budget Threshold Selector */}
              {archetype.hasThresholds && onSetBudgetThreshold && data.budgetThreshold && (
                <BudgetThresholdSelector
                  value={data.budgetThreshold}
                  onChange={onSetBudgetThreshold}
                />
              )}

              {/* Sample List */}
              <DecisionSampleList
                samples={data.samples}
                onUpdate={onUpdateSample}
                onDelete={onRemoveSample}
              />

              {/* Add New Sample */}
              {isAddingNew ? (
                <DecisionSampleForm
                  onSave={(sample) => {
                    onAddSample(sample);
                    setIsAddingNew(false);
                  }}
                  onCancel={() => setIsAddingNew(false)}
                />
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingNew(true)}
                  disabled={isComplete}
                  className="w-full"
                >
                  {isComplete ? 'Maximum samples reached' : 'Add Decision'}
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
