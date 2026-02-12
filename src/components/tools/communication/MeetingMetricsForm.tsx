/**
 * MeetingMetricsForm Component
 *
 * Form for entering meeting communication metrics.
 * Supports auto-import from Tool 2 (Meeting Audit) or manual entry.
 *
 * Story 13.1: Communication Metrics Input
 * Task 5: Create MeetingMetricsForm component (AC: 1, 4, 5, 6)
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, RefreshCw, ExternalLink } from 'lucide-react';
import type { MeetingMetrics } from './comm-constants';
import { MEETING_METRICS_CONFIG } from './comm-constants';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { cn } from '@/lib/utils';

interface MeetingMetricsFormProps {
  metrics: MeetingMetrics;
  onChange: <K extends keyof MeetingMetrics>(field: K, value: MeetingMetrics[K]) => void;
  onPullFromTool2: () => boolean;
  className?: string;
}

export function MeetingMetricsForm({
  metrics,
  onChange,
  onPullFromTool2,
  className,
}: MeetingMetricsFormProps) {
  const [tool2Available, setTool2Available] = useState(false);

  // Check if Tool 2 has data on mount
  useEffect(() => {
    const calcStore = useCalculatorStore.getState();
    setTool2Available(!!calcStore.results && !!calcStore.meetingData);
  }, []);

  const handleNumberChange = (field: keyof MeetingMetrics, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numValue)) {
      onChange(field, numValue as MeetingMetrics[typeof field]);
    }
  };

  const handleSliderChange = (field: keyof MeetingMetrics, value: number[]) => {
    onChange(field, value[0] as MeetingMetrics[typeof field]);
  };

  const handleImportClick = () => {
    const success = onPullFromTool2();
    if (!success) {
      // Tool 2 data not available - refresh availability check
      const calcStore = useCalculatorStore.getState();
      setTool2Available(!!calcStore.results && !!calcStore.meetingData);
    }
  };

  // If data was pulled from Tool 2, show the imported data view
  if (metrics.pulledFromTool2) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
          <Badge variant="secondary" className="bg-primary/20">
            Imported from Meeting Audit
          </Badge>
          <span className="text-sm text-muted-foreground">
            Meeting data automatically pulled from Tool 2
          </span>
        </div>

        {/* Info Cascade Meetings (read-only display) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>{MEETING_METRICS_CONFIG[0].label}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{MEETING_METRICS_CONFIG[0].guidance}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-lg font-semibold">
            {metrics.infoCascadeMeetingsPerWeek} per week
          </div>
          <p className="text-xs text-muted-foreground">
            {MEETING_METRICS_CONFIG[0].description}
          </p>
        </div>

        {/* Decision Documentation Rate (read-only display) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>{MEETING_METRICS_CONFIG[1].label}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{MEETING_METRICS_CONFIG[1].guidance}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-lg font-semibold">
            {metrics.decisionDocumentationRatePercent}%
          </div>
          <p className="text-xs text-muted-foreground">
            {MEETING_METRICS_CONFIG[1].description}
          </p>
        </div>

        {/* Option to enter manually instead */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange('pulledFromTool2', false)}
          className="text-muted-foreground"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Enter manually instead
        </Button>
      </div>
    );
  }

  // Manual entry view
  return (
    <div className={cn('space-y-4', className)}>
      {/* Import from Tool 2 option */}
      {tool2Available ? (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm">Meeting Audit data available</span>
          <Button size="sm" onClick={handleImportClick}>
            Import from Tool 2
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            Complete the Meeting Audit (Tool 2) to auto-import meeting data
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/tool/calculator">
              Go to Tool 2
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}

      {/* Info Cascade Meetings */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="infoCascadeMeetingsPerWeek">
            {MEETING_METRICS_CONFIG[0].label}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{MEETING_METRICS_CONFIG[0].guidance}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="infoCascadeMeetingsPerWeek"
            type="number"
            min={MEETING_METRICS_CONFIG[0].min}
            max={MEETING_METRICS_CONFIG[0].max}
            placeholder={MEETING_METRICS_CONFIG[0].placeholder}
            value={metrics.infoCascadeMeetingsPerWeek || ''}
            onChange={(e) => handleNumberChange('infoCascadeMeetingsPerWeek', e.target.value)}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground">per week</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {MEETING_METRICS_CONFIG[0].description}
        </p>
      </div>

      {/* Decision Documentation Rate (Slider) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="decisionDocumentationRatePercent">
              {MEETING_METRICS_CONFIG[1].label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{MEETING_METRICS_CONFIG[1].guidance}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm font-medium">{metrics.decisionDocumentationRatePercent}%</span>
        </div>
        <Slider
          id="decisionDocumentationRatePercent"
          min={0}
          max={100}
          step={5}
          value={[metrics.decisionDocumentationRatePercent]}
          onValueChange={(value) => handleSliderChange('decisionDocumentationRatePercent', value)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0% (Never)</span>
          <span>100% (Always)</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {MEETING_METRICS_CONFIG[1].description}
        </p>
      </div>
    </div>
  );
}
