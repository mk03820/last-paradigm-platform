/**
 * MetricsSection Component
 *
 * Collapsible section wrapper for communication metrics forms.
 * Shows section status and completion indicator.
 *
 * Story 13.1: Communication Metrics Input
 * Task 6: Create MetricsSection wrapper component (AC: 1, 6)
 */

'use client';

import { ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type SectionStatus = 'not-started' | 'in-progress' | 'complete';

interface MetricsSectionProps {
  /** Unique identifier for the section */
  id: string;
  /** Section title (e.g., "Email Communication") */
  title: string;
  /** Icon emoji for the section */
  icon: string;
  /** Section description */
  description: string;
  /** Completion status */
  status: SectionStatus;
  /** Whether section is expanded by default */
  defaultOpen?: boolean;
  /** Child content (the form) */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

function getStatusBadge(status: SectionStatus) {
  switch (status) {
    case 'complete':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <Check className="h-3 w-3 mr-1" />
          Complete
        </Badge>
      );
    case 'in-progress':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
          In Progress
        </Badge>
      );
    case 'not-started':
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Not Started
        </Badge>
      );
  }
}

export function MetricsSection({
  id,
  title,
  icon,
  description,
  status,
  defaultOpen = false,
  children,
  className,
}: MetricsSectionProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpen ? id : undefined}
      >
        <AccordionItem value={id} className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-label={title}>
                  {icon}
                </span>
                <div className="text-left">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              {getStatusBadge(status)}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="pt-0 pb-6 px-6">
              {children}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

/**
 * Determine section status based on metrics completion
 */
export function getSectionStatus(
  hasAnyData: boolean,
  isComplete: boolean
): SectionStatus {
  if (isComplete) return 'complete';
  if (hasAnyData) return 'in-progress';
  return 'not-started';
}
