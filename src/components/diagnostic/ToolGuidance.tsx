/**
 * Tool Guidance Component
 *
 * Story 8.7: Guided Diagnostic Flow
 * Task 1: Create ToolGuidance component (AC: 6)
 *
 * Displays contextual guidance for a diagnostic tool including:
 * - What it measures
 * - Why it matters
 * - What data users will need
 * - Estimated time to complete
 *
 * Can be dismissed and preference is saved.
 */

'use client';

import React, { memo } from 'react';
import { Info, X, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getToolById } from './diagnostic-constants';
import { getToolGuidance } from './guidance-content';
import { useGuidancePreference } from './useGuidancePreference';
import { cn } from '@/lib/utils';

export interface ToolGuidanceProps {
  /** The tool ID to show guidance for */
  toolId: string;
  /** Optional className for styling */
  className?: string;
  /** Whether to show even if dismissed (for preview/testing) */
  forceShow?: boolean;
}

export const ToolGuidance = memo(function ToolGuidance({
  toolId,
  className,
  forceShow = false,
}: ToolGuidanceProps) {
  const { isDismissed, isLoading, dismiss } = useGuidancePreference(toolId);
  const tool = getToolById(toolId);
  const guidance = getToolGuidance(toolId);

  // Don't render if loading, dismissed (unless forced), or no content
  if (isLoading) {
    return null;
  }

  if (isDismissed && !forceShow) {
    return null;
  }

  if (!tool || !guidance) {
    return null;
  }

  return (
    <Card
      className={cn(
        'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30',
        'transition-all duration-300 ease-out',
        className
      )}
      role="complementary"
      aria-label={`Guidance for ${tool.name}`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/50">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 space-y-3">
              {/* Time estimate */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>This tool takes about {tool.estimatedMinutes} minutes</span>
              </div>

              {/* What it measures */}
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  What this measures
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {guidance.whatItMeasures}
                </p>
              </div>

              {/* Why it matters */}
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Why it matters
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {guidance.whyItMatters}
                </p>
              </div>

              {/* What you'll need */}
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  What you&apos;ll need
                </h3>
                <ul className="mt-1 space-y-1">
                  {guidance.dataNeeded.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
            onClick={dismiss}
            aria-label="Dismiss guidance"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Don't show again link */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={dismiss}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Don&apos;t show this again
          </button>
        </div>
      </CardContent>
    </Card>
  );
});
