/**
 * ProjectDelaysCostInput Component
 *
 * Form for entering project delays and failures cost inputs.
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 2: Create ProjectDelaysCostInput component (AC: 1, 2)
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
import { Info, TrendingDown } from 'lucide-react';
import type { ProjectDelaysCostInput as ProjectDelaysCostInputType } from './cost-constants';
import { PROJECT_DELAYS_FIELDS, formatCurrency } from './cost-constants';
import { cn } from '@/lib/utils';

interface ProjectDelaysCostInputProps {
  data: ProjectDelaysCostInputType;
  onChange: (data: Partial<Omit<ProjectDelaysCostInputType, 'subtotal'>>) => void;
  className?: string;
}

export function ProjectDelaysCostInput({
  data,
  onChange,
  className,
}: ProjectDelaysCostInputProps) {
  const handleNumberChange = (field: keyof ProjectDelaysCostInputType, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      onChange({ [field]: numValue });
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-lg">Project Delays & Failures</CardTitle>
        </div>
        <CardDescription>
          Cost of projects that failed or were significantly delayed due to misalignment
        </CardDescription>
        <div className="mt-2 p-3 bg-muted/50 rounded-md">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Think about projects in the past year that went off track. How many failed completely?
              How many had major delays? What was their average budget or value?
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Failed Projects Count */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="failedProjectsCount">
              {PROJECT_DELAYS_FIELDS[0].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{PROJECT_DELAYS_FIELDS[0].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="failedProjectsCount"
            type="number"
            min={PROJECT_DELAYS_FIELDS[0].min}
            max={PROJECT_DELAYS_FIELDS[0].max}
            placeholder={PROJECT_DELAYS_FIELDS[0].placeholder}
            value={data.failedProjectsCount || ''}
            onChange={(e) => handleNumberChange('failedProjectsCount', e.target.value)}
          />
        </div>

        {/* Average Project Value */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="avgProjectValue">
              {PROJECT_DELAYS_FIELDS[1].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{PROJECT_DELAYS_FIELDS[1].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="avgProjectValue"
              type="number"
              min={PROJECT_DELAYS_FIELDS[1].min}
              placeholder={PROJECT_DELAYS_FIELDS[1].placeholder}
              value={data.avgProjectValue || ''}
              onChange={(e) => handleNumberChange('avgProjectValue', e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        {/* Impact Percentage */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="delayImpactPercent">
              {PROJECT_DELAYS_FIELDS[2].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{PROJECT_DELAYS_FIELDS[2].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <Input
              id="delayImpactPercent"
              type="number"
              min={PROJECT_DELAYS_FIELDS[2].min}
              max={PROJECT_DELAYS_FIELDS[2].max}
              placeholder={PROJECT_DELAYS_FIELDS[2].placeholder}
              value={data.delayImpactPercent || ''}
              onChange={(e) => handleNumberChange('delayImpactPercent', e.target.value)}
              className="pr-7"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
        </div>

        {/* Subtotal Display */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subtotal</span>
            <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              {formatCurrency(data.subtotal)}
            </span>
          </div>
          {data.subtotal > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {data.failedProjectsCount} projects x {formatCurrency(data.avgProjectValue)} x {data.delayImpactPercent}% impact
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
