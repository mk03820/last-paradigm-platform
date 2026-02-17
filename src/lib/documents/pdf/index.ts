/**
 * PDF Document Module Index
 *
 * Exports all PDF document generators, styles, and components.
 *
 * Story 18.4: PowerPoint & PDF Generation
 * Task 5.2: Create PDF module exports
 */

// Style exports
export {
  pdfStyles,
  PDF_COLORS,
  ATTRIBUTION_TEXT,
  FONT_SIZES,
  PAGE_DIMENSIONS,
  MARGINS,
  getScoreColor,
  getScoreInterpretation,
  formatCurrency,
  formatPercent,
  formatScore,
} from './styles';

// Component exports
export {
  CoverPage,
  StandardPage,
  SectionHeading,
  Paragraph,
  BulletList,
  KeyValue,
  MetricBox,
  MetricsRow,
  DataTable,
  ScoreIndicator,
  Divider,
  Spacer,
  TwoColumns,
  CalloutBox,
  PageBreak,
} from './components';

// Generator exports
import { generateBoardSummaryReport } from './board-summary-report';
export { generateBoardSummaryReport };

// Types
import type { DiagnosticSessionData } from '@/lib/db/schema';
import type { GenerationResult } from '../word/types';

/**
 * PDF document generator function type
 */
export type PdfDocumentGenerator = (
  diagnosticData: DiagnosticSessionData
) => Promise<GenerationResult>;

/**
 * Available PDF document names
 */
export type PdfDocumentName = 'board-summary-report';

/**
 * Registry of all PDF document generators
 */
export const PDF_DOCUMENT_GENERATORS: Record<PdfDocumentName, PdfDocumentGenerator> = {
  'board-summary-report': generateBoardSummaryReport,
};

/**
 * Get PDF document generator by name
 */
export function getPdfDocumentGenerator(name: string): PdfDocumentGenerator | undefined {
  return PDF_DOCUMENT_GENERATORS[name as PdfDocumentName];
}

/**
 * Check if a document name is a valid PDF document
 */
export function isPdfDocument(name: string): name is PdfDocumentName {
  return name in PDF_DOCUMENT_GENERATORS;
}

/**
 * Get all available PDF document names
 */
export function getPdfDocumentNames(): PdfDocumentName[] {
  return Object.keys(PDF_DOCUMENT_GENERATORS) as PdfDocumentName[];
}

/**
 * PDF document metadata for UI display
 */
export const PDF_DOCUMENT_METADATA: Record<PdfDocumentName, {
  displayName: string;
  description: string;
  pageCount: string;
}> = {
  'board-summary-report': {
    displayName: 'Board Summary Report',
    description: 'Comprehensive PDF summary for board-level presentation',
    pageCount: '6-8 pages',
  },
};
