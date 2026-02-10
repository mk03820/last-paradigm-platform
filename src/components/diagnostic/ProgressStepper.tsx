/**
 * ProgressStepper Component
 *
 * Visual progress stepper showing all 7 diagnostic tools with completion status.
 * Desktop shows full stepper, mobile shows compact dropdown.
 *
 * Story 8.6: Progress Stepper Navigation
 * Covers: AC1-AC7, AC10 (stepper display, navigation, responsive)
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Circle, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToolsWithStatus, useDiagnosticProgress } from './useToolStatus';
import { useToolAccess } from './useToolAccess';
import type { ToolStatus } from './diagnostic-constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface ProgressStepperProps {
  /** The ID of the current tool (e.g., 'alignment', 'meeting-audit') */
  currentToolId: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get the status icon for a tool step
 */
function StepIcon({
  status,
  isCurrent,
}: {
  status: ToolStatus;
  isCurrent: boolean;
}) {
  if (status === 'completed') {
    return (
      <Check
        className="h-4 w-4 text-green-600 dark:text-green-400"
        aria-hidden="true"
      />
    );
  }

  if (status === 'in_progress' || isCurrent) {
    return (
      <Circle
        className={cn(
          'h-4 w-4',
          isCurrent
            ? 'fill-primary text-primary'
            : 'fill-yellow-500 text-yellow-500'
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <Circle
      className="h-4 w-4 text-muted-foreground/50"
      aria-hidden="true"
    />
  );
}

/**
 * Desktop stepper - shows all 7 steps in a row
 */
function DesktopStepper({
  tools,
  currentToolId,
  checkAccess,
}: {
  tools: ReturnType<typeof useToolsWithStatus>;
  currentToolId: string;
  checkAccess: ReturnType<typeof useToolAccess>['checkAccess'];
}) {
  return (
    <nav
      aria-label="Diagnostic progress"
      className="hidden sm:flex items-center justify-center gap-1"
    >
      {tools.map((tool, index) => {
        const isCurrent = tool.id === currentToolId;
        const access = checkAccess(tool);

        return (
          <React.Fragment key={tool.id}>
            {/* Connector line */}
            {index > 0 && (
              <div
                className={cn(
                  'h-0.5 w-4 md:w-8',
                  tools[index - 1].status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-muted-foreground/30'
                )}
                aria-hidden="true"
              />
            )}

            {/* Step */}
            <Link
              href={tool.route}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md transition-all',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                isCurrent && 'bg-primary/10 ring-2 ring-primary',
                !isCurrent && 'hover:bg-muted',
                !access.canAccess && 'opacity-60'
              )}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Tool ${tool.number}: ${tool.name}${
                tool.status === 'completed' ? ' (completed)' : ''
              }${isCurrent ? ' (current)' : ''}`}
            >
              <StepIcon status={tool.status} isCurrent={isCurrent} />
              <span
                className={cn(
                  'text-xs font-medium hidden md:inline',
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {tool.number}
              </span>
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/**
 * Mobile stepper - compact dropdown format
 */
function MobileStepper({
  tools,
  currentToolId,
  progress,
  checkAccess,
}: {
  tools: ReturnType<typeof useToolsWithStatus>;
  currentToolId: string;
  progress: ReturnType<typeof useDiagnosticProgress>;
  checkAccess: ReturnType<typeof useToolAccess>['checkAccess'];
}) {
  const currentTool = tools.find((t) => t.id === currentToolId);

  if (!currentTool) return null;

  return (
    <div className="sm:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            aria-label={`Tool ${currentTool.number} of 7: ${currentTool.shortName}. Open navigation menu.`}
          >
            <span className="flex items-center gap-2">
              <StepIcon status={currentTool.status} isCurrent />
              <span>
                Tool {currentTool.number} of 7: {currentTool.shortName}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-[280px]">
          {tools.map((tool) => {
            const isCurrent = tool.id === currentToolId;
            const access = checkAccess(tool);

            return (
              <DropdownMenuItem
                key={tool.id}
                asChild
                disabled={!access.canAccess}
              >
                <Link
                  href={tool.route}
                  className={cn(
                    'flex items-center gap-3 w-full',
                    isCurrent && 'bg-primary/10'
                  )}
                >
                  <StepIcon status={tool.status} isCurrent={isCurrent} />
                  <span className="flex-1">
                    {tool.number}. {tool.shortName}
                  </span>
                  {isCurrent && (
                    <span className="text-xs text-muted-foreground">
                      (current)
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Main ProgressStepper component
 */
export const ProgressStepper = React.memo(function ProgressStepper({
  currentToolId,
  className,
}: ProgressStepperProps) {
  const tools = useToolsWithStatus();
  const progress = useDiagnosticProgress();
  const { checkAccess, isLoading } = useToolAccess();

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-2', className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Desktop Stepper */}
      <DesktopStepper
        tools={tools}
        currentToolId={currentToolId}
        checkAccess={checkAccess}
      />

      {/* Mobile Stepper */}
      <MobileStepper
        tools={tools}
        currentToolId={currentToolId}
        progress={progress}
        checkAccess={checkAccess}
      />

      {/* Progress Summary */}
      <p className="text-center text-xs text-muted-foreground">
        {progress.completedCount} of {progress.totalTools} completed
        {progress.inProgressCount > 0 && ` (${progress.inProgressCount} in progress)`}
      </p>
    </div>
  );
});
