/**
 * Complete Diagnostic PDF Export Components
 *
 * Exports all PDF-related components for the Total Cost of Misalignment tool.
 *
 * Story 14.6: Complete Diagnostic PDF Export
 * Covers: FR2-36 (Export full 7-tool diagnostic as premium PDF)
 */

// ============================================================================
// Main Components
// ============================================================================

export { DiagnosticPDFDocument } from './DiagnosticPDFDocument';
export type { DiagnosticPDFDocumentProps } from './DiagnosticPDFDocument';

export { DiagnosticPDFExport, DocumentIcon } from './DiagnosticPDFExport';
export type { DiagnosticPDFExportProps } from './DiagnosticPDFExport';

// ============================================================================
// Section Components
// ============================================================================

export { PDFCoverPage } from './PDFCoverPage';
export { PDFExecutiveSummary } from './PDFExecutiveSummary';
export { PDFToolSummary, PDFAllToolsSummary } from './PDFToolSummary';
export { PDFCostBreakdown } from './PDFCostBreakdown';
export { PDFROISummary, PDFROIPlaceholder } from './PDFROISummary';
export { PDFRecommendations } from './PDFRecommendations';

// ============================================================================
// Styles and Utilities
// ============================================================================

export {
  diagnosticPDFStyles,
  brandColors,
  interpretationColors,
  getInterpretationStyle,
  formatCurrencyPDF,
  formatFullCurrencyPDF,
  formatPercentPDF,
  formatDatePDF,
} from './DiagnosticPDFStyles';
