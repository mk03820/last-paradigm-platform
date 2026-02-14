/**
 * useStaggeredReveal Hook
 *
 * Custom hook using Intersection Observer to trigger staggered reveal
 * animations when elements enter the viewport.
 *
 * Story 16.4: Premium Card Interactions
 * Task 2: Implement card entry animations with stagger
 * Covers: AC2 (staggered reveal pattern with 50ms delay)
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseStaggeredRevealOptions {
  /**
   * Delay between each item's animation (in ms)
   * @default 50
   */
  staggerDelay?: number;

  /**
   * Intersection Observer threshold (0-1)
   * @default 0.1
   */
  threshold?: number;

  /**
   * Root margin for intersection observer
   * @default '0px 0px -50px 0px'
   */
  rootMargin?: string;

  /**
   * Whether to only trigger animation once
   * @default true
   */
  triggerOnce?: boolean;

  /**
   * Whether animations are disabled (e.g., reduced motion)
   * @default false
   */
  disabled?: boolean;
}

interface UseStaggeredRevealReturn {
  /**
   * Ref to attach to the container element
   */
  containerRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Whether items should be visible
   */
  isVisible: boolean;

  /**
   * Calculate delay for a specific item index
   */
  getDelay: (index: number) => number;
}

/**
 * Hook for implementing staggered reveal animations on element groups
 *
 * @param options - Configuration options for the staggered reveal
 * @returns Object containing container ref, visibility state, and delay calculator
 *
 * @example
 * const { containerRef, isVisible, getDelay } = useStaggeredReveal({
 *   staggerDelay: 50,
 *   threshold: 0.1,
 * });
 *
 * return (
 *   <div ref={containerRef}>
 *     {items.map((item, index) => (
 *       <motion.div
 *         key={item.id}
 *         initial={{ opacity: 0, y: 20 }}
 *         animate={isVisible ? { opacity: 1, y: 0 } : undefined}
 *         transition={{ delay: getDelay(index), duration: 0.3 }}
 *       >
 *         {item.content}
 *       </motion.div>
 *     ))}
 *   </div>
 * );
 */
export function useStaggeredReveal(
  options: UseStaggeredRevealOptions = {}
): UseStaggeredRevealReturn {
  const {
    staggerDelay = 50,
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    disabled = false,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // If disabled, show immediately without animation
    if (disabled) {
      setIsVisible(true);
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Skip if already triggered and triggerOnce is enabled
    if (triggerOnce && hasTriggeredRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            hasTriggeredRef.current = true;

            // Disconnect if only triggering once
            if (triggerOnce) {
              observer.disconnect();
            }
          } else if (!triggerOnce) {
            // Reset visibility when element leaves viewport (if not triggerOnce)
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, disabled]);

  /**
   * Calculate animation delay for a specific item
   * Converts staggerDelay from ms to seconds for Framer Motion
   */
  const getDelay = useCallback(
    (index: number): number => {
      if (disabled) {
        return 0;
      }
      return (index * staggerDelay) / 1000;
    },
    [staggerDelay, disabled]
  );

  return {
    containerRef,
    isVisible,
    getDelay,
  };
}

export default useStaggeredReveal;
