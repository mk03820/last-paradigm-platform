/**
 * ChatMetricsForm Component
 *
 * Form for entering chat/messaging communication metrics.
 *
 * Story 13.1: Communication Metrics Input
 * Task 4: Create ChatMetricsForm component (AC: 1, 3, 6)
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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
import type { ChatMetrics, FrequencyLevel } from './comm-constants';
import { CHAT_METRICS_CONFIG, FREQUENCY_LEVELS } from './comm-constants';
import { cn } from '@/lib/utils';

interface ChatMetricsFormProps {
  metrics: ChatMetrics;
  onChange: <K extends keyof ChatMetrics>(field: K, value: ChatMetrics[K]) => void;
  className?: string;
}

export function ChatMetricsForm({
  metrics,
  onChange,
  className,
}: ChatMetricsFormProps) {
  const handleNumberChange = (field: keyof ChatMetrics, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numValue)) {
      onChange(field, numValue as ChatMetrics[typeof field]);
    }
  };

  const handleSliderChange = (field: keyof ChatMetrics, value: number[]) => {
    onChange(field, value[0] as ChatMetrics[typeof field]);
  };

  const handleFrequencyChange = (value: FrequencyLevel) => {
    onChange('atHereFrequency', value);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Active Channels */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="activeChannels">
            {CHAT_METRICS_CONFIG[0].label}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{CHAT_METRICS_CONFIG[0].guidance}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="activeChannels"
          type="number"
          min={CHAT_METRICS_CONFIG[0].min}
          max={CHAT_METRICS_CONFIG[0].max}
          placeholder={CHAT_METRICS_CONFIG[0].placeholder}
          value={metrics.activeChannels || ''}
          onChange={(e) => handleNumberChange('activeChannels', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {CHAT_METRICS_CONFIG[0].description}
        </p>
      </div>

      {/* DM Ratio (Slider) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="dmRatioPercent">
              {CHAT_METRICS_CONFIG[1].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{CHAT_METRICS_CONFIG[1].guidance}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm font-medium">{metrics.dmRatioPercent}%</span>
        </div>
        <Slider
          id="dmRatioPercent"
          min={0}
          max={100}
          step={5}
          value={[metrics.dmRatioPercent]}
          onValueChange={(value) => handleSliderChange('dmRatioPercent', value)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0% (All Public)</span>
          <span>100% (All DMs)</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {CHAT_METRICS_CONFIG[1].description}
        </p>
      </div>

      {/* @here/@channel Frequency */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="atHereFrequency">
            {CHAT_METRICS_CONFIG[2].label}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{CHAT_METRICS_CONFIG[2].guidance}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={metrics.atHereFrequency}
          onValueChange={handleFrequencyChange}
        >
          <SelectTrigger id="atHereFrequency">
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
          {CHAT_METRICS_CONFIG[2].description}
        </p>
      </div>

      {/* Cross-Channel Redundancy */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="crossChannelRedundancyPercent">
              {CHAT_METRICS_CONFIG[3].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{CHAT_METRICS_CONFIG[3].guidance}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm font-medium">{metrics.crossChannelRedundancyPercent}%</span>
        </div>
        <Slider
          id="crossChannelRedundancyPercent"
          min={0}
          max={100}
          step={5}
          value={[metrics.crossChannelRedundancyPercent]}
          onValueChange={(value) => handleSliderChange('crossChannelRedundancyPercent', value)}
        />
        <p className="text-xs text-muted-foreground">
          {CHAT_METRICS_CONFIG[3].description}
        </p>
      </div>
    </div>
  );
}
