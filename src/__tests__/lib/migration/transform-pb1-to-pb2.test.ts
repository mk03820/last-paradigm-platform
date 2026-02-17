/**
 * PB1 to PB2 Transformation Tests
 *
 * Tests for transform-pb1-to-pb2.ts utility functions.
 *
 * Story 15.7: PB1 Data Migration to Database
 * Task 7.2: Unit tests for transform-pb1-to-pb2.ts (all 7 tool mappings)
 *
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import {
  transformPB1ToPB2,
  transformToRoadmap,
  transformToOKRFramework,
  transformToMeetingProtocol,
  transformToDelegationFramework,
  transformToGovernanceCharter,
  transformToDataPlatformPlaybook,
  transformToCommunicationArchitecture,
  transformToROIDashboard,
  calculateEstimatedSavings,
} from '@/lib/migration/transform-pb1-to-pb2';
import type { PB1CollectedData } from '@/lib/migration/collect-pb1-data';
import type { DiagnosticSessionData } from '@/lib/db/schema';

describe('transform-pb1-to-pb2', () => {
  describe('transformToRoadmap (Tool 1 -> Roadmap)', () => {
    it('returns null when no Tool 1 data', () => {
      const result = transformToRoadmap(undefined, 0);
      expect(result).toBeNull();
    });

    it('returns null when no scores', () => {
      const tool1: DiagnosticSessionData['tool1'] = { compositeScore: 2.5 };
      const result = transformToRoadmap(tool1, 100000);
      expect(result).toBeNull();
    });

    it('transforms alignment scores correctly', () => {
      const tool1: DiagnosticSessionData['tool1'] = {
        scores: {
          strategic: 3,
          execution: 2,
          technology: 2,
          people: 4,
          governance: 3,
        },
        compositeScore: 2.7,
      };

      const result = transformToRoadmap(tool1, 500000);

      expect(result).not.toBeNull();
      expect(result?.alignmentScores.strategic).toBe(3);
      expect(result?.alignmentScores.execution).toBe(2);
      expect(result?.compositeScore).toBe(2.7);
      expect(result?.totalAlignmentTax).toBe(500000);
    });

    it('identifies priority dimensions (weakest first)', () => {
      const tool1: DiagnosticSessionData['tool1'] = {
        scores: {
          strategic: 4,
          execution: 1,
          technology: 2,
          people: 3,
          governance: 2,
        },
        compositeScore: 2.3,
      };

      const result = transformToRoadmap(tool1, 500000);

      expect(result?.priorityDimensions).toContain('execution');
      expect(result?.priorityDimensions[0]).toBe('execution'); // Weakest first
    });
  });

  describe('transformToOKRFramework (Tool 1 -> OKRs)', () => {
    it('returns null when no Tool 1 data', () => {
      const result = transformToOKRFramework(undefined);
      expect(result).toBeNull();
    });

    it('transforms to OKR context correctly', () => {
      const tool1: DiagnosticSessionData['tool1'] = {
        scores: {
          strategic: 3,
          execution: 2,
          technology: 2,
          people: 4,
          governance: 3,
        },
        compositeScore: 2.7,
      };

      const result = transformToOKRFramework(tool1);

      expect(result).not.toBeNull();
      expect(result?.dimensionScores.strategic).toBe(3);
      expect(result?.compositeScore).toBe(2.7);
    });

    it('identifies weakest dimensions (below 2.5)', () => {
      const tool1: DiagnosticSessionData['tool1'] = {
        scores: {
          strategic: 3,
          execution: 2,
          technology: 1,
          people: 4,
          governance: 3,
        },
        compositeScore: 2.5,
      };

      const result = transformToOKRFramework(tool1);

      expect(result?.weakestDimensions).toContain('execution');
      expect(result?.weakestDimensions).toContain('technology');
      expect(result?.weakestDimensions).not.toContain('strategic');
    });
  });

  describe('transformToMeetingProtocol (Tool 2 -> Meeting Protocol)', () => {
    it('returns null when no Tool 2 data', () => {
      const result = transformToMeetingProtocol(undefined);
      expect(result).toBeNull();
    });

    it('transforms meeting data correctly', () => {
      const tool2: DiagnosticSessionData['tool2'] = {
        inputs: {
          meetingCount: 20,
          averageAttendees: 8,
          averageDuration: 60,
        },
        results: {
          wastedCost: 150000,
        },
      };

      const result = transformToMeetingProtocol(tool2);

      expect(result).not.toBeNull();
      expect(result?.meetingCount).toBe(20);
      expect(result?.wastedCost).toBe(150000);
      expect(result?.totalHours).toBe(160); // 20 * 60 * 8 / 60
    });

    it('identifies waste categories for high meetings', () => {
      const tool2: DiagnosticSessionData['tool2'] = {
        inputs: {
          meetingCount: 25,
          averageAttendees: 10,
          averageDuration: 90,
        },
        results: {
          wastedCost: 250000,
        },
      };

      const result = transformToMeetingProtocol(tool2);

      expect(result?.wasteCategories).toContain('excessive-meetings');
      expect(result?.wasteCategories).toContain('over-attendance');
      expect(result?.wasteCategories).toContain('long-duration');
    });
  });

  describe('transformToDelegationFramework (Tool 3 -> Delegation)', () => {
    it('returns null when no Tool 3 data', () => {
      const result = transformToDelegationFramework(undefined);
      expect(result).toBeNull();
    });

    it('returns null when decisions is not an array', () => {
      const tool3: DiagnosticSessionData['tool3'] = {
        decisions: 'invalid' as unknown as unknown[],
        metrics: {},
      };
      const result = transformToDelegationFramework(tool3);
      expect(result).toBeNull();
    });

    it('extracts decision type metrics', () => {
      const tool3: DiagnosticSessionData['tool3'] = {
        decisions: [
          { type: 'budget', daysToDecision: 21 },
          { type: 'budget', daysToDecision: 28 },
          { type: 'hiring', daysToDecision: 35 },
        ],
        metrics: null,
      };

      const result = transformToDelegationFramework(tool3);

      expect(result).not.toBeNull();
      expect(result?.decisionTypes.length).toBeGreaterThan(0);
    });

    it('identifies bottleneck patterns', () => {
      const tool3: DiagnosticSessionData['tool3'] = {
        decisions: [
          { type: 'budget', daysToDecision: 30 },
          { type: 'hiring', daysToDecision: 45 },
        ],
        metrics: null,
      };

      const result = transformToDelegationFramework(tool3);

      expect(result?.bottleneckPatterns.length).toBeGreaterThan(0);
    });

    it('identifies slowest decisions', () => {
      const tool3: DiagnosticSessionData['tool3'] = {
        decisions: [
          { type: 'budget', daysToDecision: 30 },
          { type: 'hiring', daysToDecision: 45 },
          { type: 'strategy', daysToDecision: 60 },
        ],
        metrics: null,
      };

      const result = transformToDelegationFramework(tool3);

      expect(result?.slowestDecisions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('transformToGovernanceCharter (Tool 4 -> Governance)', () => {
    it('returns null when no Tool 4 data', () => {
      const result = transformToGovernanceCharter(undefined);
      expect(result).toBeNull();
    });

    it('transforms stakeholder data correctly', () => {
      const tool4: DiagnosticSessionData['tool4'] = {
        stakeholders: [
          { name: 'John CEO', role: 'CEO', power: 5, interest: 4 },
          { name: 'Jane CTO', role: 'CTO', power: 4, interest: 5 },
        ],
      };

      const result = transformToGovernanceCharter(tool4);

      expect(result).not.toBeNull();
      expect(result?.stakeholders).toHaveLength(2);
      expect(result?.stakeholders[0].name).toBe('John CEO');
    });

    it('identifies key players (high power & interest)', () => {
      const tool4: DiagnosticSessionData['tool4'] = {
        stakeholders: [
          { name: 'Key Player', power: 5, interest: 5 },
          { name: 'Low Interest', power: 5, interest: 1 },
          { name: 'Low Power', power: 1, interest: 5 },
        ],
      };

      const result = transformToGovernanceCharter(tool4);

      expect(result?.keyPlayers).toContain('Key Player');
      expect(result?.keyPlayers).not.toContain('Low Interest');
    });

    it('identifies risky stakeholders', () => {
      const tool4: DiagnosticSessionData['tool4'] = {
        stakeholders: [
          { name: 'Blocker', power: 5, interest: 1 },
          { name: 'Hostile', power: 3, interest: 3, sentiment: 'hostile' },
          { name: 'Safe', power: 2, interest: 2, sentiment: 'positive' },
        ],
      };

      const result = transformToGovernanceCharter(tool4);

      expect(result?.riskyStakeholders).toContain('Blocker');
      expect(result?.riskyStakeholders).toContain('Hostile');
      expect(result?.riskyStakeholders).not.toContain('Safe');
    });
  });

  describe('transformToDataPlatformPlaybook (Tool 5 -> Data Playbook)', () => {
    it('returns null when no Tool 5 data', () => {
      const result = transformToDataPlatformPlaybook(undefined);
      expect(result).toBeNull();
    });

    it('transforms journey data correctly', () => {
      const tool5: DiagnosticSessionData['tool5'] = {
        journeys: [
          { id: '1', name: 'Order Processing', stages: [] },
          { id: '2', name: 'Invoice Generation', stages: [] },
        ],
        frictionCost: 75000,
      };

      const result = transformToDataPlatformPlaybook(tool5);

      expect(result).not.toBeNull();
      expect(result?.journeyCount).toBe(2);
      expect(result?.frictionCost).toBe(75000);
    });

    it('extracts top bottlenecks from stages', () => {
      const tool5: DiagnosticSessionData['tool5'] = {
        journeys: [
          {
            id: '1',
            name: 'Order Processing',
            stages: [
              { name: 'Data Entry', latencyHours: 48, category: 'manual' },
              { name: 'Validation', latencyHours: 72, category: 'process' },
            ],
          },
        ],
        frictionCost: 100000,
      };

      const result = transformToDataPlatformPlaybook(tool5);

      expect(result?.topBottlenecks.length).toBeGreaterThan(0);
    });
  });

  describe('transformToCommunicationArchitecture (Tool 6 -> Comm Arch)', () => {
    it('returns null when no Tool 6 data', () => {
      const result = transformToCommunicationArchitecture(undefined);
      expect(result).toBeNull();
    });

    it('transforms communication metrics correctly', () => {
      const tool6: DiagnosticSessionData['tool6'] = {
        metrics: {
          email: { avgResponseTimeHours: 4 },
          chat: { afterHoursPercent: 15 },
          meetings: { infoCascadeMeetingsPerWeek: 3 },
        },
        antiPatterns: [
          { name: 'info-hoarding', severity: 'high' },
        ],
      };

      const result = transformToCommunicationArchitecture(tool6);

      expect(result).not.toBeNull();
      expect(result?.antiPatterns).toHaveLength(1);
      expect(result?.antiPatterns[0].pattern).toBe('info-hoarding');
    });

    it('calculates health score based on metrics', () => {
      const healthyTool6: DiagnosticSessionData['tool6'] = {
        metrics: {
          email: { avgResponseTimeHours: 2, avgCcCount: 1 },
          chat: { afterHoursPercent: 5 },
          meetings: { infoCascadeMeetingsPerWeek: 1 },
        },
        antiPatterns: [],
      };

      const unhealthyTool6: DiagnosticSessionData['tool6'] = {
        metrics: {
          email: { avgResponseTimeHours: 48, avgCcCount: 8 },
          chat: { afterHoursPercent: 40 },
          meetings: { infoCascadeMeetingsPerWeek: 10 },
        },
        antiPatterns: [],
      };

      const healthyResult = transformToCommunicationArchitecture(healthyTool6);
      const unhealthyResult = transformToCommunicationArchitecture(unhealthyTool6);

      expect(healthyResult?.healthScore).toBeGreaterThan(unhealthyResult?.healthScore || 0);
    });
  });

  describe('transformToROIDashboard (Tool 7 -> ROI)', () => {
    it('returns null when no cost data available', () => {
      const result = transformToROIDashboard(undefined, undefined, undefined);
      expect(result).toBeNull();
    });

    it('transforms Tool 7 data correctly', () => {
      const tool7: DiagnosticSessionData['tool7'] = {
        totalCost: 500000,
        alignmentTaxPercent: 5,
      };

      const result = transformToROIDashboard(tool7);

      expect(result).not.toBeNull();
      expect(result?.totalAlignmentTax).toBe(500000);
      expect(result?.alignmentTaxPercent).toBe(5);
      expect(result?.estimatedSavings).toBe(200000); // 40% default
    });

    it('estimates from Tool 2 when Tool 7 missing', () => {
      const tool2: DiagnosticSessionData['tool2'] = {
        results: {
          wastedCost: 150000,
        },
      };

      const result = transformToROIDashboard(undefined, tool2);

      expect(result).not.toBeNull();
      expect(result?.totalAlignmentTax).toBeCloseTo(545454, -2); // 150k / 0.275
    });

    it('builds cost breakdown from multiple tools', () => {
      const tool2: DiagnosticSessionData['tool2'] = {
        results: { wastedCost: 150000 },
      };
      const tool5: DiagnosticSessionData['tool5'] = {
        journeys: [],
        frictionCost: 75000,
      };
      const tool7: DiagnosticSessionData['tool7'] = {
        totalCost: 300000,
        alignmentTaxPercent: 3,
      };

      const result = transformToROIDashboard(tool7, tool2, tool5);

      expect(result?.costBreakdown.length).toBeGreaterThan(0);
      expect(result?.costBreakdown.some((b) => b.category === 'Meeting Waste')).toBe(true);
      expect(result?.costBreakdown.some((b) => b.category === 'Data Friction')).toBe(true);
    });
  });

  describe('calculateEstimatedSavings', () => {
    it('calculates savings with default rate (40%)', () => {
      expect(calculateEstimatedSavings(500000)).toBe(200000);
    });

    it('respects custom recovery rate', () => {
      expect(calculateEstimatedSavings(500000, 0.5)).toBe(250000);
    });

    it('clamps rate to min/max bounds', () => {
      expect(calculateEstimatedSavings(500000, 0.1)).toBe(150000); // Clamped to 30%
      expect(calculateEstimatedSavings(500000, 0.9)).toBe(250000); // Clamped to 50%
    });
  });

  describe('transformPB1ToPB2 (Full Transformation)', () => {
    it('creates minimal context when no data', () => {
      const emptyData: PB1CollectedData = {
        tool1: null,
        tool2: null,
        tool3: null,
        tool4: null,
        tool5: null,
        tool6: null,
        tool7: null,
        totalAlignmentTax: null,
        estimatedSavings: null,
        completedToolsCount: 0,
        hasData: false,
      };

      const result = transformPB1ToPB2('user-123', emptyData);

      expect(result.userId).toBe('user-123');
      expect(result.generatedAt).toBeDefined();
      expect(result.roadmap).toBeUndefined();
      expect(result.meetingProtocol).toBeUndefined();
    });

    it('includes all available tool transformations', () => {
      const fullData: PB1CollectedData = {
        tool1: {
          scores: { strategic: 3, execution: 2, technology: 2, people: 3, governance: 3 },
          compositeScore: 2.6,
        },
        tool2: {
          inputs: { meetingCount: 20, averageAttendees: 8, averageDuration: 60 },
          results: { wastedCost: 150000 },
        },
        tool3: {
          decisions: [{ type: 'budget', daysToDecision: 21 }],
          metrics: null,
        },
        tool4: {
          stakeholders: [{ name: 'CEO', power: 5, interest: 4 }],
        },
        tool5: {
          journeys: [{ id: '1', name: 'Process', stages: [] }],
          frictionCost: 75000,
        },
        tool6: {
          metrics: { email: { avgResponseTimeHours: 4 } },
          antiPatterns: [],
        },
        tool7: {
          totalCost: 500000,
          alignmentTaxPercent: 5,
        },
        totalAlignmentTax: 500000,
        estimatedSavings: 200000,
        completedToolsCount: 7,
        hasData: true,
      };

      const result = transformPB1ToPB2('user-123', fullData);

      expect(result.userId).toBe('user-123');
      expect(result.roadmap).toBeDefined();
      expect(result.okrFramework).toBeDefined();
      expect(result.meetingProtocol).toBeDefined();
      expect(result.delegationFramework).toBeDefined();
      expect(result.governanceCharter).toBeDefined();
      expect(result.dataPlatformPlaybook).toBeDefined();
      expect(result.communicationArchitecture).toBeDefined();
      expect(result.roiDashboard).toBeDefined();
    });

    it('handles partial data correctly', () => {
      const partialData: PB1CollectedData = {
        tool1: null,
        tool2: {
          inputs: { meetingCount: 20, averageAttendees: 8, averageDuration: 60 },
          results: { wastedCost: 150000 },
        },
        tool3: null,
        tool4: {
          stakeholders: [{ name: 'CEO', power: 5, interest: 4 }],
        },
        tool5: null,
        tool6: null,
        tool7: null,
        totalAlignmentTax: 150000,
        estimatedSavings: 60000,
        completedToolsCount: 2,
        hasData: true,
      };

      const result = transformPB1ToPB2('user-123', partialData);

      expect(result.roadmap).toBeUndefined();
      expect(result.meetingProtocol).toBeDefined();
      expect(result.governanceCharter).toBeDefined();
      expect(result.delegationFramework).toBeUndefined();
    });
  });
});
