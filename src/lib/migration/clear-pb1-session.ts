/**
 * PB1 Session Cleanup Utility
 *
 * Clears all PB1 session data from Zustand stores after successful migration.
 * Preserves any non-PB1 session data (e.g., auth state).
 *
 * Story 15.7: PB1 Data Migration to Database
 * Task 6: Create Session Cleanup Utility
 *
 * Covers: AC4 (Clear session storage after successful migration)
 */

import { useCalculatorStore } from '@/lib/store/calculator-store';
import { useTool1Store } from '@/lib/store/tool1-store';
import { useTool3Store } from '@/lib/store/tool3-store';
import { useTool4Store } from '@/lib/store/tool4-store';
import { useTool5Store } from '@/lib/store/tool5-store';
import { useTool6Store } from '@/lib/store/tool6-store';
import { useTool7Store } from '@/lib/store/tool7-store';

/**
 * Result of session cleanup operation
 */
export interface ClearSessionResult {
  success: boolean;
  clearedStores: string[];
  errors: Array<{ store: string; error: string }>;
}

/**
 * Clear Tool 1 (Alignment Assessment) store
 */
export function clearTool1Store(): void {
  try {
    useTool1Store.getState().resetTool1();
  } catch (error) {
    console.warn('[clear-pb1-session] Failed to clear Tool 1 store:', error);
    throw error;
  }
}

/**
 * Clear Tool 2 (Meeting Audit/Calculator) store
 */
export function clearTool2Store(): void {
  try {
    useCalculatorStore.getState().clearSession();
  } catch (error) {
    console.warn('[clear-pb1-session] Failed to clear Tool 2 store:', error);
    throw error;
  }
}

/**
 * Clear Tool 3 (Decision Velocity) store
 */
export function clearTool3Store(): void {
  try {
    useTool3Store.getState().resetTool3();
  } catch (error) {
    console.warn('[clear-pb1-session] Failed to clear Tool 3 store:', error);
    throw error;
  }
}

/**
 * Clear Tool 4 (Stakeholder Mapping) store
 */
export function clearTool4Store(): void {
  try {
    useTool4Store.getState().resetTool4();
  } catch (error) {
    console.warn('[clear-pb1-session] Failed to clear Tool 4 store:', error);
    throw error;
  }
}

/**
 * Clear Tool 5 (Data Flow Friction) store
 */
export function clearTool5Store(): void {
  try {
    useTool5Store.getState().resetTool5();
  } catch (error) {
    console.warn('[clear-pb1-session] Failed to clear Tool 5 store:', error);
    throw error;
  }
}

/**
 * Clear Tool 6 (Communication Pattern) store
 */
export function clearTool6Store(): void {
  try {
    useTool6Store.getState().resetTool6();
  } catch (error) {
    console.warn('[clear-pb1-session] Failed to clear Tool 6 store:', error);
    throw error;
  }
}

/**
 * Clear Tool 7 (Total Cost) store
 */
export function clearTool7Store(): void {
  try {
    useTool7Store.getState().resetTool7();
  } catch (error) {
    console.warn('[clear-pb1-session] Failed to clear Tool 7 store:', error);
    throw error;
  }
}

/**
 * Clear all PB1 session stores
 *
 * Clears all 7 tool stores in sequence, tracking success/failure for each.
 * Returns detailed result with list of cleared stores and any errors.
 *
 * @returns ClearSessionResult with success status and details
 */
export function clearAllPB1Stores(): ClearSessionResult {
  const clearedStores: string[] = [];
  const errors: Array<{ store: string; error: string }> = [];

  const stores = [
    { name: 'tool1', clear: clearTool1Store },
    { name: 'tool2', clear: clearTool2Store },
    { name: 'tool3', clear: clearTool3Store },
    { name: 'tool4', clear: clearTool4Store },
    { name: 'tool5', clear: clearTool5Store },
    { name: 'tool6', clear: clearTool6Store },
    { name: 'tool7', clear: clearTool7Store },
  ];

  for (const store of stores) {
    try {
      store.clear();
      clearedStores.push(store.name);
    } catch (error) {
      errors.push({
        store: store.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Also clear the sessionStorage keys directly for extra safety
  try {
    const sessionStorageKeys = [
      'tool1-alignment-session',
      'calculator-session',
      'tool3-decision-velocity-session',
      'tool4-stakeholder-map-session',
      'tool5-data-flow-session',
      'tool6-communication-session',
      'tool7-total-cost-session',
    ];

    for (const key of sessionStorageKeys) {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn('[clear-pb1-session] Failed to clear sessionStorage:', error);
    // Don't fail the operation for this - stores were already cleared
  }

  return {
    success: errors.length === 0,
    clearedStores,
    errors,
  };
}

/**
 * Check if session has any PB1 data
 *
 * Useful for determining if migration is needed.
 *
 * @returns true if any PB1 store has data
 */
export function hasPB1SessionData(): boolean {
  try {
    const tool1 = useTool1Store.getState();
    const tool2 = useCalculatorStore.getState();
    const tool3 = useTool3Store.getState();
    const tool4 = useTool4Store.getState();
    const tool5 = useTool5Store.getState();
    const tool6 = useTool6Store.getState();
    const tool7 = useTool7Store.getState();

    // Check Tool 1: has scores
    if (Object.values(tool1.scores).some((s) => s !== undefined)) {
      return true;
    }

    // Check Tool 2: has meeting data or results
    if (tool2.meetingData || tool2.results) {
      return true;
    }

    // Check Tool 3: has samples
    if (Object.values(tool3.archetypes).some((a) => a.samples.length > 0)) {
      return true;
    }

    // Check Tool 4: has stakeholders
    if (tool4.stakeholders.length > 0) {
      return true;
    }

    // Check Tool 5: has journeys or friction points
    if (tool5.journeys.length > 0 || tool5.frictionPoints.length > 0) {
      return true;
    }

    // Check Tool 6: has metrics
    if (tool6.email || tool6.chat || tool6.meetings) {
      return true;
    }

    // Check Tool 7: has aggregated data or results
    if (tool7.aggregatedData || tool7.calculationResults) {
      return true;
    }

    return false;
  } catch (error) {
    console.warn('[clear-pb1-session] Error checking for PB1 data:', error);
    return false;
  }
}
