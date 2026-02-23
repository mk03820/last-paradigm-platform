/**
 * Tool 7: Total Cost of Misalignment Calculator - Main Page
 *
 * Entry point for calculating the total cost of organizational misalignment
 * by aggregating data from all 6 diagnostic tools.
 *
 * Story 14.1: Cross-Tool Data Aggregation
 * C3-S8: Session persistence integration
 * Task 5: Create Tool 7 main page (AC: all)
 */

'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { ProgressStepper, ToolGuidance } from '@/components/diagnostic';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToolCompletionStatus } from '@/components/tools/total-cost/ToolCompletionStatus';
import { AggregatedDataPreview } from '@/components/tools/total-cost/AggregatedDataPreview';
import { Tool7SessionLoader } from '@/components/tools/total-cost';
import { aggregateAllTools } from '@/components/tools/total-cost/aggregation-engine';
import { useTool7Store } from '@/lib/store/tool7-store';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { useTool1Store } from '@/lib/store/tool1-store';
import { useTool3Store } from '@/lib/store/tool3-store';
import { useTool4Store } from '@/lib/store/tool4-store';
import { useTool5Store } from '@/lib/store/tool5-store';
import { useTool6Store } from '@/lib/store/tool6-store';
import { AlertCircle, Calculator, RefreshCw } from 'lucide-react';

export default function TotalCostPage() {
  const router = useRouter();

  // Store state
  const aggregatedData = useTool7Store((state) => state.aggregatedData);
  const aggregationStatus = useTool7Store((state) => state.aggregationStatus);
  const setAggregatedData = useTool7Store((state) => state.setAggregatedData);
  const setAggregationStatus = useTool7Store((state) => state.setAggregationStatus);
  const setAggregationError = useTool7Store((state) => state.setAggregationError);
  const canProceed = useTool7Store((state) => state.canProceed);

  // Local state for refresh
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Subscribe to stores that affect aggregation - this ensures we re-aggregate
  // after Zustand persist middleware finishes hydrating from sessionStorage
  const calculatorResults = useCalculatorStore((state) => state.results);
  const tool1Completion = useTool1Store((state) => state.completion);
  const tool3Completion = useTool3Store((state) => state.completion);
  const tool4Completion = useTool4Store((state) => state.completion);
  const tool5Completion = useTool5Store((state) => state.completion);
  const tool6Completion = useTool6Store((state) => state.completion);

  // Initial aggregation on mount and when stores hydrate
  React.useEffect(() => {
    // Always refresh when this effect runs - this handles both initial mount
    // and re-hydration from sessionStorage
    handleRefresh();
  }, [calculatorResults, tool1Completion, tool3Completion, tool4Completion, tool5Completion, tool6Completion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle data refresh from tools (AC5)
  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    setAggregationStatus('aggregating');

    try {
      // Slight delay to show loading state for UX
      await new Promise((resolve) => setTimeout(resolve, 100));

      const data = aggregateAllTools();
      setAggregatedData(data);
      setAggregationError(null);
    } catch (error) {
      setAggregationError({
        message: error instanceof Error ? error.message : 'Failed to aggregate tool data',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [setAggregatedData, setAggregationStatus, setAggregationError]);

  // Handle continue to cost inputs (Story 14.2)
  const handleContinue = () => {
    // Navigate to additional cost inputs page (will be created in Story 14.2)
    router.push('/tool/total-cost/inputs');
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/diagnostic"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Diagnostic Hub
            </Link>
          </nav>

          {/* Progress Stepper */}
          <div className="mb-6">
            <ProgressStepper currentToolId="total-cost" />
          </div>

          {/* Tool Guidance */}
          <ToolGuidance toolId="total-cost" className="mb-6" />

          {/* Session Loader for authenticated users */}
          <Suspense fallback={null}>
            <Tool7SessionLoader />
          </Suspense>

          {/* Page Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Total Cost of Misalignment Calculator
              </h1>
            </div>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Aggregate data from all diagnostic tools to calculate the total
              cost of organizational misalignment. This gives you a comprehensive
              view of how misalignment impacts your bottom line.
            </p>
          </header>

          {/* Minimum Requirement Alert */}
          {aggregatedData && !canProceed() && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Minimum Requirement Not Met</AlertTitle>
              <AlertDescription>
                You must complete <strong>Tool 2: Meeting Audit Calculator</strong> before
                calculating your total cost of misalignment. The Meeting Audit provides
                the baseline cost data needed for the calculation.
              </AlertDescription>
            </Alert>
          )}

          {/* Tool Completion Status (Task 5.3) */}
          <ToolCompletionStatus
            aggregatedData={aggregatedData}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing || aggregationStatus === 'aggregating'}
            className="mb-6"
          />

          {/* Aggregated Data Preview (Task 5.4) */}
          <AggregatedDataPreview
            aggregatedData={aggregatedData}
            className="mb-8"
          />

          {/* Aggregation Info */}
          {aggregatedData && aggregatedData.completedToolsCount > 0 && (
            <div className="mb-8 p-4 rounded-lg border bg-muted/50">
              <h3 className="font-medium mb-2">What Happens Next?</h3>
              <p className="text-sm text-muted-foreground">
                With {aggregatedData.completedToolsCount} tool{aggregatedData.completedToolsCount !== 1 ? 's' : ''} complete,
                you can proceed to add any additional cost factors and calculate your
                total cost of misalignment. The more tools you complete, the more
                accurate your total cost estimate will be.
              </p>
            </div>
          )}

          {/* Action Buttons (Task 5.5, 5.6) */}
          <div className="flex items-center justify-between">
            <Link href="/diagnostic" passHref legacyBehavior>
              <Button variant="outline" asChild>
                <a>
                  <span aria-hidden="true" className="mr-2">&larr;</span>
                  Back to Tool Hub
                </a>
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              {/* Manual Refresh Button (AC5) */}
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing || aggregationStatus === 'aggregating'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>

              {/* Continue Button (Task 5.6) */}
              <Button
                onClick={handleContinue}
                disabled={!canProceed()}
                size="lg"
              >
                Continue to Cost Inputs
                <span aria-hidden="true" className="ml-2">&rarr;</span>
              </Button>
            </div>
          </div>

          {/* Help text */}
          {!canProceed() && (
            <p className="mt-4 text-sm text-muted-foreground text-right">
              Complete Tool 2 (Meeting Audit) to proceed
            </p>
          )}
        </div>
      </main>
    </>
  );
}
