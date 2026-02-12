/**
 * AdditionalCostsForm Component
 *
 * Combines all cost input components into a single form with running total.
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 7: Create AdditionalCostsForm component (AC: 1, 2, 4)
 */

'use client';

import type {
  AdditionalCostsInput,
  ProjectDelaysCostInput as ProjectDelaysCostInputType,
  ReworkCostInput as ReworkCostInputType,
  TurnoverCostInput as TurnoverCostInputType,
  OpportunityCostInput as OpportunityCostInputType,
} from './cost-constants';
import { formatCurrency } from './cost-constants';
import { ProjectDelaysCostInput } from './ProjectDelaysCostInput';
import { ReworkCostInput } from './ReworkCostInput';
import { TurnoverCostInput } from './TurnoverCostInput';
import { OpportunityCostInput } from './OpportunityCostInput';
import { cn } from '@/lib/utils';

interface AdditionalCostsFormProps {
  data: AdditionalCostsInput;
  onProjectDelaysChange: (data: Partial<Omit<ProjectDelaysCostInputType, 'subtotal'>>) => void;
  onReworkChange: (data: Partial<Omit<ReworkCostInputType, 'subtotal'>>) => void;
  onTurnoverChange: (data: Partial<Omit<TurnoverCostInputType, 'subtotal'>>) => void;
  onOpportunityCostChange: (data: Partial<Omit<OpportunityCostInputType, 'subtotal'>>) => void;
  className?: string;
}

export function AdditionalCostsForm({
  data,
  onProjectDelaysChange,
  onReworkChange,
  onTurnoverChange,
  onOpportunityCostChange,
  className,
}: AdditionalCostsFormProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Cost Input Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <ProjectDelaysCostInput
          data={data.projectDelays}
          onChange={onProjectDelaysChange}
        />
        <ReworkCostInput
          data={data.rework}
          onChange={onReworkChange}
        />
        <TurnoverCostInput
          data={data.turnover}
          onChange={onTurnoverChange}
        />
        <OpportunityCostInput
          data={data.opportunityCost}
          onChange={onOpportunityCostChange}
        />
      </div>

      {/* Running Total */}
      <div className="p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Total Additional Costs</h3>
            <p className="text-sm text-muted-foreground">
              Sum of all additional cost categories
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(data.total)}
            </span>
            {data.total > 0 && (
              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                {data.projectDelays.subtotal > 0 && (
                  <p>Project Delays: {formatCurrency(data.projectDelays.subtotal)}</p>
                )}
                {data.rework.subtotal > 0 && (
                  <p>Rework: {formatCurrency(data.rework.subtotal)}</p>
                )}
                {data.turnover.subtotal > 0 && (
                  <p>Turnover: {formatCurrency(data.turnover.subtotal)}</p>
                )}
                {data.opportunityCost.subtotal > 0 && (
                  <p>Opportunity Cost: {formatCurrency(data.opportunityCost.subtotal)}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
