/**
 * useReducedMotion Hook
 *
 * Detects user's preference for reduced motion using the prefers-reduced-motion
 * media query. When enabled, animations should be disabled or replaced with
 * instant transitions.
 *
 * Story 16.4: Premium Card Interactions
 * Task 6: Accessibility - reduced motion support
 * Covers: AC7 (prefers-reduced-motion support)
 */

'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect user's reduced motion preference
 *
 * @returns boolean - true if user prefers reduced motion
 *
 * @example
 * const reducedMotion = useReducedMotion();
 *
 * // Use with Framer Motion
 * <motion.div
 *   variants={reducedMotion ? {} : cardVariants}
 *   initial={reducedMotion ? false : 'hidden'}
 *   animate="visible"
 * />
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;
