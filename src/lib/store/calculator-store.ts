import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CalculatorStore,
  MeetingAuditInput,
  CalculationResult,
} from '@/types/calculator.types';

/**
 * Calculator session store using Zustand with sessionStorage persistence.
 *
 * Per architecture decision (architecture.md#Session State):
 * - Uses sessionStorage which clears on tab close (NFR11 compliance)
 * - Persist middleware handles serialization automatically
 * - No backend state eliminates GDPR concerns for anonymous users
 *
 * Covers: FR33 (preserve input data), FR35 (restore on return), FR36 (clear on session end)
 */
export const useCalculatorStore = create<CalculatorStore>()(
  persist(
    (set) => ({
      // State
      meetingData: null,
      results: null,
      isCalculating: false,

      // Actions
      setMeetingData: (data: MeetingAuditInput | null) => set({ meetingData: data }),
      setResults: (results: CalculationResult | null) => set({ results }),
      setIsCalculating: (loading: boolean) => set({ isCalculating: loading }),
      clearSession: () =>
        set({
          meetingData: null,
          results: null,
          isCalculating: false,
        }),
    }),
    {
      name: 'calculator-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
