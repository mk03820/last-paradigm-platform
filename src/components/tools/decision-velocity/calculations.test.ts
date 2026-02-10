import { describe, it, expect } from 'vitest';
import {
  daysBetween,
  median,
  percentile90,
  getDecisionLatency,
  getExecutionLatency,
  getTotalCycleTime,
  calculateLatencyMetrics,
  calculateArchetypeMetrics,
  calculateAllMetrics,
  findSlowestArchetype,
  calculateAggregateMetrics,
  getPerformanceLevel,
  getPerformanceColor,
  getPerformanceBgColor,
} from './calculations';
import type { ArchetypeData, ArchetypeId } from './constants';

/**
 * Latency Calculation Tests
 *
 * Story 10.2: Latency Calculation and Display
 */

describe('daysBetween', () => {
  it('calculates days between two dates', () => {
    expect(daysBetween('2024-01-01', '2024-01-10')).toBe(9);
  });

  it('returns 0 for same date', () => {
    expect(daysBetween('2024-01-15', '2024-01-15')).toBe(0);
  });

  it('handles month boundaries', () => {
    expect(daysBetween('2024-01-28', '2024-02-02')).toBe(5);
  });

  it('handles year boundaries', () => {
    expect(daysBetween('2023-12-28', '2024-01-03')).toBe(6);
  });
});

describe('median', () => {
  it('returns 0 for empty array', () => {
    expect(median([])).toBe(0);
  });

  it('returns single value for array of one', () => {
    expect(median([5])).toBe(5);
  });

  it('calculates median for odd-length array', () => {
    expect(median([1, 3, 5])).toBe(3);
  });

  it('calculates median for even-length array', () => {
    expect(median([1, 2, 3, 4])).toBe(3); // (2+3)/2 = 2.5, rounded to 3
  });

  it('handles unsorted array', () => {
    expect(median([5, 1, 3])).toBe(3);
  });
});

describe('percentile90', () => {
  it('returns 0 for empty array', () => {
    expect(percentile90([])).toBe(0);
  });

  it('returns single value for array of one', () => {
    expect(percentile90([5])).toBe(5);
  });

  it('calculates 90th percentile', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(percentile90(values)).toBe(9); // 90th percentile of 1-10 is 9
  });

  it('handles small arrays', () => {
    expect(percentile90([5, 10, 15])).toBe(15);
  });
});

describe('getDecisionLatency', () => {
  it('calculates days from request to decision', () => {
    const sample = {
      id: '1',
      description: 'Test',
      requestDate: '2024-01-01',
      decisionDate: '2024-01-15',
    };
    expect(getDecisionLatency(sample)).toBe(14);
  });
});

describe('getExecutionLatency', () => {
  it('calculates days from decision to implementation', () => {
    const sample = {
      id: '1',
      description: 'Test',
      requestDate: '2024-01-01',
      decisionDate: '2024-01-15',
      implementationDate: '2024-01-20',
    };
    expect(getExecutionLatency(sample)).toBe(5);
  });

  it('returns null when no implementation date', () => {
    const sample = {
      id: '1',
      description: 'Test',
      requestDate: '2024-01-01',
      decisionDate: '2024-01-15',
    };
    expect(getExecutionLatency(sample)).toBeNull();
  });
});

describe('getTotalCycleTime', () => {
  it('calculates days from request to implementation', () => {
    const sample = {
      id: '1',
      description: 'Test',
      requestDate: '2024-01-01',
      decisionDate: '2024-01-15',
      implementationDate: '2024-01-20',
    };
    expect(getTotalCycleTime(sample)).toBe(19);
  });

  it('returns null when no implementation date', () => {
    const sample = {
      id: '1',
      description: 'Test',
      requestDate: '2024-01-01',
      decisionDate: '2024-01-15',
    };
    expect(getTotalCycleTime(sample)).toBeNull();
  });
});

describe('calculateLatencyMetrics', () => {
  it('calculates metrics from values', () => {
    const values = [5, 10, 15, 20, 25];
    const metrics = calculateLatencyMetrics(values);
    expect(metrics.median).toBe(15);
    expect(metrics.p90).toBe(25);
    expect(metrics.sampleCount).toBe(5);
  });
});

