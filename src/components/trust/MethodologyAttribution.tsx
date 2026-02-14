'use client';

import { cn } from '@/lib/utils';
import { BookIcon } from '@/components/icons/PaymentIcons';

interface MethodologyAttributionProps {
  className?: string;
}

/**
 * Methodology Attribution Component
 * Displays "Based on The Last Paradigm methodology" with book icon
 * Per FR65 requirement - subtle, credibility-building element
 * Meets AC8 requirement
 */
export function MethodologyAttribution({ className }: MethodologyAttributionProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2',
        'text-muted-foreground',
        className
      )}
    >
      <BookIcon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
      <p className="text-xs md:text-sm">
        Based on{' '}
        <span className="font-medium text-foreground">
          The Last Paradigm
        </span>{' '}
        methodology
      </p>
    </div>
  );
}
