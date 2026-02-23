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
import type { SessionSyncStore } from '@/components/session';

/**
 * Tool 4 Stakeholder Mapping Store
 *
 * Manages state for the Stakeholder Power/Interest Mapping tool.
 * Uses sessionStorage for persistence (clears on tab close).
 *
 * Story 11.1: Stakeholder Input Interface
 * C3-S5: Server sync for session persistence
 * Covers: AC6 (auto-save to Zustand store)
 */

export interface Tool4CompletionData {
  completedAt: string;
  stakeholderCount: number;
  quadrantCounts: Record<StakeholderQuadrant, number>;
  hasEngagementStrategies: boolean;
}

export interface Tool4State extends SessionSyncStore {
  // Stakeholder list
  stakeholders: Stakeholder[];
  // Owner assignments for engagement tracking (stakeholder id -> owner name)
  ownerAssignments: Record<string, string>;
  // Server session ID for sync (if authenticated)
  sessionId: string | null;
  // Track if data needs server sync
  isDirty: boolean;
  // Track if currently syncing to server
  isSyncing: boolean;
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

  // Session sync methods (implements SessionSyncStore)
  syncToServer: () => Promise<void>;
  loadFromServer: (sessionId: string) => Promise<boolean>;

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
      isSyncing: false,
      completion: null,

      // Add a new stakeholder
      addStakeholder: (stakeholder: Omit<Stakeholder, 'id'>) => {
        const id = generateStakeholderId();
        set((state) => ({
          stakeholders: [...state.stakeholders, { ...stakeholder, id }],
          isDirty: true,
          completion: null,
        }));
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
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
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
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
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
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
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // Reset all Tool 4 data
      resetTool4: () => {
        set({
          stakeholders: [],
          ownerAssignments: {},
          isDirty: false,
          isSyncing: false,
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
                tool4: {
                  stakeholders: state.stakeholders,
                  quadrantSummary: getQuadrantCounts(state.stakeholders),
                  riskCount: state.stakeholders.length,
                  completedAt: state.completion?.completedAt,
                },
              },
            }),
          });

          if (response.ok) {
            set({ isDirty: false });
          }
        } catch (error) {
          console.error('[tool4-store] Failed to sync to server:', error);
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
            const tool4Data = session.data?.tool4;

            if (tool4Data) {
              set({
                sessionId,
                stakeholders: tool4Data.stakeholders || [],
                completion: tool4Data.completedAt
                  ? {
                      completedAt: tool4Data.completedAt,
                      stakeholderCount: tool4Data.stakeholders?.length || 0,
                      quadrantCounts: tool4Data.quadrantSummary || getQuadrantCounts([]),
                      hasEngagementStrategies: true,
                    }
                  : null,
                isDirty: false,
              });
              return true;
            }

            // Session exists but no tool4 data
            set({ sessionId, isDirty: false });
            return true;
          }

          return false;
        } catch (error) {
          console.error('[tool4-store] Failed to load from server:', error);
          return false;
        } finally {
          set({ isSyncing: false });
        }
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
