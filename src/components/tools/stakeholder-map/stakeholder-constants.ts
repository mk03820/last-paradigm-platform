/**
 * Stakeholder Mapping Constants and Types
 *
 * Defines stakeholder data structures, role suggestions,
 * and power/interest calibration guidance.
 *
 * Story 11.1: Stakeholder Input Interface
 * Covers: FR2-16 (Add stakeholders with power and interest scores)
 */

// Maximum number of stakeholders allowed (NFR2-5)
export const MAX_STAKEHOLDERS = 50;

// Minimum stakeholders required for meaningful analysis
export const MIN_STAKEHOLDERS = 3;

/**
 * Stakeholder sentiment levels for Story 11.3
 */
export type StakeholderSentiment = 'supporter' | 'neutral' | 'blocker';

/**
 * Sentiment display information for Story 11.3
 */
export interface SentimentInfo {
  id: StakeholderSentiment;
  label: string;
  description: string;
}

export const SENTIMENTS: SentimentInfo[] = [
  {
    id: 'supporter',
    label: 'Supporter',
    description: 'Actively advocates for the initiative',
  },
  {
    id: 'neutral',
    label: 'Neutral',
    description: 'Neither for nor against the initiative',
  },
  {
    id: 'blocker',
    label: 'Blocker',
    description: 'Actively resists or opposes the initiative',
  },
];

/**
 * Sentiment color styles for Story 11.3
 */
export const SENTIMENT_STYLES: Record<
  StakeholderSentiment,
  { bg: string; text: string; border: string; ring: string }
> = {
  supporter: {
    bg: 'bg-green-500',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-500',
    ring: 'ring-green-500',
  },
  neutral: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-500',
    ring: 'ring-yellow-500',
  },
  blocker: {
    bg: 'bg-red-500',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-500',
    ring: 'ring-red-500',
  },
};

/**
 * Core stakeholder data structure
 */
export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  power: number; // 1-10
  interest: number; // 1-10
  sentiment?: StakeholderSentiment; // Added in Story 11.3
}

/**
 * Quadrant types for the 2x2 matrix (Story 11.2)
 */
export type StakeholderQuadrant =
  | 'key_players'
  | 'keep_satisfied'
  | 'keep_informed'
  | 'monitor';

/**
 * Quadrant metadata for display
 */
export interface QuadrantInfo {
  id: StakeholderQuadrant;
  label: string;
  description: string;
  powerRange: string;
  interestRange: string;
  color: string;
}

export const QUADRANTS: QuadrantInfo[] = [
  {
    id: 'key_players',
    label: 'Key Players',
    description: 'High power, high interest. These stakeholders can make or break your initiative.',
    powerRange: '6-10',
    interestRange: '6-10',
    color: 'blue',
  },
  {
    id: 'keep_satisfied',
    label: 'Keep Satisfied',
    description: 'High power, low interest. Keep them informed but don\'t overwhelm.',
    powerRange: '6-10',
    interestRange: '1-5',
    color: 'purple',
  },
  {
    id: 'keep_informed',
    label: 'Keep Informed',
    description: 'Low power, high interest. They care about outcomes but have limited authority.',
    powerRange: '1-5',
    interestRange: '6-10',
    color: 'teal',
  },
  {
    id: 'monitor',
    label: 'Monitor',
    description: 'Low power, low interest. Minimal engagement needed but stay aware.',
    powerRange: '1-5',
    interestRange: '1-5',
    color: 'gray',
  },
];

/**
 * Common executive and leadership roles for autocomplete
 */
export const ROLE_SUGGESTIONS = [
  'CEO',
  'CFO',
  'CTO',
  'COO',
  'CMO',
  'CHRO',
  'CIO',
  'CDO',
  'VP Engineering',
  'VP Sales',
  'VP Marketing',
  'VP Operations',
  'VP Product',
  'VP Finance',
  'VP HR',
  'Director of Engineering',
  'Director of Product',
  'Director of Operations',
  'Director of Sales',
  'Director of Marketing',
  'Program Manager',
  'Project Manager',
  'Team Lead',
  'Senior Manager',
  'Manager',
  'External Consultant',
  'Board Member',
  'Investor',
  'Key Customer',
  'Union Representative',
  'Regulatory Body',
  'Legal Counsel',
  'External Partner',
] as const;

/**
 * Power calibration guidance
 */
export interface CalibrationLevel {
  range: string;
  min: number;
  max: number;
  label: string;
  guidance: string;
  examples: string[];
}

