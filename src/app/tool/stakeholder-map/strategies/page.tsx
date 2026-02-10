/**
 * Stakeholder Engagement Strategies Page
 *
 * Displays engagement recommendations and action plan.
 *
 * Story 11.4: Engagement Strategy Generation
 * Covers: FR2-19, FR2-20
 */

'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/layout';
import { ProgressStepper, ToolGuidance } from '@/components/diagnostic';
import { Button } from '@/components/ui/button';
import {
  QuadrantStrategy,
  EngagementActionTable,
  canProceedToMatrix,
  getEngagementSummary,
  type StakeholderQuadrant,
} from '@/components/tools/stakeholder-map';
import { useTool4Store } from '@/lib/store/tool4-store';

const QUADRANT_ORDER: StakeholderQuadrant[] = [
  'key_players',
  'keep_satisfied',
  'keep_informed',
  'monitor',
];

export default function StakeholderStrategiesPage() {
  const router = useRouter();
  const {
    stakeholders,
    ownerAssignments,
    setOwner,
    markComplete,
    completion,
  } = useTool4Store();

  // Redirect if not enough stakeholders
  useEffect(() => {
    if (!canProceedToMatrix(stakeholders)) {
      router.replace('/tool/stakeholder-map');
    }
  }, [stakeholders, router]);

  // Mark complete when page is viewed
  useEffect(() => {
    if (stakeholders.length >= 3 && !completion) {
      markComplete();
    }
  }, [stakeholders.length, completion, markComplete]);

  const handleOwnerChange = useCallback(
    (stakeholderId: string, owner: string) => {
      setOwner(stakeholderId, owner);
    },
    [setOwner]
  );

  // Don't render if not enough stakeholders (will redirect)
  if (!canProceedToMatrix(stakeholders)) {
    return null;
  }

  const summary = getEngagementSummary(stakeholders);

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/tool/stakeholder-map/matrix"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Matrix View
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Engagement Strategies
              </h1>
              {completion && (
                <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Complete
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              Recommended engagement approaches for your {stakeholders.length} stakeholders.
              Assign owners to track accountability.
            </p>
          </header>

          {/* Quadrant Strategies Grid */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Quadrant-Based Strategies</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {QUADRANT_ORDER.map((quadrant) => (
                <QuadrantStrategy
                  key={quadrant}
                  quadrant={quadrant}
                  stakeholderCount={summary[quadrant].count}
                  blockerCount={summary[quadrant].blockers}
                />
              ))}
            </div>
          </section>

          {/* Action Table */}
          <section className="mb-8">
            <EngagementActionTable
              stakeholders={stakeholders}
              owners={ownerAssignments}
              onOwnerChange={handleOwnerChange}
            />
          </section>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t pt-6">
            <Button variant="outline" asChild>
              <Link href="/tool/stakeholder-map/matrix">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Matrix
              </Link>
            </Button>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/diagnostic">Diagnostic Hub</Link>
              </Button>
              <Button asChild>
                <Link href="/tool/data-flow">
                  Next Tool
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
