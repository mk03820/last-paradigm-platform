/**
 * OpportunityCostInput Component
 *
 * Form for entering opportunity cost inputs.
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 5: Create OpportunityCostInput component (AC: 1, 2)
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
import { Info, Target } from 'lucide-react';
import type { OpportunityCostInput as OpportunityCostInputType } from './cost-constants';
import { OPPORTUNITY_COST_FIELDS, formatCurrency } from './cost-constants';
import { cn } from '@/lib/utils';

interface OpportunityCostInputProps {
  data: OpportunityCostInputType;
  onChange: (data: Partial<Omit<OpportunityCostInputType, 'subtotal'>>) => void;
  className?: string;
}

export function OpportunityCostInput({
  data,
  onChange,
  className,
}: OpportunityCostInputProps) {
  const handleNumberChange = (field: keyof OpportunityCostInputType, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      onChange({ [field]: numValue });
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-lg">Opportunity Costs</CardTitle>
        </div>
        <CardDescription>
          Revenue and growth opportunities lost due to organizational drag
        </CardDescription>
        <div className="mt-2 p-3 bg-muted/50 rounded-md">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Consider deals that fell through, products that launched late, and market
              opportunities missed because the organization moved too slowly.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delayed Revenue */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="delayedRevenue">
              {OPPORTUNITY_COST_FIELDS[0].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{OPPORTUNITY_COST_FIELDS[0].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="delayedRevenue"
              type="number"
              min={OPPORTUNITY_COST_FIELDS[0].min}
              placeholder={OPPORTUNITY_COST_FIELDS[0].placeholder}
              value={data.delayedRevenue || ''}
              onChange={(e) => handleNumberChange('delayedRevenue', e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        {/* Missed Deals */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="missedDeals">
              {OPPORTUNITY_COST_FIELDS[1].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{OPPORTUNITY_COST_FIELDS[1].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="missedDeals"
              type="number"
              min={OPPORTUNITY_COST_FIELDS[1].min}
              placeholder={OPPORTUNITY_COST_FIELDS[1].placeholder}
              value={data.missedDeals || ''}
              onChange={(e) => handleNumberChange('missedDeals', e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        {/* Market Share Loss */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="marketShareLoss">
              {OPPORTUNITY_COST_FIELDS[2].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{OPPORTUNITY_COST_FIELDS[2].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="marketShareLoss"
              type="number"
              min={OPPORTUNITY_COST_FIELDS[2].min}
              placeholder={OPPORTUNITY_COST_FIELDS[2].placeholder}
              value={data.marketShareLoss || ''}
              onChange={(e) => handleNumberChange('marketShareLoss', e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        {/* Subtotal Display */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subtotal</span>
            <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {formatCurrency(data.subtotal)}
            </span>
          </div>
          {data.subtotal > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Sum of delayed revenue, missed deals, and market share loss
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
