/**
 * Recommendation Engine Tests
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Task 8.2: Unit tests for recommendation-engine.ts
 */

import { describe, it, expect } from 'vitest';
import {
  generateRecommendations,
  transformDiagnosticDataToInput,
} from './recommendation-engine';
import type { RecommendationInput } from './types';
import {
  DECISION_VELOCITY_BENCHMARK_DAYS,
  DATA_FRICTION_THRESHOLD_DOLLARS,
  ROI_DASHBOARD_TOOL_ID,
} from './recommendation-constants';

describe('Recommendation Engine', () => {
  describe('generateRecommendations', () => {
    describe('Decision Velocity threshold (AC2)', () => {
      it('should trigger Tool 3 when velocity >2x benchmark', () => {
        const input: RecommendationInput = {
          decisionVelocity: {
            worstMedianDays: 21, // 3x benchmark (7 days)
            worstArchetype: 'strategic',
            benchmarkDays: DECISION_VELOCITY_BENCHMARK_DAYS,
          },
        };

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 3)).toBe(true);
        const rec = result.recommendations.find((r) => r.toolId === 3)!;
        expect(rec.triggerMetric).toBe('Decision Velocity');
        expect(rec.reasoning).toContain('21 days');
        expect(rec.reasoning).toContain('3.0x slower');
      });

      it('should NOT trigger Tool 3 when velocity <=2x benchmark', () => {
        const input: RecommendationInput = {
          decisionVelocity: {
            worstMedianDays: 14, // Exactly 2x benchmark
            worstArchetype: 'strategic',
            benchmarkDays: DECISION_VELOCITY_BENCHMARK_DAYS,
          },
        };

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 3)).toBe(false);
      });

      it('should NOT trigger when decision velocity data is missing', () => {
        const input: RecommendationInput = {};

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 3)).toBe(false);
      });
    });

    describe('Meeting Waste threshold (AC3)', () => {
      it('should trigger Tool 4 when waste >30%', () => {
        const input: RecommendationInput = {
          meetingWastePercent: 45,
          meetingWasteCost: 500000,
        };

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 4)).toBe(true);
        const rec = result.recommendations.find((r) => r.toolId === 4)!;
        expect(rec.triggerMetric).toBe('Meeting Waste');
        expect(rec.reasoning).toContain('45%');
        expect(rec.reasoning).toContain('$500K');
      });

      it('should NOT trigger Tool 4 when waste <=30%', () => {
        const input: RecommendationInput = {
          meetingWastePercent: 30,
        };

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 4)).toBe(false);
      });

      it('should NOT trigger when meeting waste data is missing', () => {
        const input: RecommendationInput = {};

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 4)).toBe(false);
      });
    });

    describe('Data Friction threshold (AC4)', () => {
      it('should trigger Tool 6 when cost >$5M', () => {
        const input: RecommendationInput = {
          dataFrictionCost: 8000000, // $8M
          topBottleneck: 'Legacy ERP system',
        };

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 6)).toBe(true);
        const rec = result.recommendations.find((r) => r.toolId === 6)!;
        expect(rec.triggerMetric).toBe('Data Friction Cost');
        expect(rec.reasoning).toContain('$8.0M');
        expect(rec.reasoning).toContain('Legacy ERP system');
      });

      it('should NOT trigger Tool 6 when cost <=$5M', () => {
        const input: RecommendationInput = {
          dataFrictionCost: DATA_FRICTION_THRESHOLD_DOLLARS,
        };

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 6)).toBe(false);
      });

      it('should NOT trigger when data friction data is missing', () => {
        const input: RecommendationInput = {};

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 6)).toBe(false);
      });
    });

    describe('Stakeholder Blockers threshold (AC5)', () => {
      it('should trigger Tool 2 when blockers exist', () => {
        const input: RecommendationInput = {
          stakeholders: [
            { name: 'John CFO', role: 'CFO', power: 9, interest: 8, sentiment: 'blocker' },
            { name: 'Jane VP', role: 'VP', power: 7, interest: 6, sentiment: 'supporter' },
          ],
        };

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 2)).toBe(true);
        const rec = result.recommendations.find((r) => r.toolId === 2)!;
        expect(rec.triggerMetric).toBe('Stakeholder Blockers');
        expect(rec.reasoning).toContain('1 blocker');
        expect(rec.reasoning).toContain('John CFO');
      });

      it('should count multiple blockers', () => {
        const input: RecommendationInput = {
          stakeholders: [
            { name: 'John', role: 'CFO', power: 9, interest: 8, sentiment: 'blocker' },
            { name: 'Jane', role: 'VP', power: 7, interest: 6, sentiment: 'blocker' },
            { name: 'Bob', role: 'Dir', power: 5, interest: 5, sentiment: 'blocker' },
          ],
        };

        const result = generateRecommendations(input);

        const rec = result.recommendations.find((r) => r.toolId === 2)!;
        expect(rec.reasoning).toContain('3 blockers');
      });

      it('should NOT trigger Tool 2 when no blockers', () => {
        const input: RecommendationInput = {
          stakeholders: [
            { name: 'John', role: 'CFO', power: 9, interest: 8, sentiment: 'supporter' },
            { name: 'Jane', role: 'VP', power: 7, interest: 6, sentiment: 'neutral' },
          ],
        };

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 2)).toBe(false);
      });

      it('should NOT trigger when stakeholder data is missing', () => {
        const input: RecommendationInput = {};

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 2)).toBe(false);
      });

      it('should NOT trigger when stakeholders array is empty', () => {
        const input: RecommendationInput = {
          stakeholders: [],
        };

        const result = generateRecommendations(input);

        expect(result.recommendations.some((r) => r.toolId === 2)).toBe(false);
      });
    });

    describe('Tool 8 ROI Dashboard fallback (AC6)', () => {
      it('should include Tool 8 when fewer than 3 recommendations', () => {
        const input: RecommendationInput = {
          meetingWastePercent: 45, // Only triggers Tool 4
          totalAlignmentTax: 2000000,
        };

        const result = generateRecommendations(input);

        expect(result.recommendations.length).toBeGreaterThan(1);
        expect(result.recommendations.some((r) => r.toolId === ROI_DASHBOARD_TOOL_ID)).toBe(true);
      });

      it('should include Tool 8 when no thresholds exceeded', () => {
        const input: RecommendationInput = {
          totalAlignmentTax: 1500000,
        };

        const result = generateRecommendations(input);

        expect(result.recommendations).toHaveLength(1);
        expect(result.recommendations[0].toolId).toBe(ROI_DASHBOARD_TOOL_ID);
      });

      it('should include total alignment tax in ROI reasoning', () => {
        const input: RecommendationInput = {
          totalAlignmentTax: 3500000,
        };

        const result = generateRecommendations(input);

        const roiRec = result.recommendations.find((r) => r.toolId === ROI_DASHBOARD_TOOL_ID)!;
        expect(roiRec.reasoning).toContain('$3.5M');
      });

      it('should handle missing total alignment tax gracefully', () => {
        const input: RecommendationInput = {};

        const result = generateRecommendations(input);

        expect(result.recommendations).toHaveLength(1);
        const roiRec = result.recommendations[0];
        expect(roiRec.toolId).toBe(ROI_DASHBOARD_TOOL_ID);
        expect(roiRec.reasoning).toContain('Track your transformation progress');
      });
    });

    describe('Edge Cases', () => {
      it('should take top 3 when all thresholds exceeded (AC8)', () => {
        const input: RecommendationInput = {
          decisionVelocity: {
            worstMedianDays: 28,
            worstArchetype: 'strategic',
            benchmarkDays: DECISION_VELOCITY_BENCHMARK_DAYS,
          },
          meetingWastePercent: 50,
          meetingWasteCost: 1000000,
          dataFrictionCost: 10000000,
          stakeholders: [
            { name: 'John', role: 'CFO', power: 9, interest: 8, sentiment: 'blocker' },
          ],
          totalAlignmentTax: 5000000,
        };

        const result = generateRecommendations(input);

        expect(result.recommendations).toHaveLength(3);
        // Should be ranked by severity
        result.recommendations.forEach((rec, index) => {
          expect(rec.rank).toBe(index + 1);
        });
      });

      it('should rank by severity descending', () => {
        const input: RecommendationInput = {
          decisionVelocity: {
            worstMedianDays: 15, // Just above 2x threshold
            worstArchetype: 'strategic',
            benchmarkDays: DECISION_VELOCITY_BENCHMARK_DAYS,
          },
          dataFrictionCost: 15000000, // 3x threshold - higher severity
        };

        const result = generateRecommendations(input);

        // Data friction (Tool 6) should rank higher due to greater severity
        expect(result.recommendations[0].toolId).toBe(6);
        expect(result.recommendations[0].rank).toBe(1);
      });

      it('should not duplicate ROI Dashboard if already triggered', () => {
        const input: RecommendationInput = {
          meetingWastePercent: 45, // Only 1 recommendation
        };

        const result = generateRecommendations(input);

        const roiCount = result.recommendations.filter(
          (r) => r.toolId === ROI_DASHBOARD_TOOL_ID
        ).length;
        expect(roiCount).toBeLessThanOrEqual(1);
      });

      it('should return result with generatedAt timestamp', () => {
        const before = new Date();
        const result = generateRecommendations({});
        const after = new Date();

        expect(result.generatedAt).toBeInstanceOf(Date);
        expect(result.generatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(result.generatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      });

      it('should include input summary in result', () => {
        const input: RecommendationInput = {
          decisionVelocity: {
            worstMedianDays: 21,
            worstArchetype: 'strategic',
            benchmarkDays: 7,
          },
          meetingWastePercent: 40,
          dataFrictionCost: 6000000,
          stakeholders: [
            { name: 'John', role: 'CFO', power: 9, interest: 8, sentiment: 'blocker' },
            { name: 'Jane', role: 'VP', power: 7, interest: 6, sentiment: 'blocker' },
          ],
          totalAlignmentTax: 3000000,
        };

        const result = generateRecommendations(input);

        expect(result.inputSummary.worstDecisionVelocity).toBe(21);
        expect(result.inputSummary.meetingWastePercent).toBe(40);
        expect(result.inputSummary.dataFrictionCost).toBe(6000000);
        expect(result.inputSummary.blockerCount).toBe(2);
        expect(result.inputSummary.totalAlignmentTax).toBe(3000000);
      });
    });
  });

  describe('transformDiagnosticDataToInput', () => {
    it('should transform Tool 2 meeting audit data', () => {
      const diagnosticData = {
        tool2: {
          results: {
            wastedCost: 300000,
            totalMeetingCost: 1000000,
          },
        },
      };

      const input = transformDiagnosticDataToInput(diagnosticData);

      expect(input.meetingWastePercent).toBe(30);
      expect(input.meetingWasteCost).toBe(300000);
    });

    it('should transform Tool 4 stakeholder data', () => {
      const diagnosticData = {
        tool4: {
          stakeholders: [
            { name: 'John', role: 'CFO', power: 9, interest: 8, sentiment: 'blocker' as const },
          ],
        },
      };

      const input = transformDiagnosticDataToInput(diagnosticData);

      expect(input.stakeholders).toHaveLength(1);
      expect(input.stakeholders![0].sentiment).toBe('blocker');
    });

    it('should transform Tool 5 data friction data', () => {
      const diagnosticData = {
        tool5: {
          frictionCost: 7500000,
        },
      };

      const input = transformDiagnosticDataToInput(diagnosticData);

      expect(input.dataFrictionCost).toBe(7500000);
    });

    it('should transform Tool 7 total cost data', () => {
      const diagnosticData = {
        tool7: {
          totalCost: 4200000,
        },
      };

      const input = transformDiagnosticDataToInput(diagnosticData);

      expect(input.totalAlignmentTax).toBe(4200000);
    });

    it('should handle empty diagnostic data', () => {
      const input = transformDiagnosticDataToInput({});

      expect(input.meetingWastePercent).toBeUndefined();
      expect(input.dataFrictionCost).toBeUndefined();
      expect(input.stakeholders).toBeUndefined();
      expect(input.totalAlignmentTax).toBeUndefined();
    });

    it('should calculate decision velocity from Tool 3 decisions', () => {
      const diagnosticData = {
        tool3: {
          decisions: [
            { type: 'strategic', requestDate: '2024-01-01', decisionDate: '2024-01-15' }, // 14 days
            { type: 'strategic', requestDate: '2024-01-01', decisionDate: '2024-01-22' }, // 21 days
            { type: 'strategic', requestDate: '2024-01-01', decisionDate: '2024-01-08' }, // 7 days
          ],
        },
      };

      const input = transformDiagnosticDataToInput(diagnosticData);

      // Median of [7, 14, 21] = 14
      expect(input.decisionVelocity?.worstMedianDays).toBe(14);
    });
  });
});
