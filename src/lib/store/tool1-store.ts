import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DimensionId } from '@/components/tools/alignment/constants';
import type { SessionSyncStore } from '@/components/session';

/**
 * Tool 1 Alignment Assessment Store
 *
 * Manages state for the Organizational Alignment Assessment Matrix.
 * Uses sessionStorage for persistence (clears on tab close).
 *
 * Story 9.1: Alignment Dimension Scoring Interface
 * Story 9.4: Score Interpretation and Next Steps
 * C3-S3: Server sync for session persistence
 * Covers: AC5 (auto-save), AC7 (schema integration), AC4 (completion tracking)
 */

export interface Tool1Scores {
  strategic?: number;
  execution?: number;
  technology?: number;
  people?: number;
  governance?: number;
}

export interface Tool1CompletionData {
  compositeScore: number;
  completedAt: string;
}

export interface Tool1State extends SessionSyncStore {
  // Scores for each dimension (1-4)
  scores: Tool1Scores;
  // Server session ID for sync (if authenticated)
  sessionId: string | null;
  // Track if data needs server sync
  isDirty: boolean;
  // Track if currently syncing to server
  isSyncing: boolean;
  // Completion tracking
  completion: Tool1CompletionData | null;

  // Actions
  setScore: (dimension: DimensionId, score: number) => void;
  setScores: (scores: Tool1Scores) => void;
  resetTool1: () => void;
  setSessionId: (id: string | null) => void;
  markComplete: (compositeScore: number) => void;

  // Session sync methods (implements SessionSyncStore)
  syncToServer: () => Promise<void>;
  loadFromServer: (sessionId: string) => Promise<boolean>;

  // Computed helpers
  isComplete: () => boolean;
  getScoredCount: () => number;
}

const TOTAL_DIMENSIONS = 5;

export const useTool1Store = create<Tool1State>()(
  persist(
    (set, get) => ({
      // Initial state
      scores: {},
      sessionId: null,
      isDirty: false,
      isSyncing: false,
      completion: null,

      // Set a single dimension score
      setScore: (dimension: DimensionId, score: number) => {
        set((state) => ({
          scores: {
            ...state.scores,
            [dimension]: score,
          },
          isDirty: true,
          // Clear completion if scores change
          completion: null,
        }));
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // Set multiple scores at once
      setScores: (scores: Tool1Scores) => {
        set({ scores, isDirty: true, completion: null });
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // Reset all Tool 1 data
      resetTool1: () => {
        set({
          scores: {},
          isDirty: false,
          isSyncing: false,
          completion: null,
        });
      },

      // Set server session ID
      setSessionId: (id: string | null) => {
        set({ sessionId: id });
      },

      // Mark tool as complete with composite score
      markComplete: (compositeScore: number) => {
        set({
          completion: {
            compositeScore,
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
                tool1: {
                  scores: state.scores,
                  compositeScore: state.completion?.compositeScore,
                  completedAt: state.completion?.completedAt,
                },
              },
            }),
          });

          if (response.ok) {
            set({ isDirty: false });
          }
        } catch (error) {
          console.error('[tool1-store] Failed to sync to server:', error);
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
            const tool1Data = session.data?.tool1;

            if (tool1Data) {
              set({
                sessionId,
                scores: tool1Data.scores || {},
                completion: tool1Data.completedAt
                  ? {
                      compositeScore: tool1Data.compositeScore || 0,
                      completedAt: tool1Data.completedAt,
                    }
                  : null,
                isDirty: false,
              });
              return true;
            }

            // Session exists but no tool1 data
            set({ sessionId, isDirty: false });
            return true;
          }

          return false;
        } catch (error) {
          console.error('[tool1-store] Failed to load from server:', error);
          return false;
        } finally {
          set({ isSyncing: false });
        }
      },

      // Check if all 5 dimensions are scored
      isComplete: () => {
        const { scores } = get();
        const scoredCount = Object.values(scores).filter(
          (s) => s !== undefined
        ).length;
        return scoredCount === TOTAL_DIMENSIONS;
      },

      // Get count of scored dimensions
      getScoredCount: () => {
        const { scores } = get();
        return Object.values(scores).filter((s) => s !== undefined).length;
      },
    }),
    {
      name: 'tool1-alignment-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        scores: state.scores,
        sessionId: state.sessionId,
        completion: state.completion,
      }),
    }
  )
);
