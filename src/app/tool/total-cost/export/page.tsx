/**
 * Total Cost of Misalignment - Export Page
 *
 * Preview and export the Complete Diagnostic PDF.
 *
 * Story 14.6: Complete Diagnostic PDF Export
 * Covers: FR2-36 (Export full 7-tool diagnostic as premium PDF)
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout';
import { StepIndicator } from '@/components/layout/StepIndicator';
import {
  DiagnosticPDFExport,
  DocumentIcon,
} from '@/components/tools/total-cost/pdf';
import {
  calculateTotalAlignmentTax,
  formatCurrency,
  formatPercent,
} from '@/components/tools/total-cost';
import { useTool7Store } from '@/lib/store/tool7-store';
import type {
  AggregatedToolData,
  AdditionalCosts,
  AlignmentTaxResult,
} from '@/components/tools/total-cost/cost-constants';

/**
 * Mock data for development/demo - will be replaced with actual store data
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
 * Total Cost of Misalignment Export Page
 */
export default function TotalCostExportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [organizationName, setOrganizationName] = React.useState('');

  // Get data from store or use mock for demo
  const store = useTool7Store();
  const storeData = store.aggregatedData;
  const storeRevenue = store.revenue;
  const additionalCostsInput = store.additionalCostsInput;

  // Use store data if available, otherwise use mock data
  const hasDiagnosticData = storeData && storeData.canProceed && storeRevenue > 0;
  const { aggregatedData, additionalCosts, revenue } = hasDiagnosticData
    ? {
        aggregatedData: storeData,
        additionalCosts: {
          projectDelays: additionalCostsInput.projectDelays,
          rework: additionalCostsInput.rework,
          turnover: additionalCostsInput.turnover,
          opportunityCost: additionalCostsInput.opportunityCost,
          total: additionalCostsInput.total,
        },
        revenue: storeRevenue,
      }
    : getMockData();

  // Calculate alignment tax
  const result: AlignmentTaxResult = React.useMemo(
    () => calculateTotalAlignmentTax(aggregatedData, additionalCosts, revenue),
    [aggregatedData, additionalCosts, revenue]
  );

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Preview data sections
  const previewSections = [
    {
      title: 'Cover Page',
      description: 'Title, branding, and headline alignment tax',
    },
    {
      title: 'Executive Summary',
      description: `Total alignment tax: ${formatCurrency(result.total)} (${formatPercent(result.percentOfRevenue)} of revenue)`,
    },
    {
      title: 'Tool Results',
      description: `Results from ${aggregatedData.completedToolsCount} diagnostic tools`,
    },
    {
      title: 'Cost Breakdown',
      description: 'Detailed table of all cost categories',
    },
    {
      title: 'ROI Projections',
      description: 'Transformation investment scenarios',
    },
    {
      title: 'Recommendations',
      description: 'Prioritized action items based on findings',
    },
    {
      title: 'Methodology',
      description: 'How the analysis was performed',
    },
    {
      title: 'Next Steps',
      description: 'Contact information and CTA',
    },
  ];

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-56px)] bg-background">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-64 bg-muted rounded" />
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
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/tool/total-cost/results"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Results
            </Link>
          </nav>

          {/* Step Indicator */}
          <div className="mb-6">
            <StepIndicator
              currentStep={7}
              totalSteps={7}
              stepLabel="Total Cost of Misalignment - Export"
            />
          </div>

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Export Diagnostic Report
            </h1>
            <p className="mt-2 text-muted-foreground">
              Generate a professional PDF report of your complete alignment
              diagnostic for sharing with stakeholders.
            </p>
          </header>

          {/* Demo Notice */}
          {!hasDiagnosticData && (
            <div className="mb-6 p-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Demo Mode:</strong> This export uses sample data for
                demonstration. Complete the diagnostic tools to generate a
                report with your actual data.
              </p>
            </div>
          )}

          {/* Organization Name Input */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Report Details</CardTitle>
              <CardDescription>
                Optionally customize the report with your organization name.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <Label htmlFor="org-name">Organization Name (Optional)</Label>
                <Input
                  id="org-name"
                  type="text"
                  placeholder="e.g., Acme Corporation"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will appear on the cover page and in the filename.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Report Contents</CardTitle>
              <CardDescription>
                Your PDF will include the following sections:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {previewSections.map((section, index) => (
                  <div
                    key={section.title}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{section.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card className="mb-6 bg-muted/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(result.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Alignment Tax
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {formatPercent(result.percentOfRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">of Revenue</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {aggregatedData.completedToolsCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tools Completed
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold capitalize">
                    {result.interpretation.level}
                  </p>
                  <p className="text-xs text-muted-foreground">Severity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center p-6 rounded-lg bg-muted/30 border">
            <DocumentIcon className="h-12 w-12 text-primary" />
            <div className="text-center sm:text-left">
              <p className="font-medium">Ready to Export</p>
              <p className="text-sm text-muted-foreground">
                8-page PDF with executive summary, tool results, and
                recommendations
              </p>
            </div>
            <DiagnosticPDFExport
              result={result}
              aggregatedData={aggregatedData}
              organizationName={organizationName || undefined}
              buttonText="Download PDF Report"
              className="sm:ml-auto"
            />
          </div>

          {/* Additional Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t">
            <Button variant="outline" asChild>
              <Link href="/tool/total-cost/results">View Results</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tool/total-cost/inputs">Revise Inputs</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>

          {/* Note about generation time */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> PDF generation typically takes 2-5 seconds
              depending on your device. The file will download automatically
              once ready.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
