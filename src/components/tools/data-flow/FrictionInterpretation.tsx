/**
 * FrictionInterpretation Component
 *
 * Displays interpretation of friction breakdown (organizational vs technical)
 * with tailored recommendations based on dominant friction type.
 *
 * Story 12.4: Friction Category Breakdown and Recommendations
 * Task 3: Create FrictionInterpretation component (AC: 2, 3)
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FrictionCategory } from './friction-constants';
import {
  interpretFrictionBreakdown,
  type DominantFrictionType,
} from './cost-constants';
import { cn } from '@/lib/utils';

interface FrictionInterpretationProps {
  costByCategory: Record<FrictionCategory, number>;
  className?: string;
}

// Icons and styling based on dominant friction type
const INTERPRETATION_STYLES: Record<
  DominantFrictionType,
  {
    icon: string;
    iconLabel: string;
    badgeColor: string;
    borderColor: string;
    bgColor: string;
  }
> = {
  organizational: {
    icon: '🏢',
    iconLabel: 'Organizational',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    borderColor: 'border-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
  },
  technical: {
    icon: '⚙️',
    iconLabel: 'Technical',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  balanced: {
    icon: '⚖️',
    iconLabel: 'Balanced',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
};

// Tool recommendations with links (Playbook 2 tools)
const TOOL_RECOMMENDATIONS: Record<
  DominantFrictionType,
  Array<{ tool: string; description: string }>
> = {
  organizational: [
    { tool: 'Tool 6: Data Governance', description: 'Define ownership and access policies' },
    { tool: 'Tool 7: Total Cost of Friction', description: 'Aggregate costs for executive communication' },
  ],
  technical: [
    { tool: 'Tool 6: Data Governance', description: 'Document technical requirements' },
    { tool: 'Tool 7: Total Cost of Friction', description: 'Build business case for modernization' },
  ],
  balanced: [
    { tool: 'Tool 6: Data Governance', description: 'Address both process and technical needs' },
    { tool: 'Tool 7: Total Cost of Friction', description: 'Prioritize mixed intervention portfolio' },
  ],
};

export function FrictionInterpretation({
  costByCategory,
  className,
}: FrictionInterpretationProps) {
  const interpretation = useMemo(
    () => interpretFrictionBreakdown(costByCategory),
    [costByCategory]
  );

  const styles = INTERPRETATION_STYLES[interpretation.dominantType];
  const toolRecs = TOOL_RECOMMENDATIONS[interpretation.dominantType];

  return (
    <Card className={cn('border-l-4', styles.borderColor, className)}>
      <CardHeader className={styles.bgColor}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label={styles.iconLabel}>
              {styles.icon}
            </span>
            <span className="uppercase tracking-wide">
              {interpretation.headline}
            </span>
          </CardTitle>
          <Badge className={styles.badgeColor}>
            {interpretation.percentage}% {styles.iconLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Description */}
        <p className="text-muted-foreground">{interpretation.description}</p>

        {/* Recommendations */}
        <div>
          <h4 className="mb-3 font-medium">Recommended Actions</h4>
          <ul className="space-y-2">
            {interpretation.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tool References */}
        <div className="rounded-md border bg-muted/30 p-4">
          <h4 className="mb-3 text-sm font-medium text-muted-foreground">
            Relevant Playbook 2 Tools
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {toolRecs.map((rec, index) => (
              <div
                key={index}
                className="flex flex-col rounded-md border bg-background p-3"
              >
                <span className="font-medium text-primary">{rec.tool}</span>
                <span className="text-sm text-muted-foreground">
                  {rec.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
