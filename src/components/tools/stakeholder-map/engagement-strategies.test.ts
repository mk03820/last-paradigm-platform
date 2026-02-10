/**
 * Tests for Engagement Strategy Logic
 *
 * Story 11.4: Engagement Strategy Generation
 * Task 8.1: Unit tests for engagement strategy generation
 */

import { describe, it, expect } from 'vitest';
import type { Stakeholder } from './stakeholder-constants';
import {
  QUADRANT_STRATEGIES,
  SENTIMENT_MODIFIERS,
  CADENCE_LABELS,
  TIME_INVESTMENT_LABELS,
  getStakeholderEngagement,
  getAllEngagements,
  getEngagementSummary,
  getRecommendedAction,
  exportToCSV,
} from './engagement-strategies';

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

describe('QUADRANT_STRATEGIES', () => {
  it('defines strategies for all four quadrants', () => {
    expect(QUADRANT_STRATEGIES.key_players).toBeDefined();
    expect(QUADRANT_STRATEGIES.keep_satisfied).toBeDefined();
    expect(QUADRANT_STRATEGIES.keep_informed).toBeDefined();
    expect(QUADRANT_STRATEGIES.monitor).toBeDefined();
  });

  it('key_players has weekly cadence and high time investment', () => {
    expect(QUADRANT_STRATEGIES.key_players.cadence).toBe('weekly');
    expect(QUADRANT_STRATEGIES.key_players.timeInvestment).toBe('high');
  });

  it('monitor has quarterly cadence and minimal time investment', () => {
    expect(QUADRANT_STRATEGIES.monitor.cadence).toBe('quarterly');
    expect(QUADRANT_STRATEGIES.monitor.timeInvestment).toBe('minimal');
  });

  it('all strategies have content types', () => {
    Object.values(QUADRANT_STRATEGIES).forEach((strategy) => {
      expect(strategy.contentTypes.length).toBeGreaterThan(0);
    });
  });
});

describe('SENTIMENT_MODIFIERS', () => {
  it('defines modifiers for all three sentiments', () => {
    expect(SENTIMENT_MODIFIERS.supporter).toBeDefined();
    expect(SENTIMENT_MODIFIERS.neutral).toBeDefined();
    expect(SENTIMENT_MODIFIERS.blocker).toBeDefined();
  });

  it('blocker increases cadence', () => {
    expect(SENTIMENT_MODIFIERS.blocker.cadenceAdjustment).toBe('increase');
  });

  it('supporter and neutral maintain cadence', () => {
    expect(SENTIMENT_MODIFIERS.supporter.cadenceAdjustment).toBe('maintain');
    expect(SENTIMENT_MODIFIERS.neutral.cadenceAdjustment).toBe('maintain');
  });

  it('blocker has high priority', () => {
    expect(SENTIMENT_MODIFIERS.blocker.priority).toBe('high');
  });
});

describe('CADENCE_LABELS', () => {
  it('provides labels for all cadence types', () => {
    expect(CADENCE_LABELS.weekly).toBe('Weekly');
    expect(CADENCE_LABELS['bi-weekly']).toBe('Bi-weekly');
    expect(CADENCE_LABELS.monthly).toBe('Monthly');
    expect(CADENCE_LABELS.quarterly).toBe('Quarterly');
    expect(CADENCE_LABELS['as-needed']).toBe('As needed');
  });
});

describe('TIME_INVESTMENT_LABELS', () => {
  it('provides labels for all time investment levels', () => {
    expect(TIME_INVESTMENT_LABELS.high).toContain('High');
    expect(TIME_INVESTMENT_LABELS.medium).toContain('Medium');
    expect(TIME_INVESTMENT_LABELS.low).toContain('Low');
    expect(TIME_INVESTMENT_LABELS.minimal).toContain('Minimal');
  });
});

describe('getStakeholderEngagement', () => {
  it('returns engagement for key player', () => {
    const stakeholder = createStakeholder({ power: 9, interest: 9 });
    const engagement = getStakeholderEngagement(stakeholder);

    expect(engagement.quadrant).toBe('key_players');
    expect(engagement.quadrantLabel).toBe('Key Players');
    expect(engagement.baseCadence).toBe('weekly');
    expect(engagement.priority).toBe('high');
  });

  it('returns engagement for monitor quadrant', () => {
    const stakeholder = createStakeholder({ power: 3, interest: 3 });
    const engagement = getStakeholderEngagement(stakeholder);

    expect(engagement.quadrant).toBe('monitor');
    expect(engagement.baseCadence).toBe('quarterly');
    expect(engagement.priority).toBe('low');
  });

  it('increases cadence for blockers', () => {
    const stakeholder = createStakeholder({
      power: 5,
      interest: 5,
      sentiment: 'blocker',
    });
    const engagement = getStakeholderEngagement(stakeholder);

    // Monitor quadrant has quarterly, blocker increases to monthly
    expect(engagement.baseCadence).toBe('quarterly');
    expect(engagement.adjustedCadence).toBe('monthly');
  });

  it('maintains cadence for supporters', () => {
    const stakeholder = createStakeholder({
      power: 9,
      interest: 9,
      sentiment: 'supporter',
    });
    const engagement = getStakeholderEngagement(stakeholder);

    expect(engagement.baseCadence).toBe(engagement.adjustedCadence);
  });

  it('elevates priority for blockers', () => {
    const stakeholder = createStakeholder({
      power: 3,
      interest: 3,
      sentiment: 'blocker',
    });
    const engagement = getStakeholderEngagement(stakeholder);

    // Monitor quadrant would normally be low priority
    expect(engagement.priority).toBe('high');
  });

  it('includes additional actions for sentiment', () => {
    const stakeholder = createStakeholder({
      power: 5,
      interest: 5,
      sentiment: 'supporter',
    });
    const engagement = getStakeholderEngagement(stakeholder);

    expect(engagement.additionalActions).toContain('Leverage as champion');
  });

  it('returns empty additional actions when no sentiment', () => {
    const stakeholder = createStakeholder();
    const engagement = getStakeholderEngagement(stakeholder);

    expect(engagement.additionalActions).toEqual([]);
  });
});

