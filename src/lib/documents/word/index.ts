/**
 * Word Document Generators
 *
 * Exports all Word document generators and shared utilities.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 1.2: Create index with shared utilities
 */

// Types
export type { GenerationResult, DocumentGenerator } from './types';

// Styles and components
export * from './styles';
export * from './components';

// Document generators
export { generateStrategicAlignmentBrief } from './strategic-alignment-brief';
export { generateStakeholderCommunicationPack } from './stakeholder-communication-pack';
export { generateDecisionFrameworkGuide } from './decision-framework-guide';
export { generateDataFlowOptimizationPlan } from './data-flow-optimization-plan';
export { generateCommunicationImprovementPlaybook } from './communication-improvement-playbook';

import type { DiagnosticSessionData } from '@/lib/db/schema';
import type { GenerationResult } from './types';
import { generateStrategicAlignmentBrief } from './strategic-alignment-brief';
import { generateStakeholderCommunicationPack } from './stakeholder-communication-pack';
import { generateDecisionFrameworkGuide } from './decision-framework-guide';
import { generateDataFlowOptimizationPlan } from './data-flow-optimization-plan';
import { generateCommunicationImprovementPlaybook } from './communication-improvement-playbook';

/**
 * Map of Word document names to their generator functions
 */
export const WORD_DOCUMENT_GENERATORS: Record<
  string,
  (data: DiagnosticSessionData) => Promise<GenerationResult>
> = {
  'Strategic Alignment Brief': generateStrategicAlignmentBrief,
  'Stakeholder Communication Pack': generateStakeholderCommunicationPack,
  'Decision Framework Guide': generateDecisionFrameworkGuide,
  'Data Flow Optimization Plan': generateDataFlowOptimizationPlan,
  'Communication Improvement Playbook': generateCommunicationImprovementPlaybook,
};

/**
 * Get the generator function for a Word document by name
 * @throws Error if document name is not recognized
 */
export function getWordDocumentGenerator(
  documentName: string
): (data: DiagnosticSessionData) => Promise<GenerationResult> {
  const generator = WORD_DOCUMENT_GENERATORS[documentName];
  if (!generator) {
    throw new Error(`Unknown Word document: ${documentName}`);
  }
  return generator;
}

/**
 * Check if a document name is a recognized Word document
 */
export function isWordDocument(documentName: string): boolean {
  return documentName in WORD_DOCUMENT_GENERATORS;
}
