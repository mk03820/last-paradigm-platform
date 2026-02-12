/**
 * InterpretationCard Component
 *
 * Displays the interpretation of alignment tax level with context.
 *
 * Story 14.3: Alignment Tax Calculation and Interpretation
 * Task 5: Create InterpretationCard component (AC: 4)
 */

'use client';

import * as React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Skull,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { InterpretationThreshold, InterpretationLevel } from './cost-constants';
import { INTERPRETATION_THRESHOLDS, formatThresholdRange } from './cost-constants';

export interface InterpretationCardProps {
  /** The interpretation threshold */
  interpretation: InterpretationThreshold;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get the appropriate icon component for an interpretation level
 */
function getInterpretationIcon(level: InterpretationLevel): React.ReactNode {
  const iconProps = { className: 'w-6 h-6', 'aria-hidden': true };

  switch (level) {
    case 'normal':
      return <CheckCircle {...iconProps} />;
    case 'significant':
      return <AlertTriangle {...iconProps} />;
    case 'crisis':
      return <AlertOctagon {...iconProps} />;
    case 'existential':
      return <Skull {...iconProps} />;
  }
}

/**
 * Displays interpretation level with description and threshold context
 *
 * Features:
 * - Color-coded card based on level
 * - Icon representing severity
 * - Full description text
 * - Threshold ranges for context
 */
export function InterpretationCard({
  interpretation,
  className,
}: InterpretationCardProps) {
  const icon = getInterpretationIcon(interpretation.level);

  return (
    <Card
      className={cn(
        'border-2',
        interpretation.borderColor,
        interpretation.bgColor,
        className
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle
          className={cn(
            'flex items-center gap-2 text-lg font-semibold',
            interpretation.color
          )}
        >
          {icon}
          <span>{interpretation.label.toUpperCase()} LEVEL</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main description */}
        <p className="text-muted-foreground">{interpretation.description}</p>

        {/* Threshold ranges */}
        <ThresholdLegend currentLevel={interpretation.level} />
      </CardContent>
    </Card>
  );
}

/**
 * Compact interpretation badge
 */
export function InterpretationBadge({
  interpretation,
  className,
}: {
  interpretation: InterpretationThreshold;
  className?: string;
}) {
  const icon = getInterpretationIcon(interpretation.level);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
        interpretation.bgColor,
        interpretation.color,
        className
      )}
    >
      <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      {interpretation.label}
    </span>
  );
}

/**
 * Threshold legend showing all levels
 */
export function ThresholdLegend({
  currentLevel,
  className,
}: {
  currentLevel?: InterpretationLevel;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Thresholds
      </p>
      <div className="flex flex-wrap gap-2">
        {INTERPRETATION_THRESHOLDS.map((threshold) => (
          <span
            key={threshold.level}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs',
              threshold.bgColor,
              threshold.color,
              currentLevel === threshold.level && 'ring-2 ring-offset-1 ring-current'
            )}
          >
            {formatThresholdRange(threshold)} {threshold.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Minimal interpretation indicator
 */
export function InterpretationIndicator({
  interpretation,
  showLabel = true,
  className,
}: {
  interpretation: InterpretationThreshold;
  showLabel?: boolean;
  className?: string;
}) {
  const icon = getInterpretationIcon(interpretation.level);

  return (
    <div
      className={cn('flex items-center gap-1.5', interpretation.color, className)}
      role="status"
      aria-label={`${interpretation.label} level`}
    >
      <span className="[&>svg]:w-5 [&>svg]:h-5">{icon}</span>
      {showLabel && (
        <span className="font-medium">{interpretation.label}</span>
      )}
    </div>
  );
}
