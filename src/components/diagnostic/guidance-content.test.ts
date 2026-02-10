/**
 * Tests for guidance-content
 *
 * Story 8.7: Guided Diagnostic Flow
 * Task 9: Write tests (AC: all)
 */

import { describe, it, expect } from 'vitest';
import { TOOL_GUIDANCE, getToolGuidance } from './guidance-content';
import { DIAGNOSTIC_TOOLS } from './diagnostic-constants';

describe('guidance-content', () => {
  describe('TOOL_GUIDANCE', () => {
    it('has guidance for all 7 tools', () => {
      const toolIds = DIAGNOSTIC_TOOLS.map((t) => t.id);
      toolIds.forEach((id) => {
        expect(TOOL_GUIDANCE[id]).toBeDefined();
      });
    });

    it('each guidance has required fields', () => {
      Object.entries(TOOL_GUIDANCE).forEach(([toolId, guidance]) => {
        expect(guidance.whatItMeasures).toBeTruthy();
        expect(typeof guidance.whatItMeasures).toBe('string');

        expect(guidance.whyItMatters).toBeTruthy();
        expect(typeof guidance.whyItMatters).toBe('string');

        expect(Array.isArray(guidance.dataNeeded)).toBe(true);
        expect(guidance.dataNeeded.length).toBeGreaterThan(0);
        guidance.dataNeeded.forEach((item) => {
          expect(typeof item).toBe('string');
        });
      });
    });

    it('alignment guidance has correct content', () => {
      const guidance = TOOL_GUIDANCE['alignment'];
      expect(guidance.whatItMeasures).toContain('Strategy');
      expect(guidance.whatItMeasures).toContain('Execution');
      expect(guidance.whyItMatters).toContain('Misalignment');
    });

    it('meeting-audit guidance has correct content', () => {
      const guidance = TOOL_GUIDANCE['meeting-audit'];
      expect(guidance.whatItMeasures).toContain('meeting');
      expect(guidance.whyItMatters).toContain('Meetings');
    });

    it('decision-velocity guidance has correct content', () => {
      const guidance = TOOL_GUIDANCE['decision-velocity'];
      expect(guidance.whatItMeasures).toContain('decision');
      expect(guidance.whyItMatters).toContain('Slow decisions');
    });

    it('stakeholder-map guidance has correct content', () => {
      const guidance = TOOL_GUIDANCE['stakeholder-map'];
      expect(guidance.whatItMeasures).toContain('power');
      expect(guidance.whatItMeasures).toContain('interest');
    });

    it('total-cost guidance mentions aggregation', () => {
      const guidance = TOOL_GUIDANCE['total-cost'];
      expect(guidance.whatItMeasures.toLowerCase()).toContain('aggregat');
      expect(guidance.dataNeeded.some((d) => d.includes('Tools 1-6'))).toBe(true);
    });
  });

  describe('getToolGuidance', () => {
    it('returns guidance for valid tool ID', () => {
      const guidance = getToolGuidance('alignment');
      expect(guidance).toBeDefined();
      expect(guidance?.whatItMeasures).toBeTruthy();
    });

    it('returns undefined for invalid tool ID', () => {
      const guidance = getToolGuidance('invalid-tool');
      expect(guidance).toBeUndefined();
    });

    it('returns correct guidance for each tool', () => {
      DIAGNOSTIC_TOOLS.forEach((tool) => {
        const guidance = getToolGuidance(tool.id);
        expect(guidance).toBeDefined();
        expect(guidance).toBe(TOOL_GUIDANCE[tool.id]);
      });
    });
  });
});
