/**
 * PrioritizedActionList Component
 *
 * Displays top priority interventions as a numbered action list.
 *
 * Story 13.4: Intervention Recommendations
 * Task 4: Create PrioritizedActionList component (AC: 3)
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Target, Zap, Clock, ExternalLink } from 'lucide-react';
import type { RecommendedIntervention } from './comm-constants';
import {
  IMPACT_STYLES,
  EFFORT_STYLES,
  getAntiPatternById,
} from './comm-constants';
import { cn } from '@/lib/utils';

interface PrioritizedActionListProps {
  interventions: RecommendedIntervention[];
  title?: string;
  className?: string;
}

export function PrioritizedActionList({
  interventions,
  title = 'Top Priority Actions',
  className,
}: PrioritizedActionListProps) {
  if (interventions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No anti-patterns detected. Your communication patterns appear healthy.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Focus on these high-impact actions first
        </p>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {interventions.map((intervention, index) => {
            const pattern = getAntiPatternById(intervention.patternId);
            const impactStyle = IMPACT_STYLES[intervention.impact];
            const effortStyle = EFFORT_STYLES[intervention.effort];
            const isQuickWin =
              intervention.impact === 'high' && intervention.effort === 'low';

            return (
              <AccordionItem
                key={intervention.id}
                value={intervention.id}
                className="border-b last:border-b-0"
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left w-full pr-4">
                    <div
                      className={cn(
                        'flex items-center justify-center h-7 w-7 rounded-full text-sm font-semibold shrink-0',
                        index === 0
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{intervention.title}</span>
                        {isQuickWin && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs"
                          >
                            <Zap className="h-3 w-3 mr-0.5" />
                            Quick Win
                          </Badge>
                        )}
                      </div>
                      {pattern && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pattern.icon} {pattern.name} •{' '}
                          <span className="capitalize">{intervention.severity}</span>{' '}
                          severity
                        </p>
                      )}
                    </div>

                    <Badge
                      variant="secondary"
                      className={cn(
                        impactStyle.bgColor,
                        impactStyle.color,
                        'text-xs shrink-0'
                      )}
                    >
                      {intervention.impact === 'high'
                        ? 'High'
                        : intervention.impact === 'medium'
                        ? 'Med'
                        : 'Low'}
                    </Badge>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-0 pb-4">
                  <div className="pl-10 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {intervention.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={cn(impactStyle.color, 'text-xs')}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        {impactStyle.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(effortStyle.color, 'text-xs')}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {effortStyle.label}
                      </Badge>
                    </div>

                    {intervention.playbook2Tool && (
                      <a
                        href={intervention.playbook2Link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {intervention.playbook2Tool}
                      </a>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
