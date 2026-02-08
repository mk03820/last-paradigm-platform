'use client';

import { formatCurrency } from '@/lib/utils/format-currency';

/**
 * CostBreakdown Component
 *
 * Displays the headline meeting waste amount prominently.
 * Hero element of the results page.
 *
 * Per UX Design Requirements:
 * - Font size: 48px (display typography)
 * - Font weight: 700 (bold)
 * - Color: Gold accent (#b45309)
 * - Centered on page
 * - "per year" label: 16px, muted
 *
 * Covers: AC2, AC3, AC4, AC5 (display, formatting, hero element, screen reader)
 */

interface CostBreakdownProps {
  /** The meeting waste amount in dollars */
  amount: number;
}

export function CostBreakdown({ amount }: CostBreakdownProps) {
  const formattedAmount = formatCurrency(amount);

  // Create accessible announcement with context
  const announcement = `Your estimated meeting waste is ${formattedAmount} per year`;

  return (
    <div className="text-center space-y-2">
      <div
        role="region"
        aria-live="polite"
        aria-label={announcement}
        className="space-y-2"
      >
        <p className="text-[48px] font-bold text-[#b45309] leading-tight">
          {formattedAmount}
        </p>
        <p className="text-[16px] text-muted-foreground">per year</p>
      </div>
    </div>
  );
}
