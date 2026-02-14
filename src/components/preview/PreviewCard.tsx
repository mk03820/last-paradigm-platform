/**
 * PreviewCard Component
 *
 * Premium interactive preview card with hover effects, animations,
 * and unlock prompt functionality. Designed for blurred PB2 tool previews.
 *
 * Story 16.4: Premium Card Interactions
 * Task 1: Design and implement hover state effects
 * Task 4: Add touch interaction handling
 * Task 5: Performance optimization
 * Task 6: Reduced motion support
 * Task 7: Keyboard accessibility
 *
 * Covers: AC1, AC3, AC4, AC5, AC6, AC7, AC8
 */

'use client';

import * as React from 'react';
import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTouchDevice } from '@/hooks/useTouchDevice';
import { UnlockPromptOverlay } from './UnlockPromptOverlay';
import { cn } from '@/lib/utils';

/**
 * Preview card tool data
 */
export interface PreviewToolData {
  id: number;
  name: string;
  shortName: string;
  description: string;
  category?: string;
}

interface PreviewCardProps {
  /**
   * Tool data to display
   */
  tool: PreviewToolData;

  /**
   * Whether the card content is blurred (locked)
   * @default true
   */
  isBlurred?: boolean;

  /**
   * Animation delay for staggered entry (in seconds)
   * @default 0
   */
  delay?: number;

  /**
   * Whether animations should be disabled
   * @default false
   */
  disableAnimations?: boolean;

  /**
   * Custom purchase URL
   */
  purchaseUrl?: string;

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Index for animation staggering
   */
  index?: number;
}

/**
 * Executive Clarity theme colors
 */
const theme = {
  navy: '#1e293b',
  gold: '#b45309',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate600: '#475569',
  slate800: '#1e293b',
};

/**
 * Animation variants for card entry
 */
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

/**
 * Animation variants for description reveal
 */
const descriptionVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

