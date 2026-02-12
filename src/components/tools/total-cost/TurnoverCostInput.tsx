/**
 * TurnoverCostInput Component
 *
 * Form for entering excess turnover cost inputs.
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 4: Create TurnoverCostInput component (AC: 1, 2)
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, UserMinus } from 'lucide-react';
import type { TurnoverCostInput as TurnoverCostInputType } from './cost-constants';
import { TURNOVER_FIELDS, formatCurrency } from './cost-constants';
import { cn } from '@/lib/utils';

interface TurnoverCostInputProps {
  data: TurnoverCostInputType;
  onChange: (data: Partial<Omit<TurnoverCostInputType, 'subtotal'>>) => void;
  className?: string;
}

export function TurnoverCostInput({
  data,
  onChange,
  className,
}: TurnoverCostInputProps) {
  const handleNumberChange = (field: keyof TurnoverCostInputType, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      onChange({ [field]: numValue });
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserMinus className="h-5 w-5 text-red-500" />
          <CardTitle className="text-lg">Excess Turnover</CardTitle>
        </div>
        <CardDescription>
          Cost of losing employees who leave due to organizational friction
        </CardDescription>
        <div className="mt-2 p-3 bg-muted/50 rounded-md">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Excess turnover is above industry normal (~15%). High performers often leave
              organizations with poor alignment. Calculate replacement cost including recruiting,
              training, and lost productivity during ramp-up.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Excess Turnover Rate */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="excessTurnoverRate">
              {TURNOVER_FIELDS[0].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{TURNOVER_FIELDS[0].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <Input
              id="excessTurnoverRate"
              type="number"
              min={TURNOVER_FIELDS[0].min}
              max={TURNOVER_FIELDS[0].max}
              placeholder={TURNOVER_FIELDS[0].placeholder}
              value={data.excessTurnoverRate || ''}
              onChange={(e) => handleNumberChange('excessTurnoverRate', e.target.value)}
              className="pr-7"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Your turnover rate minus industry normal (~15%)
          </p>
        </div>

        {/* Average Replacement Cost */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="avgReplacementCost">
              {TURNOVER_FIELDS[1].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{TURNOVER_FIELDS[1].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="avgReplacementCost"
              type="number"
              min={TURNOVER_FIELDS[1].min}
              placeholder={TURNOVER_FIELDS[1].placeholder}
              value={data.avgReplacementCost || ''}
              onChange={(e) => handleNumberChange('avgReplacementCost', e.target.value)}
              className="pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Typically 50-200% of annual salary
          </p>
        </div>

        {/* Affected Headcount */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="headcount">
              {TURNOVER_FIELDS[2].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{TURNOVER_FIELDS[2].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="headcount"
            type="number"
            min={TURNOVER_FIELDS[2].min}
            max={TURNOVER_FIELDS[2].max}
            placeholder={TURNOVER_FIELDS[2].placeholder}
            value={data.headcount || ''}
            onChange={(e) => handleNumberChange('headcount', e.target.value)}
          />
        </div>

        {/* Subtotal Display */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subtotal</span>
            <span className="text-lg font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(data.subtotal)}
            </span>
          </div>
          {data.subtotal > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {data.excessTurnoverRate}% excess turnover x {data.headcount} employees x {formatCurrency(data.avgReplacementCost)} per replacement
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
