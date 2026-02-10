/**
 * Alignment Assessment Dimension Constants
 *
 * Defines the 5 alignment dimensions and their 4-level scoring scales.
 * Based on Playbook 1 methodology.
 *
 * Story 9.1: Alignment Dimension Scoring Interface
 * Covers: FR2-6 (Score 5 alignment dimensions)
 */

export type DimensionId =
  | 'strategic'
  | 'execution'
  | 'technology'
  | 'people'
  | 'governance';

export interface ScoreLevel {
  score: 1 | 2 | 3 | 4;
  label: string;
  description: string;
}

export interface AlignmentDimension {
  id: DimensionId;
  label: string;
  weight: number;
  description: string;
  levels: ScoreLevel[];
}

/**
 * The 5 alignment dimensions with weighted importance
 * Strategic and Execution carry the most weight (30% each)
 */
export const ALIGNMENT_DIMENSIONS: AlignmentDimension[] = [
  {
    id: 'strategic',
    label: 'Strategic Alignment',
    weight: 0.3,
    description: 'How well strategy translates into operational priorities',
    levels: [
      {
        score: 1,
        label: 'Chaos',
        description: 'No clear strategy exists or strategy changes unpredictably',
      },
      {
        score: 2,
        label: 'Siloed',
        description: 'Strategy exists but units pursue conflicting priorities',
      },
      {
        score: 3,
        label: 'Coordinated',
        description: 'Strategy is communicated; most units align their goals',
      },
      {
        score: 4,
        label: 'Integrated',
        description: 'Strategy cascades clearly; all units pursue shared objectives',
      },
    ],
  },
  {
    id: 'execution',
    label: 'Execution Alignment',
    weight: 0.3,
    description: 'How effectively plans convert to outcomes',
    levels: [
      {
        score: 1,
        label: 'Chaos',
        description: 'Projects frequently fail or are abandoned; rework is constant',
      },
      {
        score: 2,
        label: 'Siloed',
        description: 'Delivery happens but handoffs create delays and defects',
      },
      {
        score: 3,
        label: 'Coordinated',
        description: 'Cross-functional teams deliver; occasional friction at boundaries',
      },
      {
        score: 4,
        label: 'Integrated',
        description: 'End-to-end delivery flows smoothly; continuous improvement culture',
      },
    ],
  },
  {
    id: 'technology',
    label: 'Technology Alignment',
    weight: 0.2,
    description: 'How well systems support business needs',
    levels: [
      {
        score: 1,
        label: 'Chaos',
        description: "Legacy sprawl; systems don't talk to each other",
      },
      {
        score: 2,
        label: 'Siloed',
        description: 'Point solutions per department; manual data movement',
      },
      {
        score: 3,
        label: 'Coordinated',
        description: 'Integration exists; some automation; shared platforms emerging',
      },
      {
        score: 4,
        label: 'Integrated',
        description: 'Unified data platform; real-time integration; self-service analytics',
      },
    ],
  },
  {
    id: 'people',
    label: 'People Alignment',
    weight: 0.1,
    description: 'How well talent and culture support objectives',
    levels: [
      {
        score: 1,
        label: 'Chaos',
        description: 'High turnover; unclear roles; blame culture',
      },
      {
        score: 2,
        label: 'Siloed',
        description: 'Talent hoarding; tribal knowledge; limited collaboration',
      },
      {
        score: 3,
        label: 'Coordinated',
        description: 'Skills development; knowledge sharing beginning; some cross-training',
      },
      {
        score: 4,
        label: 'Integrated',
        description: 'Talent mobility; learning culture; psychological safety',
      },
    ],
  },
  {
    id: 'governance',
    label: 'Governance Alignment',
    weight: 0.1,
    description: 'How effectively decisions are made and accountability works',
    levels: [
      {
        score: 1,
        label: 'Chaos',
        description: 'Unclear authority; decisions reversed frequently; no accountability',
      },
      {
        score: 2,
        label: 'Siloed',
        description: 'Decisions stuck in hierarchy; approval bottlenecks',
      },
      {
        score: 3,
        label: 'Coordinated',
        description: 'Clear decision rights; some delegation; regular reviews',
      },
      {
        score: 4,
        label: 'Integrated',
        description: 'Empowered teams; fast escalation paths; transparent metrics',
      },
    ],
  },
];

/**
 * Score category interpretations for composite scores
 * Boundaries: Chaos [0, 1.8), Siloed [1.8, 2.5), Coordinated [2.5, 3.3), Integrated [3.3, 4.0]
 */
export const SCORE_CATEGORIES = [
  { min: 0, max: 1.8, label: 'Chaos', color: 'destructive' },
  { min: 1.8, max: 2.5, label: 'Siloed', color: 'warning' },
  { min: 2.5, max: 3.3, label: 'Coordinated', color: 'info' },
  { min: 3.3, max: 4.0, label: 'Integrated', color: 'success' },
] as const;

/**
 * Get score category for a composite score
 * Uses >= min and < max for all categories except the last (which includes max)
 */
export function getScoreCategory(score: number): (typeof SCORE_CATEGORIES)[number] {
  // Handle edge cases
  if (score >= 4.0) return SCORE_CATEGORIES[3]; // Integrated
  if (score >= 3.3) return SCORE_CATEGORIES[3]; // Integrated
  if (score >= 2.5) return SCORE_CATEGORIES[2]; // Coordinated
  if (score >= 1.8) return SCORE_CATEGORIES[1]; // Siloed
  return SCORE_CATEGORIES[0]; // Chaos
}

/**
 * Calculate weighted composite score from dimension scores
 */
export function calculateCompositeScore(scores: Partial<Record<DimensionId, number>>): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const dimension of ALIGNMENT_DIMENSIONS) {
    const score = scores[dimension.id];
    if (score !== undefined) {
      weightedSum += score * dimension.weight;
      totalWeight += dimension.weight;
    }
  }

  if (totalWeight === 0) return 0;

  // Normalize to account for missing dimensions
  return weightedSum / totalWeight;
}
