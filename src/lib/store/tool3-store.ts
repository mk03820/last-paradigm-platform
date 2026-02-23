import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ArchetypeId,
  ArchetypeData,
  DecisionSample,
  BudgetThresholdId,
} from '@/components/tools/decision-velocity/constants';
import {
  DECISION_ARCHETYPES,
  generateSampleId,
  canCalculateVelocity,
} from '@/components/tools/decision-velocity/constants';
import type { SessionSyncStore } from '@/components/session';

/**
 * Tool 3 Decision Velocity Store
 *
 * Manages state for the Decision Velocity Scorecard.
 * Uses sessionStorage for persistence (clears on tab close).
 *
 * Story 10.1: Decision Sample Input Interface
 * C3-S4: Server sync for session persistence
 * Covers: AC7 (auto-save to Zustand store)
 */

export interface Tool3CompletionData {
  completedAt: string;
}

export interface Tool3State extends SessionSyncStore {
  // Data for each archetype
  archetypes: Record<ArchetypeId, ArchetypeData>;
  // Server session ID for sync (if authenticated)
  sessionId: string | null;
  // Track if data needs server sync
  isDirty: boolean;
  // Track if currently syncing to server
  isSyncing: boolean;
  // Completion tracking
  completion: Tool3CompletionData | null;

  // Actions
  addSample: (archetypeId: ArchetypeId, sample: Omit<DecisionSample, 'id'>) => string;
  updateSample: (archetypeId: ArchetypeId, sampleId: string, updates: Partial<DecisionSample>) => void;
  removeSample: (archetypeId: ArchetypeId, sampleId: string) => void;
  setSkipped: (archetypeId: ArchetypeId, skipped: boolean) => void;
  setBudgetThreshold: (threshold: BudgetThresholdId) => void;
  resetTool3: () => void;
  setSessionId: (id: string | null) => void;
  markComplete: () => void;

  // Session sync methods (implements SessionSyncStore)
  syncToServer: () => Promise<void>;
  loadFromServer: (sessionId: string) => Promise<boolean>;

  // Computed helpers
  getSampleCount: (archetypeId: ArchetypeId) => number;
  getTotalSamples: () => number;
  getValidArchetypeCount: () => number;
  canProceed: () => boolean;
}

const createInitialArchetypes = (): Record<ArchetypeId, ArchetypeData> => {
  const archetypes: Partial<Record<ArchetypeId, ArchetypeData>> = {};
  for (const archetype of DECISION_ARCHETYPES) {
    archetypes[archetype.id] = {
      archetypeId: archetype.id,
      skipped: false,
      samples: [],
      ...(archetype.hasThresholds ? { budgetThreshold: 'tier2' as BudgetThresholdId } : {}),
    };
  }
  return archetypes as Record<ArchetypeId, ArchetypeData>;
};

export const useTool3Store = create<Tool3State>()(
  persist(
    (set, get) => ({
      // Initial state
      archetypes: createInitialArchetypes(),
      sessionId: null,
      isDirty: false,
      isSyncing: false,
      completion: null,

      // Add a new sample to an archetype
      addSample: (archetypeId: ArchetypeId, sample: Omit<DecisionSample, 'id'>) => {
        const id = generateSampleId();
        set((state) => ({
          archetypes: {
            ...state.archetypes,
            [archetypeId]: {
              ...state.archetypes[archetypeId],
              samples: [
                ...state.archetypes[archetypeId].samples,
                { ...sample, id },
              ],
            },
          },
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

      // Update an existing sample
      updateSample: (archetypeId: ArchetypeId, sampleId: string, updates: Partial<DecisionSample>) => {
        set((state) => ({
          archetypes: {
            ...state.archetypes,
            [archetypeId]: {
              ...state.archetypes[archetypeId],
              samples: state.archetypes[archetypeId].samples.map((s) =>
                s.id === sampleId ? { ...s, ...updates } : s
              ),
            },
          },
          isDirty: true,
          completion: null,
        }));
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // Remove a sample from an archetype
      removeSample: (archetypeId: ArchetypeId, sampleId: string) => {
        set((state) => ({
          archetypes: {
            ...state.archetypes,
            [archetypeId]: {
              ...state.archetypes[archetypeId],
              samples: state.archetypes[archetypeId].samples.filter(
                (s) => s.id !== sampleId
              ),
            },
          },
          isDirty: true,
          completion: null,
        }));
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // Toggle skip status for an archetype
      setSkipped: (archetypeId: ArchetypeId, skipped: boolean) => {
        set((state) => ({
          archetypes: {
            ...state.archetypes,
            [archetypeId]: {
              ...state.archetypes[archetypeId],
              skipped,
            },
          },
          isDirty: true,
          completion: null,
        }));
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // Set budget threshold for budget archetype
      setBudgetThreshold: (threshold: BudgetThresholdId) => {
        set((state) => ({
          archetypes: {
            ...state.archetypes,
            budget: {
              ...state.archetypes.budget,
              budgetThreshold: threshold,
            },
          },
          isDirty: true,
          completion: null,
        }));
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // Reset all Tool 3 data
      resetTool3: () => {
        set({
          archetypes: createInitialArchetypes(),
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
        set({
          completion: {
            completedAt: new Date().toISOString(),
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
                tool3: {
                  decisions: Object.values(state.archetypes).flatMap((a) => a.samples),
                  archetypes: state.archetypes,
                  completedAt: state.completion?.completedAt,
                },
              },
            }),
          });

          if (response.ok) {
            set({ isDirty: false });
          }
        } catch (error) {
          console.error('[tool3-store] Failed to sync to server:', error);
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
            const tool3Data = session.data?.tool3;

            if (tool3Data) {
              set({
                sessionId,
                archetypes: tool3Data.archetypes || createInitialArchetypes(),
                completion: tool3Data.completedAt
                  ? { completedAt: tool3Data.completedAt }
                  : null,
                isDirty: false,
              });
              return true;
            }

            // Session exists but no tool3 data
            set({ sessionId, isDirty: false });
            return true;
          }

          return false;
        } catch (error) {
          console.error('[tool3-store] Failed to load from server:', error);
          return false;
        } finally {
          set({ isSyncing: false });
        }
      },

      // Get sample count for an archetype
      getSampleCount: (archetypeId: ArchetypeId) => {
        return get().archetypes[archetypeId].samples.length;
      },

      // Get total samples across all archetypes
      getTotalSamples: () => {
        const { archetypes } = get();
        return Object.values(archetypes).reduce(
          (sum, a) => sum + a.samples.length,
          0
        );
      },

      // Get count of archetypes with sufficient data
      getValidArchetypeCount: () => {
        const { archetypes } = get();
        return Object.values(archetypes).filter(
          (a) => !a.skipped && a.samples.length >= 3
        ).length;
      },

      // Check if user can proceed to results
      canProceed: () => {
        const { archetypes } = get();
        return canCalculateVelocity(Object.values(archetypes));
      },
    }),
    {
      name: 'tool3-decision-velocity-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        archetypes: state.archetypes,
        sessionId: state.sessionId,
        completion: state.completion,
      }),
    }
  )
);
