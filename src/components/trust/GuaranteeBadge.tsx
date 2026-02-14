'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheckIcon, ChevronDownIcon } from '@/components/icons/PaymentIcons';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface GuaranteeBadgeProps {
  className?: string;
}

/**
 * 30-Day Money-Back Guarantee Badge
 * Expandable component showing refund policy details
 * Meets AC1, AC6, AC7 requirements
 */
export function GuaranteeBadge({ className }: GuaranteeBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn(
        'border-2 border-slate-200 bg-slate-50 rounded-lg p-4 md:p-6 max-w-md w-full',
        className
      )}
    >
      <CollapsibleTrigger
        className={cn(
          'flex items-center justify-between w-full text-left',
          'min-h-[44px]', // Mobile touch target
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'rounded-sm'
        )}
        aria-expanded={isExpanded}
        aria-controls="refund-policy-details"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 text-primary">
            <ShieldCheckIcon className="h-8 w-8 md:h-10 md:w-10" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">
              30-Day Money-Back Guarantee
            </h3>
            <p className="text-sm text-muted-foreground">
              Full refund, no questions asked
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          <ChevronDownIcon
            className={cn(
              'h-5 w-5 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
          <span className="sr-only">
            {isExpanded ? 'Hide' : 'View'} refund policy details
          </span>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent
        id="refund-policy-details"
        className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      >
        <div className="pt-4 mt-4 border-t border-slate-200">
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you&apos;re not satisfied with your Playbook 2 toolkit within 30
            days of purchase, contact us for a full refund. No questions asked.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            We believe in the value of these tools, and we want you to feel
            confident in your investment. Your satisfaction is our priority.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
