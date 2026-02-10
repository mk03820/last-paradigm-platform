import { describe, it, expect } from 'vitest';
import {
  DECISION_ARCHETYPES,
  BUDGET_THRESHOLDS,
  getArchetype,
  getBudgetThreshold,
  hasMinimumSamples,
  countValidArchetypes,
  canCalculateVelocity,
  generateSampleId,
  validateSampleDates,
  type ArchetypeData,
} from './constants';

/**
 * Decision Velocity Constants Tests
 *
 * Tests for archetypes, thresholds, and utility functions.
 *
 * Story 10.1: Decision Sample Input Interface
 */

describe('DECISION_ARCHETYPES', () => {
  it('has 5 decision archetypes', () => {
    expect(DECISION_ARCHETYPES).toHaveLength(5);
  });

  it('includes all required archetype IDs', () => {
    const ids = DECISION_ARCHETYPES.map((a) => a.id);
    expect(ids).toContain('strategic');
    expect(ids).toContain('budget');
    expect(ids).toContain('technology');
    expect(ids).toContain('hiring');
    expect(ids).toContain('analytics');
  });

  it('each archetype has required properties', () => {
    for (const archetype of DECISION_ARCHETYPES) {
      expect(archetype.id).toBeDefined();
      expect(archetype.label).toBeDefined();
      expect(archetype.description).toBeDefined();
      expect(archetype.examples).toBeDefined();
      expect(archetype.minSamples).toBeGreaterThanOrEqual(1);
      expect(archetype.maxSamples).toBeGreaterThan(archetype.minSamples);
    }
  });

  it('budget archetype has thresholds flag', () => {
    const budget = DECISION_ARCHETYPES.find((a) => a.id === 'budget');
    expect(budget?.hasThresholds).toBe(true);
  });

  it('non-budget archetypes do not have thresholds flag', () => {
    const nonBudget = DECISION_ARCHETYPES.filter((a) => a.id !== 'budget');
    for (const archetype of nonBudget) {
      expect(archetype.hasThresholds).toBeFalsy();
    }
  });
});

describe('BUDGET_THRESHOLDS', () => {
  it('has 4 budget tiers', () => {
    expect(BUDGET_THRESHOLDS).toHaveLength(4);
  });

  it('tiers are in ascending order', () => {
    for (let i = 0; i < BUDGET_THRESHOLDS.length - 1; i++) {
      expect(BUDGET_THRESHOLDS[i].max).toBeLessThanOrEqual(
        BUDGET_THRESHOLDS[i + 1].min
      );
    }
  });

  it('covers full range from 0 to infinity', () => {
    expect(BUDGET_THRESHOLDS[0].min).toBe(0);
    expect(BUDGET_THRESHOLDS[3].max).toBe(Infinity);
  });
});

describe('getArchetype', () => {
  it('returns archetype by ID', () => {
    const result = getArchetype('strategic');
    expect(result?.id).toBe('strategic');
    expect(result?.label).toBe('Strategic Initiatives');
  });

  it('returns undefined for invalid ID', () => {
    const result = getArchetype('invalid' as any);
    expect(result).toBeUndefined();
  });
});

describe('getBudgetThreshold', () => {
  it('returns threshold by ID', () => {
    const result = getBudgetThreshold('tier2');
    expect(result?.id).toBe('tier2');
    expect(result?.min).toBe(50000);
  });

  it('returns undefined for invalid ID', () => {
    const result = getBudgetThreshold('invalid' as any);
    expect(result).toBeUndefined();
  });
});

