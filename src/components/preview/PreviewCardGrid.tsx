/**
 * PreviewCardGrid Component
 *
 * Responsive grid of preview cards with staggered entry animations.
 * Orchestrates the animation timing for multiple cards entering the viewport.
 *
 * Story 16.4: Premium Card Interactions
 * Task 2: Implement card entry animations with stagger
 * Covers: AC2 (staggered reveal pattern with 50ms delay between cards)
 */

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { PreviewCard, type PreviewToolData } from './PreviewCard';
import { useStaggeredReveal } from '@/hooks/useStaggeredReveal';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface PreviewCardGridProps {
  /**
   * Array of tools to display
   */
  tools: PreviewToolData[];

  /**
   * Whether cards are blurred (locked)
   * @default true
   */
  isBlurred?: boolean;

  /**
   * Stagger delay between cards in milliseconds
   * @default 50
   */
  staggerDelay?: number;

  /**
   * Custom purchase URL for unlock prompts
   */
  purchaseUrl?: string;

  /**
   * Custom CSS classes for the grid container
   */
  className?: string;

  /**
   * Whether the grid is in loading state
   */
  isLoading?: boolean;
}

/**
 * Loading skeleton for preview cards
 */
function PreviewCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-slate-50 p-6">
      <div className="mb-3 h-8 w-8 rounded-full bg-slate-200" />
      <div className="mb-2 h-6 w-3/4 rounded bg-slate-200" />
      <div className="mb-3 h-4 w-1/2 rounded bg-slate-200" />
      <div className="h-3 w-16 rounded bg-slate-200" />
    </div>
  );
}

/**
 * Container animation variants
 */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export function PreviewCardGrid({
  tools,
  isBlurred = true,
  staggerDelay = 50,
  purchaseUrl,
  className,
  isLoading = false,
}: PreviewCardGridProps) {
  const reducedMotion = useReducedMotion();
  const { containerRef, isVisible, getDelay } = useStaggeredReveal({
    staggerDelay,
    threshold: 0.1,
    triggerOnce: true,
    disabled: reducedMotion,
  });

  // Show loading skeletons
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
          className
        )}
        aria-busy="true"
        aria-label="Loading preview cards"
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <PreviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (!tools || tools.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-slate-500">No preview tools available.</p>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
      variants={reducedMotion ? undefined : containerVariants}
      initial={reducedMotion ? false : 'hidden'}
      animate={isVisible ? 'visible' : 'hidden'}
      role="list"
      aria-label="PB2 Tool Previews"
    >
      {tools.map((tool, index) => (
        <div key={tool.id} role="listitem">
          <PreviewCard
            tool={tool}
            isBlurred={isBlurred}
            delay={getDelay(index)}
            disableAnimations={reducedMotion}
            purchaseUrl={purchaseUrl}
            index={index}
          />
        </div>
      ))}
    </motion.div>
  );
}

export default PreviewCardGrid;
