/**
 * Tool 7: Total Cost of Misalignment - ROI Calculator Page
 *
 * Calculate transformation ROI based on alignment tax.
 *
 * Story 14.5: Transformation ROI Calculator
 * Task 6: Create /tool/total-cost/roi/page.tsx
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { ProgressStepper, ToolGuidance } from '@/components/diagnostic';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useTool7Store } from '@/lib/store/tool7-store';
import { ROICalculator } from '@/components/tools/total-cost/ROICalculator';
import { ROIResults, ROICompactSummary } from '@/components/tools/total-cost/ROIResults';
import { formatCurrency, ROI_DEFAULTS } from '@/components/tools/total-cost/cost-constants';
import { generateScenarios, canCalculateROI } from '@/components/tools/total-cost/roi-calculator';
import type { ROIResult, ROIScenarioType } from '@/components/tools/total-cost/cost-constants';

export default function ROICalculatorPage() {
  const router = useRouter();

  // Store state
  const aggregatedData = useTool7Store((state) => state.aggregatedData);
  const additionalCostsInput = useTool7Store((state) => state.additionalCostsInput);
  const revenue = useTool7Store((state) => state.revenue);
  const canProceed = useTool7Store((state) => state.canProceed);

  // Local state for ROI calculator
  const [investment, setInvestment] = React.useState(0);
  const [targetReduction, setTargetReduction] = React.useState(ROI_DEFAULTS.targetReduction);
  const [timelineMonths, setTimelineMonths] = React.useState(ROI_DEFAULTS.timelineMonths);
  const [results, setResults] = React.useState<ROIResult[] | null>(null);
  const [selectedScenario, setSelectedScenario] = React.useState<ROIScenarioType>('moderate');
  const [isCalculating, setIsCalculating] = React.useState(false);

  // Calculate alignment tax from store data
  const meetingWasteCost = aggregatedData?.tool2?.annualizedWaste ?? 0;
  const dataFrictionCost = aggregatedData?.tool5?.totalFrictionCost ?? 0;
  const toolsCost = meetingWasteCost + dataFrictionCost;
  const alignmentTax = toolsCost + additionalCostsInput.total;

  // Check if we have required data
  const hasAlignmentTax = alignmentTax > 0;
  const canCalculate = hasAlignmentTax && canCalculateROI(alignmentTax, investment);

  // Handle calculate
  const handleCalculate = React.useCallback(() => {
    if (!canCalculate) return;

    setIsCalculating(true);

    // Simulate slight delay for UX
    setTimeout(() => {
      const scenarios = generateScenarios(
        alignmentTax,
        investment,
        targetReduction,
        timelineMonths
      );
      setResults(scenarios);
      setIsCalculating(false);
    }, 300);
  }, [alignmentTax, investment, targetReduction, timelineMonths, canCalculate]);

  // Auto-calculate when inputs change if we already have results
  React.useEffect(() => {
    if (results && canCalculate) {
      const scenarios = generateScenarios(
        alignmentTax,
        investment,
        targetReduction,
        timelineMonths
      );
      setResults(scenarios);
    }
  }, [targetReduction, timelineMonths]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigation handlers
  const handleBack = () => {
    router.push('/tool/total-cost/results');
  };

  const handleContinue = () => {
    // Could navigate to next step or export
    router.push('/dashboard');
  };

  // Redirect if no data
  React.useEffect(() => {
    if (!canProceed()) {
      router.replace('/tool/total-cost');
    }
  }, [canProceed, router]);

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background print:bg-white">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 print:hidden">
            <Link
              href="/tool/total-cost/results"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Results
            </Link>
          </nav>

          {/* Progress Stepper */}
          <div className="mb-6 print:hidden">
            <ProgressStepper currentToolId="total-cost" />
          </div>

          {/* Tool Guidance */}
          <ToolGuidance toolId="total-cost" className="mb-6 print:hidden" />

          {/* Page Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 print:bg-gray-100">
                <TrendingUp className="h-6 w-6 text-primary print:text-gray-700" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Transformation ROI Calculator
              </h1>
            </div>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Calculate the potential return on investment for organizational
              transformation initiatives based on your alignment tax.
            </p>
          </header>

          {/* No Alignment Tax Warning */}
          {!hasAlignmentTax && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Alignment Tax Data</AlertTitle>
              <AlertDescription>
                You need to complete the alignment tax calculation before using the ROI calculator.
                Please{' '}
                <Link href="/tool/total-cost/results" className="underline">
                  view your results
                </Link>{' '}
                first.
              </AlertDescription>
            </Alert>
          )}

          {/* Alignment Tax Context */}
          {hasAlignmentTax && (
            <div className="mb-8 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Your Current Annual Alignment Tax</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(alignmentTax)}
                  </p>
                </div>
                {revenue > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">As % of Revenue</p>
                    <p className="text-xl font-semibold">
                      {((alignmentTax / revenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Calculator Form */}
            <div className="lg:col-span-2 print:hidden">
              <ROICalculator
                alignmentTax={alignmentTax}
                investment={investment}
                onInvestmentChange={setInvestment}
                targetReduction={targetReduction}
                onTargetReductionChange={setTargetReduction}
                timelineMonths={timelineMonths}
                onTimelineMonthsChange={setTimelineMonths}
                onCalculate={handleCalculate}
                isCalculating={isCalculating}
              />
            </div>

            {/* Results Section */}
            <div className="lg:col-span-3">
              {results ? (
                <ROIResults
                  results={results}
                  selectedScenario={selectedScenario}
                  onScenarioSelect={setSelectedScenario}
                  showBoardSummary={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px] rounded-lg border-2 border-dashed border-muted-foreground/25">
                  <div className="text-center p-8">
                    <Calculator className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium text-lg mb-2">Enter Investment Amount</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Enter your proposed transformation investment amount and click
                      "Calculate ROI Scenarios" to see projected returns.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compact Summary for smaller viewports */}
          {results && (
            <div className="mt-6 lg:hidden print:hidden">
              <ROICompactSummary results={results} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t print:hidden">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Results
            </Button>

            <Button onClick={handleContinue} size="lg">
              Complete Diagnostic
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Methodology Note */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground print:hidden">
            <p className="font-medium mb-1">About This Calculator</p>
            <p>
              The ROI Calculator uses Net Present Value (NPV) analysis with a 10% discount
              rate to evaluate transformation investments. It models three scenarios based on
              industry transformation success rates: Conservative (85% confidence),
              Moderate (65% confidence), and Aggressive (35% confidence). Savings ramp up
              linearly during the timeline period before reaching full annual savings.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
