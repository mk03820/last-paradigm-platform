/**
 * Diagnostic Hub Page
 *
 * Central navigation page showing all 7 diagnostic tools with progress.
 * Accessible to both authenticated and anonymous users.
 *
 * Story 8.5: Diagnostic Tool Hub
 * Covers: FR2-37 (tool hub), FR2-41 (completion percentage)
 */

import { Header } from '@/components/layout';
import { DiagnosticProgress, ToolGrid } from '@/components/diagnostic';
import { SaveResultsButtonWrapper } from '@/components/session';
import Link from 'next/link';

export const metadata = {
  title: 'Diagnostic Hub | The Last Paradigm',
  description: 'Complete all 7 diagnostic tools to calculate your total cost of misalignment.',
};

export default function DiagnosticHubPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <nav aria-label="Breadcrumb">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <span aria-hidden="true">&larr;</span>
                  Home
                </Link>
              </nav>
              {/* Save Results Button - Story 15.8 */}
              <SaveResultsButtonWrapper variant="outline" size="sm" showOnlyIfData />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Alignment Tax Diagnostic
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Complete all 7 tools to calculate your organization&apos;s total cost of misalignment. Each tool provides insights into different aspects of organizational friction.
            </p>
          </header>

          {/* Progress Section */}
          <section className="mb-8 p-4 rounded-lg border bg-card" aria-labelledby="progress-heading">
            <h2 id="progress-heading" className="sr-only">
              Diagnostic Progress
            </h2>
            <DiagnosticProgress />
          </section>

          {/* Recommended Order Notice */}
          <div className="mb-6 text-sm text-muted-foreground">
            <p>
              <strong>Recommended order:</strong> Start with Tool 1 (Alignment Assessment) and
              work through to Tool 7 (Total Cost Calculator), which aggregates results from all
              other tools.
            </p>
          </div>

          {/* Tool Grid */}
          <section aria-labelledby="tools-heading">
            <h2 id="tools-heading" className="sr-only">
              Diagnostic Tools
            </h2>
            <ToolGrid />
          </section>

          {/* Help Section */}
          <section className="mt-8 p-4 rounded-lg border bg-muted/30" aria-labelledby="help-heading">
            <h2 id="help-heading" className="font-semibold mb-2">
              Need Help?
            </h2>
            <p className="text-sm text-muted-foreground">
              Each tool includes guidance and examples to help you complete the assessment.
              You can complete tools in any order and return to update your answers at any
              time.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
