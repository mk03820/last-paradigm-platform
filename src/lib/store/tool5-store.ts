import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  DataJourney,
  DataStage,
  JourneyTemplate,
} from '@/components/tools/data-flow/journey-constants';
import {
  generateJourneyId,
  generateStageId,
  getJourneyTemplate,
  calculateTotalLatency,
} from '@/components/tools/data-flow/journey-constants';
import type { FrictionPoint } from '@/components/tools/data-flow/friction-constants';
import { generateFrictionId } from '@/components/tools/data-flow/friction-constants';
import type {
  FrictionCost,
  FrictionPointWithCost,
} from '@/components/tools/data-flow/cost-constants';
import {
  calculateFrictionPointCost,
  calculateJourneyCost,
  calculateEnterpriseTotalCost,
  calculateCostByCategory,
  calculateCostBreakdown,
} from '@/components/tools/data-flow/cost-constants';
import type { SessionSyncStore } from '@/components/session';

/**
 * Tool 5 Data Flow Friction Analysis Store
 *
 * Manages state for the Data Flow Friction Analysis tool.
 * Uses sessionStorage for persistence (clears on tab close).
 *
 * Story 12.1: Data Journey Mapping Interface
 * C3-S6: Server sync for session persistence
 * Covers: AC1-AC5 (journey CRUD, stages, templates)
 *
 * Story 12.2: Friction Point Identification
 * Covers: FR2-22 (friction CRUD, severity scoring)
 *
 * Story 12.3: Friction Cost Calculation
 * Covers: FR2-23 (cost estimation, FTE + opportunity)
 */

export interface Tool5CompletionData {
  completedAt: string;
  journeyCount: number;
  totalStages: number;
  totalLatencyHours: number;
}

export interface Tool5State extends SessionSyncStore {
  // Journey list
  journeys: DataJourney[];
  // Currently selected journey for editing
  activeJourneyId: string | null;
  // Server session ID for sync (if authenticated)
  sessionId: string | null;
  // Track if data needs server sync
  isDirty: boolean;
  // Track if currently syncing to server
  isSyncing: boolean;
  // Completion tracking
  completion: Tool5CompletionData | null;
  // Friction points for all journeys (with optional cost data)
  frictionPoints: FrictionPointWithCost[];

