import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AggregatedToolData,
  AggregationStatus,
  AggregationError,
  CostBreakdown,
  AdditionalCostsInput,
  ProjectDelaysCostInput,
  ReworkCostInput,
  TurnoverCostInput,
  OpportunityCostInput,
} from '@/components/tools/total-cost/cost-constants';
import {
  createDefaultAdditionalCostsInput,
  calculateProjectDelaysCost,
  calculateReworkCost,
  calculateTurnoverCost,
  calculateOpportunityCostTotal,
  calculateTotalAdditionalCostsInput,
} from '@/components/tools/total-cost/cost-constants';
import type { SessionSyncStore } from '@/components/session';

/**
 * Tool 7 Total Cost of Misalignment Store
 *
 * Manages state for the Total Cost Calculator.
 * Uses sessionStorage for persistence (clears on tab close).
 *
 * Story 14.1: Cross-Tool Data Aggregation
 * C3-S8: Server sync for session persistence
 * Covers: FR2-31 (Cross-tool aggregation)
 *
 * NOTE: This store is designed to be extended by Stories 14.2 and 14.3
 * for additional cost inputs and calculation results.
 */

// ============================================================================
// Types for Future Extension (Stories 14.2, 14.3)
// ============================================================================

/**
 * Additional cost input (Story 14.2)
 * Placeholder interface - to be expanded in Story 14.2
 */
export interface AdditionalCost {
  id: string;
  category: string;
  description: string;
  amount: number;
  frequency: 'one-time' | 'monthly' | 'annual';
  createdAt: string;
}

/**
 * Calculation results (Story 14.3)
 * Placeholder interface - to be expanded in Story 14.3
 */
export interface CalculationResults {
  totalAnnualCost: number;
  breakdown: CostBreakdown[];
  confidenceLevel: 'low' | 'medium' | 'high';
  calculatedAt: string;
}

/**
 * Tool 7 completion data
 */
export interface Tool7CompletionData {
  completedAt: string;
  totalCost: number;
  toolsIncluded: number;
}

// ============================================================================
// Main Store State Interface
// ============================================================================

export interface Tool7State extends SessionSyncStore {
  // Aggregated data from Tools 1-6
  aggregatedData: AggregatedToolData | null;

  // Aggregation status
  aggregationStatus: AggregationStatus;
  aggregationError: AggregationError | null;

  // Additional costs (Story 14.2 - placeholder for extension)
  additionalCosts: AdditionalCost[];

  // Additional costs input with detailed fields (Story 14.2)
  additionalCostsInput: AdditionalCostsInput;

  // Company revenue for % of revenue calculation (Story 14.2)
  revenue: number;

  // Calculation results (Story 14.3 - placeholder for extension)
  calculationResults: CalculationResults | null;

  // Server session ID for sync (if authenticated)
  sessionId: string | null;

  // Track if data needs server sync
  isDirty: boolean;

  // Track if currently syncing to server
  isSyncing: boolean;

  // Completion tracking
  completion: Tool7CompletionData | null;

  // ============================================================================
  // Actions - Aggregation (Story 14.1)
  // ============================================================================

  // Set aggregated data from tools
  setAggregatedData: (data: AggregatedToolData) => void;

  // Set aggregation status
  setAggregationStatus: (status: AggregationStatus) => void;

  // Set aggregation error
  setAggregationError: (error: AggregationError | null) => void;

  // Clear aggregated data
  clearAggregatedData: () => void;

  // ============================================================================
  // Actions - Additional Costs (Story 14.2 - placeholders)
  // ============================================================================

  // Add an additional cost entry
  addAdditionalCost: (cost: Omit<AdditionalCost, 'id' | 'createdAt'>) => string;

  // Update an additional cost entry
  updateAdditionalCost: (id: string, updates: Partial<AdditionalCost>) => void;

  // Remove an additional cost entry
  removeAdditionalCost: (id: string) => void;

  // Clear all additional costs
  clearAdditionalCosts: () => void;

