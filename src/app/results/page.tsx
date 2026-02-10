'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { CostBreakdown } from '@/components/results/CostBreakdown';
import { AlignmentTaxEstimate } from '@/components/results/AlignmentTaxEstimate';
import { InputsSummary } from '@/components/results/InputsSummary';
import { FormulaDisplay } from '@/components/results/FormulaDisplay';
import { AssumptionsPanel } from '@/components/results/AssumptionsPanel';
import { EmailCaptureForm } from '@/components/email/EmailCaptureForm';
import { PdfExportButton } from '@/components/pdf/PdfExportButton';
import { SaveProgressPrompt } from '@/components/results/SaveProgressPrompt';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout';
import { ProgressStepper, ToolNavigation } from '@/components/diagnostic';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * Results Page
 *
 * Story 8.6: Progress Stepper Navigation
 * Covers: FR2-38 (Progress stepper, tool navigation)
 */
export default function ResultsPage() {
  const { results } = useCalculatorStore();

  // Redirect to calculator if no results available
  if (!results) {
    redirect('/calculator');
  }

  return (
    <>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--background)' }}>
        <div style={{ maxWidth: '768px', marginLeft: 'auto', marginRight: 'auto', padding: '2rem 1rem' }}>
        {/* Back Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
          <Link
            href="/calculator"
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
            Back to Calculator
          </Link>
        </nav>

        {/* Progress Stepper */}
        <div style={{ marginBottom: '2rem' }}>
          <ProgressStepper currentToolId="meeting-audit" />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem' }}>
            Your Meeting Waste Analysis
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted-foreground)' }}>
            Based on your inputs, here&apos;s your estimated annual meeting waste.
          </p>
        </div>

        {/* Hero Result Section */}
        <section
          aria-labelledby="results-heading"
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <h2 id="results-heading" className="sr-only">
            Calculation Results
          </h2>
          <CostBreakdown amount={results.meetingWaste} />
        </section>

        {/* Save Progress Prompt - For Anonymous Users */}
        <div style={{ marginBottom: '2rem' }}>
          <SaveProgressPrompt />
        </div>

        {/* Alignment Tax Estimate Section */}
        <div style={{ marginBottom: '2rem' }}>
          <AlignmentTaxEstimate
            meetingWaste={results.meetingWaste}
            estimatedMin={results.estimatedAlignmentTaxMin}
            estimatedMax={results.estimatedAlignmentTaxMax}
          />
        </div>

        {/* Methodology Transparency Section */}
        <section aria-labelledby="methodology-heading" style={{ marginBottom: '2rem' }}>
          <h2 id="methodology-heading" className="sr-only">
            Calculation Methodology
          </h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="methodology" style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0 1rem' }}>
              <AccordionTrigger style={{ fontSize: '1rem', fontWeight: 500 }}>
                How we calculated this
              </AccordionTrigger>
              <AccordionContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <InputsSummary inputs={results.inputs} />
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <FormulaDisplay />
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <AssumptionsPanel />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Email Capture Section - Optional, Non-blocking */}
        <section aria-labelledby="email-capture-heading" style={{ marginBottom: '2rem' }}>
          <h2 id="email-capture-heading" className="sr-only">
            Get Notified
          </h2>
          <EmailCaptureForm />
        </section>

        {/* Actions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <PdfExportButton results={results} buttonText="Export PDF" />
          <Button asChild variant="outline" size="lg">
            <Link href="/calculator">Recalculate</Link>
          </Button>
        </div>

        {/* Tool Navigation */}
        <div style={{ marginTop: '2rem' }}>
          <ToolNavigation currentToolNumber={2} />
        </div>
        </div>
      </main>
    </>
  );
}
