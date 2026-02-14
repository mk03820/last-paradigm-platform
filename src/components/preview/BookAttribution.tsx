/**
 * Book Attribution Component
 *
 * Displays attribution to "The Last Paradigm" methodology.
 * Reusable across preview, purchase, and email contexts.
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Task 4: Create book attribution component
 * Covers: AC4 (FR65)
 */

import { BookOpen } from 'lucide-react';

interface BookAttributionProps {
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the book icon */
  showIcon?: boolean;
  /** Display style variant */
  variant?: 'default' | 'subtle' | 'prominent';
}

const sizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const;

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
} as const;

const variantStyles = {
  default: 'text-slate-400',
  subtle: 'text-slate-500 dark:text-slate-500',
  prominent: 'text-amber-600 dark:text-amber-400 font-medium',
} as const;

/**
 * BookAttribution - Displays "Based on methodology from The Last Paradigm"
 *
 * Features:
 * - Multiple size variants (sm, md, lg)
 * - Optional book icon
 * - Style variants for different contexts
 * - Reusable across the application
 */
export function BookAttribution({
  className = '',
  size = 'md',
  showIcon = true,
  variant = 'default',
}: BookAttributionProps) {
  return (
    <div
      className={`
        flex items-center justify-center gap-2
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      role="complementary"
      aria-label="Methodology attribution"
    >
      {showIcon && (
        <BookOpen
          className={`${iconSizes[size]} flex-shrink-0`}
          aria-hidden="true"
        />
      )}
      <span>
        Based on methodology from{' '}
        <span className="font-semibold italic">The Last Paradigm</span>
      </span>
    </div>
  );
}
