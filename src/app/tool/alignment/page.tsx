import Link from 'next/link';
import { Header } from '@/components/layout';
import { ProgressStepper, ToolGuidance } from '@/components/diagnostic';
import { AlignmentScorer } from '@/components/tools/alignment';

/**
 * Tool 1: Organizational Alignment Assessment Page
 *
 * Allows users to score their organization across 5 alignment dimensions.
 *
 * Story 9.1: Alignment Dimension Scoring Interface
 * Story 8.6: Progress Stepper Navigation
 * Story 8.7: Guided Diagnostic Flow
 * Covers: FR2-6 (Score 5 alignment dimensions), FR2-38 (Progress stepper), FR2-40 (Contextual guidance)
 */
export default function AlignmentAssessmentPage() {
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
            <ProgressStepper currentToolId="alignment" />
          </div>

          {/* Tool Guidance */}
          <ToolGuidance toolId="alignment" className="mb-6" />

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Organizational Alignment Assessment
            </h1>
            <p className="mt-2 text-muted-foreground">
              Score your organization across 5 key alignment dimensions to identify where
              strategy and execution are decoupled.
            </p>
          </header>

          {/* Instructions */}
          <div className="mb-8 rounded-lg border bg-muted/50 p-4">
            <h2 className="font-semibold mb-2">How to Score</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <strong>1 - Chaos:</strong> Dysfunction, no coordination
              </li>
              <li>
                <strong>2 - Siloed:</strong> Isolated efforts, limited integration
              </li>
              <li>
                <strong>3 - Coordinated:</strong> Working together, some friction
              </li>
              <li>
                <strong>4 - Integrated:</strong> Seamless alignment, continuous improvement
              </li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Hover or tap each score button to see the full description.
            </p>
          </div>

          {/* Alignment Scorer Component */}
          <AlignmentScorer />
        </div>
      </main>
    </>
  );
}
