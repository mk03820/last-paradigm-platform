'use client';

/**
 * PB1 Completion Handoff Component
 *
 * Displays after all 7 PB1 tools are complete, prompting user
 * to create an account to save results and access PB2 preview.
 *
 * Story 15.6: PB1 Completion Handoff Prompt
 * Covers: FR66 (Account creation prompt)
 *
 * AC1: Displays after PB1 completion
 * AC2: Communicates value proposition
 * AC3: Non-blocking layout (inline, not modal)
 * AC4: Gold accent CTA
 * AC5: Continue without account option
 * AC6: Book attribution
 * AC7: Does not show for authenticated users
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, Lock, TrendingUp, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';

/**
 * Storage key for tracking dismissal
 */
const HANDOFF_DISMISSED_KEY = 'pb1-handoff-dismissed';

/**
 * Analytics event names for handoff tracking
 */
const ANALYTICS_EVENTS = {
  VIEWED: 'handoff_prompt_viewed',
  CREATE_ACCOUNT_CLICKED: 'handoff_create_account_clicked',
  CONTINUE_WITHOUT_CLICKED: 'handoff_continue_without_clicked',
} as const;

export interface PB1CompletionHandoffProps {
  /**
   * Total alignment tax amount calculated from all tools
   */
  totalAlignmentTax?: number;
  /**
   * Estimated savings amount (typically ~30% of alignment tax)
   */
  estimatedSavings?: number;
  /**
   * Callback when user clicks "Create Account"
   */
  onCreateAccount?: () => void;
  /**
   * Callback when user clicks "Continue without account"
   */
  onContinueWithout?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Hook to manage handoff dismissal state with sessionStorage persistence
 */
function useHandoffDismissal() {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const wasDismissed = sessionStorage.getItem(HANDOFF_DISMISSED_KEY) === 'true';
    setIsDismissed(wasDismissed);
  }, []);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(HANDOFF_DISMISSED_KEY, 'true');
    setIsDismissed(true);
  }, []);

  return { isDismissed, dismiss, mounted };
}

/**
 * Format currency value for display
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * PB1 Completion Handoff Component
 *
 * Non-blocking inline card that encourages account creation after
 * completing all 7 Playbook 1 diagnostic tools.
 *
 * Features:
 * - Value proposition messaging with 3 key benefits
 * - Gold accent primary CTA
 * - De-emphasized secondary dismiss option
 * - Book attribution per FR65
 * - SessionStorage dismissal tracking
 * - Analytics event tracking
 */
export function PB1CompletionHandoff({
  totalAlignmentTax,
  estimatedSavings,
  onCreateAccount,
  onContinueWithout,
  className = '',
}: PB1CompletionHandoffProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDismissed, dismiss, mounted } = useHandoffDismissal();
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Track "Handoff Prompt Viewed" event (Task 5.1)
  useEffect(() => {
    if (mounted && !isDismissed && !session?.user && status !== 'loading' && !hasTrackedView) {
      analytics.track({
        name: ANALYTICS_EVENTS.VIEWED,
        properties: {
          totalAlignmentTax,
          estimatedSavings,
        },
      });
      setHasTrackedView(true);
    }
  }, [mounted, isDismissed, session, status, hasTrackedView, totalAlignmentTax, estimatedSavings]);

  // Handle "Create Account" click (Task 5.2)
  const handleCreateAccount = useCallback(() => {
    analytics.track({
      name: ANALYTICS_EVENTS.CREATE_ACCOUNT_CLICKED,
      properties: {
        totalAlignmentTax,
        estimatedSavings,
      },
    });

    onCreateAccount?.();
    router.push('/auth/register?callbackUrl=/preview');
  }, [router, onCreateAccount, totalAlignmentTax, estimatedSavings]);

  // Handle "Continue without account" click (Task 5.3)
  const handleContinueWithout = useCallback(() => {
    analytics.track({
      name: ANALYTICS_EVENTS.CONTINUE_WITHOUT_CLICKED,
      properties: {
        totalAlignmentTax,
        estimatedSavings,
      },
    });

    dismiss();
    onContinueWithout?.();
  }, [dismiss, onContinueWithout, totalAlignmentTax, estimatedSavings]);

  // Don't render if:
  // - Not mounted yet (SSR)
  // - User is authenticated (AC7)
  // - User has dismissed the prompt
  // - Session is still loading
  if (!mounted || status === 'loading' || session?.user || isDismissed) {
    return null;
  }

  return (
    <section
      aria-labelledby="handoff-heading"
      className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 md:p-8 ${className}`}
      role="complementary"
    >
      {/* Success Badge - Visual confirmation of completion */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />
        </div>
        <span className="text-green-500 font-medium">Diagnostic Complete</span>
      </div>

      {/* Headline (AC2) */}
      <h2
        id="handoff-heading"
        className="text-2xl md:text-3xl font-bold text-white mb-3"
      >
        Save Your Diagnostic Results
      </h2>

      {/* Results Summary - Dynamic values when provided */}
      {totalAlignmentTax && (
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">Total Alignment Tax</p>
              <p className="text-2xl font-bold text-amber-500">
                {formatCurrency(totalAlignmentTax)}
              </p>
            </div>
            {estimatedSavings && (
              <div>
                <p className="text-sm text-slate-400">Potential Savings</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(estimatedSavings)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Value Proposition - Three Key Benefits (AC2, Task 1.3) */}
      <div className="space-y-3 mb-6">
        {/* Benefit 1: Save Results Permanently */}
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-white font-medium">Save Results Permanently</p>
            <p className="text-sm text-slate-400">
              {totalAlignmentTax
                ? `Never lose your ${formatCurrency(totalAlignmentTax)} alignment tax analysis`
                : 'Never lose your alignment tax analysis. Access anytime from any device.'}
            </p>
          </div>
        </div>

        {/* Benefit 2: Personalized Roadmap */}
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-white font-medium">See Your Personalized Roadmap</p>
            <p className="text-sm text-slate-400">
              Discover which Playbook 2 tools address your specific pain points
            </p>
          </div>
        </div>

        {/* Benefit 3: Playbook 2 Preview */}
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-white font-medium">Access Playbook 2 Preview</p>
            <p className="text-sm text-slate-400">
              See how your data feeds into implementation tools
            </p>
          </div>
        </div>
      </div>

      {/* CTAs (AC4, AC5, Task 2) */}
      <div className="space-y-3">
        {/* Primary CTA - Gold accent (AC4) with 48px minimum touch target */}
        <Button
          onClick={handleCreateAccount}
          className="w-full h-12 min-h-[48px] bg-amber-600 hover:bg-amber-700 text-white font-semibold text-lg focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          Create Account
          <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
        </Button>

        {/* Secondary option - De-emphasized (AC5) */}
        <button
          onClick={handleContinueWithout}
          className="w-full py-3 min-h-[48px] text-sm text-slate-400 hover:text-slate-300 transition-colors underline-offset-4 hover:underline"
          type="button"
        >
          Continue without account
        </button>
      </div>

      {/* Book Attribution (AC6, FR65) */}
      <p className="text-xs text-slate-500 text-center mt-6">
        Based on <em>The Last Paradigm</em> methodology for organizational transformation
      </p>
    </section>
  );
}

export default PB1CompletionHandoff;
