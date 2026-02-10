/**
 * ToolNavigation Component
 *
 * Previous/Next tool navigation buttons for results pages.
 *
 * Story 8.6: Progress Stepper Navigation
 * Covers: AC9 (prev/next buttons on results pages)
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getToolByNumber, TOTAL_TOOLS } from './diagnostic-constants';

export interface ToolNavigationProps {
  /** The current tool number (1-7) */
  currentToolNumber: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show tool names in buttons */
  showToolNames?: boolean;
}

export const ToolNavigation = React.memo(function ToolNavigation({
  currentToolNumber,
  className,
  showToolNames = true,
}: ToolNavigationProps) {
  const prevTool = currentToolNumber > 1 ? getToolByNumber(currentToolNumber - 1) : null;
  const nextTool = currentToolNumber < TOTAL_TOOLS ? getToolByNumber(currentToolNumber + 1) : null;

  return (
    <nav
      aria-label="Tool navigation"
      className={cn(
        'flex items-center justify-between gap-4 pt-6 border-t',
        className
      )}
    >
      {/* Previous Tool */}
      {prevTool ? (
        <Button variant="outline" asChild className="flex-1 max-w-xs">
          <Link href={prevTool.route}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            <span className="flex flex-col items-start text-left">
              <span className="text-xs text-muted-foreground">Previous</span>
              {showToolNames && (
                <span className="font-medium">{prevTool.shortName}</span>
              )}
            </span>
          </Link>
        </Button>
      ) : (
        <div className="flex-1 max-w-xs" />
      )}

      {/* Center - Return to Hub */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/diagnostic" className="text-muted-foreground">
          View All Tools
        </Link>
      </Button>

      {/* Next Tool */}
      {nextTool ? (
        <Button variant="default" asChild className="flex-1 max-w-xs">
          <Link href={nextTool.route}>
            <span className="flex flex-col items-end text-right">
              <span className="text-xs opacity-80">Next</span>
              {showToolNames && (
                <span className="font-medium">{nextTool.shortName}</span>
              )}
            </span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      ) : (
        <Button variant="default" asChild className="flex-1 max-w-xs">
          <Link href="/tool/total-cost">
            <span className="flex flex-col items-end text-right">
              <span className="text-xs opacity-80">Complete</span>
              <span className="font-medium">View Total Cost</span>
            </span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )}
    </nav>
  );
});