describe('calculateArchetypeMetrics', () => {
  it('returns null for skipped archetype', () => {
    const data: ArchetypeData = {
      archetypeId: 'strategic',
      skipped: true,
      samples: [],
    };
    expect(calculateArchetypeMetrics(data)).toBeNull();
  });

  it('returns null for insufficient samples', () => {
    const data: ArchetypeData = {
      archetypeId: 'strategic',
      skipped: false,
      samples: [
        { id: '1', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-10' },
        { id: '2', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-15' },
      ],
    };
    expect(calculateArchetypeMetrics(data)).toBeNull();
  });

  it('calculates metrics for valid archetype', () => {
    const data: ArchetypeData = {
      archetypeId: 'strategic',
      skipped: false,
      samples: [
        { id: '1', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-10' },
        { id: '2', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-15' },
        { id: '3', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-20' },
      ],
    };
    const metrics = calculateArchetypeMetrics(data);
    expect(metrics).not.toBeNull();
    expect(metrics?.archetypeId).toBe('strategic');
    expect(metrics?.sampleCount).toBe(3);
    expect(metrics?.decisionLatency.median).toBe(14); // 9, 14, 19 -> median is 14
  });

  it('includes execution latency when implementation dates provided', () => {
    const data: ArchetypeData = {
      archetypeId: 'strategic',
      skipped: false,
      samples: [
        { id: '1', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-10', implementationDate: '2024-01-15' },
        { id: '2', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-10', implementationDate: '2024-01-20' },
        { id: '3', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-10', implementationDate: '2024-01-25' },
      ],
    };
    const metrics = calculateArchetypeMetrics(data);
    expect(metrics?.executionLatency).not.toBeNull();
    expect(metrics?.totalCycleTime).not.toBeNull();
  });

  it('handles mixed implementation dates', () => {
    const data: ArchetypeData = {
      archetypeId: 'strategic',
      skipped: false,
      samples: [
        { id: '1', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-10', implementationDate: '2024-01-15' },
        { id: '2', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-10' }, // No implementation
        { id: '3', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-10', implementationDate: '2024-01-25' },
      ],
    };
    const metrics = calculateArchetypeMetrics(data);
    expect(metrics?.executionLatency?.sampleCount).toBe(2); // Only 2 have implementation dates
  });
});

describe('calculateAllMetrics', () => {
  it('returns metrics for valid archetypes only', () => {
    const archetypes: Record<ArchetypeId, ArchetypeData> = {
      strategic: {
        archetypeId: 'strategic',
        skipped: false,
        samples: [
          { id: '1', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-10' },
          { id: '2', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-15' },
          { id: '3', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-20' },
        ],
      },
      budget: {
        archetypeId: 'budget',
        skipped: true,
        samples: [],
      },
      technology: {
        archetypeId: 'technology',
        skipped: false,
        samples: [], // Insufficient
      },
      hiring: {
        archetypeId: 'hiring',
        skipped: false,
        samples: [
          { id: '4', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-05' },
          { id: '5', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-10' },
          { id: '6', description: 'Test', requestDate: '2024-01-01', decisionDate: '2024-01-15' },
        ],
      },
      analytics: {
        archetypeId: 'analytics',
        skipped: false,
        samples: [],
      },
    };

    const metrics = calculateAllMetrics(archetypes);
    expect(metrics).toHaveLength(2); // Only strategic and hiring have valid data
  });
});

describe('findSlowestArchetype', () => {
  it('returns null for empty metrics', () => {
    expect(findSlowestArchetype([])).toBeNull();
  });

  it('finds archetype with highest median', () => {
    const metrics = [
      { archetypeId: 'strategic' as ArchetypeId, archetypeLabel: 'Strategic', sampleCount: 3, decisionLatency: { median: 10, p90: 15, sampleCount: 3 }, executionLatency: null, totalCycleTime: null },
      { archetypeId: 'hiring' as ArchetypeId, archetypeLabel: 'Hiring', sampleCount: 3, decisionLatency: { median: 25, p90: 30, sampleCount: 3 }, executionLatency: null, totalCycleTime: null },
      { archetypeId: 'technology' as ArchetypeId, archetypeLabel: 'Technology', sampleCount: 3, decisionLatency: { median: 15, p90: 20, sampleCount: 3 }, executionLatency: null, totalCycleTime: null },
    ];
    const slowest = findSlowestArchetype(metrics);
    expect(slowest?.archetypeId).toBe('hiring');
  });
});

describe('calculateAggregateMetrics', () => {
  it('returns null for empty metrics', () => {
    expect(calculateAggregateMetrics([])).toBeNull();
  });

  it('aggregates metrics across archetypes', () => {
    const metrics = [
      { archetypeId: 'strategic' as ArchetypeId, archetypeLabel: 'Strategic', sampleCount: 3, decisionLatency: { median: 10, p90: 15, sampleCount: 3 }, executionLatency: null, totalCycleTime: null },
      { archetypeId: 'hiring' as ArchetypeId, archetypeLabel: 'Hiring', sampleCount: 5, decisionLatency: { median: 20, p90: 25, sampleCount: 5 }, executionLatency: null, totalCycleTime: null },
    ];
    const aggregate = calculateAggregateMetrics(metrics);
    expect(aggregate?.sampleCount).toBe(8); // 3 + 5
    expect(aggregate?.archetypeLabel).toBe('All Categories');
  });
});

describe('getPerformanceLevel', () => {
  it('returns fast for <= 10 days', () => {
    expect(getPerformanceLevel(5)).toBe('fast');
    expect(getPerformanceLevel(10)).toBe('fast');
  });

  it('returns average for 11-30 days', () => {
    expect(getPerformanceLevel(11)).toBe('average');
    expect(getPerformanceLevel(30)).toBe('average');
  });

  it('returns slow for 31-60 days', () => {
    expect(getPerformanceLevel(31)).toBe('slow');
    expect(getPerformanceLevel(60)).toBe('slow');
  });

  it('returns crisis for > 60 days', () => {
    expect(getPerformanceLevel(61)).toBe('crisis');
    expect(getPerformanceLevel(100)).toBe('crisis');
  });
});

describe('getPerformanceColor', () => {
  it('returns correct color classes', () => {
    expect(getPerformanceColor('fast')).toContain('green');
    expect(getPerformanceColor('average')).toContain('yellow');
    expect(getPerformanceColor('slow')).toContain('orange');
    expect(getPerformanceColor('crisis')).toContain('red');
  });
});

describe('getPerformanceBgColor', () => {
  it('returns correct background color classes', () => {
    expect(getPerformanceBgColor('fast')).toContain('green');
    expect(getPerformanceBgColor('average')).toContain('yellow');
    expect(getPerformanceBgColor('slow')).toContain('orange');
    expect(getPerformanceBgColor('crisis')).toContain('red');
  });
});
