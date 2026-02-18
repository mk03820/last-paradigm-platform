/**
 * Tests for Dev Preview Page Integration
 *
 * Story: Hidden Dev Link to Preview Page with Mock Data
 * Task 5: Write tests for dev preview feature
 *
 * Note: Full component rendering tests are complex due to Next.js
 * dependencies. Core functionality is tested in mock-pb1-data.test.ts.
 * This file tests the integration logic.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useTool1Store } from '@/lib/store/tool1-store';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { useTool3Store } from '@/lib/store/tool3-store';
import { useTool4Store } from '@/lib/store/tool4-store';
import { useTool5Store } from '@/lib/store/tool5-store';
import { useTool6Store } from '@/lib/store/tool6-store';
import { useTool7Store } from '@/lib/store/tool7-store';
import {
  seedMockPB1Data,
  getMockDiagnosticData,
  MOCK_TOOL7_DATA,
} from '@/lib/dev/mock-pb1-data';
import {
  calculateEstimatedSavings,
  getSavingsContext,
} from '@/lib/services/savings-calculator';

describe('Dev Preview Page Integration Logic', () => {
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

  describe('Mock Data Seeding (simulates useEffect behavior)', () => {
    it('should seed all stores when seedMockPB1Data is called', () => {
      // This simulates what happens in the page's useEffect
      seedMockPB1Data();

      // Verify all stores are populated
      expect(useTool1Store.getState().completion).not.toBeNull();
      expect(useCalculatorStore.getState().results).not.toBeNull();
      expect(useTool3Store.getState().completion).not.toBeNull();
      expect(useTool4Store.getState().completion).not.toBeNull();
      expect(useTool5Store.getState().completion).not.toBeNull();
      expect(useTool6Store.getState().completion).not.toBeNull();
      expect(useTool7Store.getState().completion).not.toBeNull();
    });
  });

  describe('Preview Page Data Calculation (simulates page render)', () => {
    it('should calculate correct estimated savings from mock data', () => {
      const mockData = getMockDiagnosticData();
      const estimatedSavings = calculateEstimatedSavings(mockData.totalAlignmentTax);

      // 50% of $1.2M = $600K
      expect(estimatedSavings).toBe(600000);
    });

    it('should determine correct severity level from mock data', () => {
      const mockData = getMockDiagnosticData();
      const savingsContext = getSavingsContext(mockData.percentOfRevenue);

      // 8.4% is in "existential" range (>7%)
      expect(savingsContext.severityLevel).toBe('existential');
    });

    it('should have correct values for display', () => {
      const mockData = getMockDiagnosticData();

      expect(mockData.totalAlignmentTax).toBe(1200000);
      expect(mockData.estimatedSavings).toBe(847000);
      expect(mockData.percentOfRevenue).toBe(8.4);
    });
  });

  describe('AC Verification via Data', () => {
    it('AC1: Mock data contains all tool results', () => {
      const mockData = getMockDiagnosticData();

      expect(mockData.toolResults.tool1).toBeDefined();
      expect(mockData.toolResults.tool2).toBeDefined();
      expect(mockData.toolResults.tool3).toBeDefined();
      expect(mockData.toolResults.tool4).toBeDefined();
      expect(mockData.toolResults.tool5).toBeDefined();
      expect(mockData.toolResults.tool6).toBeDefined();
      expect(mockData.toolResults.tool7).toBeDefined();
    });

    it('AC2: Mock data provides compelling savings headline value', () => {
      const mockData = getMockDiagnosticData();

      // $847K is a compelling number per story spec
      expect(mockData.estimatedSavings).toBe(847000);
      expect(mockData.estimatedSavings).toBeGreaterThan(500000);
    });

    it('AC2: Top 3 tool recommendations can be derived from mock scores', () => {
      seedMockPB1Data();

      // Verify Tool 1 scores are available for recommendation algorithm
      const tool1State = useTool1Store.getState();
      expect(tool1State.scores).toEqual({
        strategic: 3,
        execution: 2,
        technology: 2,
        people: 3,
        governance: 2,
      });

      // Lowest scores are execution, technology, governance (all 2)
      // These would be the recommended areas
      const { scores } = tool1State;
      const scoredDimensions = Object.entries(scores)
        .sort(([, a], [, b]) => (a ?? 5) - (b ?? 5));

      expect(scoredDimensions[0][0]).toBe('execution');
      expect(scoredDimensions[0][1]).toBe(2);
    });
  });

  describe('Banner Display Values', () => {
    it('should format values correctly for banner display', () => {
      // Simulates what the banner displays
      const savings = MOCK_TOOL7_DATA.estimatedSavings.toLocaleString();
      const tax = MOCK_TOOL7_DATA.totalAlignmentTax.toLocaleString();
      const percent = MOCK_TOOL7_DATA.alignmentTaxPercent;

      expect(savings).toBe('847,000');
      expect(tax).toBe('1,200,000');
      expect(percent).toBe(8.4);
    });
  });
});
