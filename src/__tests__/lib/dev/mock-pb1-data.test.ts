/**
 * Tests for Mock PB1 Data Seeding Utility
 *
 * Story: Hidden Dev Link to Preview Page with Mock Data
 * Task 5: Write tests for dev preview feature
 */

import {
  MOCK_TOOL1_DATA,
  MOCK_TOOL2_DATA,
  MOCK_TOOL3_DATA,
  MOCK_TOOL4_DATA,
  MOCK_TOOL5_DATA,
  MOCK_TOOL6_DATA,
  MOCK_TOOL7_DATA,
  seedTool1,
  seedTool2,
  seedTool3,
  seedTool4,
  seedTool5,
  seedTool6,
  seedTool7,
  seedMockPB1Data,
  getMockDiagnosticData,
} from '@/lib/dev/mock-pb1-data';
import { useTool1Store } from '@/lib/store/tool1-store';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { useTool3Store } from '@/lib/store/tool3-store';
import { useTool4Store } from '@/lib/store/tool4-store';
import { useTool5Store } from '@/lib/store/tool5-store';
import { useTool6Store } from '@/lib/store/tool6-store';
import { useTool7Store } from '@/lib/store/tool7-store';

describe('Mock PB1 Data Structure Validity', () => {
  describe('MOCK_TOOL1_DATA', () => {
    it('should have valid alignment scores between 1-4', () => {
      const { scores } = MOCK_TOOL1_DATA;
      expect(scores.strategic).toBeGreaterThanOrEqual(1);
      expect(scores.strategic).toBeLessThanOrEqual(4);
      expect(scores.execution).toBeGreaterThanOrEqual(1);
      expect(scores.execution).toBeLessThanOrEqual(4);
      expect(scores.technology).toBeGreaterThanOrEqual(1);
      expect(scores.technology).toBeLessThanOrEqual(4);
      expect(scores.people).toBeGreaterThanOrEqual(1);
      expect(scores.people).toBeLessThanOrEqual(4);
      expect(scores.governance).toBeGreaterThanOrEqual(1);
      expect(scores.governance).toBeLessThanOrEqual(4);
    });

    it('should have valid composite score', () => {
      const { compositeScore } = MOCK_TOOL1_DATA;
      expect(compositeScore).toBeGreaterThanOrEqual(1);
      expect(compositeScore).toBeLessThanOrEqual(4);
    });
  });

  describe('MOCK_TOOL2_DATA', () => {
    it('should have valid meeting data', () => {
      const { meetingData } = MOCK_TOOL2_DATA;
      expect(meetingData.meetingCount).toBeGreaterThan(0);
      expect(meetingData.averageAttendees).toBeGreaterThan(0);
      expect(meetingData.averageDuration).toBeGreaterThan(0);
    });

    it('should have valid salary distribution totaling 100%', () => {
      const { salaryDistribution } = MOCK_TOOL2_DATA.meetingData;
      const total =
        salaryDistribution.executive +
        salaryDistribution.senior +
        salaryDistribution.midLevel +
        salaryDistribution.entry;
      expect(total).toBe(100);
    });

    it('should have realistic meeting waste value', () => {
      expect(MOCK_TOOL2_DATA.results.meetingWaste).toBe(340000);
    });
  });

  describe('MOCK_TOOL3_DATA', () => {
    it('should have valid archetype IDs', () => {
      const validArchetypes = ['strategic', 'budget', 'technology', 'hiring', 'analytics'];
      MOCK_TOOL3_DATA.samples.forEach((sample) => {
        expect(validArchetypes).toContain(sample.archetypeId);
      });
    });

    it('should have decision dates after request dates', () => {
      MOCK_TOOL3_DATA.samples.forEach((sample) => {
        const requestDate = new Date(sample.requestDate);
        const decisionDate = new Date(sample.decisionDate);
        expect(decisionDate.getTime()).toBeGreaterThan(requestDate.getTime());
      });
    });
  });

  describe('MOCK_TOOL4_DATA', () => {
    it('should have 8 stakeholders per story spec', () => {
      expect(MOCK_TOOL4_DATA.stakeholders).toHaveLength(8);
    });

    it('should have valid power values (1-10)', () => {
      MOCK_TOOL4_DATA.stakeholders.forEach((s) => {
        expect(s.power).toBeGreaterThanOrEqual(1);
        expect(s.power).toBeLessThanOrEqual(10);
      });
    });

    it('should have valid interest values (1-10)', () => {
      MOCK_TOOL4_DATA.stakeholders.forEach((s) => {
        expect(s.interest).toBeGreaterThanOrEqual(1);
        expect(s.interest).toBeLessThanOrEqual(10);
      });
    });

    it('should have valid sentiment values', () => {
      const validSentiments = ['supporter', 'neutral', 'blocker'];
      MOCK_TOOL4_DATA.stakeholders.forEach((s) => {
        expect(validSentiments).toContain(s.sentiment);
      });
    });

    it('should have 2 blockers per story spec', () => {
      const blockers = MOCK_TOOL4_DATA.stakeholders.filter((s) => s.sentiment === 'blocker');
      expect(blockers).toHaveLength(2);
    });
  });

  describe('MOCK_TOOL5_DATA', () => {
    it('should have 3 journeys per story spec', () => {
      expect(MOCK_TOOL5_DATA.journeys).toHaveLength(3);
    });

    it('should have friction cost of $215K per story spec', () => {
      expect(MOCK_TOOL5_DATA.frictionCost).toBe(215000);
    });

    it('should have valid stage types', () => {
      const validTypes = ['source', 'extraction', 'storage', 'transformation', 'consumption'];
      MOCK_TOOL5_DATA.journeys.forEach((journey) => {
        journey.stages.forEach((stage) => {
          expect(validTypes).toContain(stage.type);
        });
      });
    });
  });

  describe('MOCK_TOOL6_DATA', () => {
    it('should have health score of 42 per story spec', () => {
      expect(MOCK_TOOL6_DATA.healthScore).toBe(42);
    });

    it('should have 3 anti-patterns per story spec', () => {
      expect(MOCK_TOOL6_DATA.antiPatterns).toHaveLength(3);
    });

    it('should have valid frequency levels', () => {
      const validFrequencies = ['never', 'rarely', 'sometimes', 'often', 'always'];
      expect(validFrequencies).toContain(MOCK_TOOL6_DATA.email.replyAllFrequency);
      expect(validFrequencies).toContain(MOCK_TOOL6_DATA.chat.atHereFrequency);
    });
  });

  describe('MOCK_TOOL7_DATA', () => {
    it('should have $1.2M alignment tax per story spec', () => {
      expect(MOCK_TOOL7_DATA.totalAlignmentTax).toBe(1200000);
    });

    it('should have 8.4% alignment tax per story spec', () => {
      expect(MOCK_TOOL7_DATA.alignmentTaxPercent).toBe(8.4);
    });

    it('should have $847K estimated savings per story spec', () => {
      expect(MOCK_TOOL7_DATA.estimatedSavings).toBe(847000);
    });

    it('should have cost breakdown totaling alignment tax', () => {
      const total = MOCK_TOOL7_DATA.costBreakdown.reduce((sum, item) => sum + item.amount, 0);
      expect(total).toBe(MOCK_TOOL7_DATA.totalAlignmentTax);
    });
  });
});

