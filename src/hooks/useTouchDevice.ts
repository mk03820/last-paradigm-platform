/**
 * useTouchDevice Hook
 *
 * Detects if the user is on a touch device without hover capability.
 * Used to implement touch-specific interaction patterns.
 *
 * Story 16.4: Premium Card Interactions
 * Task 4: Add touch interaction handling for mobile
 * Covers: AC5 (touch device detection)
 */

'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect touch-primary devices
 *
 * Uses combination of touch capability check and hover media query
 * to accurately detect devices where touch is the primary input.
 *
 * @returns boolean - true if device is touch-primary (no hover capability)
 *
 * @example
 * const isTouchDevice = useTouchDevice();
 *
 * // Implement touch-to-reveal pattern
 * if (isTouchDevice) {
 *   // First tap shows hover state, second tap triggers action
 * }
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') {
      return;
    }

    // Check for touch capability
    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    // Check if hover is not available (true touch device)
    const hoverNone = window.matchMedia('(hover: none)').matches;

    setIsTouch(hasTouch && hoverNone);

    // Listen for changes in hover capability (e.g., tablet with keyboard attached)
    const mediaQuery = window.matchMedia('(hover: none)');
    const handler = (event: MediaQueryListEvent) => {
      setIsTouch(hasTouch && event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isTouch;
}

export default useTouchDevice;
