/**
 * Word Document Index Tests
 *
 * Tests for document generator exports and routing.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 8: Unit tests for document generators
 */

import { describe, it, expect } from 'vitest';
import {
  WORD_DOCUMENT_GENERATORS,
  getWordDocumentGenerator,
  isWordDocument,
  generateStrategicAlignmentBrief,
  generateStakeholderCommunicationPack,
  generateDecisionFrameworkGuide,
  generateDataFlowOptimizationPlan,
  generateCommunicationImprovementPlaybook,
} from '@/lib/documents/word';

describe('WORD_DOCUMENT_GENERATORS', () => {
  it('should have all 5 Word document generators', () => {
    expect(Object.keys(WORD_DOCUMENT_GENERATORS)).toHaveLength(5);
  });

  it('should include Strategic Alignment Brief', () => {
    expect(WORD_DOCUMENT_GENERATORS['Strategic Alignment Brief']).toBeDefined();
  });

  it('should include Stakeholder Communication Pack', () => {
    expect(WORD_DOCUMENT_GENERATORS['Stakeholder Communication Pack']).toBeDefined();
  });

  it('should include Decision Framework Guide', () => {
    expect(WORD_DOCUMENT_GENERATORS['Decision Framework Guide']).toBeDefined();
  });

  it('should include Data Flow Optimization Plan', () => {
    expect(WORD_DOCUMENT_GENERATORS['Data Flow Optimization Plan']).toBeDefined();
  });

  it('should include Communication Improvement Playbook', () => {
    expect(WORD_DOCUMENT_GENERATORS['Communication Improvement Playbook']).toBeDefined();
  });
});

describe('getWordDocumentGenerator', () => {
  it('should return generator for valid document name', () => {
    const generator = getWordDocumentGenerator('Strategic Alignment Brief');
    expect(typeof generator).toBe('function');
  });

  it('should throw for unknown document name', () => {
    expect(() => getWordDocumentGenerator('Unknown Document')).toThrow(
      'Unknown Word document: Unknown Document'
    );
  });

  it('should be case-sensitive', () => {
    expect(() => getWordDocumentGenerator('strategic alignment brief')).toThrow();
  });
});

describe('isWordDocument', () => {
  it('should return true for valid Word document names', () => {
    expect(isWordDocument('Strategic Alignment Brief')).toBe(true);
    expect(isWordDocument('Stakeholder Communication Pack')).toBe(true);
    expect(isWordDocument('Decision Framework Guide')).toBe(true);
    expect(isWordDocument('Data Flow Optimization Plan')).toBe(true);
    expect(isWordDocument('Communication Improvement Playbook')).toBe(true);
  });

  it('should return false for non-Word document names', () => {
    expect(isWordDocument('Meeting Cost Tracker')).toBe(false);
    expect(isWordDocument('Board Summary Report')).toBe(false);
    expect(isWordDocument('Unknown')).toBe(false);
  });

  it('should be case-sensitive', () => {
    expect(isWordDocument('strategic alignment brief')).toBe(false);
  });
});

describe('Exported Generators', () => {
  it('should export generateStrategicAlignmentBrief', () => {
    expect(typeof generateStrategicAlignmentBrief).toBe('function');
  });

  it('should export generateStakeholderCommunicationPack', () => {
    expect(typeof generateStakeholderCommunicationPack).toBe('function');
  });

  it('should export generateDecisionFrameworkGuide', () => {
    expect(typeof generateDecisionFrameworkGuide).toBe('function');
  });

  it('should export generateDataFlowOptimizationPlan', () => {
    expect(typeof generateDataFlowOptimizationPlan).toBe('function');
  });

  it('should export generateCommunicationImprovementPlaybook', () => {
    expect(typeof generateCommunicationImprovementPlaybook).toBe('function');
  });
});

describe('All Generators Integration', () => {
  const emptyData = {};

  it('should generate Strategic Alignment Brief without error', async () => {
    const result = await generateStrategicAlignmentBrief(emptyData);
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should generate Stakeholder Communication Pack without error', async () => {
    const result = await generateStakeholderCommunicationPack(emptyData);
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should generate Decision Framework Guide without error', async () => {
    const result = await generateDecisionFrameworkGuide(emptyData);
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should generate Data Flow Optimization Plan without error', async () => {
    const result = await generateDataFlowOptimizationPlan(emptyData);
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should generate Communication Improvement Playbook without error', async () => {
    const result = await generateCommunicationImprovementPlaybook(emptyData);
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });
});
