/**
 * Engagement Strategy Constants and Logic
 *
 * Defines engagement approaches based on quadrant and sentiment.
 *
 * Story 11.4: Engagement Strategy Generation
 * Covers: FR2-19 (engagement recommendations), FR2-20 (action tracking)
 */

import type {
  Stakeholder,
  StakeholderQuadrant,
  StakeholderSentiment,
} from './stakeholder-constants';
import { getQuadrant, getQuadrantInfo } from './stakeholder-constants';

/**
 * Engagement cadence options
 */
export type EngagementCadence =
  | 'weekly'
  | 'bi-weekly'
  | 'monthly'
  | 'quarterly'
  | 'as-needed';

/**
 * Time investment levels
 */
export type TimeInvestment = 'high' | 'medium' | 'low' | 'minimal';

/**
 * Quadrant-based engagement strategy
 */
export interface QuadrantEngagement {
  quadrant: StakeholderQuadrant;
  cadence: EngagementCadence;
  contentTypes: string[];
  timeInvestment: TimeInvestment;
  description: string;
  actionVerb: string;
}

/**
 * Sentiment-based strategy modifier
 */
export interface SentimentModifier {
  sentiment: StakeholderSentiment;
  cadenceAdjustment: 'increase' | 'maintain' | 'decrease';
  additionalActions: string[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * Individual stakeholder engagement recommendation
 */
export interface StakeholderEngagement {
  stakeholder: Stakeholder;
  quadrant: StakeholderQuadrant;
  quadrantLabel: string;
  baseCadence: EngagementCadence;
  adjustedCadence: EngagementCadence;
  contentTypes: string[];
  timeInvestment: TimeInvestment;
  primaryAction: string;
  additionalActions: string[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * Quadrant engagement strategies
 */
export const QUADRANT_STRATEGIES: Record<StakeholderQuadrant, QuadrantEngagement> = {
  key_players: {
    quadrant: 'key_players',
    cadence: 'weekly',
    contentTypes: [
      'Status updates',
      'Decision previews',
      'Risk escalations',
      'Strategic discussions',
    ],
    timeInvestment: 'high',
    description:
      'Engage closely and regularly. These stakeholders need to feel ownership and be involved in key decisions.',
    actionVerb: 'Collaborate with',
  },
  keep_satisfied: {
    quadrant: 'keep_satisfied',
    cadence: 'monthly',
    contentTypes: [
      'Executive summaries',
      'Milestone reports',
      'Major decisions only',
      'Quarterly reviews',
    ],
    timeInvestment: 'medium',
    description:
      'Keep informed on major milestones without overwhelming with details. Respect their time while ensuring no surprises.',
    actionVerb: 'Update',
  },
  keep_informed: {
    quadrant: 'keep_informed',
    cadence: 'bi-weekly',
    contentTypes: [
      'Progress updates',
      'Involvement opportunities',
      'Feedback requests',
      'Working sessions',
    ],
    timeInvestment: 'medium',
    description:
      'Regular updates and opportunities for input. Leverage their interest and enthusiasm for the initiative.',
    actionVerb: 'Involve',
  },
  monitor: {
    quadrant: 'monitor',
    cadence: 'quarterly',
    contentTypes: ['Summary reports', 'Major announcements', 'Newsletter updates'],
    timeInvestment: 'minimal',
    description:
      'Minimal effort required. Keep on radar for changes in power or interest that might shift their quadrant.',
    actionVerb: 'Monitor',
  },
};

/**
 * Sentiment modifiers for engagement strategies
 */
export const SENTIMENT_MODIFIERS: Record<StakeholderSentiment, SentimentModifier> = {
  supporter: {
    sentiment: 'supporter',
    cadenceAdjustment: 'maintain',
    additionalActions: [
      'Leverage as champion',
      'Involve in advocacy',
      'Seek testimonials',
    ],
    priority: 'medium',
  },
  neutral: {
    sentiment: 'neutral',
    cadenceAdjustment: 'maintain',
    additionalActions: [
      'Build relationship',
      'Demonstrate value',
      'Address questions proactively',
    ],
    priority: 'medium',
  },
  blocker: {
    sentiment: 'blocker',
    cadenceAdjustment: 'increase',
    additionalActions: [
      'Address concerns directly',
      'Find common ground',
      'Escalate if needed',
      'Document objections',
    ],
    priority: 'high',
  },
};

/**
 * Cadence display labels
 */
export const CADENCE_LABELS: Record<EngagementCadence, string> = {
  weekly: 'Weekly',
  'bi-weekly': 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  'as-needed': 'As needed',
};

/**
 * Time investment display labels
 */
export const TIME_INVESTMENT_LABELS: Record<TimeInvestment, string> = {
  high: 'High (2-4 hrs/week)',
  medium: 'Medium (1-2 hrs/week)',
  low: 'Low (30 min/week)',
  minimal: 'Minimal (<30 min/month)',
};

/**
 * Adjust cadence based on sentiment
 */
function adjustCadence(
  baseCadence: EngagementCadence,
  adjustment: 'increase' | 'maintain' | 'decrease'
): EngagementCadence {
  const cadenceOrder: EngagementCadence[] = [
    'weekly',
    'bi-weekly',
    'monthly',
    'quarterly',
    'as-needed',
  ];

  if (adjustment === 'maintain') return baseCadence;

  const currentIndex = cadenceOrder.indexOf(baseCadence);

  if (adjustment === 'increase') {
    // Move to more frequent (lower index)
    return cadenceOrder[Math.max(0, currentIndex - 1)];
  } else {
    // Move to less frequent (higher index)
    return cadenceOrder[Math.min(cadenceOrder.length - 1, currentIndex + 1)];
  }
}

/**
 * Get engagement recommendation for a stakeholder
 */
export function getStakeholderEngagement(
  stakeholder: Stakeholder
): StakeholderEngagement {
  const quadrant = getQuadrant(stakeholder.power, stakeholder.interest);
  const quadrantInfo = getQuadrantInfo(quadrant);
  const strategy = QUADRANT_STRATEGIES[quadrant];

  // Get sentiment modifier if sentiment is assigned
  const sentimentModifier = stakeholder.sentiment
    ? SENTIMENT_MODIFIERS[stakeholder.sentiment]
    : null;

  // Adjust cadence based on sentiment
  const adjustedCadence = sentimentModifier
    ? adjustCadence(strategy.cadence, sentimentModifier.cadenceAdjustment)
    : strategy.cadence;

  // Determine priority
  let priority: 'high' | 'medium' | 'low' = 'medium';
  if (quadrant === 'key_players') {
    priority = 'high';
  } else if (quadrant === 'monitor') {
    priority = 'low';
  }
  // Blockers always get elevated priority
  if (stakeholder.sentiment === 'blocker') {
    priority = 'high';
  }

  // Build primary action
  const primaryAction = `${strategy.actionVerb} ${stakeholder.name}`;

  return {
    stakeholder,
    quadrant,
    quadrantLabel: quadrantInfo.label,
    baseCadence: strategy.cadence,
    adjustedCadence,
    contentTypes: strategy.contentTypes,
    timeInvestment: strategy.timeInvestment,
    primaryAction,
    additionalActions: sentimentModifier?.additionalActions || [],
    priority,
  };
}

/**
 * Get engagement recommendations for all stakeholders
 */
export function getAllEngagements(
  stakeholders: Stakeholder[]
): StakeholderEngagement[] {
  return stakeholders.map(getStakeholderEngagement);
}

/**
 * Get engagement summary by quadrant
 */
export function getEngagementSummary(
  stakeholders: Stakeholder[]
): Record<StakeholderQuadrant, { count: number; blockers: number }> {
  const summary: Record<StakeholderQuadrant, { count: number; blockers: number }> = {
    key_players: { count: 0, blockers: 0 },
    keep_satisfied: { count: 0, blockers: 0 },
    keep_informed: { count: 0, blockers: 0 },
    monitor: { count: 0, blockers: 0 },
  };

  for (const s of stakeholders) {
    const quadrant = getQuadrant(s.power, s.interest);
    summary[quadrant].count++;
    if (s.sentiment === 'blocker') {
      summary[quadrant].blockers++;
    }
  }

  return summary;
}

/**
 * Generate recommended action text for a stakeholder
 */
export function getRecommendedAction(stakeholder: Stakeholder): string {
  const engagement = getStakeholderEngagement(stakeholder);
  const strategy = QUADRANT_STRATEGIES[engagement.quadrant];

  let action = `${CADENCE_LABELS[engagement.adjustedCadence]} ${strategy.contentTypes[0].toLowerCase()}`;

  if (stakeholder.sentiment === 'supporter') {
    action += ' + leverage as champion';
  } else if (stakeholder.sentiment === 'blocker') {
    action += ' + address concerns directly';
  }

  return action;
}

/**
 * Export engagement data to CSV format
 */
export function exportToCSV(
  stakeholders: Stakeholder[],
  owners: Record<string, string>
): string {
  const headers = [
    'Name',
    'Role',
    'Power',
    'Interest',
    'Quadrant',
    'Sentiment',
    'Recommended Action',
    'Owner',
  ];

  const rows = stakeholders.map((s) => {
    const engagement = getStakeholderEngagement(s);
    const action = getRecommendedAction(s);
    const owner = owners[s.id] || '';

    return [
      s.name,
      s.role,
      s.power.toString(),
      s.interest.toString(),
      engagement.quadrantLabel,
      s.sentiment || 'Unassigned',
      action,
      owner,
    ];
  });

  // Escape CSV values
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(
  stakeholders: Stakeholder[],
  owners: Record<string, string>
): void {
  const csv = exportToCSV(stakeholders, owners);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `stakeholder-engagement-${timestamp}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