  // Journey CRUD
  addJourney: (journey: Omit<DataJourney, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateJourney: (id: string, updates: Partial<Omit<DataJourney, 'id' | 'createdAt'>>) => void;
  removeJourney: (id: string) => void;
  setActiveJourney: (id: string | null) => void;

  // Stage CRUD
  addStage: (journeyId: string, stage: Omit<DataStage, 'id'>) => string;
  updateStage: (journeyId: string, stageId: string, updates: Partial<Omit<DataStage, 'id'>>) => void;
  removeStage: (journeyId: string, stageId: string) => void;
  reorderStages: (journeyId: string, stageIds: string[]) => void;

  // Friction CRUD
  addFrictionPoint: (point: Omit<FrictionPointWithCost, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateFrictionPoint: (id: string, updates: Partial<Omit<FrictionPointWithCost, 'id' | 'createdAt'>>) => void;
  removeFrictionPoint: (id: string) => void;

  // Cost management
  updateFrictionCost: (frictionId: string, cost: FrictionCost | null) => void;

  // Template
  applyTemplate: (templateId: string, journeyName?: string) => string | null;

  // Session
  setSessionId: (id: string | null) => void;

  // Session sync methods (implements SessionSyncStore)
  syncToServer: () => Promise<void>;
  loadFromServer: (sessionId: string) => Promise<boolean>;

  // Completion
  markComplete: () => void;
  resetTool5: () => void;

  // Computed helpers
  getJourneyCount: () => number;
  getActiveJourney: () => DataJourney | undefined;
  getTotalLatency: () => number;
  getFrictionPointsByJourney: (journeyId: string) => FrictionPointWithCost[];
  getFrictionPointsByStage: (stageId: string) => FrictionPointWithCost[];
  getTotalFrictionCount: () => number;

  // Cost calculations
  getFrictionPointCost: (frictionId: string) => number;
  getJourneyCost: (journeyId: string) => number;
  getEnterpriseTotalCost: () => number;
  getCostByCategory: () => Record<string, number>;
  getCostBreakdown: () => { fteCost: number; opportunityCost: number; total: number };
}

export const useTool5Store = create<Tool5State>()(
  persist(
    (set, get) => ({
      // Initial state
      journeys: [],
      activeJourneyId: null,
      sessionId: null,
      isDirty: false,
      isSyncing: false,
      completion: null,
      frictionPoints: [],

      // Add a new journey
      addJourney: (journey) => {
        const id = generateJourneyId();
        const now = new Date().toISOString();
        const stagesWithIds = journey.stages.map((stage) => ({
          ...stage,
          id: generateStageId(),
        }));

        set((state) => ({
          journeys: [
            ...state.journeys,
            {
              ...journey,
              id,
              stages: stagesWithIds,
              createdAt: now,
              updatedAt: now,
            },
          ],
          activeJourneyId: id,
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

      // Update an existing journey
      updateJourney: (id, updates) => {
        set((state) => ({
          journeys: state.journeys.map((j) =>
            j.id === id
              ? { ...j, ...updates, updatedAt: new Date().toISOString() }
              : j
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

      // Remove a journey (also removes associated friction points)
      removeJourney: (id) => {
        set((state) => ({
          journeys: state.journeys.filter((j) => j.id !== id),
          frictionPoints: state.frictionPoints.filter((fp) => fp.journeyId !== id),
          activeJourneyId:
            state.activeJourneyId === id ? null : state.activeJourneyId,
          isDirty: true,
          completion: null,
        }));
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // Set the active journey for editing
      setActiveJourney: (id) => {
        set({ activeJourneyId: id });
      },

      // Add a stage to a journey
      addStage: (journeyId, stage) => {
        const stageId = generateStageId();

        set((state) => ({
          journeys: state.journeys.map((j) =>
            j.id === journeyId
              ? {
                  ...j,
                  stages: [...j.stages, { ...stage, id: stageId }],
                  updatedAt: new Date().toISOString(),
                }
              : j
          ),
          isDirty: true,
          completion: null,
        }));

        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }

        return stageId;
      },

      // Update a stage
      updateStage: (journeyId, stageId, updates) => {
        set((state) => ({
          journeys: state.journeys.map((j) =>
            j.id === journeyId
              ? {
                  ...j,
                  stages: j.stages.map((s) =>
                    s.id === stageId ? { ...s, ...updates } : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : j
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

      // Remove a stage (also removes associated friction points)
      removeStage: (journeyId, stageId) => {
        set((state) => ({
          journeys: state.journeys.map((j) =>
            j.id === journeyId
              ? {
                  ...j,
                  stages: j.stages.filter((s) => s.id !== stageId),
                  updatedAt: new Date().toISOString(),
                }
              : j
          ),
          frictionPoints: state.frictionPoints.filter((fp) => fp.stageId !== stageId),
          isDirty: true,
          completion: null,
        }));
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // Reorder stages within a journey
      reorderStages: (journeyId, stageIds) => {
        set((state) => ({
          journeys: state.journeys.map((j) => {
            if (j.id !== journeyId) return j;

            const stageMap = new Map(j.stages.map((s) => [s.id, s]));
            const reorderedStages = stageIds
              .map((id, index) => {
                const stage = stageMap.get(id);
                return stage ? { ...stage, order: index } : null;
              })
              .filter((s): s is DataStage => s !== null);

            return {
              ...j,
              stages: reorderedStages,
              updatedAt: new Date().toISOString(),
            };
          }),
          isDirty: true,
          completion: null,
        }));
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // Add a friction point
      addFrictionPoint: (point) => {
        const id = generateFrictionId();
        const now = new Date().toISOString();

        set((state) => ({
          frictionPoints: [
            ...state.frictionPoints,
            {
              ...point,
              id,
              createdAt: now,
              updatedAt: now,
            },
          ],
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

      // Update a friction point
      updateFrictionPoint: (id, updates) => {
        set((state) => ({
          frictionPoints: state.frictionPoints.map((fp) =>
            fp.id === id
              ? { ...fp, ...updates, updatedAt: new Date().toISOString() }
              : fp
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

      // Remove a friction point
      removeFrictionPoint: (id) => {
        set((state) => ({
          frictionPoints: state.frictionPoints.filter((fp) => fp.id !== id),
          isDirty: true,
          completion: null,
        }));
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId) {
          state.syncToServer();
        }
      },

      // Update cost data for a friction point
      updateFrictionCost: (frictionId, cost) => {
        set((state) => ({
          frictionPoints: state.frictionPoints.map((fp) =>
            fp.id === frictionId
              ? { ...fp, cost, updatedAt: new Date().toISOString() }
              : fp
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

      // Apply a template to create a new journey
      applyTemplate: (templateId, journeyName) => {
        const template = getJourneyTemplate(templateId);
        if (!template) return null;

        const id = generateJourneyId();
        const now = new Date().toISOString();
        const stagesWithIds = template.stages.map((stage) => ({
          ...stage,
          id: generateStageId(),
        }));

        set((state) => ({
          journeys: [
            ...state.journeys,
            {
              id,
              name: journeyName || template.name,
              description: template.description,
              stages: stagesWithIds,
              createdAt: now,
              updatedAt: now,
            },
          ],
          activeJourneyId: id,
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

      // Set server session ID
      setSessionId: (id) => {
        set({ sessionId: id });
      },

      // Mark tool as complete
      markComplete: () => {
        const { journeys } = get();
        const totalStages = journeys.reduce((sum, j) => sum + j.stages.length, 0);
        const totalLatencyHours = journeys.reduce(
          (sum, j) => sum + calculateTotalLatency(j.stages),
          0
        );

        set({
          completion: {
            completedAt: new Date().toISOString(),
            journeyCount: journeys.length,
            totalStages,
            totalLatencyHours,
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
                tool5: {
                  journeys: state.journeys,
                  frictionCost: state.frictionPoints,
                  totalFrictionCost: calculateEnterpriseTotalCost(state.frictionPoints),
                  completedAt: state.completion?.completedAt,
                },
              },
            }),
          });

          if (response.ok) {
            set({ isDirty: false });
          }
        } catch (error) {
          console.error('[tool5-store] Failed to sync to server:', error);
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
            const tool5Data = session.data?.tool5;

            if (tool5Data) {
              set({
                sessionId,
                journeys: tool5Data.journeys || [],
                frictionPoints: tool5Data.frictionCost || [],
                completion: tool5Data.completedAt
                  ? {
                      completedAt: tool5Data.completedAt,
                      journeyCount: tool5Data.journeys?.length || 0,
                      totalStages: (tool5Data.journeys || []).reduce(
                        (sum: number, j: DataJourney) => sum + j.stages.length,
                        0
                      ),
                      totalLatencyHours: (tool5Data.journeys || []).reduce(
                        (sum: number, j: DataJourney) => sum + calculateTotalLatency(j.stages),
                        0
                      ),
                    }
                  : null,
                isDirty: false,
              });
              return true;
            }

            // Session exists but no tool5 data
            set({ sessionId, isDirty: false });
            return true;
          }

          return false;
        } catch (error) {
          console.error('[tool5-store] Failed to load from server:', error);
          return false;
        } finally {
          set({ isSyncing: false });
        }
      },

      // Reset all Tool 5 data
      resetTool5: () => {
        set({
          journeys: [],
          activeJourneyId: null,
          frictionPoints: [],
          isDirty: false,
          isSyncing: false,
          completion: null,
        });
      },

      // Get journey count
      getJourneyCount: () => {
        return get().journeys.length;
      },

      // Get the currently active journey
      getActiveJourney: () => {
        const { journeys, activeJourneyId } = get();
        return journeys.find((j) => j.id === activeJourneyId);
      },

      // Get total latency across all journeys
      getTotalLatency: () => {
        const { journeys } = get();
        return journeys.reduce(
          (sum, j) => sum + calculateTotalLatency(j.stages),
          0
        );
      },

      // Get friction points for a specific journey
      getFrictionPointsByJourney: (journeyId) => {
        const { frictionPoints } = get();
        return frictionPoints.filter((fp) => fp.journeyId === journeyId);
      },

      // Get friction points for a specific stage
      getFrictionPointsByStage: (stageId) => {
        const { frictionPoints } = get();
        return frictionPoints.filter((fp) => fp.stageId === stageId);
      },

      // Get total friction point count
      getTotalFrictionCount: () => {
        return get().frictionPoints.length;
      },

      // Get cost for a specific friction point
      getFrictionPointCost: (frictionId) => {
        const { frictionPoints } = get();
        const point = frictionPoints.find((fp) => fp.id === frictionId);
        return point ? calculateFrictionPointCost(point) : 0;
      },

      // Get total cost for a journey
      getJourneyCost: (journeyId) => {
        const { frictionPoints } = get();
        const journeyPoints = frictionPoints.filter((fp) => fp.journeyId === journeyId);
        return calculateJourneyCost(journeyPoints);
      },

      // Get enterprise-wide total cost
      getEnterpriseTotalCost: () => {
        const { frictionPoints } = get();
        return calculateEnterpriseTotalCost(frictionPoints);
      },

      // Get cost breakdown by category
      getCostByCategory: () => {
        const { frictionPoints } = get();
        return calculateCostByCategory(frictionPoints);
      },

      // Get FTE vs opportunity cost breakdown
      getCostBreakdown: () => {
        const { frictionPoints } = get();
        return calculateCostBreakdown(frictionPoints);
      },
    }),
    {
      name: 'tool5-data-flow-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        journeys: state.journeys,
        activeJourneyId: state.activeJourneyId,
        sessionId: state.sessionId,
        completion: state.completion,
        frictionPoints: state.frictionPoints,
      }),
    }
  )
);
