/**
 * InterventionCard Component
 *
 * Displays a single intervention recommendation with impact/effort badges
 * and optional Playbook 2 link.
 *
 * Story 13.4: Intervention Recommendations
 * Task 3: Create InterventionCard component (AC: 1, 2)
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Zap, Clock } from 'lucide-react';
import type { RecommendedIntervention, SeverityLevel } from './comm-constants';
import {
  IMPACT_STYLES,
  EFFORT_STYLES,
  SEVERITY_STYLES,
  getAntiPatternById,
} from './comm-constants';
import { cn } from '@/lib/utils';

interface InterventionCardProps {
  intervention: RecommendedIntervention;
  showPattern?: boolean;
  className?: string;
}

export function InterventionCard({
  intervention,
  showPattern = false,
  className,
}: InterventionCardProps) {
  const impactStyle = IMPACT_STYLES[intervention.impact];
  const effortStyle = EFFORT_STYLES[intervention.effort];
  const severityStyle = SEVERITY_STYLES[intervention.severity];
  const pattern = getAntiPatternById(intervention.patternId);

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-tight">
            {intervention.title}
          </CardTitle>
          {intervention.impact === 'high' && intervention.effort === 'low' && (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shrink-0"
            >
              <Zap className="h-3 w-3 mr-1" />
              Quick Win
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        <p className="text-sm text-muted-foreground">{intervention.description}</p>

        {/* Pattern badge (if showing) */}
        {showPattern && pattern && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Addresses:</span>
            <Badge
              variant="outline"
              className={cn(severityStyle.bgColor, severityStyle.color, 'text-xs')}
            >
              <span className="mr-1">{pattern.icon}</span>
              {pattern.name}
            </Badge>
          </div>
        )}

        {/* Impact and Effort badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={cn(impactStyle.bgColor, impactStyle.color, 'text-xs')}
          >
            <Zap className="h-3 w-3 mr-1" />
            {impactStyle.label}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(effortStyle.bgColor, effortStyle.color, 'text-xs')}
          >
            <Clock className="h-3 w-3 mr-1" />
            {effortStyle.label}
          </Badge>
        </div>

        {/* Playbook 2 link */}
        {intervention.playbook2Tool && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            asChild
          >
            <a
              href={intervention.playbook2Link || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {intervention.playbook2Tool}
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact intervention item for lists
 */
interface InterventionListItemProps {
  intervention: RecommendedIntervention;
  index?: number;
  className?: string;
}

export function InterventionListItem({
  intervention,
  index,
  className,
}: InterventionListItemProps) {
  const impactStyle = IMPACT_STYLES[intervention.impact];
  const pattern = getAntiPatternById(intervention.patternId);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border bg-card',
        className
      )}
    >
      {index !== undefined && (
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0">
          {index + 1}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm">{intervention.title}</h4>
          <Badge
            variant="secondary"
            className={cn(impactStyle.bgColor, impactStyle.color, 'text-xs shrink-0')}
          >
            {intervention.impact === 'high' ? 'High' : intervention.impact === 'medium' ? 'Med' : 'Low'}
          </Badge>
        </div>

        {pattern && (
          <p className="text-xs text-muted-foreground mt-1">
            Addresses: {pattern.name} ({intervention.severity} severity)
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {intervention.description}
        </p>
      </div>
    </div>
  );
}
