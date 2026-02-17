/**
 * ToolResultCard Base Component
 *
 * Base card component for displaying individual tool results.
 * Extended by specific tool result cards.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 3.1: Create base component (AC: 2)
 */

'use client';

import { CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface ToolResultCardProps {
  toolNumber: number;
  toolName: string;
  icon?: LucideIcon;
  completedAt: string | null;
  keyMetric?: {
    label: string;
    value: string;
    highlight?: boolean;
  };
  children?: React.ReactNode;
  className?: string;
}

/**
 * Format date in readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function ToolResultCard({
  toolNumber,
  toolName,
  icon: Icon,
  completedAt,
  keyMetric,
  children,
  className,
}: ToolResultCardProps) {
  const isCompleted = completedAt !== null;

  return (
    <Card
      className={cn(
        'h-full transition-all duration-200',
        isCompleted && 'border-green-200 dark:border-green-800/50',
        className
      )}
      role="article"
      aria-label={`Tool ${toolNumber}: ${toolName}`}
      data-testid={`tool-result-card-${toolNumber}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  isCompleted
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Tool {toolNumber}
              </p>
              <CardTitle className="text-base">{toolName}</CardTitle>
            </div>
          </div>
          {isCompleted ? (
            <Badge
              variant="outline"
              className="shrink-0 text-xs bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200"
              aria-label="Completed"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {formatDate(completedAt)}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="shrink-0 text-xs text-muted-foreground border-muted-foreground/30"
            >
              <Clock className="h-3 w-3 mr-1" />
              Not Completed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isCompleted && keyMetric && (
          <div className="mb-3 pb-3 border-b">
            <p className="text-xs text-muted-foreground mb-1">{keyMetric.label}</p>
            <p
              className={cn(
                'text-xl font-bold',
                keyMetric.highlight && 'text-accent'
              )}
            >
              {keyMetric.value}
            </p>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
