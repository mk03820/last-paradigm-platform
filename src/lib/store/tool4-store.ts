import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Stakeholder,
  StakeholderQuadrant,
} from '@/components/tools/stakeholder-map/stakeholder-constants';
import {
  generateStakeholderId,
  getQuadrantCounts,
  canProceedToMatrix,
} from '@/components/tools/stakeholder-map/stakeholder-constants';

/**
 * Tool 4 Stakeholder Mapping Store
 *
 * Manages state for the Stakeholder Power/Interest Mapping tool.
 * Uses sessionStorage for persistence (clears on tab close).
 *
 * Story 11.1: Stakeholder Input Interface
 * Covers: AC6 (auto-save to Zustand store)
 */

export interface Tool4CompletionData {
  completedAt: string;
  stakeholderCount: number;
  quadrantCounts: Record<StakeholderQuadrant, number>;
  hasEngagementStrategies: boolean;
}

export interface Tool4State {
  // Stakeholder list
  stakeholders: Stakeholder[];
  // Owner assignments for engagement tracking (stakeholder id -> owner name)
  ownerAssignments: Record<string, string>;
  // Server session ID for sync (if authenticated)
  sessionId: string | null;
  // Track if data needs server sync
  isDirty: boolean;
  // Completion tracking
  completion: Tool4CompletionData | null;

  // Actions
  addStakeholder: (stakeholder: Omit<Stakeholder, 'id'>) => string;
  updateStakeholder: (id: string, updates: Partial<Omit<Stakeholder, 'id'>>) => void;
  removeStakeholder: (id: string) => void;
  setOwner: (stakeholderId: string, owner: string) => void;
  resetTool4: () => void;
  setSessionId: (id: string | null) => void;
  markComplete: () => void;

  // Computed helpers
  getStakeholderCount: () => number;
  canProceed: () => boolean;
  getQuadrantCounts: () => Record<StakeholderQuadrant, number>;
}

export const useTool4Store = create<Tool4State>()(
  persist(
    (set, get) => ({
      // Initial state
      stakeholders: [],
      ownerAssignments: {},
      sessionId: null,
      isDirty: false,
      completion: null,

      // Add a new stakeholder
      addStakeholder: (stakeholder: Omit<Stakeholder, 'id'>) => {
        const id = generateStakeholderId();
        set((state) => ({
          stakeholders: [...state.stakeholders, { ...stakeholder, id }],
          isDirty: true,
          completion: null,
        }));
        return id;
      },

      // Update an existing stakeholder
      updateStakeholder: (id: string, updates: Partial<Omit<Stakeholder, 'id'>>) => {
        set((state) => ({
          stakeholders: state.stakeholders.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
          isDirty: true,
          completion: null,
        }));
      },

      // Remove a stakeholder
      removeStakeholder: (id: string) => {
        set((state) => {
          // Also remove owner assignment
          const { [id]: _, ...remainingOwners } = state.ownerAssignments;
          return {
            stakeholders: state.stakeholders.filter((s) => s.id !== id),
            ownerAssignments: remainingOwners,
            isDirty: true,
            completion: null,
          };
        });
      },

      // Set owner for a stakeholder
      setOwner: (stakeholderId: string, owner: string) => {
        set((state) => ({
          ownerAssignments: {
            ...state.ownerAssignments,
            [stakeholderId]: owner,
          },
          isDirty: true,
        }));
      },

      // Reset all Tool 4 data
      resetTool4: () => {
        set({
          stakeholders: [],
          ownerAssignments: {},
          isDirty: false,
          completion: null,
        });
      },

      // Set server session ID
      setSessionId: (id: string | null) => {
        set({ sessionId: id });
      },

      // Mark tool as complete
      markComplete: () => {
        const { stakeholders } = get();
        set({
          completion: {
            completedAt: new Date().toISOString(),
            stakeholderCount: stakeholders.length,
            quadrantCounts: getQuadrantCounts(stakeholders),
            hasEngagementStrategies: true,
          },
          isDirty: true,
        });
      },

      // Get total stakeholder count
      getStakeholderCount: () => {
        return get().stakeholders.length;
      },

      // Check if user can proceed to matrix view
      canProceed: () => {
        return canProceedToMatrix(get().stakeholders);
      },

      // Get counts by quadrant
      getQuadrantCounts: () => {
        return getQuadrantCounts(get().stakeholders);
      },
    }),
    {
      name: 'tool4-stakeholder-map-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        stakeholders: state.stakeholders,
        ownerAssignments: state.ownerAssignments,
        sessionId: state.sessionId,
        completion: state.completion,
      }),
    }
  )
);
