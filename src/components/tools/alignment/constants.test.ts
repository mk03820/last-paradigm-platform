import { describe, it, expect } from 'vitest';
import {
  ALIGNMENT_DIMENSIONS,
  SCORE_CATEGORIES,
  getScoreCategory,
  calculateCompositeScore,
} from './constants';

/**
 * Alignment Constants Tests
 *
 * Tests the dimension data and calculation functions.
 *
 * Story 9.1: Alignment Dimension Scoring Interface
 */

describe('ALIGNMENT_DIMENSIONS', () => {
  it('has exactly 5 dimensions', () => {
    expect(ALIGNMENT_DIMENSIONS).toHaveLength(5);
  });

  it('has correct dimension IDs', () => {
    const ids = ALIGNMENT_DIMENSIONS.map((d) => d.id);
    expect(ids).toEqual([
      'strategic',
      'execution',
      'technology',
      'people',
      'governance',
    ]);
  });

  it('weights sum to 1.0', () => {
    const totalWeight = ALIGNMENT_DIMENSIONS.reduce((sum, d) => sum + d.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0);
  });

  it('each dimension has 4 levels', () => {
    ALIGNMENT_DIMENSIONS.forEach((dimension) => {
      expect(dimension.levels).toHaveLength(4);
    });
  });

  it('levels have scores 1-4', () => {
    ALIGNMENT_DIMENSIONS.forEach((dimension) => {
      const scores = dimension.levels.map((l) => l.score);
      expect(scores).toEqual([1, 2, 3, 4]);
    });
  });

  it('strategic and execution have 30% weight each', () => {
    const strategic = ALIGNMENT_DIMENSIONS.find((d) => d.id === 'strategic');
    const execution = ALIGNMENT_DIMENSIONS.find((d) => d.id === 'execution');

    expect(strategic?.weight).toBe(0.3);
    expect(execution?.weight).toBe(0.3);
  });

  it('technology has 20% weight', () => {
    const technology = ALIGNMENT_DIMENSIONS.find((d) => d.id === 'technology');
    expect(technology?.weight).toBe(0.2);
  });

  it('people and governance have 10% weight each', () => {
    const people = ALIGNMENT_DIMENSIONS.find((d) => d.id === 'people');
    const governance = ALIGNMENT_DIMENSIONS.find((d) => d.id === 'governance');

    expect(people?.weight).toBe(0.1);
    expect(governance?.weight).toBe(0.1);
  });
});

describe('SCORE_CATEGORIES', () => {
  it('has 4 categories', () => {
    expect(SCORE_CATEGORIES).toHaveLength(4);
  });

  it('has correct labels in order', () => {
    const labels = SCORE_CATEGORIES.map((c) => c.label);
    expect(labels).toEqual(['Chaos', 'Siloed', 'Coordinated', 'Integrated']);
  });

  it('covers full score range 0-4', () => {
    expect(SCORE_CATEGORIES[0].min).toBe(0);
    expect(SCORE_CATEGORIES[SCORE_CATEGORIES.length - 1].max).toBe(4.0);
  });
});

describe('getScoreCategory', () => {
  it('returns Chaos for score below 1.8', () => {
    expect(getScoreCategory(1.0).label).toBe('Chaos');
    expect(getScoreCategory(1.7).label).toBe('Chaos');
  });

  it('returns Siloed for score 1.8 to <2.5', () => {
    expect(getScoreCategory(1.8).label).toBe('Siloed');
    expect(getScoreCategory(2.0).label).toBe('Siloed');
    expect(getScoreCategory(2.49).label).toBe('Siloed');
  });

  it('returns Coordinated for score 2.5 to <3.3', () => {
    expect(getScoreCategory(2.5).label).toBe('Coordinated');
    expect(getScoreCategory(2.6).label).toBe('Coordinated');
    expect(getScoreCategory(3.0).label).toBe('Coordinated');
    expect(getScoreCategory(3.29).label).toBe('Coordinated');
  });

  it('returns Integrated for score 3.3 and above', () => {
    expect(getScoreCategory(3.3).label).toBe('Integrated');
    expect(getScoreCategory(3.4).label).toBe('Integrated');
    expect(getScoreCategory(4.0).label).toBe('Integrated');
  });
});

describe('calculateCompositeScore', () => {
  it('returns 0 for empty scores', () => {
    expect(calculateCompositeScore({})).toBe(0);
  });

  it('calculates weighted average correctly', () => {
    // All scores at 3
    const allThrees = {
      strategic: 3,
      execution: 3,
      technology: 3,
      people: 3,
      governance: 3,
    };
    expect(calculateCompositeScore(allThrees)).toBeCloseTo(3.0);
  });

  it('applies correct weights', () => {
    // Strategic at 4 (30%), others at 1
    const weighted = {
      strategic: 4,
      execution: 1,
      technology: 1,
      people: 1,
      governance: 1,
    };
    // Expected: (4*0.3 + 1*0.3 + 1*0.2 + 1*0.1 + 1*0.1) = 1.2 + 0.3 + 0.2 + 0.1 + 0.1 = 1.9
    expect(calculateCompositeScore(weighted)).toBeCloseTo(1.9);
  });

  it('handles partial scores', () => {
    // Only strategic and execution (60% of weight)
    const partial = {
      strategic: 4,
      execution: 2,
    };
    // With normalization: (4*0.3 + 2*0.3) / 0.6 = 1.8 / 0.6 = 3.0
    expect(calculateCompositeScore(partial)).toBeCloseTo(3.0);
  });

  it('returns correct category for all 4s', () => {
    const allFours = {
      strategic: 4,
      execution: 4,
      technology: 4,
      people: 4,
      governance: 4,
    };
    const score = calculateCompositeScore(allFours);
    expect(score).toBe(4.0);
    expect(getScoreCategory(score).label).toBe('Integrated');
  });

  it('returns correct category for all 1s', () => {
    const allOnes = {
      strategic: 1,
      execution: 1,
      technology: 1,
      people: 1,
      governance: 1,
    };
    const score = calculateCompositeScore(allOnes);
    expect(score).toBe(1.0);
    expect(getScoreCategory(score).label).toBe('Chaos');
  });
});
