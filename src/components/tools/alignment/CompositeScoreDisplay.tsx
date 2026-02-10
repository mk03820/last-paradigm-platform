'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { getScoreCategory } from './constants';

interface CompositeScoreDisplayProps {
  score: number;
  animate?: boolean;
}

const CATEGORY_STYLES = {
  Chaos: {
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  Siloed: {
    bg: 'bg-orange-50 dark:bg-orange-950',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  Coordinated: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  Integrated: {
    bg: 'bg-green-50 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
} as const;

/**
 * CompositeScoreDisplay Component
 *
 * Displays the weighted composite alignment score prominently
 * with category label and color-coded styling.
 *
 * Story 9.2: Weighted Composite Score Calculation
 * Covers: AC2 (prominent display), AC3 (categorization)
 */
export function CompositeScoreDisplay({
  score,
  animate = true,
}: CompositeScoreDisplayProps) {
  const [displayScore, setDisplayScore] = React.useState(animate ? 0 : score);
  const category = getScoreCategory(score);
  const styles = CATEGORY_STYLES[category.label as keyof typeof CATEGORY_STYLES];

  // Animate score count-up
  React.useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }

    const duration = 1000; // 1 second
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(score, increment * step);
      setDisplayScore(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayScore(score);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, animate]);

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-8 text-center',
        styles.bg,
        styles.border
      )}
      role="region"
      aria-label="Composite alignment score"
    >
      <p className="text-sm font-medium text-muted-foreground mb-2">
        Your Alignment Score
      </p>

      <p
        className={cn('text-6xl sm:text-7xl font-bold tabular-nums', styles.text)}
        aria-live="polite"
      >
        {displayScore.toFixed(1)}
      </p>

      <p className="text-sm text-muted-foreground mt-2">out of 4.0</p>

      <div className="mt-4">
        <span
          className={cn(
            'inline-block px-4 py-1.5 rounded-full text-sm font-semibold',
            styles.badge
          )}
        >
          {category.label}
        </span>
      </div>

      <p className={cn('mt-4 text-sm', styles.text)}>
        {getCategoryDescription(category.label)}
      </p>
    </div>
  );
}

function getCategoryDescription(label: string): string {
  switch (label) {
    case 'Chaos':
      return 'Significant alignment gaps exist across the organization';
    case 'Siloed':
      return 'Departments operate independently with limited coordination';
    case 'Coordinated':
      return 'Good alignment with some areas for improvement';
    case 'Integrated':
      return 'Strong alignment across all dimensions';
    default:
      return '';
  }
}
