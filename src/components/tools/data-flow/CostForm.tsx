/**
 * CostForm Component
 *
 * Form for entering cost estimates for a friction point.
 * Includes hours/week, hourly rate, and opportunity cost.
 *
 * Story 12.3: Friction Cost Calculation
 * Covers: AC1 (FTE cost), AC2 (opportunity cost)
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { FrictionCost } from './cost-constants';
import {
  HOURLY_RATE_PRESETS,
  DEFAULT_HOURLY_RATE,
  MAX_HOURS_PER_WEEK,
  WORKING_WEEKS_PER_YEAR,
  calculateFTECost,
  calculateTotalFrictionCost,
  formatCurrency,
  validateCost,
  createDefaultCost,
} from './cost-constants';

export interface CostFormData {
  hoursPerWeek: number;
  hourlyRate: number;
  opportunityCost: number;
}

export interface CostFormProps {
  initialData?: Partial<CostFormData>;
  onSubmit: (data: CostFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
  className?: string;
}

export function CostForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
  className,
}: CostFormProps) {
  const [hoursPerWeek, setHoursPerWeek] = useState(initialData?.hoursPerWeek ?? 0);
  const [hourlyRate, setHourlyRate] = useState(
    initialData?.hourlyRate ?? DEFAULT_HOURLY_RATE
  );
  const [customRate, setCustomRate] = useState('');
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [opportunityCost, setOpportunityCost] = useState(
    initialData?.opportunityCost ?? 0
  );

  const [errors, setErrors] = useState<{
    hoursPerWeek?: string;
    hourlyRate?: string;
    opportunityCost?: string;
  }>({});

  // Check if initial rate is a preset
  useEffect(() => {
    if (initialData?.hourlyRate) {
      const isPreset = HOURLY_RATE_PRESETS.some(
        (p) => p.value === initialData.hourlyRate
      );
      if (!isPreset) {
        setUseCustomRate(true);
        setCustomRate(initialData.hourlyRate.toString());
      }
    }
  }, [initialData?.hourlyRate]);

  // Calculate live costs
  const fteCost = useMemo(
    () => calculateFTECost(hoursPerWeek, hourlyRate),
    [hoursPerWeek, hourlyRate]
  );

  const totalCost = useMemo(
    () =>
      calculateTotalFrictionCost({
        hoursPerWeek,
        hourlyRate,
        opportunityCost,
      }),
    [hoursPerWeek, hourlyRate, opportunityCost]
  );

  const handleRateChange = (value: string) => {
    if (value === 'custom') {
      setUseCustomRate(true);
    } else {
      setUseCustomRate(false);
      setHourlyRate(parseInt(value, 10));
    }
  };

  const handleCustomRateChange = (value: string) => {
    setCustomRate(value);
    const rate = parseFloat(value);
    if (!isNaN(rate) && rate >= 0) {
      setHourlyRate(rate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateCost({ hoursPerWeek, hourlyRate, opportunityCost });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit({
      hoursPerWeek,
      hourlyRate,
      opportunityCost,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Hours per Week */}
      <div className="space-y-2">
        <Label htmlFor="hours-per-week">Hours per Week</Label>
        <p className="text-xs text-muted-foreground">
          How many hours per week are spent dealing with this friction?
        </p>
        <div className="flex items-center gap-4">
          <Input
            id="hours-per-week"
            type="range"
            min={0}
            max={MAX_HOURS_PER_WEEK}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10))}
            className="flex-1"
          />
          <Input
            type="number"
            min={0}
            max={MAX_HOURS_PER_WEEK}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10) || 0)}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">hrs/week</span>
        </div>
        {errors.hoursPerWeek && (
          <p className="text-sm text-destructive">{errors.hoursPerWeek}</p>
        )}
      </div>

      {/* Hourly Rate */}
      <div className="space-y-2">
        <Label htmlFor="hourly-rate">Blended Hourly Rate</Label>
        <p className="text-xs text-muted-foreground">
          Fully-loaded cost including salary, benefits, and overhead.
        </p>
        <div className="flex items-center gap-4">
          <Select
            value={useCustomRate ? 'custom' : hourlyRate.toString()}
            onValueChange={handleRateChange}
          >
            <SelectTrigger id="hourly-rate" className="w-48">
              <SelectValue placeholder="Select rate" />
            </SelectTrigger>
            <SelectContent>
              {HOURLY_RATE_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value.toString()}>
                  {preset.label} - {preset.description}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom rate...</SelectItem>
            </SelectContent>
          </Select>
          {useCustomRate && (
            <div className="flex items-center gap-2">
              <span className="text-sm">$</span>
              <Input
                type="number"
                min={0}
                step={5}
                value={customRate}
                onChange={(e) => handleCustomRateChange(e.target.value)}
                className="w-24"
                placeholder="Rate"
              />
              <span className="text-sm text-muted-foreground">/hr</span>
            </div>
          )}
        </div>
        {errors.hourlyRate && (
          <p className="text-sm text-destructive">{errors.hourlyRate}</p>
        )}
      </div>

      {/* FTE Cost Preview */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Annualized FTE Cost</p>
            <p className="text-xs text-muted-foreground">
              {hoursPerWeek} hrs × ${hourlyRate}/hr × {WORKING_WEEKS_PER_YEAR} weeks
            </p>
          </div>
          <p className="text-xl font-bold">{formatCurrency(fteCost)}</p>
        </div>
      </div>

      {/* Opportunity Cost */}
      <div className="space-y-2">
        <Label htmlFor="opportunity-cost">Annual Opportunity Cost</Label>
        <p className="text-xs text-muted-foreground">
          Estimated annual cost of delayed decisions, missed revenue, or competitive
          disadvantage caused by this friction.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm">$</span>
          <Input
            id="opportunity-cost"
            type="number"
            min={0}
            step={1000}
            value={opportunityCost}
            onChange={(e) => setOpportunityCost(parseInt(e.target.value, 10) || 0)}
            className="w-40"
            placeholder="0"
          />
          <span className="text-sm text-muted-foreground">/year</span>
        </div>
        {errors.opportunityCost && (
          <p className="text-sm text-destructive">{errors.opportunityCost}</p>
        )}
      </div>

      {/* Total Cost */}
      <div className="rounded-lg border border-primary bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Total Annual Friction Cost</p>
            <p className="text-xs text-muted-foreground">
              FTE ({formatCurrency(fteCost)}) + Opportunity ({formatCurrency(opportunityCost)})
            </p>
          </div>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalCost)}</p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? 'Update Cost' : 'Add Cost'}</Button>
      </div>
    </form>
  );
}
