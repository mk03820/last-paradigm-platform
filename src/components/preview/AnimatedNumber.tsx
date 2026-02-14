/**
 * Animated Number Component
 *
 * Displays a number with count-up animation using Framer Motion.
 * Respects prefers-reduced-motion for accessibility.
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Task 3.2: Implement animated count-up effect using Framer Motion
 * Covers: AC2, AC7 (Animation with accessibility)
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { formatSavingsAmount, formatPercentage } from '@/lib/services/savings-calculator';

interface AnimatedNumberProps {
  /** The target value to animate to */
  value: number;
  /** Format type for display */
  format: 'currency' | 'percent';
  /** Animation duration in seconds (default 1.5) */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AnimatedNumber - Displays a number with count-up animation
 *
 * Features:
 * - Smooth spring animation using Framer Motion
 * - Respects prefers-reduced-motion
 * - Accessible via aria-live for screen readers
 * - Supports currency ($X.XM) and percentage (X.X%) formats
 */
export function AnimatedNumber({
  value,
  format,
  duration = 1.5,
  className = '',
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState('');
  const hasAnimated = useRef(false);

  // Create spring animation
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    duration: duration * 1000,
  });

  // Transform spring value to formatted string
  const transform = useTransform(spring, (current) => {
    if (format === 'currency') {
      return formatSavingsAmount(current);
    }
    return formatPercentage(current);
  });

  // Subscribe to transform updates
  useEffect(() => {
    const unsubscribe = transform.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [transform]);

  // Trigger animation when value changes
  useEffect(() => {
    if (prefersReducedMotion) {
      // Skip animation for users who prefer reduced motion
      spring.jump(value);
      setDisplayValue(
        format === 'currency' ? formatSavingsAmount(value) : formatPercentage(value)
      );
    } else {
      // Start from 0 on first animation
      if (!hasAnimated.current) {
        spring.jump(0);
        hasAnimated.current = true;
      }
      spring.set(value);
    }
  }, [value, spring, prefersReducedMotion, format]);

  // Set initial display value
  useEffect(() => {
    if (!displayValue) {
      setDisplayValue(
        format === 'currency' ? formatSavingsAmount(0) : formatPercentage(0)
      );
    }
  }, [displayValue, format]);

  return (
    <motion.span
      className={`tabular-nums ${className}`}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {displayValue}
    </motion.span>
  );
}
