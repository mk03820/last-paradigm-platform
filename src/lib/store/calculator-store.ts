import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CalculatorStore,
  MeetingAuditInput,
  CalculationResult,
} from '@/types/calculator.types';

/**
 * Extended calculator store with session sync capabilities
 */
export interface ExtendedCalculatorStore extends CalculatorStore {
  // Server session ID (null for anonymous users)
  sessionId: string | null;
  // Track if data needs to be synced to server
  isDirty: boolean;
  // Track if currently syncing
  isSyncing: boolean;

  // Extended actions
  setSessionId: (id: string | null) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsSyncing: (syncing: boolean) => void;

  // Session sync functions
  syncToServer: () => Promise<void>;
  loadFromServer: (sessionId: string) => Promise<boolean>;
  migrateToServer: () => Promise<string | null>;
}

/**
 * Calculator session store using Zustand with sessionStorage persistence.
 *
 * Per architecture decision (architecture.md#Session State):
 * - Uses sessionStorage which clears on tab close (NFR11 compliance)
 * - Persist middleware handles serialization automatically
 * - No backend state eliminates GDPR concerns for anonymous users
 *
 * Extended for Story 8.3:
 * - Supports server-side session sync for authenticated users
 * - Migration flow for anonymous to authenticated transition
 *
 * Covers: FR33 (preserve input data), FR35 (restore on return), FR36 (clear on session end)
 * Story 8.3: FR2-4 (Cross-device continuity), FR2-5 (Anonymous access)
 */
export const useCalculatorStore = create<ExtendedCalculatorStore>()(
  persist(
    (set, get) => ({
      // State
      meetingData: null,
      results: null,
      isCalculating: false,
      sessionId: null,
      isDirty: false,
      isSyncing: false,

      // Basic actions
      setMeetingData: (data: MeetingAuditInput | null) => {
        set({ meetingData: data, isDirty: true });
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId && data) {
          state.syncToServer();
        }
      },
      setResults: (results: CalculationResult | null) => {
        set({ results, isDirty: true });
        // Auto-sync if we have a session ID
        const state = get();
        if (state.sessionId && results) {
          state.syncToServer();
        }
      },
      setIsCalculating: (loading: boolean) => set({ isCalculating: loading }),
      clearSession: () =>
        set({
          meetingData: null,
          results: null,
          isCalculating: false,
          sessionId: null,
          isDirty: false,
          isSyncing: false,
        }),

      // Extended actions
      setSessionId: (id: string | null) => set({ sessionId: id }),
      setIsDirty: (dirty: boolean) => set({ isDirty: dirty }),
      setIsSyncing: (syncing: boolean) => set({ isSyncing: syncing }),

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
                tool2: {
                  inputs: state.meetingData,
                  results: state.results ? {
                    totalMeetingHours: 0,
                    totalMeetingCost: 0,
                    wastedHours: 0,
                    wastedCost: state.results.meetingWaste,
                    effectiveHours: 0,
                    effectiveCost: 0,
                  } : undefined,
                  completedAt: state.results?.calculatedAt,
                },
              },
            }),
          });

          if (response.ok) {
            set({ isDirty: false });
          }
        } catch (error) {
          console.error('[calculator-store] Failed to sync to server:', error);
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
            const tool2Data = session.data?.tool2;

            if (tool2Data) {
              set({
                sessionId,
                meetingData: tool2Data.inputs || null,
                results: tool2Data.completedAt ? {
                  meetingWaste: tool2Data.results?.wastedCost || 0,
                  estimatedAlignmentTaxMin: (tool2Data.results?.wastedCost || 0) / 0.30,
                  estimatedAlignmentTaxMax: (tool2Data.results?.wastedCost || 0) / 0.25,
                  inputs: tool2Data.inputs,
                  calculatedAt: tool2Data.completedAt,
                } : null,
                isDirty: false,
              });
              return true;
            }

            // Session exists but no tool2 data
            set({ sessionId, isDirty: false });
            return true;
          }

          return false;
        } catch (error) {
          console.error('[calculator-store] Failed to load from server:', error);
          return false;
        } finally {
          set({ isSyncing: false });
        }
      },

      /**
       * Migrate current anonymous session to server
       * Returns the new session ID or null on failure
       */
      migrateToServer: async () => {
        const state = get();

        // Nothing to migrate
        if (!state.meetingData && !state.results) {
          return null;
        }

        set({ isSyncing: true });

        try {
          const response = await fetch('/api/sessions/migrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              meetingData: state.meetingData,
              results: state.results,
            }),
          });

          const data = await response.json();

          if (data.success && data.data?.session) {
            const newSessionId = data.data.session.id;
            set({ sessionId: newSessionId, isDirty: false });
            return newSessionId;
          }

          return null;
        } catch (error) {
          console.error('[calculator-store] Failed to migrate to server:', error);
          return null;
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'calculator-session',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist these fields to sessionStorage
      partialize: (state) => ({
        meetingData: state.meetingData,
        results: state.results,
        sessionId: state.sessionId,
      }),
    }
  )
);
