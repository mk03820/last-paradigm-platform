/**
 * EmailMetricsForm Component
 *
 * Form for entering email communication metrics.
 *
 * Story 13.1: Communication Metrics Input
 * Task 3: Create EmailMetricsForm component (AC: 1, 2, 6)
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import type { EmailMetrics, FrequencyLevel } from './comm-constants';
import { EMAIL_METRICS_CONFIG, FREQUENCY_LEVELS } from './comm-constants';
import { cn } from '@/lib/utils';

interface EmailMetricsFormProps {
  metrics: EmailMetrics;
  onChange: <K extends keyof EmailMetrics>(field: K, value: EmailMetrics[K]) => void;
  className?: string;
}

export function EmailMetricsForm({
  metrics,
  onChange,
  className,
}: EmailMetricsFormProps) {
  const handleNumberChange = (field: keyof EmailMetrics, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numValue)) {
      onChange(field, numValue as EmailMetrics[typeof field]);
    }
  };

  const handleFrequencyChange = (value: FrequencyLevel) => {
    onChange('replyAllFrequency', value);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Distribution List Count */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="distributionListCount">
            {EMAIL_METRICS_CONFIG[0].label}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{EMAIL_METRICS_CONFIG[0].guidance}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="distributionListCount"
          type="number"
          min={EMAIL_METRICS_CONFIG[0].min}
          max={EMAIL_METRICS_CONFIG[0].max}
          placeholder={EMAIL_METRICS_CONFIG[0].placeholder}
          value={metrics.distributionListCount || ''}
          onChange={(e) => handleNumberChange('distributionListCount', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {EMAIL_METRICS_CONFIG[0].description}
        </p>
      </div>

      {/* Average List Size */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="avgListSize">
            {EMAIL_METRICS_CONFIG[1].label}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{EMAIL_METRICS_CONFIG[1].guidance}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="avgListSize"
          type="number"
          min={EMAIL_METRICS_CONFIG[1].min}
          max={EMAIL_METRICS_CONFIG[1].max}
          placeholder={EMAIL_METRICS_CONFIG[1].placeholder}
          value={metrics.avgListSize || ''}
          onChange={(e) => handleNumberChange('avgListSize', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {EMAIL_METRICS_CONFIG[1].description}
        </p>
      </div>

      {/* Reply-All Frequency */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="replyAllFrequency">
            {EMAIL_METRICS_CONFIG[2].label}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{EMAIL_METRICS_CONFIG[2].guidance}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={metrics.replyAllFrequency}
          onValueChange={handleFrequencyChange}
        >
          <SelectTrigger id="replyAllFrequency">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCY_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                <div className="flex flex-col">
                  <span>{level.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {level.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {EMAIL_METRICS_CONFIG[2].description}
        </p>
      </div>

      {/* Urgent Response Time */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="urgentResponseTimeHours">
            {EMAIL_METRICS_CONFIG[3].label}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{EMAIL_METRICS_CONFIG[3].guidance}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="urgentResponseTimeHours"
            type="number"
            min={EMAIL_METRICS_CONFIG[3].min}
            max={EMAIL_METRICS_CONFIG[3].max}
            placeholder={EMAIL_METRICS_CONFIG[3].placeholder}
            value={metrics.urgentResponseTimeHours || ''}
            onChange={(e) => handleNumberChange('urgentResponseTimeHours', e.target.value)}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground">hours</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {EMAIL_METRICS_CONFIG[3].description}
        </p>
      </div>
    </div>
  );
}