describe('hasMinimumSamples', () => {
  it('returns true when skipped', () => {
    const data: ArchetypeData = {
      archetypeId: 'strategic',
      skipped: true,
      samples: [],
    };
    expect(hasMinimumSamples(data)).toBe(true);
  });

  it('returns true when samples >= minSamples', () => {
    const data: ArchetypeData = {
      archetypeId: 'strategic',
      skipped: false,
      samples: [
        { id: '1', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
        { id: '2', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
        { id: '3', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
      ],
    };
    expect(hasMinimumSamples(data)).toBe(true);
  });

  it('returns false when samples < minSamples', () => {
    const data: ArchetypeData = {
      archetypeId: 'strategic',
      skipped: false,
      samples: [
        { id: '1', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
        { id: '2', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
      ],
    };
    expect(hasMinimumSamples(data)).toBe(false);
  });
});

describe('countValidArchetypes', () => {
  it('counts archetypes with sufficient samples', () => {
    const archetypes: ArchetypeData[] = [
      {
        archetypeId: 'strategic',
        skipped: false,
        samples: [
          { id: '1', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
          { id: '2', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
          { id: '3', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
        ],
      },
      {
        archetypeId: 'budget',
        skipped: false,
        samples: [
          { id: '4', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
        ],
      },
    ];
    expect(countValidArchetypes(archetypes)).toBe(1);
  });

  it('excludes skipped archetypes', () => {
    const archetypes: ArchetypeData[] = [
      {
        archetypeId: 'strategic',
        skipped: true,
        samples: [],
      },
    ];
    expect(countValidArchetypes(archetypes)).toBe(0);
  });
});

describe('canCalculateVelocity', () => {
  it('returns true when at least 1 archetype has sufficient samples', () => {
    const archetypes: ArchetypeData[] = [
      {
        archetypeId: 'strategic',
        skipped: false,
        samples: [
          { id: '1', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
          { id: '2', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
          { id: '3', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
        ],
      },
    ];
    expect(canCalculateVelocity(archetypes)).toBe(true);
  });

  it('returns false when no archetype has sufficient samples', () => {
    const archetypes: ArchetypeData[] = [
      {
        archetypeId: 'strategic',
        skipped: false,
        samples: [
          { id: '1', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
        ],
      },
    ];
    expect(canCalculateVelocity(archetypes)).toBe(false);
  });
});

describe('generateSampleId', () => {
  it('generates unique IDs', () => {
    const id1 = generateSampleId();
    const id2 = generateSampleId();
    expect(id1).not.toBe(id2);
  });

  it('generates IDs starting with "sample-"', () => {
    const id = generateSampleId();
    expect(id).toMatch(/^sample-/);
  });
});

describe('validateSampleDates', () => {
  it('returns null for valid dates', () => {
    const result = validateSampleDates({
      requestDate: '2024-06-01',
      decisionDate: '2024-06-15',
      implementationDate: '2024-06-20',
    });
    expect(result).toBeNull();
  });

  it('returns error when request date is missing', () => {
    const result = validateSampleDates({
      decisionDate: '2024-06-15',
    });
    expect(result).toBe('Request date is required');
  });

  it('returns error when decision date is missing', () => {
    const result = validateSampleDates({
      requestDate: '2024-06-01',
    });
    expect(result).toBe('Decision date is required');
  });

  it('returns error when decision date is before request date', () => {
    const result = validateSampleDates({
      requestDate: '2024-06-15',
      decisionDate: '2024-06-01',
    });
    expect(result).toBe('Decision date must be on or after request date');
  });

  it('returns error when implementation date is before decision date', () => {
    const result = validateSampleDates({
      requestDate: '2024-06-01',
      decisionDate: '2024-06-15',
      implementationDate: '2024-06-10',
    });
    expect(result).toBe('Implementation date must be on or after decision date');
  });

  it('allows same date for request and decision', () => {
    const result = validateSampleDates({
      requestDate: '2024-06-15',
      decisionDate: '2024-06-15',
    });
    expect(result).toBeNull();
  });

  it('allows missing implementation date', () => {
    const result = validateSampleDates({
      requestDate: '2024-06-01',
      decisionDate: '2024-06-15',
    });
    expect(result).toBeNull();
  });
});
