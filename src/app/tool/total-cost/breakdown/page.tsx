/**
 * Total Cost of Misalignment - Cost Category Breakdown Page
 *
 * Displays detailed cost category breakdown with interactive visualization.
 *
 * Story 14.4: Cost Category Breakdown Visualization
 * FR2-34: Cost category breakdown visualization
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header, StepIndicator } from '@/components/layout';
import {
  CostCategoryChart,
  AlignmentTaxHeadline,
  PercentOfRevenueDisplay,
  calculateTotalAlignmentTax,
} from '@/components/tools/total-cost';
import type { AggregatedToolData, AdditionalCosts, CostSourceItem } from '@/components/tools/total-cost/cost-constants';
import { TOOLS } from '@/components/tools/total-cost/cost-constants';

/**
 * Mock data for development - will be replaced with actual store data
 * when Stories 14.1 and 14.2 are complete
 */
function getMockData(): {
  aggregatedData: AggregatedToolData;
  additionalCosts: AdditionalCosts;
  revenue: number;
} {
  return {
    aggregatedData: {
      tool1: {
        compositeScore: 2.3,
        category: 'siloed',
        weakestDimension: 'Communication',
        completedAt: new Date().toISOString(),
      },
      tool2: {
        annualizedWaste: 1200000,
        meetingsPerWeek: 45,
        totalAttendeeHours: 540,
        completedAt: new Date().toISOString(),
      },
      tool3: {
        avgDecisionLatencyDays: 12,
        bottleneckPatterns: ['Approval bottleneck', 'Information silos'],
        decisionTypeCount: 4,
        completedAt: new Date().toISOString(),
      },
      tool4: {
        stakeholderCount: 15,
        blockerCount: 3,
        keyPlayerCount: 5,
        riskLevel: 'medium',
        completedAt: new Date().toISOString(),
      },
      tool5: {
        totalFrictionCost: 450000,
        journeyCount: 5,
        frictionPointCount: 12,
        criticalFrictionCount: 3,
        completedAt: new Date().toISOString(),
      },
      tool6: {
        healthScore: 58,
        healthStatus: 'warning',
        patternsDetected: 3,
        interventionsRecommended: 5,
        completedAt: new Date().toISOString(),
      },
      aggregatedAt: new Date().toISOString(),
      completedToolsCount: 6,
      canProceed: true,
    },
    additionalCosts: {
      projectDelays: {
        annualProjectBudget: 2000000,
        delayPercentage: 15,
        subtotal: 350000,
      },
      rework: {
        annualLaborBudget: 3000000,
        reworkPercentage: 20,
        subtotal: 600000,
      },
      turnover: {
        annualTurnoverCost: 500000,
        alignmentAttributionPercent: 40,
        subtotal: 200000,
      },
      opportunityCost: {
        estimatedAmount: 100000,
        subtotal: 100000,
      },
      total: 1250000,
    },
    revenue: 70000000,
  };
}

/**
 * Get tool name by number
 */
function getToolName(toolNumber: number | undefined): string {
  if (!toolNumber) return 'Manual Input';
  const tool = TOOLS.find((t) => t.number === toolNumber);
  return tool?.shortName || `Tool ${toolNumber}`;
}

/**
 * Cost Category Breakdown Page
 */
