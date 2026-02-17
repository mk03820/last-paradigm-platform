/**
 * useWindowSize Hook
 *
 * Returns the current window dimensions and updates on resize.
 * Used for responsive canvas-based animations like confetti.
 *
 * Story 17.6: Purchase Success Page
 * Task 2.2: Support confetti animation with window dimensions
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Window size object
 */
interface WindowSize {
  width: number;
  height: number;
}

/**
 * Hook to get current window size
 *
 * @returns Object with width and height of the window
 *
 * @example
 * const { width, height } = useWindowSize();
 * <Confetti width={width} height={height} />
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') {
      return;
    }

    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Set initial size
    handleResize();

    // Add event listener with passive option for performance
    window.addEventListener('resize', handleResize, { passive: true });

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export default useWindowSize;
