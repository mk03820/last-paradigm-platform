'use client';

/**
 * UnlockOverlay Component
 *
 * Displays a centered overlay on top of blurred content with unlock CTA.
 *
 * Story 16.3: Preview Cards with Blur Effect
 * Task 3: Create blur overlay with unlock CTA
 * Covers: AC5 (unlock overlay with messaging)
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { UnlockOverlayProps } from './PreviewCardTypes';

/**
 * UnlockOverlay displays a centered CTA on blurred content.
 *
 * Task 3.1: Create UnlockOverlay component positioned over blurred content
 * Task 3.2: Add lock icon
 * Task 3.3: Add "Unlock with Playbook 2" text messaging
 * Task 3.4: Style overlay with semi-transparent background
 * Task 3.6: Overlay should not block interactions (pointer-events-none on container)
 *
 * @example
 * <UnlockOverlay ctaText="Unlock with Playbook 2" showIcon />
 */
export function UnlockOverlay({
  ctaText = 'Unlock with Playbook 2',
  showIcon = true,
  className,
}: UnlockOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center',
        // Semi-transparent background for visibility over blurred content (Task 3.4)
        'bg-background/60 backdrop-blur-sm',
        className
      )}
      // Overlay itself allows pointer events for future click handling (Task 3.6)
    >
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg px-4 py-2',
          'bg-primary/10 border border-primary/20',
          'text-foreground shadow-lg'
        )}
      >
        {/* Lock Icon (Task 3.2) */}
        {showIcon && <LockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />}

        {/* CTA Text (Task 3.3) */}
        <span className="text-sm font-semibold">{ctaText}</span>
      </div>
    </div>
  );
}

/**
 * Lock Icon component
 * Using Lucide-style lock icon
 */
interface IconProps {
  className?: string;
}

function LockIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default UnlockOverlay;
