'use client';

import { BUDGET_THRESHOLDS, type BudgetThresholdId } from './constants';

/**
 * BudgetThresholdSelector Component
 *
 * Radio/segmented control for selecting budget tier.
 * Each tier has different velocity benchmarks.
 *
 * Story 10.1: Decision Sample Input Interface
 * Covers: AC4 (Budget decisions segmented by threshold)
 */

export interface BudgetThresholdSelectorProps {
  value: BudgetThresholdId;
  onChange: (threshold: BudgetThresholdId) => void;
  disabled?: boolean;
}

export function BudgetThresholdSelector({
  value,
  onChange,
  disabled = false,
}: BudgetThresholdSelectorProps) {
  return (
    <div
      className="space-y-2"
      role="radiogroup"
      aria-labelledby="budget-threshold-label"
    >
      <label
        id="budget-threshold-label"
        className="text-sm font-medium text-foreground"
      >
        Budget Range
      </label>
      <div className="flex flex-wrap gap-2">
        {BUDGET_THRESHOLDS.map((threshold) => (
          <label
            key={threshold.id}
            className={`
              inline-flex items-center px-3 py-2 rounded-lg border cursor-pointer
              transition-colors text-sm font-medium
              ${
                value === threshold.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name="budget-threshold"
              value={threshold.id}
              checked={value === threshold.id}
              onChange={() => onChange(threshold.id)}
              disabled={disabled}
              className="sr-only"
              aria-describedby={`threshold-${threshold.id}-desc`}
            />
            <span>{threshold.shortLabel}</span>
            <span id={`threshold-${threshold.id}-desc`} className="sr-only">
              {threshold.label}
            </span>
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Select the typical budget range for decisions you&apos;ll enter
      </p>
    </div>
  );
}