export function PreviewCard({
  tool,
  isBlurred = true,
  delay = 0,
  disableAnimations = false,
  purchaseUrl,
  className,
  index = 0,
}: PreviewCardProps) {
  const reducedMotion = useReducedMotion();
  const isTouchDevice = useTouchDevice();

  // State for interactions
  const [isHovered, setIsHovered] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [touchTapCount, setTouchTapCount] = useState(0);

  // Refs for accessibility
  const cardRef = useRef<HTMLDivElement>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if animations should run
  const shouldAnimate = !reducedMotion && !disableAnimations;

  /**
   * Handle mouse enter - show hover state and description
   */
  const handleMouseEnter = useCallback(() => {
    if (isTouchDevice) return; // Skip for touch devices

    setIsHovered(true);
    setShowDescription(true);
  }, [isTouchDevice]);

  /**
   * Handle mouse leave - hide hover state
   */
  const handleMouseLeave = useCallback(() => {
    if (isTouchDevice) return;

    setIsHovered(false);
    setShowDescription(false);
  }, [isTouchDevice]);

  /**
   * Handle touch interaction
   * First tap: show hover state
   * Second tap: show unlock prompt
   */
  const handleTouchStart = useCallback(() => {
    if (!isTouchDevice) return;

    // Clear any existing timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }

    if (touchTapCount === 0) {
      // First tap: show hover state
      setIsHovered(true);
      setShowDescription(true);
      setTouchTapCount(1);

      // Reset after 3 seconds if no second tap
      touchTimeoutRef.current = setTimeout(() => {
        setTouchTapCount(0);
        setIsHovered(false);
        setShowDescription(false);
      }, 3000);
    } else {
      // Second tap: show unlock prompt
      setShowUnlockPrompt(true);
      setTouchTapCount(0);
      setIsHovered(false);
      setShowDescription(false);
    }
  }, [isTouchDevice, touchTapCount]);

  /**
   * Handle click to open unlock prompt
   */
  const handleClick = useCallback(() => {
    if (isTouchDevice) return; // Handled by touch events

    if (isBlurred) {
      setShowUnlockPrompt(true);
    }
  }, [isTouchDevice, isBlurred]);

  /**
   * Handle keyboard interaction
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (isBlurred) {
          setShowUnlockPrompt(true);
        }
      }
    },
    [isBlurred]
  );

  /**
   * Close unlock prompt
   */
  const handleCloseUnlockPrompt = useCallback(() => {
    setShowUnlockPrompt(false);
  }, []);

  /**
   * Clean up touch timeout on unmount
   */
  React.useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  // Animation transition configuration
  const cardTransition = shouldAnimate
    ? { delay, duration: 0.3, ease: 'easeOut' as const }
    : { duration: 0 };

  const hoverTransition = shouldAnimate
    ? { duration: 0.2, ease: 'easeOut' as const }
    : { duration: 0 };

  return (
    <>
      <motion.div
        ref={cardRef}
        className={cn(
          // Base styles
          'preview-card relative rounded-xl border bg-white',
          // Minimum touch target size
          'min-h-[176px]',
          // Focus styles (2px Navy ring with 2px offset)
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // GPU acceleration hints (applied sparingly during interaction)
          isHovered && 'will-change-transform',
          // Cursor style
          isBlurred && 'cursor-pointer',
          className
        )}
        style={{
          // Focus ring color
          ['--tw-ring-color' as string]: theme.navy,
        }}
        // Animation props
        variants={shouldAnimate ? cardVariants : undefined}
        initial={shouldAnimate ? 'hidden' : false}
        animate="visible"
        transition={cardTransition}
        // Hover animation using GPU-accelerated transform only
        whileHover={
          shouldAnimate && !isTouchDevice
            ? {
                y: -4,
                transition: hoverTransition,
              }
            : undefined
        }
        // Touch tap animation (brief scale pulse)
        whileTap={
          isTouchDevice
            ? {
                scale: 0.98,
                transition: { duration: 0.1 },
              }
            : undefined
        }
        // Event handlers
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        // Accessibility
        tabIndex={0}
        role="button"
        aria-label={`${tool.name}${isBlurred ? ' - Click to unlock' : ''}`}
        aria-pressed={showUnlockPrompt}
      >
        {/* Shadow layer using pseudo-element for GPU-accelerated animation */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 rounded-xl transition-opacity',
            shouldAnimate ? 'duration-200 ease-out' : 'duration-0'
          )}
          style={{
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            opacity: isHovered ? 1 : 0,
          }}
          aria-hidden="true"
        />

        {/* Base shadow (always visible) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl shadow-md"
          aria-hidden="true"
        />

        {/* Card Content */}
        <div className="relative p-6">
          {/* Tool Number Badge */}
          <div
            className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: theme.gold }}
          >
            {tool.id}
          </div>

          {/* Tool Name */}
          <h3
            className={cn(
              'mb-2 text-lg font-semibold',
              isBlurred && 'select-none blur-[2px]'
            )}
            style={{ color: theme.slate800 }}
          >
            {tool.shortName}
          </h3>

          {/* Tool Full Name */}
          <p
            className={cn(
              'mb-3 text-sm',
              isBlurred && 'select-none blur-[2px]'
            )}
            style={{ color: theme.slate600 }}
          >
            {tool.name}
          </p>

          {/* Category Tag (if present) */}
          {tool.category && (
            <span
              className={cn(
                'inline-block rounded-full px-2 py-1 text-xs font-medium',
                isBlurred && 'blur-[2px]'
              )}
              style={{
                backgroundColor: `${theme.gold}20`,
                color: theme.gold,
              }}
            >
              {tool.category}
            </span>
          )}

          {/* Expanded Description (appears on hover) */}
          <motion.div
            className="mt-4 overflow-hidden"
            variants={shouldAnimate ? descriptionVariants : undefined}
            initial={shouldAnimate ? 'hidden' : false}
            animate={showDescription ? 'visible' : 'hidden'}
            transition={hoverTransition}
          >
            <p
              className={cn(
                'text-sm leading-relaxed',
                isBlurred && 'select-none blur-[3px]'
              )}
              style={{ color: theme.slate600 }}
            >
              {tool.description}
            </p>
          </motion.div>

          {/* Lock Overlay for Blurred Cards */}
          {isBlurred && (
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/10 transition-opacity',
                shouldAnimate ? 'duration-200' : 'duration-0',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
              aria-hidden="true"
            >
              <div className="rounded-full bg-white/90 p-3 shadow-lg">
                <LockIcon />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Unlock Prompt Overlay */}
      <UnlockPromptOverlay
        isOpen={showUnlockPrompt}
        onClose={handleCloseUnlockPrompt}
        toolName={tool.shortName}
        purchaseUrl={purchaseUrl}
      />
    </>
  );
}

/**
 * Lock icon component
 */
function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={theme.gold}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default PreviewCard;
