import { describe, it, expect } from 'vitest';
import {
  BENCHMARKS,
  BUDGET_BENCHMARKS,
  BENCHMARK_LABELS,
  getBenchmarksForArchetype,
  getBenchmarkLevel,
  calculateGapToFast,
  getBenchmarkLevelColor,
  getBenchmarkColumnStyle,
} from './benchmarks';

/**
 * Benchmark Constants and Functions Tests
 *
 * Story 10.3: Benchmark Comparison Table
 * Covers: AC 3, 5 (Benchmark values match Playbook 1, budget tier handling)
 */

describe('Benchmark Constants', () => {
  describe('BENCHMARKS', () => {
    it('has all non-budget archetypes', () => {
      expect(Object.keys(BENCHMARKS)).toEqual(['strategic', 'technology', 'hiring', 'analytics']);
    });

    it('has correct strategic benchmarks from Playbook 1', () => {
      expect(BENCHMARKS.strategic.fast.max).toBe(14);
      expect(BENCHMARKS.strategic.average.max).toBe(45);
      expect(BENCHMARKS.strategic.slow.max).toBe(90);
      expect(BENCHMARKS.strategic.crisis.min).toBe(90);
    });

    it('has correct technology benchmarks from Playbook 1', () => {
      expect(BENCHMARKS.technology.fast.max).toBe(7);
      expect(BENCHMARKS.technology.average.max).toBe(21);
      expect(BENCHMARKS.technology.slow.max).toBe(45);
      expect(BENCHMARKS.technology.crisis.min).toBe(45);
    });

    it('has correct hiring benchmarks from Playbook 1', () => {
      expect(BENCHMARKS.hiring.fast.max).toBe(14);
      expect(BENCHMARKS.hiring.average.max).toBe(30);
      expect(BENCHMARKS.hiring.slow.max).toBe(60);
      expect(BENCHMARKS.hiring.crisis.min).toBe(60);
    });

    it('has correct analytics benchmarks from Playbook 1', () => {
      expect(BENCHMARKS.analytics.fast.max).toBe(3);
      expect(BENCHMARKS.analytics.average.max).toBe(7);
      expect(BENCHMARKS.analytics.slow.max).toBe(14);
      expect(BENCHMARKS.analytics.crisis.min).toBe(14);
    });
  });

  describe('BUDGET_BENCHMARKS', () => {
    it('has all budget tiers', () => {
      expect(Object.keys(BUDGET_BENCHMARKS)).toEqual(['tier1', 'tier2', 'tier3', 'tier4']);
    });

    it('has correct tier1 (<$50K) benchmarks', () => {
      expect(BUDGET_BENCHMARKS.tier1.fast.max).toBe(5);
      expect(BUDGET_BENCHMARKS.tier1.average.max).toBe(14);
      expect(BUDGET_BENCHMARKS.tier1.slow.max).toBe(30);
      expect(BUDGET_BENCHMARKS.tier1.crisis.min).toBe(30);
    });

    it('has correct tier2 ($50K-$500K) benchmarks', () => {
      expect(BUDGET_BENCHMARKS.tier2.fast.max).toBe(10);
      expect(BUDGET_BENCHMARKS.tier2.average.max).toBe(30);
      expect(BUDGET_BENCHMARKS.tier2.slow.max).toBe(60);
      expect(BUDGET_BENCHMARKS.tier2.crisis.min).toBe(60);
    });

    it('has correct tier3 ($500K-$5M) benchmarks', () => {
      expect(BUDGET_BENCHMARKS.tier3.fast.max).toBe(21);
      expect(BUDGET_BENCHMARKS.tier3.average.max).toBe(60);
      expect(BUDGET_BENCHMARKS.tier3.slow.max).toBe(120);
      expect(BUDGET_BENCHMARKS.tier3.crisis.min).toBe(120);
    });

    it('has correct tier4 (>$5M) benchmarks', () => {
      expect(BUDGET_BENCHMARKS.tier4.fast.max).toBe(45);
      expect(BUDGET_BENCHMARKS.tier4.average.max).toBe(90);
      expect(BUDGET_BENCHMARKS.tier4.slow.max).toBe(180);
      expect(BUDGET_BENCHMARKS.tier4.crisis.min).toBe(180);
    });
  });

  describe('BENCHMARK_LABELS', () => {
    it('has labels for all levels', () => {
      expect(Object.keys(BENCHMARK_LABELS)).toEqual(['fast', 'average', 'slow', 'crisis']);
    });

    it('has label and description for each level', () => {
      expect(BENCHMARK_LABELS.fast.label).toBe('Fast');
      expect(BENCHMARK_LABELS.fast.description).toBeDefined();
      expect(BENCHMARK_LABELS.crisis.label).toBe('Crisis');
      expect(BENCHMARK_LABELS.crisis.description).toBeDefined();
    });
  });
});

