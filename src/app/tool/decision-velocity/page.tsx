import Link from 'next/link';
import { Header } from '@/components/layout';
import { ProgressStepper, ToolGuidance } from '@/components/diagnostic';
import { DecisionVelocityScorer } from '@/components/tools/decision-velocity';

/**
 * Tool 3: Decision Velocity Scorecard Page
 *
 * Allows users to input decision samples to measure organizational decision velocity.
 *
 * Story 10.1: Decision Sample Input Interface
 * Story 8.6: Progress Stepper Navigation
 * Story 8.7: Guided Diagnostic Flow
 * Covers: FR2-11 (Decision sample input), FR2-38 (Progress stepper), FR2-40 (Contextual guidance)
 */
export default function DecisionVelocityPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
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
            <ProgressStepper currentToolId="decision-velocity" />
          </div>

          {/* Tool Guidance */}
          <ToolGuidance toolId="decision-velocity" className="mb-6" />

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Decision Velocity Scorecard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Measure how long decisions take in your organization by entering samples
              from recent decisions across different categories.
            </p>
          </header>

          {/* Instructions */}
          <div className="mb-8 rounded-lg border bg-muted/50 p-4">
            <h2 className="font-semibold mb-2">How to Use This Tool</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                <strong>1. Choose categories:</strong> Skip any decision types that
                don&apos;t apply to your organization.
              </li>
              <li>
                <strong>2. Enter decisions:</strong> For each relevant category, add
                3-10 recent decisions with their timing data.
              </li>
              <li>
                <strong>3. Focus on recent examples:</strong> Decisions from the last
                6-12 months give the best picture of current velocity.
              </li>
              <li>
                <strong>4. Be specific:</strong> Include the request date (when approval
                was first sought) and decision date (when approval was granted).
              </li>
            </ul>
          </div>

          {/* Decision Velocity Scorer Component */}
          <DecisionVelocityScorer />
        </div>
      </main>
    </>
  );
}