describe('getAllEngagements', () => {
  it('returns engagements for all stakeholders', () => {
    const stakeholders = [
      createStakeholder({ id: '1', power: 9, interest: 9 }),
      createStakeholder({ id: '2', power: 3, interest: 3 }),
      createStakeholder({ id: '3', power: 9, interest: 3 }),
    ];

    const engagements = getAllEngagements(stakeholders);

    expect(engagements).toHaveLength(3);
    expect(engagements[0].quadrant).toBe('key_players');
    expect(engagements[1].quadrant).toBe('monitor');
    expect(engagements[2].quadrant).toBe('keep_satisfied');
  });

  it('returns empty array for empty input', () => {
    expect(getAllEngagements([])).toEqual([]);
  });
});

describe('getEngagementSummary', () => {
  it('returns counts for all quadrants', () => {
    const stakeholders = [
      createStakeholder({ power: 9, interest: 9 }),
      createStakeholder({ power: 9, interest: 9 }),
      createStakeholder({ power: 3, interest: 3 }),
    ];

    const summary = getEngagementSummary(stakeholders);

    expect(summary.key_players.count).toBe(2);
    expect(summary.monitor.count).toBe(1);
    expect(summary.keep_satisfied.count).toBe(0);
    expect(summary.keep_informed.count).toBe(0);
  });

  it('tracks blocker counts', () => {
    const stakeholders = [
      createStakeholder({ power: 9, interest: 9, sentiment: 'blocker' }),
      createStakeholder({ power: 9, interest: 9, sentiment: 'supporter' }),
    ];

    const summary = getEngagementSummary(stakeholders);

    expect(summary.key_players.count).toBe(2);
    expect(summary.key_players.blockers).toBe(1);
  });

  it('returns zeros for empty input', () => {
    const summary = getEngagementSummary([]);

    expect(summary.key_players.count).toBe(0);
    expect(summary.key_players.blockers).toBe(0);
  });
});

describe('getRecommendedAction', () => {
  it('includes cadence and content type', () => {
    const stakeholder = createStakeholder({ power: 9, interest: 9 });
    const action = getRecommendedAction(stakeholder);

    expect(action).toContain('Weekly');
    expect(action.toLowerCase()).toContain('status');
  });

  it('adds champion note for supporters', () => {
    const stakeholder = createStakeholder({
      power: 9,
      interest: 9,
      sentiment: 'supporter',
    });
    const action = getRecommendedAction(stakeholder);

    expect(action).toContain('leverage as champion');
  });

  it('adds concern note for blockers', () => {
    const stakeholder = createStakeholder({
      power: 9,
      interest: 9,
      sentiment: 'blocker',
    });
    const action = getRecommendedAction(stakeholder);

    expect(action).toContain('address concerns');
  });
});

describe('exportToCSV', () => {
  it('generates CSV with headers', () => {
    const csv = exportToCSV([], {});
    const lines = csv.split('\n');

    expect(lines[0]).toContain('Name');
    expect(lines[0]).toContain('Role');
    expect(lines[0]).toContain('Quadrant');
    expect(lines[0]).toContain('Sentiment');
    expect(lines[0]).toContain('Owner');
  });

  it('includes stakeholder data', () => {
    const stakeholders = [
      createStakeholder({
        id: '1',
        name: 'John Doe',
        role: 'CEO',
        power: 9,
        interest: 8,
        sentiment: 'supporter',
      }),
    ];
    const owners = { '1': 'Jane Smith' };

    const csv = exportToCSV(stakeholders, owners);

    expect(csv).toContain('John Doe');
    expect(csv).toContain('CEO');
    expect(csv).toContain('Key Players');
    expect(csv).toContain('supporter');
    expect(csv).toContain('Jane Smith');
  });

  it('escapes values with commas', () => {
    const stakeholders = [
      createStakeholder({
        id: '1',
        name: 'Doe, John',
        role: 'CEO, CFO',
        power: 9,
        interest: 8,
      }),
    ];

    const csv = exportToCSV(stakeholders, {});

    expect(csv).toContain('"Doe, John"');
    expect(csv).toContain('"CEO, CFO"');
  });

  it('handles empty owner assignments', () => {
    const stakeholders = [createStakeholder({ id: '1' })];
    const csv = exportToCSV(stakeholders, {});

    // Should have empty owner field (just commas at end)
    const lines = csv.split('\n');
    expect(lines[1].endsWith(',')).toBe(true);
  });

  it('shows Unassigned for stakeholders without sentiment', () => {
    const stakeholders = [createStakeholder({ id: '1' })];
    const csv = exportToCSV(stakeholders, {});

    expect(csv).toContain('Unassigned');
  });
});