describe('getBenchmarksForArchetype', () => {
  it('returns correct benchmarks for strategic', () => {
    const benchmarks = getBenchmarksForArchetype('strategic');
    expect(benchmarks).toBe(BENCHMARKS.strategic);
  });

  it('returns correct benchmarks for technology', () => {
    const benchmarks = getBenchmarksForArchetype('technology');
    expect(benchmarks).toBe(BENCHMARKS.technology);
  });

  it('returns correct benchmarks for hiring', () => {
    const benchmarks = getBenchmarksForArchetype('hiring');
    expect(benchmarks).toBe(BENCHMARKS.hiring);
  });

  it('returns correct benchmarks for analytics', () => {
    const benchmarks = getBenchmarksForArchetype('analytics');
    expect(benchmarks).toBe(BENCHMARKS.analytics);
  });

  it('returns tier2 by default for budget without threshold', () => {
    const benchmarks = getBenchmarksForArchetype('budget');
    expect(benchmarks).toBe(BUDGET_BENCHMARKS.tier2);
  });

  it('returns correct tier for budget with threshold', () => {
    expect(getBenchmarksForArchetype('budget', 'tier1')).toBe(BUDGET_BENCHMARKS.tier1);
    expect(getBenchmarksForArchetype('budget', 'tier2')).toBe(BUDGET_BENCHMARKS.tier2);
    expect(getBenchmarksForArchetype('budget', 'tier3')).toBe(BUDGET_BENCHMARKS.tier3);
    expect(getBenchmarksForArchetype('budget', 'tier4')).toBe(BUDGET_BENCHMARKS.tier4);
  });
});

describe('getBenchmarkLevel', () => {
  const strategicBenchmarks = BENCHMARKS.strategic;

  it('returns fast for values at or below fast threshold', () => {
    expect(getBenchmarkLevel(10, strategicBenchmarks)).toBe('fast');
    expect(getBenchmarkLevel(14, strategicBenchmarks)).toBe('fast');
  });

  it('returns average for values above fast but at or below average', () => {
    expect(getBenchmarkLevel(15, strategicBenchmarks)).toBe('average');
    expect(getBenchmarkLevel(30, strategicBenchmarks)).toBe('average');
    expect(getBenchmarkLevel(45, strategicBenchmarks)).toBe('average');
  });

  it('returns slow for values above average but at or below slow', () => {
    expect(getBenchmarkLevel(46, strategicBenchmarks)).toBe('slow');
    expect(getBenchmarkLevel(75, strategicBenchmarks)).toBe('slow');
    expect(getBenchmarkLevel(90, strategicBenchmarks)).toBe('slow');
  });

  it('returns crisis for values above slow threshold', () => {
    expect(getBenchmarkLevel(91, strategicBenchmarks)).toBe('crisis');
    expect(getBenchmarkLevel(120, strategicBenchmarks)).toBe('crisis');
    expect(getBenchmarkLevel(365, strategicBenchmarks)).toBe('crisis');
  });

  it('works correctly with analytics (tighter thresholds)', () => {
    const analyticsBenchmarks = BENCHMARKS.analytics;
    expect(getBenchmarkLevel(2, analyticsBenchmarks)).toBe('fast');
    expect(getBenchmarkLevel(5, analyticsBenchmarks)).toBe('average');
    expect(getBenchmarkLevel(10, analyticsBenchmarks)).toBe('slow');
    expect(getBenchmarkLevel(20, analyticsBenchmarks)).toBe('crisis');
  });
});

describe('calculateGapToFast', () => {
  const strategicBenchmarks = BENCHMARKS.strategic;

  it('returns 0 when user is at or below fast threshold', () => {
    expect(calculateGapToFast(10, strategicBenchmarks)).toBe(0);
    expect(calculateGapToFast(14, strategicBenchmarks)).toBe(0);
  });

  it('returns positive gap when user is above fast threshold', () => {
    expect(calculateGapToFast(20, strategicBenchmarks)).toBe(6); // 20 - 14 = 6
    expect(calculateGapToFast(45, strategicBenchmarks)).toBe(31); // 45 - 14 = 31
    expect(calculateGapToFast(100, strategicBenchmarks)).toBe(86); // 100 - 14 = 86
  });

  it('works with budget tier benchmarks', () => {
    const tier1Benchmarks = BUDGET_BENCHMARKS.tier1;
    expect(calculateGapToFast(3, tier1Benchmarks)).toBe(0);
    expect(calculateGapToFast(10, tier1Benchmarks)).toBe(5); // 10 - 5 = 5
  });
});

describe('getBenchmarkLevelColor', () => {
  it('returns green colors for fast', () => {
    const colors = getBenchmarkLevelColor('fast');
    expect(colors.bg).toContain('green');
    expect(colors.text).toContain('green');
    expect(colors.border).toContain('green');
  });

  it('returns yellow colors for average', () => {
    const colors = getBenchmarkLevelColor('average');
    expect(colors.bg).toContain('yellow');
    expect(colors.text).toContain('yellow');
    expect(colors.border).toContain('yellow');
  });

  it('returns orange colors for slow', () => {
    const colors = getBenchmarkLevelColor('slow');
    expect(colors.bg).toContain('orange');
    expect(colors.text).toContain('orange');
    expect(colors.border).toContain('orange');
  });

  it('returns red colors for crisis', () => {
    const colors = getBenchmarkLevelColor('crisis');
    expect(colors.bg).toContain('red');
    expect(colors.text).toContain('red');
    expect(colors.border).toContain('red');
  });
});

describe('getBenchmarkColumnStyle', () => {
  it('returns highlighted style when column matches user level', () => {
    const style = getBenchmarkColumnStyle('fast', 'fast');
    expect(style.bg).toContain('green');
    expect(style.text).toContain('green');
  });

  it('returns neutral style when column does not match user level', () => {
    const style = getBenchmarkColumnStyle('slow', 'fast');
    expect(style.bg).toBe('bg-transparent');
    expect(style.text).toBe('text-muted-foreground');
  });

  it('highlights correct column for each level', () => {
    expect(getBenchmarkColumnStyle('average', 'average').bg).toContain('yellow');
    expect(getBenchmarkColumnStyle('slow', 'slow').bg).toContain('orange');
    expect(getBenchmarkColumnStyle('crisis', 'crisis').bg).toContain('red');
  });
});
