import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DimensionId } from '@/components/tools/alignment/constants';

/**
 * Tool 1 Alignment Assessment Store
 *
 * Manages state for the Organizational Alignment Assessment Matrix.
 * Uses sessionStorage for persistence (clears on tab close).
 *
 * Story 9.1: Alignment Dimension Scoring Interface
 * Story 9.4: Score Interpretation and Next Steps
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

export interface Tool1State {
  // Scores for each dimension (1-4)
  scores: Tool1Scores;
  // Server session ID for sync (if authenticated)
  sessionId: string | null;
  // Track if data needs server sync
  isDirty: boolean;
  // Completion tracking
  completion: Tool1CompletionData | null;

  // Actions
  setScore: (dimension: DimensionId, score: number) => void;
  setScores: (scores: Tool1Scores) => void;
  resetTool1: () => void;
  setSessionId: (id: string | null) => void;
  markComplete: (compositeScore: number) => void;

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
      },

      // Set multiple scores at once
      setScores: (scores: Tool1Scores) => {
        set({ scores, isDirty: true, completion: null });
      },

      // Reset all Tool 1 data
      resetTool1: () => {
        set({
          scores: {},
          isDirty: false,
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
