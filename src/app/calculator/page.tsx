import { Suspense } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout';
import { ProgressStepper } from '@/components/diagnostic';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { CalculatorHeader } from '@/components/calculator/CalculatorHeader';
import { SessionLoader } from '@/components/calculator/SessionLoader';

/**
 * Tool 2: Meeting Audit Calculator Page
 *
 * Story 8.6: Progress Stepper Navigation
 * Covers: FR2-38 (Progress stepper)
 */
export default function CalculatorPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--background)' }}>
        <div style={{ maxWidth: '768px', marginLeft: 'auto', marginRight: 'auto', padding: '2rem 1rem' }}>
        {/* Back Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
          <Link
            href="/diagnostic"
            style={{
              fontSize: '0.875rem',
              color: 'var(--muted-foreground)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span aria-hidden="true">&larr;</span>
            Back to Diagnostic Hub
          </Link>
        </nav>

        {/* Progress Stepper */}
        <div style={{ marginBottom: '2rem' }}>
          <ProgressStepper currentToolId="meeting-audit" />
        </div>

        {/* Session Loader for authenticated users */}
        <Suspense fallback={null}>
          <SessionLoader />
        </Suspense>

        {/* Calculator Header with Import/Export Options */}
        <CalculatorHeader />

        {/* Calculator Form with Validation */}
        <CalculatorForm />
        </div>
      </main>
    </>
  );
}