export default function CostBreakdownPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState<CostSourceItem | null>(null);

  // TODO: Replace with actual store data when 14.1 and 14.2 are complete
  const { aggregatedData, additionalCosts, revenue } = getMockData();

  // Calculate alignment tax
  const result = React.useMemo(
    () => calculateTotalAlignmentTax(aggregatedData, additionalCosts, revenue),
    [aggregatedData, additionalCosts, revenue]
  );

  // Simulate loading state
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if no data
  React.useEffect(() => {
    if (!isLoading && !aggregatedData.canProceed) {
      router.replace('/tool/total-cost/inputs');
    }
  }, [aggregatedData.canProceed, router, isLoading]);

  // Handle category click
  const handleCategoryClick = React.useCallback((category: CostSourceItem) => {
    setSelectedCategory(category);
  }, []);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-56px)] bg-background">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-[400px] bg-muted rounded" />
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/tool/total-cost/results"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Results
            </Link>
          </nav>

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Cost Category Breakdown
            </h1>
            <p className="mt-2 text-muted-foreground">
              Detailed analysis of your alignment tax by category
            </p>
          </header>

          {/* Summary Card */}
          <Card className="mb-8">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Alignment Tax</p>
                  <AlignmentTaxHeadline amount={result.total} className="text-3xl" />
                </div>
                <div className="md:text-right">
                  <PercentOfRevenueDisplay
                    percentOfRevenue={result.percentOfRevenue}
                    revenue={result.revenue}
                    interpretation={result.interpretation}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Chart */}
          <CostCategoryChart
            result={result}
            onCategoryClick={handleCategoryClick}
            className="mb-8"
          />

          {/* Category Detail Panel (when selected) */}
          {selectedCategory && (
            <Card className="mb-8" role="region" aria-label="Selected category details">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedCategory.label} Details
                </CardTitle>
                <CardDescription>
                  Source: {selectedCategory.source === 'tool'
                    ? getToolName(selectedCategory.toolNumber)
                    : 'Manual Input'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Cost</p>
                    <p className="text-2xl font-bold">
                      ${selectedCategory.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">% of Total Tax</p>
                    <p className="text-2xl font-bold">
                      {selectedCategory.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {selectedCategory.source === 'tool' && selectedCategory.toolNumber && (
                  <div className="pt-4 border-t">
                    <Button asChild variant="outline" size="sm">
                      <Link href={TOOLS.find(t => t.number === selectedCategory.toolNumber)?.path || '#'}>
                        View {getToolName(selectedCategory.toolNumber)} Tool
                      </Link>
                    </Button>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="mt-2"
                >
                  Clear Selection
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Key Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Largest category insight */}
              {result.meetingWaste > 0 && result.meetingWaste >= Math.max(
                result.dataFriction,
                result.projectDelays,
                result.rework,
                result.turnover,
                result.opportunityCost
              ) && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                  <div className="flex-1">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Meeting Waste is your largest cost driver
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                      Consider reviewing meeting practices with the Meeting Audit tool for quick wins.
                    </p>
                  </div>
                </div>
              )}

              {/* Tool vs Manual comparison */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                <div className="flex-1">
                  <p className="font-medium">
                    {result.toolsSubtotal > result.additionalSubtotal
                      ? 'Tool-measured costs exceed manual estimates'
                      : 'Manual estimates exceed tool-measured costs'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tool-sourced: ${result.toolsSubtotal.toLocaleString()} |
                    Manual inputs: ${result.additionalSubtotal.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                <div className="flex-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Complete more diagnostic tools for accuracy
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    {aggregatedData.completedToolsCount} of 6 diagnostic tools completed.
                    {aggregatedData.completedToolsCount < 6 &&
                      ' Additional tools provide more precise cost measurements.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="outline" asChild>
              <Link href="/tool/total-cost/results">
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                Back to Results
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tool/total-cost/inputs">
                Revise Inputs
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                Return to Dashboard
              </Link>
            </Button>
          </div>

          {/* Methodology Note */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium mb-1">Understanding the Categories</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Meeting Waste:</strong> Time spent in unproductive meetings (Tool 2)</li>
              <li><strong>Data Friction:</strong> Cost of data access and quality issues (Tool 5)</li>
              <li><strong>Project Delays:</strong> Value lost from delayed or failed projects</li>
              <li><strong>Rework:</strong> Cost of work redone due to miscommunication</li>
              <li><strong>Excess Turnover:</strong> Cost of losing employees to organizational friction</li>
              <li><strong>Opportunity Cost:</strong> Revenue missed due to slow execution</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
