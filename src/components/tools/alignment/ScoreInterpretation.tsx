'use client';

import { useMemo } from 'react';
import { getScoreCategory } from './constants';

/**
 * ScoreInterpretation Component
 *
 * Displays interpretation text matching the user's score category.
 * Includes headline, description, urgency level, and recommended action.
 *
 * Story 9.4: Score Interpretation and Next Steps
 * Covers: AC1 (Interpretation text for each score range)
 */

export interface ScoreInterpretationProps {
  score: number;
}

const INTERPRETATIONS = {
  Chaos: {
    headline: 'Critical Alignment Gaps Detected',
    description:
      'Your organization shows significant misalignment across multiple dimensions. This level of dysfunction typically results in substantial wasted resources, failed initiatives, and employee frustration.',
    urgency: 'Immediate action recommended',
    action:
      'Focus on stabilizing one dimension before attempting broader transformation.',
  },
  Siloed: {
    headline: 'Departmental Silos Limiting Performance',
    description:
      "Your organization has functional capabilities but they operate in isolation. Information doesn't flow effectively, and handoffs create friction and delays.",
    urgency: 'Strategic intervention needed',
    action: 'Prioritize cross-functional alignment and information sharing.',
  },
  Coordinated: {
    headline: 'Good Foundation with Room to Improve',
    description:
      'Your organization demonstrates solid alignment fundamentals. Most teams work together effectively, though some friction points remain.',
    urgency: 'Optimization opportunity',
    action:
      'Focus on eliminating remaining friction points for competitive advantage.',
  },
  Integrated: {
    headline: 'Strong Organizational Alignment',
    description:
      'Your organization shows excellent alignment across dimensions. Strategy flows to execution smoothly, and teams collaborate effectively.',
    urgency: 'Maintain and refine',
    action: 'Continue monitoring alignment and address emerging gaps early.',
  },
} as const;

const CATEGORY_STYLES = {
  Chaos: {
    container: 'border-red-200 bg-red-50',
    headline: 'text-red-800',
    urgency: 'bg-red-100 text-red-800',
    icon: '⚠️',
  },
  Siloed: {
    container: 'border-orange-200 bg-orange-50',
    headline: 'text-orange-800',
    urgency: 'bg-orange-100 text-orange-800',
    icon: '📊',
  },
  Coordinated: {
    container: 'border-blue-200 bg-blue-50',
    headline: 'text-blue-800',
    urgency: 'bg-blue-100 text-blue-800',
    icon: '📈',
  },
  Integrated: {
    container: 'border-green-200 bg-green-50',
    headline: 'text-green-800',
    urgency: 'bg-green-100 text-green-800',
    icon: '✓',
  },
} as const;

export function ScoreInterpretation({ score }: ScoreInterpretationProps) {
  const category = useMemo(() => getScoreCategory(score), [score]);
  const interpretation =
    INTERPRETATIONS[category.label as keyof typeof INTERPRETATIONS];
  const styles = CATEGORY_STYLES[category.label as keyof typeof CATEGORY_STYLES];

  return (
    <div
      className={`rounded-xl border p-6 ${styles.container}`}
      role="region"
      aria-labelledby="interpretation-headline"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          {styles.icon}
        </span>
        <div className="flex-1">
          <h3
            id="interpretation-headline"
            className={`text-xl font-semibold mb-2 ${styles.headline}`}
          >
            {interpretation.headline}
          </h3>
          <p className="text-gray-700 mb-4">{interpretation.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles.urgency}`}
            >
              {interpretation.urgency}
            </span>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-800">
            <span className="font-semibold">Recommended approach:</span>{' '}
            {interpretation.action}
          </p>
        </div>
      </div>
    </div>
  );
}