export const POWER_CALIBRATION: CalibrationLevel[] = [
  {
    range: '8-10',
    min: 8,
    max: 10,
    label: 'Very High',
    guidance: 'Can unilaterally approve or veto the initiative',
    examples: [
      'Controls the budget',
      'Can fire project sponsors',
      'Board-level authority',
    ],
  },
  {
    range: '6-7',
    min: 6,
    max: 7,
    label: 'High',
    guidance: 'Significant influence on key decisions',
    examples: [
      'Approves major milestones',
      'Controls key resources',
      'Can reassign team members',
    ],
  },
  {
    range: '4-5',
    min: 4,
    max: 5,
    label: 'Medium',
    guidance: 'Can influence but not directly control outcomes',
    examples: [
      'Provides input to decision-makers',
      'Can delay but not stop progress',
      'Controls dependencies',
    ],
  },
  {
    range: '1-3',
    min: 1,
    max: 3,
    label: 'Low',
    guidance: 'Limited formal authority over the initiative',
    examples: [
      'Influences through expertise',
      'Part of broader team',
      'Advisory role only',
    ],
  },
];

export const INTEREST_CALIBRATION: CalibrationLevel[] = [
  {
    range: '8-10',
    min: 8,
    max: 10,
    label: 'Very High',
    guidance: 'Their work or team changes significantly',
    examples: [
      'Role is directly affected',
      'Team is restructured',
      'KPIs tied to outcome',
    ],
  },
  {
    range: '6-7',
    min: 6,
    max: 7,
    label: 'High',
    guidance: 'Materially impacted by outcomes',
    examples: [
      'Processes will change',
      'New tools or systems',
      'Reporting relationships shift',
    ],
  },
  {
    range: '4-5',
    min: 4,
    max: 5,
    label: 'Medium',
    guidance: 'Indirectly affected or occasional interaction',
    examples: [
      'Adjacent processes change',
      'Some workflow adjustments',
      'Periodic involvement',
    ],
  },
  {
    range: '1-3',
    min: 1,
    max: 3,
    label: 'Low',
    guidance: 'Minimal impact on their work',
    examples: [
      'Awareness only',
      'No direct involvement',
      'Tangential connection',
    ],
  },
];

/**
 * Get the power calibration level for a given score
 */
export function getPowerLevel(power: number): CalibrationLevel {
  for (const level of POWER_CALIBRATION) {
    if (power >= level.min && power <= level.max) {
      return level;
    }
  }
  return POWER_CALIBRATION[POWER_CALIBRATION.length - 1];
}

/**
 * Get the interest calibration level for a given score
 */
export function getInterestLevel(interest: number): CalibrationLevel {
  for (const level of INTEREST_CALIBRATION) {
    if (interest >= level.min && interest <= level.max) {
      return level;
    }
  }
  return INTEREST_CALIBRATION[INTEREST_CALIBRATION.length - 1];
}

/**
 * Determine which quadrant a stakeholder belongs to
 */
export function getQuadrant(power: number, interest: number): StakeholderQuadrant {
  const highPower = power >= 6;
  const highInterest = interest >= 6;

  if (highPower && highInterest) return 'key_players';
  if (highPower && !highInterest) return 'keep_satisfied';
  if (!highPower && highInterest) return 'keep_informed';
  return 'monitor';
}

/**
 * Get quadrant info by ID
 */
export function getQuadrantInfo(quadrantId: StakeholderQuadrant): QuadrantInfo {
  return QUADRANTS.find((q) => q.id === quadrantId) || QUADRANTS[3];
}

/**
 * Generate a unique stakeholder ID
 */
export function generateStakeholderId(): string {
  return `sh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate stakeholder data
 */
export interface StakeholderValidation {
  valid: boolean;
  errors: {
    name?: string;
    role?: string;
    power?: string;
    interest?: string;
  };
}

export function validateStakeholder(
  stakeholder: Partial<Stakeholder>
): StakeholderValidation {
  const errors: StakeholderValidation['errors'] = {};

  if (!stakeholder.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!stakeholder.role?.trim()) {
    errors.role = 'Role is required';
  }

  if (
    stakeholder.power === undefined ||
    stakeholder.power < 1 ||
    stakeholder.power > 10
  ) {
    errors.power = 'Power must be between 1 and 10';
  }

  if (
    stakeholder.interest === undefined ||
    stakeholder.interest < 1 ||
    stakeholder.interest > 10
  ) {
    errors.interest = 'Interest must be between 1 and 10';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Check if we can proceed to the matrix view
 */
export function canProceedToMatrix(stakeholders: Stakeholder[]): boolean {
  return stakeholders.length >= MIN_STAKEHOLDERS;
}

/**
 * Get quadrant counts from stakeholder list
 */
export function getQuadrantCounts(
  stakeholders: Stakeholder[]
): Record<StakeholderQuadrant, number> {
  const counts: Record<StakeholderQuadrant, number> = {
    key_players: 0,
    keep_satisfied: 0,
    keep_informed: 0,
    monitor: 0,
  };

  for (const stakeholder of stakeholders) {
    const quadrant = getQuadrant(stakeholder.power, stakeholder.interest);
    counts[quadrant]++;
  }

  return counts;
}
