'use client';

/**
 * PDF Document Component
 *
 * Main PDF document structure for exporting meeting waste analysis.
 * Uses @react-pdf/renderer for client-side PDF generation.
 *
 * Document Structure (in order per Story 4-3):
 * 1. Header (Story 4-2) - branding and date
 * 2. Executive Summary (Story 4-2) - headline number
 * 3. Methodology (Story 4-2) - alignment tax explanation
 * 4. Inputs Summary (Story 4-3) - user input data
 * 5. Formula & Assumptions (Story 4-3) - calculation details
 * 6. Next Steps (Story 4-3) - Step 1 of 7 framing
 * 7. Footer (Story 4-3) - branding and attribution
 *
 * Design Requirements:
 * - Executive Clarity theme: Navy (#1e293b), Gold (#b45309)
 * - Letter size (8.5" x 11") with 1" margins
 * - Premium typography for board-room presentation
 *
 * Covers: FR21-FR28 (PDF export with all sections)
 */

import { Document, Page, Text } from '@react-pdf/renderer';
import { pdfStyles } from './PdfStyles';
import { PdfHeader } from './sections/PdfHeader';
import { ExecutiveSummary } from './sections/ExecutiveSummary';
import { MethodologySection } from './sections/MethodologySection';
import { InputsSection } from './sections/InputsSection';
import { FormulaSection } from './sections/FormulaSection';
import { NextStepsSection } from './sections/NextStepsSection';
import { PdfFooter } from './sections/PdfFooter';
import type { CalculationResult } from '@/types/calculator.types';

interface PdfDocumentProps {
  /** Calculation results to display in the PDF */
  results: CalculationResult;
}

/**
 * Main PDF Document Component
 *
 * Generates a multi-page PDF with complete meeting waste analysis:
 * - Page 1: Executive summary with headline number
 * - Page 2: Methodology explanation
 * - Page 3: User inputs, formula, and next steps
 *
 * All pages include consistent header and footer.
 */
export function PdfDocument({ results }: PdfDocumentProps) {
  const { meetingWaste, inputs, calculatedAt } = results;

  return (
    <Document
      title="Meeting Waste Analysis"
      author="The Last Paradigm"
      subject="Alignment Tax Diagnostic Report"
      creator="The Last Paradigm Platform"
    >
      {/* Page 1: Executive Summary (Story 4-2) */}
      <Page size="LETTER" style={pdfStyles.page}>
        <PdfHeader generatedAt={calculatedAt} />
        <ExecutiveSummary meetingWaste={meetingWaste} />
        <PdfFooter />
      </Page>

      {/* Page 2: Methodology (Story 4-2) */}
      <Page size="LETTER" style={pdfStyles.page}>
        <PdfHeader generatedAt={calculatedAt} />
        <MethodologySection />
        <PdfFooter />
      </Page>

      {/* Page 3: Inputs, Formula, and Next Steps (Story 4-3) */}
      <Page size="LETTER" style={pdfStyles.page}>
        <PdfHeader generatedAt={calculatedAt} />

        {/* Page title */}
        <Text style={pdfStyles.pageTitle}>Analysis Details</Text>

        {/* Inputs Summary - All user inputs (FR24) */}
        <InputsSection inputs={inputs} />

        {/* Formula Section - Calculation methodology (FR25) */}
        <FormulaSection />

        <PdfFooter />
      </Page>

      {/* Page 4: Next Steps (Story 4-3) */}
      <Page size="LETTER" style={pdfStyles.page}>
        <PdfHeader generatedAt={calculatedAt} />

        {/* Next Steps - Step 1 of 7 framing (FR26) */}
        <NextStepsSection />

        {/* Footer with branding and attribution (FR27) */}
        <PdfFooter />
      </Page>
    </Document>
  );
}
