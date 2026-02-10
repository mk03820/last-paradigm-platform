'use client';

/**
 * Guidance Preference Hook
 *
 * Story 8.7: Guided Diagnostic Flow
 * Task 3: Create useGuidancePreference hook (AC: 7, 8)
 *
 * Manages user preferences for dismissing tool guidance.
 * Stores dismissed state in localStorage per tool.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'lpp-guidance-dismissed-';

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get the storage key for a tool
 */
function getStorageKey(toolId: string): string {
  return `${STORAGE_KEY_PREFIX}${toolId}`;
}

/**
 * Hook to manage guidance dismiss preferences
 *
 * @param toolId - The tool ID to check/set preference for
 * @returns Object with isDismissed state and dismiss function
 */
export function useGuidancePreference(toolId: string) {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    if (!isBrowser()) {
      setIsLoading(false);
      return;
    }

    try {
      const key = getStorageKey(toolId);
      const stored = localStorage.getItem(key);
      setIsDismissed(stored === 'true');
    } catch {
      // localStorage may be unavailable (private browsing, etc.)
      setIsDismissed(false);
    }
    setIsLoading(false);
  }, [toolId]);

  // Dismiss the guidance and save preference
  const dismiss = useCallback(() => {
    if (!isBrowser()) return;

    try {
      const key = getStorageKey(toolId);
      localStorage.setItem(key, 'true');
      setIsDismissed(true);
    } catch {
      // localStorage may be unavailable
      setIsDismissed(true);
    }
  }, [toolId]);

  // Reset the preference (for testing or user preference reset)
  const reset = useCallback(() => {
    if (!isBrowser()) return;

    try {
      const key = getStorageKey(toolId);
      localStorage.removeItem(key);
      setIsDismissed(false);
    } catch {
      setIsDismissed(false);
    }
  }, [toolId]);

  return {
    isDismissed,
    isLoading,
    dismiss,
    reset,
  };
}

/**
 * Check if guidance is dismissed for a tool (non-reactive)
 * Useful for initial render decisions
 */
export function isGuidanceDismissed(toolId: string): boolean {
  if (!isBrowser()) return false;

  try {
    const key = getStorageKey(toolId);
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

/**
 * Dismiss guidance for a tool (non-reactive)
 * Useful for programmatic dismissal
 */
export function dismissGuidance(toolId: string): void {
  if (!isBrowser()) return;

  try {
    const key = getStorageKey(toolId);
    localStorage.setItem(key, 'true');
  } catch {
    // Ignore errors
  }
}

/**
 * Reset all guidance preferences
 * Useful for testing or user preference reset
 */
export function resetAllGuidancePreferences(): void {
  if (!isBrowser()) return;

  try {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(STORAGE_KEY_PREFIX)
    );
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore errors
  }
}
