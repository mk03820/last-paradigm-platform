/**
 * PowerPoint Document Module Index
 *
 * Exports all PowerPoint document generators, styles, and components.
 *
 * Story 18.4: PowerPoint & PDF Generation
 * Task 5.1: Create PowerPoint module exports
 */

// Style exports
export {
  PPTX_COLORS,
  ATTRIBUTION_TEXT,
  FONTS,
  FONT_SIZES,
  SLIDE_DIMENSIONS,
  MARGINS,
  TITLE_SLIDE_STYLE,
  SECTION_SLIDE_STYLE,
  CONTENT_SLIDE_STYLE,
  TWO_COLUMN_STYLE,
  METRIC_BOX_STYLE,
  TABLE_STYLE,
  CHART_STYLE,
  FOOTER_STYLE,
  getScoreColor,
  getScoreInterpretation,
  formatCurrency,
  formatPercent,
  formatScore,
} from './styles';

// Component exports
export {
  createPresentation,
  addTitleSlide,
  addSectionSlide,
  addContentSlide,
  addBulletSlide,
  addMetricBox,
  addMetricsRow,
  addTable,
  addScoreIndicator,
  addBarChart,
  addDonutChart,
  addSlideFooter,
  addThankYouSlide,
} from './components';

// Generator exports
import { generateExecutivePresentationDeck } from './executive-presentation-deck';
export { generateExecutivePresentationDeck };

// Types
import type { DiagnosticSessionData } from '@/lib/db/schema';
import type { GenerationResult } from '../word/types';

/**
 * PowerPoint document generator function type
 */
export type PptxDocumentGenerator = (
  diagnosticData: DiagnosticSessionData
) => Promise<GenerationResult>;

/**
 * Available PowerPoint document names
 */
export type PptxDocumentName = 'executive-presentation-deck';

/**
 * Registry of all PowerPoint document generators
 */
export const PPTX_DOCUMENT_GENERATORS: Record<PptxDocumentName, PptxDocumentGenerator> = {
  'executive-presentation-deck': generateExecutivePresentationDeck,
};

/**
 * Get PowerPoint document generator by name
 */
export function getPptxDocumentGenerator(name: string): PptxDocumentGenerator | undefined {
  return PPTX_DOCUMENT_GENERATORS[name as PptxDocumentName];
}

/**
 * Check if a document name is a valid PowerPoint document
 */
export function isPptxDocument(name: string): name is PptxDocumentName {
  return name in PPTX_DOCUMENT_GENERATORS;
}

/**
 * Get all available PowerPoint document names
 */
export function getPptxDocumentNames(): PptxDocumentName[] {
  return Object.keys(PPTX_DOCUMENT_GENERATORS) as PptxDocumentName[];
}

/**
 * PowerPoint document metadata for UI display
 */
export const PPTX_DOCUMENT_METADATA: Record<PptxDocumentName, {
  displayName: string;
  description: string;
  slideCount: string;
}> = {
  'executive-presentation-deck': {
    displayName: 'Executive Presentation Deck',
    description: 'Board-ready presentation with all diagnostic findings and recommendations',
    slideCount: '15-16 slides',
  },
};
