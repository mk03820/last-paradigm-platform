/**
 * ROIResults Component
 *
 * Displays all three ROI scenarios with key metrics.
 *
 * Story 14.5: Transformation ROI Calculator
 * Task 4: Create ROIResults.tsx component
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { TrendingUp, AlertCircle, Info, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ROIResult, ROIScenarioType } from './cost-constants';
import { formatCurrency, formatROIRatio, formatPaybackPeriod } from './cost-constants';
import { getScenarioRecommendation, formatNPV } from './roi-calculator';
import { ROIScenarioCard } from './ROIScenarioCard';

export interface ROIResultsProps {
  /** Array of ROI results for all scenarios */
  results: ROIResult[];
  /** The currently selected scenario */
  selectedScenario?: ROIScenarioType;
  /** Handler for scenario selection */
  onScenarioSelect?: (scenario: ROIScenarioType) => void;
  /** Whether to show the board summary */
  showBoardSummary?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ROI Results Display Component
 *
 * Features:
 * - Three scenario cards side by side
 * - Recommendation indicator
 * - Board-presentation summary section
 * - Executive-ready formatting
 */
export function ROIResults({
  results,
  selectedScenario,
  onScenarioSelect,
  showBoardSummary = true,
  className,
}: ROIResultsProps) {
  // Get recommendation
  const recommendation = getScenarioRecommendation(results);

  // Find moderate scenario for summary
  const moderateResult = results.find((r) => r.scenarioType === 'moderate');

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">ROI Scenarios</h2>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {results.map((result) => (
          <ROIScenarioCard
            key={result.scenarioType}
            result={result}
            isRecommended={result.scenarioType === recommendation.recommended}
            isHighlighted={result.scenarioType === selectedScenario}
            onClick={onScenarioSelect ? () => onScenarioSelect(result.scenarioType) : undefined}
          />
        ))}
      </div>

      {/* Recommendation Alert */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4" />
        <AlertTitle>Recommendation</AlertTitle>
        <AlertDescription>
          Based on your inputs, we recommend the{' '}
          <strong className="capitalize">{recommendation.recommended}</strong> scenario.{' '}
          {recommendation.reason}
        </AlertDescription>
      </Alert>

      {/* Board Summary Section */}
      {showBoardSummary && moderateResult && (
        <BoardSummary results={results} moderateResult={moderateResult} />
      )}
    </div>
  );
}

/**
 * Board Presentation Summary
 */
function BoardSummary({
  results,
  moderateResult,
}: {
  results: ROIResult[];
  moderateResult: ROIResult;
}) {
  const conservative = results.find((r) => r.scenarioType === 'conservative');
  const aggressive = results.find((r) => r.scenarioType === 'aggressive');

  return (
    <Card className="border-2 print:border">
      <CardHeader className="bg-muted/30 print:bg-gray-100">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span>Board Summary</span>
          <span className="text-xs font-normal text-muted-foreground">
            Executive presentation format
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Headline Numbers */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <SummaryMetric
            label="Investment"
            value={formatCurrency(moderateResult.investment)}
            subtext="Transformation budget"
          />
          <SummaryMetric
            label="Annual Savings"
            value={formatCurrency(moderateResult.annualSavings)}
            subtext="Expected (moderate)"
            highlight
          />
          <SummaryMetric
            label="Payback Period"
            value={formatPaybackPeriod(moderateResult.paybackMonths)}
            subtext="Break-even timeline"
          />
        </div>

        {/* Range Display */}
        <div className="p-4 rounded-lg bg-muted/50 print:bg-gray-50">
          <p className="text-sm font-medium mb-3">Projected Range (3-Year NPV)</p>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Conservative</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {conservative ? formatNPV(conservative.npv) : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">{conservative?.probability}% likely</p>
            </div>
            <div className="flex-1 mx-4 h-2 bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200 rounded-full" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Aggressive</p>
              <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {aggressive ? formatNPV(aggressive.npv) : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">{aggressive?.probability}% likely</p>
            </div>
          </div>
        </div>

        {/* ROI Summary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Scenario</th>
                <th className="text-right py-2 font-medium">Annual Savings</th>
                <th className="text-right py-2 font-medium">3-Year NPV</th>
                <th className="text-right py-2 font-medium">ROI</th>
                <th className="text-right py-2 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.scenarioType} className="border-b last:border-0">
                  <td className="py-2 capitalize">{result.scenarioType}</td>
                  <td className="text-right py-2">{formatCurrency(result.annualSavings)}</td>
                  <td className="text-right py-2">{formatNPV(result.npv)}</td>
                  <td className="text-right py-2">{formatROIRatio(result.roiRatio)}</td>
                  <td className="text-right py-2">{result.probability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key Takeaways */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Key Takeaways:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              - Even the conservative scenario yields{' '}
              <strong className="text-foreground">
                {conservative ? formatROIRatio(conservative.roiRatio) : 'positive'} ROI
              </strong>{' '}
              with {conservative?.probability}% confidence
            </li>
            <li>
              - Payback period ranges from{' '}
              <strong className="text-foreground">
                {aggressive ? formatPaybackPeriod(aggressive.paybackMonths) : 'N/A'}
              </strong>{' '}
              to{' '}
              <strong className="text-foreground">
                {conservative ? formatPaybackPeriod(conservative.paybackMonths) : 'N/A'}
              </strong>
            </li>
            <li>
              - The moderate scenario targets{' '}
              <strong className="text-foreground">{moderateResult.targetReduction}%</strong>{' '}
              reduction in alignment tax
            </li>
          </ul>
        </div>

        {/* Methodology Note */}
        <div className="pt-4 border-t text-xs text-muted-foreground">
          <p>
            <strong>Methodology:</strong> NPV calculated at 10% discount rate over 3 years.
            Savings assume linear ramp-up during timeline period. Confidence levels based on
            industry transformation success rates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Summary Metric Sub-component
 */
function SummaryMetric({
  label,
  value,
  subtext,
  highlight = false,
}: {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn('p-4 rounded-lg', highlight ? 'bg-primary/10' : 'bg-muted/30')}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={cn('text-2xl font-bold', highlight && 'text-primary')}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
    </div>
  );
}

/**
 * Compact ROI Summary
 */
export function ROICompactSummary({
  results,
  className,
}: {
  results: ROIResult[];
  className?: string;
}) {
  const moderate = results.find((r) => r.scenarioType === 'moderate');
  if (!moderate) return null;

  return (
    <div className={cn('flex items-center gap-4 p-4 rounded-lg bg-muted/30', className)}>
      <div>
        <p className="text-xs text-muted-foreground">Annual Savings</p>
        <p className="text-xl font-bold">{formatCurrency(moderate.annualSavings)}</p>
      </div>
      <div className="text-muted-foreground">|</div>
      <div>
        <p className="text-xs text-muted-foreground">ROI</p>
        <p className="text-xl font-bold">{formatROIRatio(moderate.roiRatio)}</p>
      </div>
      <div className="text-muted-foreground">|</div>
      <div>
        <p className="text-xs text-muted-foreground">Payback</p>
        <p className="text-xl font-bold">{formatPaybackPeriod(moderate.paybackMonths)}</p>
      </div>
    </div>
  );
}

export default ROIResults;