describe('Seeding Functions', () => {
  beforeEach(() => {
    // Reset all stores before each test
    useTool1Store.getState().resetTool1();
    useCalculatorStore.getState().clearSession();
    useTool3Store.getState().resetTool3();
    useTool4Store.getState().resetTool4();
    useTool5Store.getState().resetTool5();
    useTool6Store.getState().resetTool6();
    useTool7Store.getState().resetTool7();
  });

  describe('seedTool1', () => {
    it('should populate Tool 1 store with mock scores', () => {
      seedTool1();
      const state = useTool1Store.getState();
      expect(state.scores).toEqual(MOCK_TOOL1_DATA.scores);
    });

    it('should mark Tool 1 as complete', () => {
      seedTool1();
      const state = useTool1Store.getState();
      expect(state.completion).not.toBeNull();
      expect(state.completion?.compositeScore).toBe(MOCK_TOOL1_DATA.compositeScore);
    });
  });

  describe('seedTool2', () => {
    it('should populate Tool 2 store with mock meeting data', () => {
      seedTool2();
      const state = useCalculatorStore.getState();
      expect(state.meetingData).toEqual(MOCK_TOOL2_DATA.meetingData);
    });

    it('should populate Tool 2 store with mock results', () => {
      seedTool2();
      const state = useCalculatorStore.getState();
      expect(state.results).not.toBeNull();
      expect(state.results?.meetingWaste).toBe(MOCK_TOOL2_DATA.results.meetingWaste);
    });
  });

  describe('seedTool3', () => {
    it('should populate Tool 3 store with mock decision samples', () => {
      seedTool3();
      const state = useTool3Store.getState();
      const totalSamples = state.getTotalSamples();
      expect(totalSamples).toBe(MOCK_TOOL3_DATA.samples.length);
    });

    it('should mark Tool 3 as complete', () => {
      seedTool3();
      const state = useTool3Store.getState();
      expect(state.completion).not.toBeNull();
    });
  });

  describe('seedTool4', () => {
    it('should populate Tool 4 store with mock stakeholders', () => {
      seedTool4();
      const state = useTool4Store.getState();
      expect(state.stakeholders).toHaveLength(MOCK_TOOL4_DATA.stakeholders.length);
    });

    it('should mark Tool 4 as complete', () => {
      seedTool4();
      const state = useTool4Store.getState();
      expect(state.completion).not.toBeNull();
    });
  });

  describe('seedTool5', () => {
    it('should populate Tool 5 store with mock journeys', () => {
      seedTool5();
      const state = useTool5Store.getState();
      expect(state.journeys).toHaveLength(MOCK_TOOL5_DATA.journeys.length);
    });

    it('should mark Tool 5 as complete', () => {
      seedTool5();
      const state = useTool5Store.getState();
      expect(state.completion).not.toBeNull();
    });
  });

  describe('seedTool6', () => {
    it('should populate Tool 6 store with mock communication metrics', () => {
      seedTool6();
      const state = useTool6Store.getState();
      expect(state.email).toEqual(MOCK_TOOL6_DATA.email);
      expect(state.chat).toEqual(MOCK_TOOL6_DATA.chat);
      expect(state.meetings).toEqual(MOCK_TOOL6_DATA.meetings);
    });

    it('should mark Tool 6 as complete', () => {
      seedTool6();
      const state = useTool6Store.getState();
      expect(state.completion).not.toBeNull();
    });
  });

  describe('seedTool7', () => {
    it('should populate Tool 7 store with mock revenue', () => {
      seedTool7();
      const state = useTool7Store.getState();
      expect(state.revenue).toBe(MOCK_TOOL7_DATA.revenue);
    });

    it('should populate Tool 7 store with mock calculation results', () => {
      seedTool7();
      const state = useTool7Store.getState();
      expect(state.calculationResults).not.toBeNull();
      expect(state.calculationResults?.totalAnnualCost).toBe(MOCK_TOOL7_DATA.totalAlignmentTax);
    });

    it('should mark Tool 7 as complete', () => {
      seedTool7();
      const state = useTool7Store.getState();
      expect(state.completion).not.toBeNull();
      expect(state.completion?.totalCost).toBe(MOCK_TOOL7_DATA.totalAlignmentTax);
    });
  });

  describe('seedMockPB1Data', () => {
    it('should seed all 7 tool stores', () => {
      seedMockPB1Data();

      expect(useTool1Store.getState().completion).not.toBeNull();
      expect(useCalculatorStore.getState().results).not.toBeNull();
      expect(useTool3Store.getState().completion).not.toBeNull();
      expect(useTool4Store.getState().completion).not.toBeNull();
      expect(useTool5Store.getState().completion).not.toBeNull();
      expect(useTool6Store.getState().completion).not.toBeNull();
      expect(useTool7Store.getState().completion).not.toBeNull();
    });
  });
});

