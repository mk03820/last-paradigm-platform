/**
 * Stakeholder Risk Detection Logic
 *
 * Detects stakeholder risks based on power, interest, and sentiment.
 *
 * Story 11.3: Sentiment Overlay and Risk Identification
 * Covers: AC3 (risk detection), AC4 (risk summary)
 */

import type { Stakeholder, StakeholderQuadrant } from './stakeholder-constants';
import { getQuadrant } from './stakeholder-constants';

/**
 * Risk types that can be detected
 */
export type RiskType =
  | 'high_power_blocker'
  | 'no_champion'
  | 'disengaged_implementer';

/**
 * Risk severity levels
 */
export type RiskSeverity = 'critical' | 'high' | 'medium';

/**
 * A detected stakeholder risk
 */
export interface StakeholderRisk {
  id: string;
  type: RiskType;
  severity: RiskSeverity;
  title: string;
  description: string;
  stakeholders: Stakeholder[];
  mitigation: string;
}

/**
 * Risk detection configuration
 */
const RISK_CONFIG: Record<
  RiskType,
  {
    severity: RiskSeverity;
    title: string;
    description: string;
    mitigation: string;
  }
> = {
  high_power_blocker: {
    severity: 'critical',
    title: 'High-Power Blocker',
    description:
      'Stakeholders with significant power are actively blocking the initiative.',
    mitigation:
      'Schedule direct conversations to understand concerns. Consider addressing their specific objections or finding common ground.',
  },
  no_champion: {
    severity: 'high',
    title: 'No High-Power Champion',
    description:
      'There are no high-power stakeholders actively supporting the initiative.',
    mitigation:
      'Identify potential champions among high-power stakeholders. Build relationships and demonstrate value to convert neutral parties.',
  },
  disengaged_implementer: {
    severity: 'medium',
    title: 'Disengaged Implementer',
    description:
      'Stakeholders with high interest but low power are blocking or disengaged.',
    mitigation:
      'Engage these stakeholders to understand their concerns. Their resistance may spread to others if not addressed.',
  },
};

/**
 * Detect high-power blockers (power >= 7, sentiment = blocker)
 */
export function detectHighPowerBlockers(
  stakeholders: Stakeholder[]
): Stakeholder[] {
  return stakeholders.filter(
    (s) => s.power >= 7 && s.sentiment === 'blocker'
  );
}

/**
 * Check if there are any high-power champions (power >= 7, sentiment = supporter)
 */
export function hasHighPowerChampion(stakeholders: Stakeholder[]): boolean {
  return stakeholders.some(
    (s) => s.power >= 7 && s.sentiment === 'supporter'
  );
}

/**
 * Detect disengaged implementers (keep_informed quadrant with blocker sentiment)
 */
export function detectDisengagedImplementers(
  stakeholders: Stakeholder[]
): Stakeholder[] {
  return stakeholders.filter((s) => {
    const quadrant = getQuadrant(s.power, s.interest);
    return quadrant === 'keep_informed' && s.sentiment === 'blocker';
  });
}

/**
 * Detect all risks from stakeholder list
 */
export function detectRisks(stakeholders: Stakeholder[]): StakeholderRisk[] {
  const risks: StakeholderRisk[] = [];

  // Check for high-power blockers
  const highPowerBlockers = detectHighPowerBlockers(stakeholders);
  if (highPowerBlockers.length > 0) {
    const config = RISK_CONFIG.high_power_blocker;
    risks.push({
      id: 'risk_high_power_blocker',
      type: 'high_power_blocker',
      severity: config.severity,
      title: config.title,
      description: config.description,
      stakeholders: highPowerBlockers,
      mitigation: config.mitigation,
    });
  }

  // Check for no champions
  if (!hasHighPowerChampion(stakeholders)) {
    // Only flag if there are stakeholders with sentiment assigned
    const hasAnySentiment = stakeholders.some((s) => s.sentiment);
    if (hasAnySentiment) {
      const config = RISK_CONFIG.no_champion;
      risks.push({
        id: 'risk_no_champion',
        type: 'no_champion',
        severity: config.severity,
        title: config.title,
        description: config.description,
        stakeholders: [],
        mitigation: config.mitigation,
      });
    }
  }

  // Check for disengaged implementers
  const disengagedImplementers = detectDisengagedImplementers(stakeholders);
  if (disengagedImplementers.length > 0) {
    const config = RISK_CONFIG.disengaged_implementer;
    risks.push({
      id: 'risk_disengaged_implementer',
      type: 'disengaged_implementer',
      severity: config.severity,
      title: config.title,
      description: config.description,
      stakeholders: disengagedImplementers,
      mitigation: config.mitigation,
    });
  }

  // Sort by severity (critical first)
  const severityOrder: Record<RiskSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
  };

  return risks.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );
}

/**
 * Calculate overall risk score (0-100)
 */
export function calculateRiskScore(stakeholders: Stakeholder[]): number {
  if (stakeholders.length === 0) return 0;

  const risks = detectRisks(stakeholders);
  if (risks.length === 0) return 0;

  // Base score from risk severities
  let score = 0;
  for (const risk of risks) {
    switch (risk.severity) {
      case 'critical':
        score += 40;
        break;
      case 'high':
        score += 25;
        break;
      case 'medium':
        score += 15;
        break;
    }
  }

  // Cap at 100
  return Math.min(100, score);
}

/**
 * Get risk level label from score
 */
export function getRiskLevel(
  score: number
): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 60) return 'critical';
  if (score >= 40) return 'high';
  if (score >= 20) return 'medium';
  return 'low';
}

/**
 * Get sentiment distribution
 */
export function getSentimentCounts(
  stakeholders: Stakeholder[]
): Record<'supporter' | 'neutral' | 'blocker' | 'unassigned', number> {
  const counts = {
    supporter: 0,
    neutral: 0,
    blocker: 0,
    unassigned: 0,
  };

  for (const s of stakeholders) {
    if (s.sentiment) {
      counts[s.sentiment]++;
    } else {
      counts.unassigned++;
    }
  }

  return counts;
}
