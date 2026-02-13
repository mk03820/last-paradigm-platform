/**
 * ROICalculator Component
 *
 * Form for entering transformation investment and reduction targets.
 *
 * Story 14.5: Transformation ROI Calculator
 * Task 3: Create ROICalculator.tsx form component
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calculator, TrendingUp, Clock, Target } from 'lucide-react';
import {
  ROI_DEFAULTS,
  ROI_TIMELINE_OPTIONS,
  ROI_REDUCTION_OPTIONS,
  formatCurrency,
} from './cost-constants';
import { validateROIInput, canCalculateROI } from './roi-calculator';

export interface ROICalculatorProps {
  /** Current alignment tax amount */
  alignmentTax: number;
  /** Current investment value */
  investment: number;
  /** Handle investment change */
  onInvestmentChange: (value: number) => void;
  /** Current target reduction percentage */
  targetReduction: number;
  /** Handle target reduction change */
  onTargetReductionChange: (value: number) => void;
  /** Current timeline in months */
  timelineMonths: number;
  /** Handle timeline change */
  onTimelineMonthsChange: (value: number) => void;
  /** Callback when calculate is clicked */
  onCalculate?: () => void;
  /** Whether calculation is in progress */
  isCalculating?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format currency input for display
 */
function formatCurrencyInput(value: number): string {
  if (value === 0) return '';
  return value.toLocaleString('en-US');
}

/**
 * Parse currency input string to number
 */
function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * ROI Calculator Form Component
 *
 * Features:
 * - Investment amount input with currency formatting
 * - Target reduction slider (25%, 50%, 75%)
 * - Timeline selector (12, 18, 24, 36 months)
 * - Real-time validation
 * - Accessibility support
 */
export function ROICalculator({
  alignmentTax,
  investment,
  onInvestmentChange,
  targetReduction,
  onTargetReductionChange,
  timelineMonths,
  onTimelineMonthsChange,
  onCalculate,
  isCalculating = false,
  className,
}: ROICalculatorProps) {
  // Local state for formatted input
  const [investmentInput, setInvestmentInput] = React.useState(
    formatCurrencyInput(investment)
  );
  const [isFocused, setIsFocused] = React.useState(false);

  // Validation
  const validation = validateROIInput({
    alignmentTax,
    investment,
    targetReduction,
    timelineMonths,
  });
  const canCalculate = canCalculateROI(alignmentTax, investment);

  // Handle investment input change
  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInvestmentInput(rawValue);

    const numValue = parseCurrencyInput(rawValue);
    onInvestmentChange(numValue);
  };

  // Handle investment blur - format the value
  const handleInvestmentBlur = () => {
    setIsFocused(false);
    setInvestmentInput(formatCurrencyInput(investment));
  };

  // Handle investment focus - show raw value
  const handleInvestmentFocus = () => {
    setIsFocused(true);
    setInvestmentInput(investment > 0 ? investment.toString() : '');
  };

  // Sync external investment changes
  React.useEffect(() => {
    if (!isFocused) {
      setInvestmentInput(formatCurrencyInput(investment));
    }
  }, [investment, isFocused]);

  // Calculate potential savings for preview
  const potentialAnnualSavings = (alignmentTax * targetReduction) / 100;

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>ROI Calculator</CardTitle>
        </div>
        <CardDescription>
          Enter your transformation investment to calculate projected returns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alignment Tax Context */}
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Alignment Tax</p>
              <p className="text-2xl font-bold">{formatCurrency(alignmentTax)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This is your annual cost of organizational misalignment
          </p>
        </div>

        {/* Investment Input */}
        <div className="space-y-2">
          <Label htmlFor="investment" className="flex items-center gap-2">
            <span>Transformation Investment</span>
            <span className="text-xs text-muted-foreground">(USD)</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="investment"
              type="text"
              inputMode="numeric"
              value={investmentInput}
              onChange={handleInvestmentChange}
              onBlur={handleInvestmentBlur}
              onFocus={handleInvestmentFocus}
              placeholder="e.g., 500,000"
              className="pl-8 text-lg"
              aria-describedby="investment-help"
            />
          </div>
          <p id="investment-help" className="text-xs text-muted-foreground">
            The total budget for your organizational transformation initiative
          </p>
          {investment > 0 && investment < ROI_DEFAULTS.minInvestment && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Minimum investment is ${ROI_DEFAULTS.minInvestment.toLocaleString()}
            </p>
          )}
        </div>

        {/* Target Reduction */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="target-reduction" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Target Reduction</span>
            </Label>
            <span className="text-2xl font-bold text-primary">{targetReduction}%</span>
          </div>

          <Slider
            id="target-reduction"
            value={[targetReduction]}
            onValueChange={(values) => onTargetReductionChange(values[0])}
            min={10}
            max={90}
            step={5}
            className="py-4"
            aria-label="Target reduction percentage"
          />

          {/* Quick select buttons */}
          <div className="flex gap-2">
            {ROI_REDUCTION_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={targetReduction === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTargetReductionChange(option.value)}
                className="flex-1"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Potential savings preview */}
          <p className="text-sm text-muted-foreground">
            At {targetReduction}% reduction, potential annual savings:{' '}
            <span className="font-medium text-foreground">
              {formatCurrency(potentialAnnualSavings)}
            </span>
          </p>
        </div>

        {/* Timeline Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Timeline to Achievement</span>
          </Label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROI_TIMELINE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={timelineMonths === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimelineMonthsChange(option.value)}
                className={cn(
                  'flex-1',
                  option.value === 18 && timelineMonths !== 18 && 'ring-1 ring-primary/20'
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {timelineMonths === 18 && (
            <p className="text-xs text-muted-foreground">
              18 months is the recommended timeline for most transformation initiatives
            </p>
          )}
        </div>

        {/* Validation Errors */}
        {!validation.isValid && validation.errors.length > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-medium text-destructive mb-1">
              Please fix the following:
            </p>
            <ul className="text-xs text-destructive space-y-1">
              {validation.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Calculate Button */}
        {onCalculate && (
          <Button
            onClick={onCalculate}
            disabled={!canCalculate || isCalculating}
            size="lg"
            className="w-full"
          >
            {isCalculating ? (
              <>
                <span className="animate-pulse">Calculating...</span>
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate ROI Scenarios
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default ROICalculator;