describe('getMockDiagnosticData', () => {
  it('should return data in expected format', () => {
    const data = getMockDiagnosticData();

    expect(data).toHaveProperty('totalAlignmentTax');
    expect(data).toHaveProperty('estimatedSavings');
    expect(data).toHaveProperty('percentOfRevenue');
    expect(data).toHaveProperty('toolResults');
  });

  it('should return correct financial values', () => {
    const data = getMockDiagnosticData();

    expect(data.totalAlignmentTax).toBe(MOCK_TOOL7_DATA.totalAlignmentTax);
    expect(data.estimatedSavings).toBe(MOCK_TOOL7_DATA.estimatedSavings);
    expect(data.percentOfRevenue).toBe(MOCK_TOOL7_DATA.alignmentTaxPercent);
  });

  it('should include all 7 tool results', () => {
    const data = getMockDiagnosticData();

    expect(data.toolResults).toHaveProperty('tool1');
    expect(data.toolResults).toHaveProperty('tool2');
    expect(data.toolResults).toHaveProperty('tool3');
    expect(data.toolResults).toHaveProperty('tool4');
    expect(data.toolResults).toHaveProperty('tool5');
    expect(data.toolResults).toHaveProperty('tool6');
    expect(data.toolResults).toHaveProperty('tool7');
  });
});
