/**
 * UnlockPromptOverlay Component
 *
 * Modal overlay prompting users to unlock PB2 tools through purchase.
 * Features accessible design with focus trapping, keyboard navigation,
 * and smooth animations.
 *
 * Story 16.4: Premium Card Interactions
 * Task 3: Create unlock prompt overlay component
 * Covers: AC4 (unlock prompt overlay with pricing and CTA)
 */

'use client';

import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTouchDevice } from '@/hooks/useTouchDevice';

interface UnlockPromptOverlayProps {
  /**
   * Whether the overlay is visible
   */
  isOpen: boolean;

  /**
   * Callback when overlay should close
   */
  onClose: () => void;

  /**
   * Optional tool name to personalize the prompt
   */
  toolName?: string;

  /**
   * Optional custom purchase URL
   * @default '#purchase'
   */
  purchaseUrl?: string;

  /**
   * Optional custom price display
   * @default '$2,500'
   */
  price?: string;
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
 * Animation variants for overlay
 */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

/**
 * X close icon component
 */
function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="M6 6 18 18" />
    </svg>
  );
}

/**
 * Lock icon component
 */
function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
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

export function UnlockPromptOverlay({
  isOpen,
  onClose,
  toolName,
  purchaseUrl = '#purchase',
  price = '$2,500',
}: UnlockPromptOverlayProps) {
  const reducedMotion = useReducedMotion();
  const isTouchDevice = useTouchDevice();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const ctaButtonRef = useRef<HTMLAnchorElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const touchStartY = useRef<number>(0);

  /**
   * Store the previously focused element when opening
   */
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  /**
   * Focus the close button when overlay opens
   */
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      // Small delay to ensure animation has started
      const timeoutId = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  /**
   * Return focus to triggering element when closing
   */
  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  /**
   * Handle Escape key to close
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  /**
   * Focus trap within the modal
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, a[href], [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab: go to last element if on first
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: go to first element if on last
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    []
  );

  /**
   * Handle backdrop click to close
   */
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  /**
   * Touch event handlers for swipe-to-dismiss on mobile
   */
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    touchStartY.current = event.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!isTouchDevice) return;

      const touchEndY = event.changedTouches[0].clientY;
      const deltaY = touchEndY - touchStartY.current;

      // Swipe down more than 100px to dismiss
      if (deltaY > 100) {
        onClose();
      }
    },
    [isTouchDevice, onClose]
  );

  /**
   * Prevent body scroll when modal is open
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Animation transition configuration
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.15, ease: 'easeOut' };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={transition}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlock-prompt-title"
          aria-describedby="unlock-prompt-description"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            className="relative mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-2xl"
            variants={modalVariants}
            transition={transition}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ focusRingColor: theme.navy } as React.CSSProperties}
              aria-label="Close"
            >
              <CloseIcon />
            </button>

            {/* Lock Icon */}
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${theme.gold}20` }}
            >
              <div style={{ color: theme.gold }}>
                <LockIcon />
              </div>
            </div>

            {/* Heading */}
            <h3
              id="unlock-prompt-title"
              className="mb-2 text-center text-xl font-semibold"
              style={{ color: theme.slate800 }}
            >
              Unlock {toolName ? `"${toolName}"` : 'this tool'} with Playbook 2
            </h3>

            {/* Price */}
            <p
              className="mb-4 text-center text-3xl font-bold"
              style={{ color: theme.gold }}
              aria-label={`Price: ${price}`}
            >
              {price}
            </p>

            {/* Description */}
            <p
              id="unlock-prompt-description"
              className="mb-6 text-center text-sm"
              style={{ color: theme.slate600 }}
            >
              Get full access to all 5 diagnostic tools and personalized
              recommendations to eliminate your organizational Alignment Tax.
            </p>

            {/* CTA Button */}
            <a
              ref={ctaButtonRef}
              href={purchaseUrl}
              className="block w-full rounded-lg py-3 px-6 text-center font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: theme.gold,
                minHeight: '44px',
                minWidth: '44px',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#92400e';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = theme.gold;
              }}
            >
              Purchase Playbook 2
            </a>

            {/* Swipe indicator for touch devices */}
            {isTouchDevice && (
              <p className="mt-4 text-center text-xs text-slate-400">
                Swipe down to dismiss
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UnlockPromptOverlay;
