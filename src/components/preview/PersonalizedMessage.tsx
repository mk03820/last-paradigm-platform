/**
 * Personalized Message Component
 *
 * Displays severity-specific messaging based on alignment tax interpretation.
 * Includes supporting statistics from the user's diagnostic.
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Task 5: Add personalized messaging based on diagnostic results
 * Covers: AC3 (FR43)
 */

import { AlertTriangle, AlertOctagon, CheckCircle, Skull } from 'lucide-react';
import type { SavingsContext } from '@/lib/services/savings-calculator';
import { formatSavingsAmount, formatPercentage } from '@/lib/services/savings-calculator';

interface PersonalizedMessageProps {
  /** Savings context with severity-based messaging */
  context: SavingsContext;
  /** Total alignment tax amount */
  totalAlignmentTax?: number;
  /** Percentage of revenue */
  percentOfRevenue?: number;
  /** Additional CSS classes */
  className?: string;
}

const severityIcons = {
  normal: CheckCircle,
  significant: AlertTriangle,
  crisis: AlertOctagon,
  existential: Skull,
} as const;

const severityLabels = {
  normal: 'Normal Range',
  significant: 'Significant Impact',
  crisis: 'Crisis Level',
  existential: 'Existential Threat',
} as const;

/**
 * PersonalizedMessage - Displays severity-based messaging
 *
 * Features:
 * - Four severity levels with distinct styling
 * - Icon indicators for each level
 * - Supporting statistics from diagnostic
 * - Color-coded backgrounds matching interpretation cards
 */
export function PersonalizedMessage({
  context,
  totalAlignmentTax,
  percentOfRevenue,
  className = '',
}: PersonalizedMessageProps) {
  const Icon = severityIcons[context.severityLevel];
  const label = severityLabels[context.severityLevel];

  return (
    <div
      className={`
        mt-8 p-6 rounded-xl text-center
        ${context.bgColor}
        border border-opacity-30
        ${getBorderColor(context.severityLevel)}
        ${className}
      `}
      role="region"
      aria-label="Personalized assessment message"
    >
      {/* Severity Badge */}
      <div
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4
          ${context.color}
          bg-white/50 dark:bg-slate-900/50
          text-sm font-medium uppercase tracking-wide
        `}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
        <span>{label}</span>
      </div>

      {/* Headline */}
      <h2 className={`text-xl md:text-2xl font-bold mb-3 ${context.color}`}>
        {context.headline}
      </h2>

      {/* Subheadline */}
      <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
        {context.subheadline}
      </p>

      {/* Supporting Statistics */}
      {(totalAlignmentTax !== undefined || percentOfRevenue !== undefined) && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {totalAlignmentTax !== undefined && (
            <>
              Your{' '}
              <span className={`font-semibold ${context.color}`}>
                {formatSavingsAmount(totalAlignmentTax)}
              </span>{' '}
              alignment tax
            </>
          )}
          {totalAlignmentTax !== undefined && percentOfRevenue !== undefined && (
            <> represents </>
          )}
          {percentOfRevenue !== undefined && (
            <>
              <span className={`font-semibold ${context.color}`}>
                {formatPercentage(percentOfRevenue)}
              </span>{' '}
              of revenue
            </>
          )}
          .
        </p>
      )}
    </div>
  );
}

/**
 * Get border color class based on severity level
 */
function getBorderColor(severityLevel: SavingsContext['severityLevel']): string {
  switch (severityLevel) {
    case 'normal':
      return 'border-green-300 dark:border-green-700';
    case 'significant':
      return 'border-yellow-300 dark:border-yellow-700';
    case 'crisis':
      return 'border-orange-300 dark:border-orange-700';
    case 'existential':
      return 'border-red-300 dark:border-red-700';
  }
}