  // ============================================================================
  // Actions - Additional Costs Input (Story 14.2)
  // ============================================================================

  // Update project delays cost
  updateProjectDelaysCost: (data: Partial<Omit<ProjectDelaysCostInput, 'subtotal'>>) => void;

  // Update rework cost
  updateReworkCost: (data: Partial<Omit<ReworkCostInput, 'subtotal'>>) => void;

  // Update turnover cost
  updateTurnoverCost: (data: Partial<Omit<TurnoverCostInput, 'subtotal'>>) => void;

  // Update opportunity cost
  updateOpportunityCost: (data: Partial<Omit<OpportunityCostInput, 'subtotal'>>) => void;

  // Set revenue
  setRevenue: (revenue: number) => void;

  // Reset additional costs input to defaults
  resetAdditionalCostsInput: () => void;

  // ============================================================================
  // Actions - Calculation (Story 14.3 - placeholders)
  // ============================================================================

  // Set calculation results
  setCalculationResults: (results: CalculationResults | null) => void;

  // ============================================================================
  // Actions - Session & Completion
  // ============================================================================

  // Set server session ID
  setSessionId: (id: string | null) => void;

  // Session sync methods (implements SessionSyncStore)
  syncToServer: () => Promise<void>;
  loadFromServer: (sessionId: string) => Promise<boolean>;

  // Mark tool as complete
  markComplete: (totalCost: number, toolsIncluded: number) => void;

  // Reset all Tool 7 data
  resetTool7: () => void;

  // ============================================================================
  // Computed Helpers
  // ============================================================================

  // Check if minimum requirements are met (Tool 2 complete)
  canProceed: () => boolean;

  // Get count of completed tools
  getCompletedToolsCount: () => number;

  // Check if aggregation is complete
  isAggregated: () => boolean;

  // Get total additional costs (Story 14.2)
  getTotalAdditionalCosts: () => number;

  // Get total additional costs from input form (Story 14.2)
  getTotalAdditionalCostsInput: () => number;

