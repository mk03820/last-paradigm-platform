/**
 * Tool 7: Total Cost of Misalignment - Additional Inputs Page
 *
 * Page for entering additional cost categories not captured by other tools.
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 8: Create cost inputs page (AC: all)
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { ProgressStepper, ToolGuidance } from '@/components/diagnostic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, ChevronLeft, ChevronRight } from 'lucide-react';
import { RevenueInput } from '@/components/tools/total-cost/RevenueInput';
import { AdditionalCostsForm } from '@/components/tools/total-cost/AdditionalCostsForm';
import { formatCurrency } from '@/components/tools/total-cost/cost-constants';
import { useTool7Store } from '@/lib/store/tool7-store';

export default function TotalCostInputsPage() {
  const router = useRouter();

  // Store state
  const aggregatedData = useTool7Store((state) => state.aggregatedData);
  const additionalCostsInput = useTool7Store((state) => state.additionalCostsInput);
  const revenue = useTool7Store((state) => state.revenue);
  const updateProjectDelaysCost = useTool7Store((state) => state.updateProjectDelaysCost);
  const updateReworkCost = useTool7Store((state) => state.updateReworkCost);
  const updateTurnoverCost = useTool7Store((state) => state.updateTurnoverCost);
  const updateOpportunityCost = useTool7Store((state) => state.updateOpportunityCost);
  const setRevenue = useTool7Store((state) => state.setRevenue);

  // Calculate costs from tools
  const meetingWasteCost = aggregatedData?.tool2?.annualizedWaste ?? 0;
  const dataFrictionCost = aggregatedData?.tool5?.totalFrictionCost ?? 0;
  const toolsCost = meetingWasteCost + dataFrictionCost;

  // Calculate total cost
  const totalCost = toolsCost + additionalCostsInput.total;

  // Check if can continue (at least Tool 2 completed)
  const canContinue = aggregatedData?.canProceed ?? false;

  const handleContinue = () => {
    // Navigate to results page (Story 14.3)
    router.push('/tool/total-cost/results');
  };

  const handleBack = () => {
    router.push('/tool/total-cost');
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/tool/total-cost"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Cost Overview
            </Link>
          </nav>

          {/* Progress Stepper */}
          <div className="mb-6">
            <ProgressStepper currentToolId="total-cost" />
          </div>

          {/* Tool Guidance */}
          <ToolGuidance toolId="total-cost" className="mb-6" />

          {/* Page Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Additional Cost Inputs
              </h1>
            </div>
            <p className="text-muted-foreground">
              Enter cost categories not captured by other diagnostic tools.
              These inputs help calculate your complete alignment tax.
            </p>
          </header>

          {/* Revenue Input (Prominent) */}
          <section className="mb-8">
            <RevenueInput
              value={revenue}
              onChange={setRevenue}
              totalCost={totalCost}
            />
          </section>

          {/* Costs from Other Tools */}
          {toolsCost > 0 && (
            <section className="mb-8">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-lg">From Other Tools</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Already captured
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Cost data aggregated from completed diagnostic tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {meetingWasteCost > 0 && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <div>
                          <p className="font-medium">Meeting Waste</p>
                          <p className="text-xs text-muted-foreground">Tool 2: Meeting Audit</p>
                        </div>
                        <span className="font-semibold">{formatCurrency(meetingWasteCost)}</span>
                      </div>
                    )}
                    {dataFrictionCost > 0 && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <div>
                          <p className="font-medium">Data Friction</p>
                          <p className="text-xs text-muted-foreground">Tool 5: Data Flow</p>
                        </div>
                        <span className="font-semibold">{formatCurrency(dataFrictionCost)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-medium">Tools Subtotal</span>
                      <span className="font-bold text-lg">{formatCurrency(toolsCost)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Additional Cost Inputs */}
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Additional Cost Categories</h2>
              <p className="text-sm text-muted-foreground">
                Enter estimates for costs not captured by the diagnostic tools
              </p>
            </div>
            <AdditionalCostsForm
              data={additionalCostsInput}
              onProjectDelaysChange={updateProjectDelaysCost}
              onReworkChange={updateReworkCost}
              onTurnoverChange={updateTurnoverCost}
              onOpportunityCostChange={updateOpportunityCost}
            />
          </section>

          {/* Combined Total */}
          <section className="mb-8">
            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Combined Total Alignment Tax</h3>
                    <p className="text-sm text-muted-foreground">
                      Sum of tool costs and additional inputs
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary">
                      {formatCurrency(totalCost)}
                    </span>
                    {revenue > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {((totalCost / revenue) * 100).toFixed(2)}% of revenue
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Overview
            </Button>

            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              size="lg"
            >
              Continue to Results
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {!canContinue && (
            <p className="mt-4 text-sm text-amber-600 dark:text-amber-400 text-right">
              Complete at least the Meeting Audit (Tool 2) to continue
            </p>
          )}
        </div>
      </main>
    </>
  );
}
