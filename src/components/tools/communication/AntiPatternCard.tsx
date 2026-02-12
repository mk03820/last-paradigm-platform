/**
 * AntiPatternCard Component
 *
 * Displays a single anti-pattern with detection status, severity, and evidence.
 *
 * Story 13.2: Anti-Pattern Detection
 * Task 4: Create AntiPatternCard component (AC: 2, 3)
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
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AntiPattern, DetectionResult } from './comm-constants';
import { getSeverityStyle } from './comm-constants';
import { cn } from '@/lib/utils';

interface AntiPatternCardProps {
  pattern: AntiPattern;
  result: DetectionResult;
  className?: string;
}

export function AntiPatternCard({
  pattern,
  result,
  className,
}: AntiPatternCardProps) {
  const severityStyle = getSeverityStyle(result.severity);

  return (
    <Card
      className={cn(
        'transition-all',
        result.detected && 'border-l-4',
        result.severity === 'high' && 'border-l-red-500',
        result.severity === 'medium' && 'border-l-orange-500',
        result.severity === 'low' && 'border-l-yellow-500',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label={pattern.name}>
              {pattern.icon}
            </span>
            <CardTitle className="text-lg">{pattern.name}</CardTitle>
          </div>
          <Badge
            variant="secondary"
            className={cn(severityStyle.bgColor, severityStyle.color)}
          >
            {result.detected ? (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                {severityStyle.label}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {severityStyle.label}
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        <p className="text-sm text-muted-foreground">{pattern.description}</p>

        {/* Evidence (if detected) */}
        {result.detected && result.evidence.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Evidence:</p>
            <ul className="space-y-1">
              {result.evidence.map((item, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-primary mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Examples (collapsible) */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="examples" className="border-0">
            <AccordionTrigger className="py-2 text-sm hover:no-underline">
              <span className="text-muted-foreground">
                See examples of this pattern
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1 pt-1">
                {pattern.examples.map((example, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-muted-foreground/50">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Confidence indicator (subtle) */}
        {result.detected && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Detection confidence:</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-24">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
            <span>{Math.round(result.confidence * 100)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
