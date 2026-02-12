/**
 * RevenueInput Component
 *
 * Form for entering company annual revenue.
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 6: Create RevenueInput component (AC: 3)
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
import { Info, DollarSign } from 'lucide-react';
import { REVENUE_FIELDS, formatCurrency } from './cost-constants';
import { cn } from '@/lib/utils';

interface RevenueInputProps {
  value: number;
  onChange: (value: number) => void;
  totalCost?: number;
  className?: string;
}

export function RevenueInput({
  value,
  onChange,
  totalCost = 0,
  className,
}: RevenueInputProps) {
  const handleChange = (inputValue: string) => {
    const numValue = inputValue === '' ? 0 : parseFloat(inputValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const percentOfRevenue = value > 0 ? (totalCost / value) * 100 : 0;

  return (
    <Card className={cn('border-2 border-primary/20', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          <CardTitle className="text-lg">Company Revenue</CardTitle>
        </div>
        <CardDescription>
          Required to calculate alignment tax as a percentage of revenue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="annualRevenue">
              {REVENUE_FIELDS[0].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{REVENUE_FIELDS[0].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="annualRevenue"
              type="number"
              min={0}
              placeholder={REVENUE_FIELDS[0].placeholder}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              className="pl-7 text-lg"
            />
          </div>
        </div>

        {value > 0 && totalCost > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Alignment Tax</span>
              <div className="text-right">
                <span className="text-lg font-semibold text-primary">
                  {percentOfRevenue.toFixed(2)}%
                </span>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(totalCost)} of {formatCurrency(value)}
                </p>
              </div>
            </div>
          </div>
        )}

        {value === 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Enter your annual revenue to see alignment tax as a percentage
          </p>
        )}
      </CardContent>
    </Card>
  );
}
