/**
 * Tool 7 Store Tests
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 9: Update tool7-store tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useTool7Store } from './tool7-store';
import { createDefaultAdditionalCostsInput } from '@/components/tools/total-cost/cost-constants';

describe('Tool7Store - Additional Costs Input (Story 14.2)', () => {
  beforeEach(() => {
    // Reset store before each test
    useTool7Store.getState().resetTool7();
  });

  describe('initial state', () => {
    it('should have default additional costs input', () => {
      const state = useTool7Store.getState();
      const defaultCosts = createDefaultAdditionalCostsInput();

      expect(state.additionalCostsInput).toEqual(defaultCosts);
    });

    it('should have revenue set to 0', () => {
      const state = useTool7Store.getState();
      expect(state.revenue).toBe(0);
    });
  });

  describe('updateProjectDelaysCost', () => {
    it('should update project delays data', () => {
      const { updateProjectDelaysCost } = useTool7Store.getState();

      updateProjectDelaysCost({
        failedProjectsCount: 3,
        avgProjectValue: 100000,
        delayImpactPercent: 50,
      });

      const state = useTool7Store.getState();
      expect(state.additionalCostsInput.projectDelays.failedProjectsCount).toBe(3);
      expect(state.additionalCostsInput.projectDelays.avgProjectValue).toBe(100000);
      expect(state.additionalCostsInput.projectDelays.delayImpactPercent).toBe(50);
    });

    it('should calculate subtotal correctly', () => {
      const { updateProjectDelaysCost } = useTool7Store.getState();

      updateProjectDelaysCost({
        failedProjectsCount: 3,
        avgProjectValue: 100000,
        delayImpactPercent: 50,
      });

      const state = useTool7Store.getState();
      // 3 * 100000 * 0.5 = 150000
      expect(state.additionalCostsInput.projectDelays.subtotal).toBe(150000);
    });

    it('should update total additional costs', () => {
      const { updateProjectDelaysCost } = useTool7Store.getState();

      updateProjectDelaysCost({
        failedProjectsCount: 2,
        avgProjectValue: 200000,
        delayImpactPercent: 25,
      });

      const state = useTool7Store.getState();
      // 2 * 200000 * 0.25 = 100000
      expect(state.additionalCostsInput.total).toBe(100000);
    });
  });

  describe('updateReworkCost', () => {
    it('should update rework data', () => {
      const { updateReworkCost } = useTool7Store.getState();

      updateReworkCost({
        reworkPercent: 20,
        annualLaborCost: 5000000,
      });

      const state = useTool7Store.getState();
      expect(state.additionalCostsInput.rework.reworkPercent).toBe(20);
      expect(state.additionalCostsInput.rework.annualLaborCost).toBe(5000000);
    });

    it('should calculate subtotal correctly', () => {
      const { updateReworkCost } = useTool7Store.getState();

      updateReworkCost({
        reworkPercent: 20,
        annualLaborCost: 5000000,
      });

      const state = useTool7Store.getState();
      // 5000000 * 0.20 = 1000000
      expect(state.additionalCostsInput.rework.subtotal).toBe(1000000);
    });
  });

  describe('updateTurnoverCost', () => {
    it('should update turnover data', () => {
      const { updateTurnoverCost } = useTool7Store.getState();

      updateTurnoverCost({
        excessTurnoverRate: 10,
        avgReplacementCost: 75000,
        headcount: 100,
      });

      const state = useTool7Store.getState();
      expect(state.additionalCostsInput.turnover.excessTurnoverRate).toBe(10);
      expect(state.additionalCostsInput.turnover.avgReplacementCost).toBe(75000);
      expect(state.additionalCostsInput.turnover.headcount).toBe(100);
    });

    it('should calculate subtotal correctly', () => {
      const { updateTurnoverCost } = useTool7Store.getState();

      updateTurnoverCost({
        excessTurnoverRate: 10,
        avgReplacementCost: 75000,
        headcount: 100,
      });

      const state = useTool7Store.getState();
      // 0.10 * 100 * 75000 = 750000
      expect(state.additionalCostsInput.turnover.subtotal).toBe(750000);
    });
  });

  describe('updateOpportunityCost', () => {
    it('should update opportunity cost data', () => {
      const { updateOpportunityCost } = useTool7Store.getState();

      updateOpportunityCost({
        delayedRevenue: 500000,
        missedDeals: 250000,
        marketShareLoss: 1000000,
      });

      const state = useTool7Store.getState();
      expect(state.additionalCostsInput.opportunityCost.delayedRevenue).toBe(500000);
      expect(state.additionalCostsInput.opportunityCost.missedDeals).toBe(250000);
      expect(state.additionalCostsInput.opportunityCost.marketShareLoss).toBe(1000000);
    });

    it('should calculate subtotal correctly', () => {
      const { updateOpportunityCost } = useTool7Store.getState();

      updateOpportunityCost({
        delayedRevenue: 500000,
        missedDeals: 250000,
        marketShareLoss: 1000000,
      });

      const state = useTool7Store.getState();
      // 500000 + 250000 + 1000000 = 1750000
      expect(state.additionalCostsInput.opportunityCost.subtotal).toBe(1750000);
    });
  });

  describe('setRevenue', () => {
    it('should update revenue', () => {
      const { setRevenue } = useTool7Store.getState();

      setRevenue(50000000);

      const state = useTool7Store.getState();
      expect(state.revenue).toBe(50000000);
    });

    it('should mark store as dirty', () => {
      const { setRevenue } = useTool7Store.getState();

      setRevenue(50000000);

      const state = useTool7Store.getState();
      expect(state.isDirty).toBe(true);
    });
  });

  describe('getTotalAdditionalCostsInput', () => {
    it('should return total of all categories', () => {
      const {
        updateProjectDelaysCost,
        updateReworkCost,
        updateTurnoverCost,
        updateOpportunityCost,
      } = useTool7Store.getState();

      updateProjectDelaysCost({
        failedProjectsCount: 2,
        avgProjectValue: 100000,
        delayImpactPercent: 50,
      }); // 100000

      updateReworkCost({
        reworkPercent: 10,
        annualLaborCost: 2000000,
      }); // 200000

      updateTurnoverCost({
        excessTurnoverRate: 5,
        avgReplacementCost: 60000,
        headcount: 50,
      }); // 150000

      updateOpportunityCost({
        delayedRevenue: 100000,
        missedDeals: 50000,
        marketShareLoss: 100000,
      }); // 250000

      const total = useTool7Store.getState().getTotalAdditionalCostsInput();
      expect(total).toBe(700000);
    });
  });

  describe('getPercentOfRevenue', () => {
    it('should calculate correct percentage', () => {
      const { setRevenue, getPercentOfRevenue } = useTool7Store.getState();

      setRevenue(50000000);

      const percent = getPercentOfRevenue(1500000);
      expect(percent).toBe(3); // 1500000 / 50000000 * 100 = 3%
    });

    it('should return 0 when revenue is 0', () => {
      const { getPercentOfRevenue } = useTool7Store.getState();

      const percent = getPercentOfRevenue(1500000);
      expect(percent).toBe(0);
    });
  });

  describe('resetAdditionalCostsInput', () => {
    it('should reset all additional costs to defaults', () => {
      const {
        updateProjectDelaysCost,
        updateReworkCost,
        setRevenue,
        resetAdditionalCostsInput,
      } = useTool7Store.getState();

      // Set some values
      updateProjectDelaysCost({
        failedProjectsCount: 5,
        avgProjectValue: 200000,
        delayImpactPercent: 75,
      });
      updateReworkCost({
        reworkPercent: 30,
        annualLaborCost: 10000000,
      });
      setRevenue(100000000);

      // Reset
      resetAdditionalCostsInput();

      const state = useTool7Store.getState();
      expect(state.additionalCostsInput.projectDelays.failedProjectsCount).toBe(0);
      expect(state.additionalCostsInput.rework.reworkPercent).toBe(0);
      expect(state.additionalCostsInput.total).toBe(0);
      expect(state.revenue).toBe(0);
    });
  });

  describe('resetTool7', () => {
    it('should reset additional costs input', () => {
      const { updateProjectDelaysCost, setRevenue, resetTool7 } = useTool7Store.getState();

      updateProjectDelaysCost({
        failedProjectsCount: 5,
        avgProjectValue: 200000,
        delayImpactPercent: 75,
      });
      setRevenue(50000000);

      resetTool7();

      const state = useTool7Store.getState();
      expect(state.additionalCostsInput.total).toBe(0);
      expect(state.revenue).toBe(0);
    });
  });
});
