/**
 * Alignment Tax Estimate Component
 *
 * Displays the estimated total alignment tax range based on meeting waste.
 * Meeting waste is estimated to be 25-30% of total alignment tax.
 *
 * Per UX requirements:
 * - Displays range format: "$X - $Y"
 * - Uses "estimated" language
 * - Explains 25-30% relationship
 * - Includes Step 1 of 7 framing
 *
 * Covers: FR12, FR13, FR16 (alignment tax estimation and framing)
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format-currency';

interface AlignmentTaxEstimateProps {
  /** The calculated meeting waste amount */
  meetingWaste: number;
  /** Minimum estimated alignment tax (meetingWaste / 0.30) */
  estimatedMin: number;
  /** Maximum estimated alignment tax (meetingWaste / 0.25) */
  estimatedMax: number;
}

export function AlignmentTaxEstimate({
  meetingWaste,
  estimatedMin,
  estimatedMax,
}: AlignmentTaxEstimateProps) {
  const headingId = 'alignment-tax-heading';

  return (
    <section role="region" aria-labelledby={headingId}>
      <Card className="bg-muted/50">
        <CardHeader className="pb-4">
          <h2 id={headingId} className="text-xl font-semibold leading-none">
            Estimated Total Alignment Tax
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Range Display */}
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(estimatedMin)} - {formatCurrency(estimatedMax)}
          </p>

          {/* Context Explanation */}
          <p className="text-sm text-muted-foreground">
            Meeting waste typically represents 25-30% of your organization&apos;s total
            alignment tax. Based on your {formatCurrency(meetingWaste)} in meeting waste,
            your estimated total alignment tax falls within this range.
          </p>

          {/* Step 1 of 7 Framing */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Step 1 of 7:</span> This meeting audit is the
              first step in diagnosing your complete alignment tax. Complete the full
              diagnostic to understand the remaining 70-75% of hidden costs.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
