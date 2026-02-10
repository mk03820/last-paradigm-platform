/**
 * Tests for Stakeholder Risk Detection
 *
 * Story 11.3: Sentiment Overlay and Risk Identification
 * Task 6.2: Unit tests for risk detection functions
 */

import { describe, it, expect } from 'vitest';
import type { Stakeholder } from './stakeholder-constants';
import {
  detectHighPowerBlockers,
  hasHighPowerChampion,
  detectDisengagedImplementers,
  detectRisks,
  calculateRiskScore,
  getRiskLevel,
  getSentimentCounts,
} from './stakeholder-risks';

// Helper to create stakeholders
function createStakeholder(
  overrides: Partial<Stakeholder> = {}
): Stakeholder {
  return {
    id: `sh_${Math.random().toString(36).slice(2)}`,
    name: 'Test Stakeholder',
    role: 'Manager',
    power: 5,
    interest: 5,
    ...overrides,
  };
}

describe('detectHighPowerBlockers', () => {
  it('returns empty array when no stakeholders', () => {
    expect(detectHighPowerBlockers([])).toEqual([]);
  });

  it('returns empty array when no blockers', () => {
    const stakeholders = [
      createStakeholder({ power: 9, sentiment: 'supporter' }),
      createStakeholder({ power: 8, sentiment: 'neutral' }),
    ];
    expect(detectHighPowerBlockers(stakeholders)).toEqual([]);
  });

  it('returns empty array when blockers have low power', () => {
    const stakeholders = [
      createStakeholder({ power: 6, sentiment: 'blocker' }),
      createStakeholder({ power: 3, sentiment: 'blocker' }),
    ];
    expect(detectHighPowerBlockers(stakeholders)).toEqual([]);
  });

  it('returns stakeholders with power >= 7 and blocker sentiment', () => {
    const blocker1 = createStakeholder({ power: 9, sentiment: 'blocker' });
    const blocker2 = createStakeholder({ power: 7, sentiment: 'blocker' });
    const supporter = createStakeholder({ power: 10, sentiment: 'supporter' });
    const stakeholders = [blocker1, supporter, blocker2];

    const result = detectHighPowerBlockers(stakeholders);
    expect(result).toHaveLength(2);
    expect(result).toContain(blocker1);
    expect(result).toContain(blocker2);
  });

  it('does not include stakeholders without sentiment', () => {
    const stakeholders = [
      createStakeholder({ power: 9 }),
      createStakeholder({ power: 8, sentiment: 'blocker' }),
    ];
    const result = detectHighPowerBlockers(stakeholders);
    expect(result).toHaveLength(1);
    expect(result[0].sentiment).toBe('blocker');
  });
});

describe('hasHighPowerChampion', () => {
  it('returns false when no stakeholders', () => {
    expect(hasHighPowerChampion([])).toBe(false);
  });

  it('returns false when no supporters', () => {
    const stakeholders = [
      createStakeholder({ power: 9, sentiment: 'neutral' }),
      createStakeholder({ power: 8, sentiment: 'blocker' }),
    ];
    expect(hasHighPowerChampion(stakeholders)).toBe(false);
  });

  it('returns false when supporters have low power', () => {
    const stakeholders = [
      createStakeholder({ power: 6, sentiment: 'supporter' }),
      createStakeholder({ power: 5, sentiment: 'supporter' }),
    ];
    expect(hasHighPowerChampion(stakeholders)).toBe(false);
  });

  it('returns true when at least one supporter has power >= 7', () => {
    const stakeholders = [
      createStakeholder({ power: 5, sentiment: 'blocker' }),
      createStakeholder({ power: 7, sentiment: 'supporter' }),
    ];
    expect(hasHighPowerChampion(stakeholders)).toBe(true);
  });

  it('returns true when champion has power 10', () => {
    const stakeholders = [
      createStakeholder({ power: 10, sentiment: 'supporter' }),
    ];
    expect(hasHighPowerChampion(stakeholders)).toBe(true);
  });
});

describe('detectDisengagedImplementers', () => {
  it('returns empty array when no stakeholders', () => {
    expect(detectDisengagedImplementers([])).toEqual([]);
  });

  it('returns empty array when no blockers in keep_informed quadrant', () => {
    const stakeholders = [
      // keep_informed quadrant (low power, high interest) but supporter
      createStakeholder({ power: 3, interest: 8, sentiment: 'supporter' }),
      // blocker but in key_players quadrant
      createStakeholder({ power: 8, interest: 9, sentiment: 'blocker' }),
    ];
    expect(detectDisengagedImplementers(stakeholders)).toEqual([]);
  });

  it('returns blockers in keep_informed quadrant', () => {
    const disengaged1 = createStakeholder({
      power: 3,
      interest: 8,
      sentiment: 'blocker',
    });
    const disengaged2 = createStakeholder({
      power: 5,
      interest: 7,
      sentiment: 'blocker',
    });
    const stakeholders = [
      disengaged1,
      disengaged2,
      createStakeholder({ power: 3, interest: 8, sentiment: 'neutral' }),
    ];

    const result = detectDisengagedImplementers(stakeholders);
    expect(result).toHaveLength(2);
    expect(result).toContain(disengaged1);
    expect(result).toContain(disengaged2);
  });
});

