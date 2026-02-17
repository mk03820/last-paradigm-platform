'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks';

/**
 * Checkout transition state types
 */
export type CheckoutTransitionStatus = 'initiating' | 'redirecting' | 'error';

/**
 * Props for CheckoutTransition component
 */
export interface CheckoutTransitionProps {
  /** Whether the overlay is visible */
  isVisible: boolean;
  /** Current transition state */
  status: CheckoutTransitionStatus;
  /** Error message to display when status is 'error' */
  errorMessage?: string;
  /** Callback when user clicks retry button (error state) */
  onRetry?: () => void;
  /** Callback when user clicks close button (error state) */
  onClose?: () => void;
}

/**
 * CheckoutTransition Component
 *
 * Full-screen branded loading overlay displayed during Stripe checkout redirect.
 * Provides a smooth, professional transition experience with trust reinforcement.
 *
 * Story 17.3: Checkout Transition Experience
 * Covers: AC1-AC8 (full-screen overlay, branding, loading indicator, guarantee,
 * overlay persistence, error handling, reduced motion, responsive design)
 *
 * @example
 * ```tsx
 * <CheckoutTransition
 *   isVisible={checkoutState.isVisible}
 *   status={checkoutState.status}
 *   errorMessage={checkoutState.errorMessage}
 *   onRetry={handleRetry}
 *   onClose={handleClose}
 * />
 * ```
 */
export function CheckoutTransition({
  isVisible,
  status,
  errorMessage,
  onRetry,
  onClose,
}: CheckoutTransitionProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element before overlay opens
  useEffect(() => {
    if (isVisible) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isVisible]);

  // Restore focus when overlay closes
  useEffect(() => {
    if (!isVisible && previousActiveElement.current) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isVisible]);

  // Focus trap implementation
  useFocusTrap(containerRef, isVisible && status === 'error');

  // Handle Escape key to close error state
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && status === 'error' && onClose) {
        event.preventDefault();
        onClose();
      }
    },
    [status, onClose]
  );

  useEffect(() => {
    if (isVisible && status === 'error') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, status, handleKeyDown]);

  // Prevent body scroll when overlay is visible
  useEffect(() => {
    if (isVisible) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isVisible]);

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className={cn(
            'fixed inset-0 z-[100] flex flex-col items-center justify-center',
            'bg-slate-900 text-white'
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-transition-title"
          aria-describedby="checkout-transition-description"
          aria-live="polite"
        >
          {/* Logo */}
          <motion.div
            variants={contentVariants}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.1 }}
            className="mb-8"
          >
            <Logo />
          </motion.div>

          {/* Main content based on status */}
          <motion.div
            variants={contentVariants}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.15 }}
          >
            {status === 'error' ? (
              <ErrorState
                message={errorMessage}
                onRetry={onRetry}
                onClose={onClose}
              />
            ) : (
              <LoadingState
                status={status}
                prefersReducedMotion={prefersReducedMotion}
              />
            )}
          </motion.div>

          {/* Trust Reinforcement - only show in loading states */}
          {status !== 'error' && (
            <motion.div
              variants={contentVariants}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.25 }}
              className="mt-12 flex flex-col items-center gap-4"
            >
              {/* 30-Day Guarantee Badge */}
              <div className="flex items-center gap-2 text-green-400">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                <span className="text-sm font-medium">30-Day Money-Back Guarantee</span>
              </div>

              {/* Stripe Secure Badge */}
              <div className="flex items-center gap-2 text-slate-400">
                <StripeSecureBadge />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Loading state content
 */
interface LoadingStateProps {
  status: CheckoutTransitionStatus;
  prefersReducedMotion: boolean;
}

function LoadingState({ status, prefersReducedMotion }: LoadingStateProps) {
  const statusText = status === 'initiating'
    ? 'Preparing your secure checkout...'
    : 'Redirecting to secure payment...';

  const descriptionText = status === 'initiating'
    ? "You'll be redirected to our secure payment page"
    : 'Please wait while we connect you to Stripe';

  return (
    <div className="flex flex-col items-center text-center px-4">
      {/* Spinner */}
      <div className="relative">
        {prefersReducedMotion ? (
          // Static icon for reduced motion
          <Loader2 className="h-12 w-12 text-amber-500" aria-hidden="true" />
        ) : (
          // Animated spinner
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Loader2 className="h-12 w-12 text-amber-500" aria-hidden="true" />
          </motion.div>
        )}
      </div>

      {/* Status Text */}
      <h2
        id="checkout-transition-title"
        className="mt-6 text-xl font-medium text-white"
      >
        {statusText}
      </h2>

      {/* Description */}
      <p
        id="checkout-transition-description"
        className="mt-2 text-slate-400 text-sm max-w-xs"
      >
        {descriptionText}
      </p>

      {/* Screen reader announcement */}
      <span className="sr-only" role="status" aria-live="assertive">
        {status === 'initiating'
          ? 'Creating checkout session. Please wait.'
          : 'Redirecting to secure checkout. Please wait.'}
      </span>
    </div>
  );
}

/**
 * Error state content
 */
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

function ErrorState({ message, onRetry, onClose }: ErrorStateProps) {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Focus first button on mount
  useEffect(() => {
    firstButtonRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-center max-w-md text-center px-4">
      {/* Error Icon */}
      <div className="rounded-full bg-red-900/50 p-4 mb-6">
        <AlertCircle className="h-12 w-12 text-red-400" aria-hidden="true" />
      </div>

      {/* Title */}
      <h2
        id="checkout-transition-title"
        className="text-xl font-medium text-white mb-2"
      >
        Unable to Start Checkout
      </h2>

      {/* Error Message */}
      <p
        id="checkout-transition-description"
        className="text-slate-400 mb-8"
        role="alert"
      >
        {message || 'An unexpected error occurred. Please try again.'}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {onRetry && (
          <Button
            ref={firstButtonRef}
            onClick={onRetry}
            className={cn(
              'bg-amber-600 hover:bg-amber-500 active:bg-amber-700',
              'text-white font-medium',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
            )}
          >
            Try Again
          </Button>
        )}
        {onClose && (
          <Button
            ref={!onRetry ? firstButtonRef : undefined}
            variant="outline"
            onClick={onClose}
            className={cn(
              'border-slate-600 text-slate-300',
              'hover:bg-slate-800 hover:text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
            )}
          >
            <X className="mr-2 h-4 w-4" aria-hidden="true" />
            Close
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Last Paradigm Logo
 */
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl md:text-3xl font-bold text-white">
        Last<span className="text-amber-500">Paradigm</span>
      </span>
    </div>
  );
}

/**
 * Stripe Secure Badge
 */
function StripeSecureBadge() {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <span>Secure checkout powered by Stripe</span>
    </div>
  );
}

/**
 * Focus trap hook for modal accessibility
 */
function useFocusTrap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  isActive: boolean
) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((el) => !el.hasAttribute('disabled'));

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, isActive]);
}

export default CheckoutTransition;
