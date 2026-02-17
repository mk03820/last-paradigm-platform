/**
 * Excel Document Module Index
 *
 * Exports all Excel document generators, styles, and components.
 *
 * Story 18.3: Excel Document Templates & Generation
 * Task 5: Create Excel module exports
 */

// Style exports
export {
  EXCEL_COLORS,
  ATTRIBUTION_TEXT,
  HEADER_STYLE,
  DATA_CELL_STYLE,
  ALT_ROW_STYLE,
  TITLE_STYLE,
  SECTION_HEADER_STYLE,
  HIGHLIGHT_STYLE,
  CURRENCY_STYLE,
  PERCENT_STYLE,
  NUMBER_STYLE,
  DATE_STYLE,
  INPUT_CELL_STYLE,
  ATTRIBUTION_STYLE,
  getScoreColor,
  COLUMN_WIDTHS,
  ROW_HEIGHTS,
} from './styles';

// Component exports
export {
  addBrandedHeader,
  addSectionHeader,
  addDataTable,
  addKeyValuePairs,
  addFormulaCell,
  addChartPlaceholder,
  configurePrintArea,
  createNamedRange,
  addScoreConditionalFormatting,
  getColumnLetter,
  formatCurrency,
  formatPercent,
} from './components';

// Generator exports
import { generateMeetingCostTracker } from './meeting-cost-tracker';
import { generateAlignmentTaxCalculator } from './alignment-tax-calculator';
import { generateTransformationRoadmapPlanner } from './transformation-roadmap-planner';

export { generateMeetingCostTracker };
export { generateAlignmentTaxCalculator };
export { generateTransformationRoadmapPlanner };

// Types
import type { DiagnosticSessionData } from '@/lib/db/schema';
import type { GenerationResult } from '../word/types';

/**
 * Excel document generator function type
 */
export type ExcelDocumentGenerator = (
  diagnosticData: DiagnosticSessionData
) => Promise<GenerationResult>;

/**
 * Available Excel document names
 */
export type ExcelDocumentName =
  | 'meeting-cost-tracker'
  | 'alignment-tax-calculator'
  | 'transformation-roadmap-planner';

/**
 * Registry of all Excel document generators
 */
export const EXCEL_DOCUMENT_GENERATORS: Record<ExcelDocumentName, ExcelDocumentGenerator> = {
  'meeting-cost-tracker': generateMeetingCostTracker,
  'alignment-tax-calculator': generateAlignmentTaxCalculator,
  'transformation-roadmap-planner': generateTransformationRoadmapPlanner,
};

/**
 * Get Excel document generator by name
 */
export function getExcelDocumentGenerator(name: string): ExcelDocumentGenerator | undefined {
  return EXCEL_DOCUMENT_GENERATORS[name as ExcelDocumentName];
}

/**
 * Check if a document name is a valid Excel document
 */
export function isExcelDocument(name: string): name is ExcelDocumentName {
  return name in EXCEL_DOCUMENT_GENERATORS;
}

/**
 * Get all available Excel document names
 */
export function getExcelDocumentNames(): ExcelDocumentName[] {
  return Object.keys(EXCEL_DOCUMENT_GENERATORS) as ExcelDocumentName[];
}

/**
 * Excel document metadata for UI display
 */
export const EXCEL_DOCUMENT_METADATA: Record<ExcelDocumentName, {
  displayName: string;
  description: string;
  primaryTool: number;
}> = {
  'meeting-cost-tracker': {
    displayName: 'Meeting Cost Tracker',
    description: 'Track ongoing meeting costs with diagnostic baseline and working formulas',
    primaryTool: 2,
  },
  'alignment-tax-calculator': {
    displayName: 'Alignment Tax Calculator',
    description: 'Calculate total alignment tax with all 7 diagnostic inputs and ROI projections',
    primaryTool: 0, // Uses all tools
  },
  'transformation-roadmap-planner': {
    displayName: 'Transformation Roadmap Planner',
    description: 'Plan and track organizational transformation with priority matrix and timeline',
    primaryTool: 0, // Uses all tools
  },
};
