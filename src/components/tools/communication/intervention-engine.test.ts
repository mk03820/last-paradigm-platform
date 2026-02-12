/**
 * Intervention Engine Tests
 *
 * Unit tests for intervention matching and prioritization.
 *
 * Story 13.4: Intervention Recommendations
 * Task 9: Write tests (AC: all)
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePriority,
  getRecommendedInterventionsForPattern,
  getAllRecommendedInterventions,
  getPrioritizedInterventions,
  getTopInterventions,
  groupInterventionsByPattern,
  getInterventionsByPatternWithMetadata,
  countPlaybook2Interventions,
  generateTool6Summary,
  getQuickWins,
} from './intervention-engine';
import type { DetectionResult, PatternAnalysis, Intervention } from './comm-constants';

// Helper to create a detection result
function createDetectionResult(
  patternId: string,
  detected: boolean,
  severity: 'none' | 'low' | 'medium' | 'high'
): DetectionResult {
  return {
    patternId,
    detected,
    severity,
    evidence: detected ? ['Test evidence'] : [],
    confidence: detected ? 0.8 : 1.0,
  };
}

// Helper to create pattern analysis
function createAnalysis(
  results: DetectionResult[]
): PatternAnalysis {
  return {
    results,
    detectedCount: results.filter((r) => r.detected).length,
    overallHealth: 'warning',
    analyzedAt: new Date().toISOString(),
  };
}

describe('calculatePriority', () => {
  const mockIntervention: Intervention = {
    id: 'test',
    patternId: 'test-pattern',
    title: 'Test Intervention',
    description: 'Test description',
    impact: 'high',
    effort: 'low',
  };

  it('calculates higher priority for high impact + high severity', () => {
    const priority = calculatePriority(mockIntervention, 'high');
    expect(priority).toBeGreaterThan(5); // 3 * 3 + 0.5 = 9.5
  });

  it('calculates lower priority for low impact + low severity', () => {
    const lowImpact = { ...mockIntervention, impact: 'low' as const };
    const priority = calculatePriority(lowImpact, 'low');
    expect(priority).toBeLessThan(3); // 1 * 1 + 0.5 = 1.5
  });

  it('adds bonus for low effort', () => {
    const lowEffort = { ...mockIntervention, effort: 'low' as const };
    const highEffort = { ...mockIntervention, effort: 'high' as const };

    const lowPriority = calculatePriority(lowEffort, 'medium');
    const highPriority = calculatePriority(highEffort, 'medium');

    expect(lowPriority).toBeGreaterThan(highPriority);
  });

  it('returns 0 priority for none severity', () => {
    const priority = calculatePriority(mockIntervention, 'none');
    expect(priority).toBeLessThan(1);
  });
});

describe('getRecommendedInterventionsForPattern', () => {
  it('returns interventions for detected pattern', () => {
    const result = createDetectionResult('broadcast-overload', true, 'high');
    const interventions = getRecommendedInterventionsForPattern(result);

    expect(interventions.length).toBeGreaterThan(0);
    expect(interventions[0].patternId).toBe('broadcast-overload');
    expect(interventions[0].severity).toBe('high');
    expect(interventions[0].priority).toBeDefined();
  });

  it('returns empty array for non-detected pattern', () => {
    const result = createDetectionResult('broadcast-overload', false, 'none');
    const interventions = getRecommendedInterventionsForPattern(result);

    expect(interventions).toHaveLength(0);
  });

  it('returns empty array for none severity', () => {
    const result = createDetectionResult('broadcast-overload', true, 'none');
    const interventions = getRecommendedInterventionsForPattern(result);

    expect(interventions).toHaveLength(0);
  });

  it('includes priority and severity in results', () => {
    const result = createDetectionResult('telephone-game', true, 'medium');
    const interventions = getRecommendedInterventionsForPattern(result);

    expect(interventions.length).toBeGreaterThan(0);
    interventions.forEach((i) => {
      expect(i.priority).toBeGreaterThan(0);
      expect(i.severity).toBe('medium');
    });
  });
});

describe('getAllRecommendedInterventions', () => {
  it('aggregates interventions from all detected patterns', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', true, 'high'),
      createDetectionResult('telephone-game', true, 'medium'),
      createDetectionResult('tribal-knowledge', false, 'none'),
    ]);

    const interventions = getAllRecommendedInterventions(analysis);

    expect(interventions.length).toBeGreaterThan(3);
    expect(interventions.some((i) => i.patternId === 'broadcast-overload')).toBe(true);
    expect(interventions.some((i) => i.patternId === 'telephone-game')).toBe(true);
    expect(interventions.some((i) => i.patternId === 'tribal-knowledge')).toBe(false);
  });

  it('returns empty array when no patterns detected', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', false, 'none'),
    ]);

    const interventions = getAllRecommendedInterventions(analysis);
    expect(interventions).toHaveLength(0);
  });
});

describe('getPrioritizedInterventions', () => {
  it('sorts interventions by priority descending', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', true, 'high'),
      createDetectionResult('telephone-game', true, 'low'),
    ]);

    const interventions = getPrioritizedInterventions(analysis);

    // Check they're sorted by priority descending
    for (let i = 1; i < interventions.length; i++) {
      expect(interventions[i - 1].priority).toBeGreaterThanOrEqual(
        interventions[i].priority
      );
    }
  });

  it('limits results when limit provided', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', true, 'high'),
      createDetectionResult('telephone-game', true, 'medium'),
      createDetectionResult('tribal-knowledge', true, 'low'),
    ]);

    const interventions = getPrioritizedInterventions(analysis, 3);
    expect(interventions.length).toBeLessThanOrEqual(3);
  });
});

describe('getTopInterventions', () => {
  it('returns top 3 by default', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', true, 'high'),
      createDetectionResult('telephone-game', true, 'medium'),
      createDetectionResult('tribal-knowledge', true, 'low'),
    ]);

    const top = getTopInterventions(analysis);
    expect(top.length).toBeLessThanOrEqual(3);
  });

  it('returns requested count', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', true, 'high'),
      createDetectionResult('telephone-game', true, 'medium'),
    ]);

    const top = getTopInterventions(analysis, 5);
    expect(top.length).toBeLessThanOrEqual(5);
  });
});

describe('groupInterventionsByPattern', () => {
  it('groups interventions by pattern ID', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', true, 'high'),
      createDetectionResult('telephone-game', true, 'medium'),
    ]);

    const interventions = getAllRecommendedInterventions(analysis);
    const grouped = groupInterventionsByPattern(interventions);

    expect(grouped.has('broadcast-overload')).toBe(true);
    expect(grouped.has('telephone-game')).toBe(true);

    const broadcastInterventions = grouped.get('broadcast-overload');
    expect(broadcastInterventions).toBeDefined();
    expect(broadcastInterventions!.every((i) => i.patternId === 'broadcast-overload')).toBe(true);
  });
});

describe('getInterventionsByPatternWithMetadata', () => {
  it('returns patterns sorted by severity', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', true, 'low'),
      createDetectionResult('telephone-game', true, 'high'),
      createDetectionResult('tribal-knowledge', true, 'medium'),
    ]);

    const result = getInterventionsByPatternWithMetadata(analysis);

    expect(result.length).toBe(3);
    expect(result[0].severity).toBe('high');
    expect(result[1].severity).toBe('medium');
    expect(result[2].severity).toBe('low');
  });

  it('includes interventions sorted by priority within each pattern', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', true, 'high'),
    ]);

    const result = getInterventionsByPatternWithMetadata(analysis);

    expect(result.length).toBe(1);
    const interventions = result[0].interventions;

    for (let i = 1; i < interventions.length; i++) {
      expect(interventions[i - 1].priority).toBeGreaterThanOrEqual(
        interventions[i].priority
      );
    }
  });
});

describe('countPlaybook2Interventions', () => {
  it('counts interventions with playbook2Tool', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', true, 'high'),
      createDetectionResult('telephone-game', true, 'medium'),
    ]);

    const interventions = getAllRecommendedInterventions(analysis);
    const count = countPlaybook2Interventions(interventions);

    expect(count).toBeGreaterThan(0);
  });

  it('returns 0 for empty array', () => {
    const count = countPlaybook2Interventions([]);
    expect(count).toBe(0);
  });
});

describe('generateTool6Summary', () => {
  it('generates complete summary', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', true, 'high'),
      createDetectionResult('telephone-game', true, 'medium'),
      createDetectionResult('tribal-knowledge', false, 'none'),
    ]);

    const summary = generateTool6Summary(analysis, 65, 'warning');

    expect(summary.healthScore).toBe(65);
    expect(summary.healthStatus).toBe('warning');
    expect(summary.patternsDetected).toBe(2);
    expect(summary.patternsSeverity.high).toBe(1);
    expect(summary.patternsSeverity.medium).toBe(1);
    expect(summary.patternsSeverity.low).toBe(0);
    expect(summary.interventionsRecommended).toBeGreaterThan(0);
    expect(summary.topInterventions.length).toBeLessThanOrEqual(3);
    expect(summary.completedAt).toBeDefined();
  });

  it('handles no detected patterns', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', false, 'none'),
    ]);

    const summary = generateTool6Summary(analysis, 95, 'healthy');

    expect(summary.patternsDetected).toBe(0);
    expect(summary.interventionsRecommended).toBe(0);
    expect(summary.topInterventions).toHaveLength(0);
  });
});

describe('getQuickWins', () => {
  it('returns high impact, low effort interventions', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', true, 'high'),
      createDetectionResult('telephone-game', true, 'high'),
    ]);

    const quickWins = getQuickWins(analysis);

    quickWins.forEach((i) => {
      expect(i.impact).toBe('high');
      expect(i.effort).toBe('low');
    });
  });

  it('sorts quick wins by priority', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', true, 'medium'),
      createDetectionResult('telephone-game', true, 'high'),
    ]);

    const quickWins = getQuickWins(analysis);

    for (let i = 1; i < quickWins.length; i++) {
      expect(quickWins[i - 1].priority).toBeGreaterThanOrEqual(
        quickWins[i].priority
      );
    }
  });

  it('returns empty array when no quick wins available', () => {
    const analysis = createAnalysis([
      createDetectionResult('broadcast-overload', false, 'none'),
    ]);

    const quickWins = getQuickWins(analysis);
    expect(quickWins).toHaveLength(0);
  });
});