  // Get percentage of revenue (Story 14.2)
  getPercentOfRevenue: (totalCost: number) => number;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateCostId(): string {
  return `cost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useTool7Store = create<Tool7State>()(
  persist(
    (set, get) => ({
      // Initial state
      aggregatedData: null,
      aggregationStatus: 'idle',
      aggregationError: null,
      additionalCosts: [],
      additionalCostsInput: createDefaultAdditionalCostsInput(),
      revenue: 0,
      calculationResults: null,
      sessionId: null,
      isDirty: false,
      isSyncing: false,
      completion: null,

      // ============================================================================
      // Actions - Aggregation (Story 14.1)
      // ============================================================================

      setAggregatedData: (data) => {
        set({
          aggregatedData: data,
          aggregationStatus: 'complete',
          aggregationError: null,
          isDirty: true,
          // Clear completion when data changes
          completion: null,
          // Clear previous calculation results when re-aggregating
          calculationResults: null,
        });
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      setAggregationStatus: (status) => {
        set({ aggregationStatus: status });
      },

      setAggregationError: (error) => {
        set({
          aggregationError: error,
          aggregationStatus: error ? 'error' : get().aggregationStatus,
        });
      },

      clearAggregatedData: () => {
        set({
          aggregatedData: null,
          aggregationStatus: 'idle',
          aggregationError: null,
          calculationResults: null,
          completion: null,
          isDirty: true,
        });
      },

      // ============================================================================
      // Actions - Additional Costs (Story 14.2 - placeholders)
      // ============================================================================

      addAdditionalCost: (cost) => {
        const id = generateCostId();
        const now = new Date().toISOString();

        set((state) => ({
          additionalCosts: [
            ...state.additionalCosts,
            { ...cost, id, createdAt: now },
          ],
          isDirty: true,
          completion: null,
          calculationResults: null,
        }));

        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }

        return id;
      },

      updateAdditionalCost: (id, updates) => {
        set((state) => ({
          additionalCosts: state.additionalCosts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
          isDirty: true,
          completion: null,
          calculationResults: null,
        }));
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      removeAdditionalCost: (id) => {
        set((state) => ({
          additionalCosts: state.additionalCosts.filter((c) => c.id !== id),
          isDirty: true,
          completion: null,
          calculationResults: null,
        }));
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      clearAdditionalCosts: () => {
        set({
          additionalCosts: [],
          isDirty: true,
          completion: null,
          calculationResults: null,
        });
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // ============================================================================
      // Actions - Additional Costs Input (Story 14.2)
      // ============================================================================

      updateProjectDelaysCost: (data) => {
        set((state) => {
          const current = state.additionalCostsInput.projectDelays;
          const updated = { ...current, ...data };
          const subtotal = calculateProjectDelaysCost(updated);
          const newProjectDelays = { ...updated, subtotal };
          const newAdditionalCostsInput = {
            ...state.additionalCostsInput,
            projectDelays: newProjectDelays,
          };
          newAdditionalCostsInput.total = calculateTotalAdditionalCostsInput(newAdditionalCostsInput);
          return {
            additionalCostsInput: newAdditionalCostsInput,
            isDirty: true,
            completion: null,
            calculationResults: null,
          };
        });
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      updateReworkCost: (data) => {
        set((state) => {
          const current = state.additionalCostsInput.rework;
          const updated = { ...current, ...data };
          const subtotal = calculateReworkCost(updated);
          const newRework = { ...updated, subtotal };
          const newAdditionalCostsInput = {
            ...state.additionalCostsInput,
            rework: newRework,
          };
          newAdditionalCostsInput.total = calculateTotalAdditionalCostsInput(newAdditionalCostsInput);
          return {
            additionalCostsInput: newAdditionalCostsInput,
            isDirty: true,
            completion: null,
            calculationResults: null,
          };
        });
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      updateTurnoverCost: (data) => {
        set((state) => {
          const current = state.additionalCostsInput.turnover;
          const updated = { ...current, ...data };
          const subtotal = calculateTurnoverCost(updated);
          const newTurnover = { ...updated, subtotal };
          const newAdditionalCostsInput = {
            ...state.additionalCostsInput,
            turnover: newTurnover,
          };
          newAdditionalCostsInput.total = calculateTotalAdditionalCostsInput(newAdditionalCostsInput);
          return {
            additionalCostsInput: newAdditionalCostsInput,
            isDirty: true,
            completion: null,
            calculationResults: null,
          };
        });
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      updateOpportunityCost: (data) => {
        set((state) => {
          const current = state.additionalCostsInput.opportunityCost;
          const updated = { ...current, ...data };
          const subtotal = calculateOpportunityCostTotal(updated);
          const newOpportunityCost = { ...updated, subtotal };
          const newAdditionalCostsInput = {
            ...state.additionalCostsInput,
            opportunityCost: newOpportunityCost,
          };
          newAdditionalCostsInput.total = calculateTotalAdditionalCostsInput(newAdditionalCostsInput);
          return {
            additionalCostsInput: newAdditionalCostsInput,
            isDirty: true,
            completion: null,
            calculationResults: null,
          };
        });
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      setRevenue: (revenue) => {
        set({
          revenue,
          isDirty: true,
          completion: null,
          calculationResults: null,
        });
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      resetAdditionalCostsInput: () => {
        set({
          additionalCostsInput: createDefaultAdditionalCostsInput(),
          revenue: 0,
          isDirty: true,
          completion: null,
          calculationResults: null,
        });
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // ============================================================================
      // Actions - Calculation (Story 14.3 - placeholder)
      // ============================================================================

      setCalculationResults: (results) => {
        set({
          calculationResults: results,
          isDirty: true,
        });
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // ============================================================================
      // Actions - Session & Completion
      // ============================================================================

      setSessionId: (id) => {
        set({ sessionId: id });
      },

      markComplete: (totalCost, toolsIncluded) => {
        set({
          completion: {
            completedAt: new Date().toISOString(),
            totalCost,
            toolsIncluded,
          },
          isDirty: true,
        });
        // Auto-sync completion to server
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      /**
       * Sync current state to server session
       */
      syncToServer: async () => {
        const state = get();
        if (!state.sessionId || state.isSyncing) return;

        set({ isSyncing: true });

        try {
          const response = await fetch(`/api/sessions/${state.sessionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: {
                tool7: {
                  aggregatedData: state.aggregatedData,
                  additionalCostsInput: state.additionalCostsInput,
                  revenue: state.revenue,
                  calculationResults: state.calculationResults,
                  completedAt: state.completion?.completedAt,
                },
              },
            }),
          });

          if (response.ok) {
            set({ isDirty: false });
          }
        } catch (error) {
          console.error('[tool7-store] Failed to sync to server:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      /**
       * Load session data from server
       */
      loadFromServer: async (sessionId: string) => {
        set({ isSyncing: true });

        try {
          const response = await fetch(`/api/sessions/${sessionId}`);
          const data = await response.json();

          if (data.success && data.data?.session) {
            const session = data.data.session;
            const tool7Data = session.data?.tool7;

            if (tool7Data) {
              set({
                sessionId,
                aggregatedData: tool7Data.aggregatedData || null,
                additionalCostsInput: tool7Data.additionalCostsInput || createDefaultAdditionalCostsInput(),
                revenue: tool7Data.revenue || 0,
                calculationResults: tool7Data.calculationResults || null,
                completion: tool7Data.completedAt
                  ? {
                      completedAt: tool7Data.completedAt,
                      totalCost: tool7Data.calculationResults?.totalAnnualCost || 0,
                      toolsIncluded: tool7Data.aggregatedData?.completedToolsCount || 0,
                    }
                  : null,
                isDirty: false,
              });
              return true;
            }

            // Session exists but no tool7 data
            set({ sessionId, isDirty: false });
            return true;
          }

          return false;
        } catch (error) {
          console.error('[tool7-store] Failed to load from server:', error);
          return false;
        } finally {
          set({ isSyncing: false });
        }
      },

      resetTool7: () => {
        set({
          aggregatedData: null,
          aggregationStatus: 'idle',
          aggregationError: null,
          additionalCosts: [],
          additionalCostsInput: createDefaultAdditionalCostsInput(),
          revenue: 0,
          calculationResults: null,
          isDirty: false,
          isSyncing: false,
          completion: null,
        });
      },

      // ============================================================================
      // Computed Helpers
      // ============================================================================

      canProceed: () => {
        const { aggregatedData } = get();
        return aggregatedData?.canProceed ?? false;
      },

      getCompletedToolsCount: () => {
        const { aggregatedData } = get();
        return aggregatedData?.completedToolsCount ?? 0;
      },

      isAggregated: () => {
        const { aggregatedData, aggregationStatus } = get();
        return aggregatedData !== null && aggregationStatus === 'complete';
      },

      getTotalAdditionalCosts: () => {
        const { additionalCosts } = get();
        return additionalCosts.reduce((sum, cost) => {
          // Normalize to annual
          switch (cost.frequency) {
            case 'monthly':
              return sum + cost.amount * 12;
            case 'one-time':
              return sum + cost.amount;
            case 'annual':
            default:
              return sum + cost.amount;
          }
        }, 0);
      },

      getTotalAdditionalCostsInput: () => {
        const { additionalCostsInput } = get();
        return additionalCostsInput.total;
      },

      getPercentOfRevenue: (totalCost: number) => {
        const { revenue } = get();
        if (revenue <= 0) return 0;
        return (totalCost / revenue) * 100;
      },
    }),
    {
      name: 'tool7-total-cost-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        aggregatedData: state.aggregatedData,
        aggregationStatus: state.aggregationStatus,
        additionalCosts: state.additionalCosts,
        additionalCostsInput: state.additionalCostsInput,
        revenue: state.revenue,
        calculationResults: state.calculationResults,
        sessionId: state.sessionId,
        completion: state.completion,
      }),
    }
  )
);
