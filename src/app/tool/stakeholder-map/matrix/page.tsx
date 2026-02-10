/**
 * Stakeholder Matrix Page
 *
 * Displays the 2x2 power/interest matrix visualization.
 *
 * Story 11.2: 2x2 Matrix Visualization
 * Covers: FR2-17 (Power/interest matrix visualization)
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout';
import { ProgressStepper, ToolGuidance } from '@/components/diagnostic';
import { Button } from '@/components/ui/button';
import {
  StakeholderMatrix,
  StakeholderDetailPanel,
  QuadrantSummary,
  RiskSummary,
  canProceedToMatrix,
  SENTIMENT_STYLES,
  type Stakeholder,
  type StakeholderSentiment,
} from '@/components/tools/stakeholder-map';
import { useTool4Store } from '@/lib/store/tool4-store';

export default function StakeholderMatrixPage() {
  const router = useRouter();
  const { stakeholders, getQuadrantCounts, updateStakeholder } = useTool4Store();
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);

  // Redirect if not enough stakeholders
  useEffect(() => {
    if (!canProceedToMatrix(stakeholders)) {
      router.replace('/tool/stakeholder-map');
    }
  }, [stakeholders, router]);

  const handleSelect = useCallback((stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedStakeholder(null);
  }, []);

  const handleEditStakeholder = useCallback(() => {
    // Navigate back to input page with edit mode
    router.push('/tool/stakeholder-map');
  }, [router]);

  const handleSentimentChange = useCallback(
    (sentiment: StakeholderSentiment | undefined) => {
      if (selectedStakeholder) {
        updateStakeholder(selectedStakeholder.id, { sentiment });
        // Update local selected stakeholder to reflect change immediately
        setSelectedStakeholder((prev) =>
          prev ? { ...prev, sentiment } : null
        );
      }
    },
    [selectedStakeholder, updateStakeholder]
  );

  // Don't render if not enough stakeholders (will redirect)
  if (!canProceedToMatrix(stakeholders)) {
    return null;
  }

  const quadrantCounts = getQuadrantCounts();

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/tool/stakeholder-map"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Stakeholder Input
            </Link>
          </nav>

          {/* Progress Stepper */}
          <div className="mb-6">
            <ProgressStepper currentToolId="stakeholder-map" />
          </div>

          {/* Tool Guidance */}
          <ToolGuidance toolId="stakeholder-map" className="mb-6" />

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Stakeholder Power/Interest Matrix
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your {stakeholders.length} stakeholders mapped by power and interest.
              Click on any stakeholder to view details.
            </p>
          </header>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Matrix (2 columns on large screens) */}
            <div className="lg:col-span-2">
              <StakeholderMatrix
                stakeholders={stakeholders}
                selectedId={selectedStakeholder?.id}
                onSelect={handleSelect}
                className="mb-6"
              />

              {/* Quadrant Legend */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Quadrants</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Key Players</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span>Keep Satisfied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-teal-500" />
                      <span>Keep Informed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500" />
                      <span>Monitor</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Sentiment (Ring Color)</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-green-500 bg-transparent" />
                      <span>Supporter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-yellow-500 bg-transparent" />
                      <span>Neutral</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-transparent" />
                      <span>Blocker</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar (1 column on large screens) */}
            <div className="space-y-6">
              {/* Selected Stakeholder Detail */}
              {selectedStakeholder ? (
                <StakeholderDetailPanel
                  stakeholder={selectedStakeholder}
                  onEdit={handleEditStakeholder}
                  onClose={handleCloseDetail}
                  onSentimentChange={handleSentimentChange}
                />
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Click on a stakeholder in the matrix to view their details.
                  </p>
                </div>
              )}

              {/* Risk Summary */}
              <RiskSummary stakeholders={stakeholders} />

              {/* Quadrant Summary */}
              <QuadrantSummary counts={quadrantCounts} />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/tool/stakeholder-map">Edit Stakeholders</Link>
            </Button>
            <Button asChild>
              <Link href="/diagnostic">Back to Diagnostic Hub</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
