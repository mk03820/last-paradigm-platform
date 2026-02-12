/**
 * AlignmentTaxHeadline Component
 *
 * Displays the total alignment tax amount prominently.
 * Executive-ready presentation with large typography.
 *
 * Story 14.3: Alignment Tax Calculation and Interpretation
 * Task 3: Create AlignmentTaxHeadline component (AC: 2, 5)
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatFullCurrency } from './calculation-engine';

export interface AlignmentTaxHeadlineProps {
  /** Total alignment tax amount in dollars */
  amount: number;
  /** Whether to show the animated count-up effect */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Large, bold display of the total alignment tax
 *
 * Features:
 * - 48px bold typography
 * - Executive-ready formatting ($2.9M for millions)
 * - Optional count-up animation
 * - "per year" label below
 * - Screen reader accessible
 */
export function AlignmentTaxHeadline({
  amount,
  animate = true,
  className,
}: AlignmentTaxHeadlineProps) {
  const [displayAmount, setDisplayAmount] = React.useState(animate ? 0 : amount);
  const [isAnimating, setIsAnimating] = React.useState(animate);

  // Animated count-up effect
  React.useEffect(() => {
    if (!animate || amount === 0) {
      setDisplayAmount(amount);
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = amount / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Easing function for smooth deceleration
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      current = amount * eased;

      setDisplayAmount(current);

      if (step >= steps) {
        setDisplayAmount(amount);
        setIsAnimating(false);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [amount, animate]);

  const formattedAmount = formatCurrency(displayAmount);
  const fullAmount = formatFullCurrency(amount);

  // Create accessible announcement with full context
  const announcement = `Your estimated alignment tax is ${fullAmount} per year`;

  return (
    <div className={cn('text-center space-y-2', className)}>
      <div
        role="region"
        aria-live="polite"
        aria-label={announcement}
        className="space-y-2"
      >
        {/* Main headline number */}
        <p
          className={cn(
            'text-[48px] font-bold text-[#b45309] leading-tight',
            'transition-opacity duration-300',
            isAnimating && 'opacity-90'
          )}
          aria-hidden={isAnimating}
        >
          {formattedAmount}
        </p>

        {/* Per year label */}
        <p className="text-[16px] text-muted-foreground">per year</p>

        {/* Screen reader only: full amount */}
        <span className="sr-only">{fullAmount}</span>
      </div>
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function AlignmentTaxBadge({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  const formattedAmount = formatCurrency(amount);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg',
        'bg-amber-100 dark:bg-amber-900/30',
        'text-amber-800 dark:text-amber-200',
        'font-semibold',
        className
      )}
    >
      <span className="text-lg">{formattedAmount}</span>
      <span className="text-sm text-muted-foreground">/year</span>
    </span>
  );
}