describe('detectRisks', () => {
  it('returns empty array when no stakeholders', () => {
    expect(detectRisks([])).toEqual([]);
  });

  it('returns empty array when no sentiment assigned', () => {
    const stakeholders = [
      createStakeholder({ power: 9, interest: 8 }),
      createStakeholder({ power: 3, interest: 5 }),
    ];
    expect(detectRisks(stakeholders)).toEqual([]);
  });

  it('detects high-power blocker risk', () => {
    const stakeholders = [
      createStakeholder({ power: 9, interest: 8, sentiment: 'blocker' }),
      createStakeholder({ power: 8, interest: 5, sentiment: 'supporter' }),
    ];

    const risks = detectRisks(stakeholders);
    expect(risks).toHaveLength(1);
    expect(risks[0].type).toBe('high_power_blocker');
    expect(risks[0].severity).toBe('critical');
    expect(risks[0].stakeholders).toHaveLength(1);
  });

  it('detects no champion risk when no high-power supporters', () => {
    const stakeholders = [
      createStakeholder({ power: 5, interest: 8, sentiment: 'supporter' }),
      createStakeholder({ power: 6, interest: 5, sentiment: 'neutral' }),
    ];

    const risks = detectRisks(stakeholders);
    expect(risks.some((r) => r.type === 'no_champion')).toBe(true);
  });

  it('does not flag no champion if there is a high-power supporter', () => {
    const stakeholders = [
      createStakeholder({ power: 8, interest: 8, sentiment: 'supporter' }),
      createStakeholder({ power: 3, interest: 5, sentiment: 'blocker' }),
    ];

    const risks = detectRisks(stakeholders);
    expect(risks.some((r) => r.type === 'no_champion')).toBe(false);
  });

  it('detects disengaged implementer risk', () => {
    const stakeholders = [
      createStakeholder({ power: 3, interest: 8, sentiment: 'blocker' }),
      createStakeholder({ power: 9, interest: 9, sentiment: 'supporter' }),
    ];

    const risks = detectRisks(stakeholders);
    expect(risks.some((r) => r.type === 'disengaged_implementer')).toBe(true);
  });

  it('sorts risks by severity (critical first)', () => {
    const stakeholders = [
      createStakeholder({ power: 3, interest: 8, sentiment: 'blocker' }), // medium
      createStakeholder({ power: 5, interest: 5, sentiment: 'neutral' }), // triggers no_champion (high)
      createStakeholder({ power: 9, interest: 8, sentiment: 'blocker' }), // critical
    ];

    const risks = detectRisks(stakeholders);
    expect(risks.length).toBeGreaterThan(1);
    expect(risks[0].severity).toBe('critical');
  });
});

describe('calculateRiskScore', () => {
  it('returns 0 for empty stakeholder list', () => {
    expect(calculateRiskScore([])).toBe(0);
  });

  it('returns 0 when no risks detected', () => {
    const stakeholders = [
      createStakeholder({ power: 9, interest: 8, sentiment: 'supporter' }),
    ];
    expect(calculateRiskScore(stakeholders)).toBe(0);
  });

  it('adds 40 for critical risk', () => {
    const stakeholders = [
      createStakeholder({ power: 9, interest: 8, sentiment: 'blocker' }),
      createStakeholder({ power: 8, interest: 7, sentiment: 'supporter' }),
    ];
    expect(calculateRiskScore(stakeholders)).toBe(40);
  });

  it('adds 25 for high risk', () => {
    const stakeholders = [
      createStakeholder({ power: 5, interest: 5, sentiment: 'neutral' }),
    ];
    // Only no_champion risk (high) should trigger
    expect(calculateRiskScore(stakeholders)).toBe(25);
  });

  it('caps at 100', () => {
    const stakeholders = [
      createStakeholder({ power: 9, sentiment: 'blocker' }), // critical +40
      createStakeholder({ power: 8, sentiment: 'blocker' }), // same risk
      createStakeholder({ power: 3, interest: 8, sentiment: 'blocker' }), // medium +15
      createStakeholder({ power: 4, interest: 9, sentiment: 'blocker' }), // same risk
      // no_champion high +25
    ];
    expect(calculateRiskScore(stakeholders)).toBeLessThanOrEqual(100);
  });
});

describe('getRiskLevel', () => {
  it('returns low for score < 20', () => {
    expect(getRiskLevel(0)).toBe('low');
    expect(getRiskLevel(10)).toBe('low');
    expect(getRiskLevel(19)).toBe('low');
  });

  it('returns medium for score 20-39', () => {
    expect(getRiskLevel(20)).toBe('medium');
    expect(getRiskLevel(30)).toBe('medium');
    expect(getRiskLevel(39)).toBe('medium');
  });

  it('returns high for score 40-59', () => {
    expect(getRiskLevel(40)).toBe('high');
    expect(getRiskLevel(50)).toBe('high');
    expect(getRiskLevel(59)).toBe('high');
  });

  it('returns critical for score >= 60', () => {
    expect(getRiskLevel(60)).toBe('critical');
    expect(getRiskLevel(80)).toBe('critical');
    expect(getRiskLevel(100)).toBe('critical');
  });
});

describe('getSentimentCounts', () => {
  it('returns all zeros for empty list', () => {
    expect(getSentimentCounts([])).toEqual({
      supporter: 0,
      neutral: 0,
      blocker: 0,
      unassigned: 0,
    });
  });

  it('counts each sentiment type', () => {
    const stakeholders = [
      createStakeholder({ sentiment: 'supporter' }),
      createStakeholder({ sentiment: 'supporter' }),
      createStakeholder({ sentiment: 'neutral' }),
      createStakeholder({ sentiment: 'blocker' }),
    ];

    expect(getSentimentCounts(stakeholders)).toEqual({
      supporter: 2,
      neutral: 1,
      blocker: 1,
      unassigned: 0,
    });
  });

  it('counts unassigned stakeholders', () => {
    const stakeholders = [
      createStakeholder({ sentiment: 'supporter' }),
      createStakeholder({}), // no sentiment
      createStakeholder({}), // no sentiment
    ];

    expect(getSentimentCounts(stakeholders)).toEqual({
      supporter: 1,
      neutral: 0,
      blocker: 0,
      unassigned: 2,
    });
  });
});
