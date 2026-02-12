/**
 * ToolCard Component
 *
 * Displays a single diagnostic tool with status and result summary.
 *
 * Story 8.5: Diagnostic Tool Hub
 * Covers: AC1 (tool display), AC2 (status), AC3 (result summary), AC5 (navigation)
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DiagnosticTool, ToolStatus } from './diagnostic-constants';
import { STATUS_CONFIG } from './diagnostic-constants';
import { cn } from '@/lib/utils';

export interface ToolCardProps {
  tool: DiagnosticTool;
  status: ToolStatus;
  resultSummary: string | null;
  disabled?: boolean;
  onDisabledClick?: () => void;
}

export function ToolCard({
  tool,
  status,
  resultSummary,
  disabled = false,
  onDisabledClick,
}: ToolCardProps) {
  const Icon = tool.icon;
  const statusConfig = STATUS_CONFIG[status];

  const cardContent = (
    <Card
      className={cn(
        'h-full transition-all duration-200',
        disabled
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:shadow-md hover:border-primary/50 cursor-pointer',
        status === 'completed' && 'border-green-200 dark:border-green-800/50'
      )}
      role="article"
      aria-label={`Tool ${tool.number}: ${tool.name}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                status === 'completed'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : status === 'in_progress'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Tool {tool.number}</p>
              <CardTitle className="text-base whitespace-nowrap">{tool.shortName}</CardTitle>
            </div>
          </div>
          <Badge
            variant={statusConfig.variant}
            className={cn('shrink-0 text-xs', statusConfig.className)}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm">{tool.description}</CardDescription>
        {resultSummary && (
          <p className="mt-2 text-sm font-medium text-foreground">{resultSummary}</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">~{tool.estimatedMinutes} min</p>
      </CardContent>
    </Card>
  );

  if (disabled) {
    return (
      <button
        type="button"
        onClick={onDisabledClick}
        className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
        aria-label={`Tool ${tool.number}: ${tool.name} - requires sign in`}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link
      href={tool.route}
      className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
      aria-label={`Go to Tool ${tool.number}: ${tool.name}`}
    >
      {cardContent}
    </Link>
  );
}
