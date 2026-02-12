/**
 * ReworkCostInput Component
 *
 * Form for entering rework and duplication cost inputs.
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 3: Create ReworkCostInput component (AC: 1, 2)
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
import { Info, RefreshCw } from 'lucide-react';
import type { ReworkCostInput as ReworkCostInputType } from './cost-constants';
import { REWORK_FIELDS, formatCurrency } from './cost-constants';
import { cn } from '@/lib/utils';

interface ReworkCostInputProps {
  data: ReworkCostInputType;
  onChange: (data: Partial<Omit<ReworkCostInputType, 'subtotal'>>) => void;
  className?: string;
}

export function ReworkCostInput({
  data,
  onChange,
  className,
}: ReworkCostInputProps) {
  const handleNumberChange = (field: keyof ReworkCostInputType, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      onChange({ [field]: numValue });
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-lg">Rework & Duplication</CardTitle>
        </div>
        <CardDescription>
          Cost of work that gets redone due to miscommunication or changing requirements
        </CardDescription>
        <div className="mt-2 p-3 bg-muted/50 rounded-md">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Survey your team: What percentage of work gets redone? Common causes include
              misunderstood requirements, late feedback, and duplicate efforts across teams.
              Industry average is 15-30%.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rework Percentage */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="reworkPercent">
              {REWORK_FIELDS[0].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{REWORK_FIELDS[0].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <Input
              id="reworkPercent"
              type="number"
              min={REWORK_FIELDS[0].min}
              max={REWORK_FIELDS[0].max}
              placeholder={REWORK_FIELDS[0].placeholder}
              value={data.reworkPercent || ''}
              onChange={(e) => handleNumberChange('reworkPercent', e.target.value)}
              className="pr-7"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
          <p className="text-xs text-muted-foreground">Industry benchmark: 15-30%</p>
        </div>

        {/* Annual Labor Cost */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="annualLaborCost">
              {REWORK_FIELDS[1].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{REWORK_FIELDS[1].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="annualLaborCost"
              type="number"
              min={REWORK_FIELDS[1].min}
              placeholder={REWORK_FIELDS[1].placeholder}
              value={data.annualLaborCost || ''}
              onChange={(e) => handleNumberChange('annualLaborCost', e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        {/* Subtotal Display */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subtotal</span>
            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(data.subtotal)}
            </span>
          </div>
          {data.subtotal > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(data.annualLaborCost)} labor cost x {data.reworkPercent}% rework
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
