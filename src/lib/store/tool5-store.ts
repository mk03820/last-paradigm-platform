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

/**
 * Tool 5 Data Flow Friction Analysis Store
 *
 * Manages state for the Data Flow Friction Analysis tool.
 * Uses sessionStorage for persistence (clears on tab close).
 *
 * Story 12.1: Data Journey Mapping Interface
 * Covers: AC1-AC5 (journey CRUD, stages, templates)
 */

export interface Tool5CompletionData {
  completedAt: string;
  journeyCount: number;
  totalStages: number;
  totalLatencyHours: number;
}

export interface Tool5State {
  // Journey list
  journeys: DataJourney[];
  // Currently selected journey for editing
  activeJourneyId: string | null;
  // Server session ID for sync (if authenticated)
  sessionId: string | null;
  // Track if data needs server sync
  isDirty: boolean;
  // Completion tracking
  completion: Tool5CompletionData | null;

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

  // Template
  applyTemplate: (templateId: string, journeyName?: string) => string | null;

  // Session
  setSessionId: (id: string | null) => void;

  // Completion
  markComplete: () => void;
  resetTool5: () => void;

  // Computed helpers
  getJourneyCount: () => number;
  getActiveJourney: () => DataJourney | undefined;
  getTotalLatency: () => number;
}

export const useTool5Store = create<Tool5State>()(
  persist(
    (set, get) => ({
      // Initial state
      journeys: [],
      activeJourneyId: null,
      sessionId: null,
      isDirty: false,
      completion: null,

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
      },

      // Remove a journey
      removeJourney: (id) => {
        set((state) => ({
          journeys: state.journeys.filter((j) => j.id !== id),
          activeJourneyId:
            state.activeJourneyId === id ? null : state.activeJourneyId,
          isDirty: true,
          completion: null,
        }));
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
      },

      // Remove a stage
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
          isDirty: true,
          completion: null,
        }));
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
      },

      // Reset all Tool 5 data
      resetTool5: () => {
        set({
          journeys: [],
          activeJourneyId: null,
          isDirty: false,
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
    }),
    {
      name: 'tool5-data-flow-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        journeys: state.journeys,
        activeJourneyId: state.activeJourneyId,
        sessionId: state.sessionId,
        completion: state.completion,
      }),
    }
  )
);
