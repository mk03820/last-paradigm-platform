'use client';

/**
 * BlurredContentZone Component
 *
 * Displays locked methodology content with CSS blur effect.
 * Content is visually blurred and marked as inaccessible.
 *
 * Story 16.3: Preview Cards with Blur Effect
 * Task 1.4: Create BlurredContentZone sub-component
 * Task 2: Implement CSS blur effect system
 * Covers: AC3, AC7, AC8
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { UnlockOverlay } from './UnlockOverlay';
import type { BlurredContentZoneProps } from './PreviewCardTypes';

/**
 * BlurredContentZone displays locked content with blur and overlay.
 *
 * Task 2.1: Create blur effect using CSS filter: blur(8px)
 * Task 2.3: Blur conveys "locked" without making content invisible
 * Task 2.5: Add select-none and pointer-events-none
 * Task 3.5: Add subtle gradient fade at boundary
 * Task 8: Accessibility features
 *
 * @example
 * <BlurredContentZone
 *   lockedContent={{
 *     previewText: "Framework methodology details...",
 *     methodologySteps: ["Step 1", "Step 2", "Step 3"]
 *   }}
 *   documentOutput="Decision_Rights_Matrix.xlsx"
 * />
 */
export function BlurredContentZone({
  lockedContent,
  documentOutput,
}: BlurredContentZoneProps) {
  const { previewText, methodologySteps, templatePreview } = lockedContent;

  return (
    <div className="relative mt-4">
      {/* Gradient Fade at Boundary (Task 3.5) */}
      <div
        className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Blurred Content Container */}
      <div
        className={cn(
          // Task 2.1: CSS blur effect - using blur (8px) for optimal visibility
          'blur-[6px]',
          // Task 2.5: Prevent text selection and pointer interactions
          'select-none pointer-events-none',
          // Padding and spacing
          'pt-4 space-y-3'
        )}
        // Task 8.1: Hide from screen readers (AC7)
        aria-hidden="true"
        role="presentation"
      >
        {/* Locked Preview Text */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {previewText}
        </p>

        {/* Methodology Steps (if present) */}
        {methodologySteps && methodologySteps.length > 0 && (
          <div className="rounded-md border border-border bg-muted/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Methodology Includes:
            </p>
            <ul className="space-y-1">
              {methodologySteps.map((step, index) => (
                <li
                  key={index}
                  className="text-sm text-foreground flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Template Preview */}
        {templatePreview && (
          <div className="text-xs text-muted-foreground italic">
            {templatePreview}
          </div>
        )}

        {/* Document Output Reference */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
          <FileIcon />
          <span>Output: </span>
          <span className="font-mono">{documentOutput}</span>
        </div>
      </div>

      {/* Unlock Overlay (Task 3) */}
      <UnlockOverlay />

      {/* Accessible Alternative for Screen Readers (Task 8.2) */}
      <span className="sr-only">
        Content locked - purchase Playbook 2 to access full tool details and
        templates. This includes the {documentOutput} document.
      </span>
    </div>
  );
}

/**
 * File icon for document output
 */
function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

/**
 * CSS Blur Browser Support Notes (Task 2.4):
 *
 * CSS filter: blur() is supported in:
 * - Chrome 53+
 * - Firefox 35+
 * - Safari 9.1+
 * - Edge 12+
 *
 * The blur-[6px] class uses Tailwind's arbitrary value syntax which
 * compiles to: filter: blur(6px);
 *
 * Fallback styling is handled by:
 * - Modern browsers: Full blur effect
 * - Older browsers: Content remains somewhat visible but the select-none
 *   and pointer-events-none still prevent interaction
 *
 * Task 2.2: Browser fallback is acceptable since all target browsers support blur.
 */

export default BlurredContentZone;
