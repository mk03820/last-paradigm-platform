import { describe, it, expect } from 'vitest';
import {
  BOTTLENECK_PATTERNS,
  SEVERITY_LABELS,
  calculatePatternSeverity,
  getSeverityColor,
  detectBottleneckPatterns,
  getOverallVelocityScore,
  getTopInterventions,
  type PatternDetection,
} from './bottleneck-patterns';
import type { ArchetypeMetrics } from './calculations';

/**
 * Bottleneck Patterns Tests
 *
 * Story 10.4: Bottleneck Pattern Identification
 * Covers: AC 1, 5 (Pattern definitions, detection thresholds)
 */

const createMetrics = (
  archetypeId: string,
  median: number,
  p90: number,
  executionMedian?: number
): ArchetypeMetrics => ({
  archetypeId: archetypeId as ArchetypeMetrics['archetypeId'],
  archetypeLabel: `${archetypeId} Label`,
  sampleCount: 5,
  decisionLatency: { median, p90, sampleCount: 5 },
  executionLatency: executionMedian
    ? { median: executionMedian, p90: executionMedian + 5, sampleCount: 3 }
    : null,
  totalCycleTime: null,
});

describe('Bottleneck Pattern Constants', () => {
  describe('BOTTLENECK_PATTERNS', () => {
    it('has all 4 patterns defined', () => {
      expect(Object.keys(BOTTLENECK_PATTERNS)).toEqual([
        'approval_layers',
        'meeting_dependencies',
        'unclear_handoffs',
        'rework_loops',
      ]);
    });

    it('each pattern has required fields', () => {
      for (const pattern of Object.values(BOTTLENECK_PATTERNS)) {
        expect(pattern.id).toBeDefined();
        expect(pattern.label).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(pattern.symptoms.length).toBeGreaterThanOrEqual(1);
        expect(pattern.diagnosticQuestions.length).toBeGreaterThanOrEqual(1);
        expect(pattern.interventions.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('each diagnostic question has id and question', () => {
      for (const pattern of Object.values(BOTTLENECK_PATTERNS)) {
        for (const q of pattern.diagnosticQuestions) {
          expect(q.id).toBeDefined();
          expect(q.question).toBeDefined();
          expect(q.question.endsWith('?')).toBe(true);
        }
      }
    });

    it('each intervention has id, title, and description', () => {
      for (const pattern of Object.values(BOTTLENECK_PATTERNS)) {
        for (const i of pattern.interventions) {
          expect(i.id).toBeDefined();
          expect(i.title).toBeDefined();
          expect(i.description).toBeDefined();
        }
      }
    });
  });

  describe('SEVERITY_LABELS', () => {
    it('has labels for all severity levels', () => {
      expect(SEVERITY_LABELS.low).toBe('Low Impact');
      expect(SEVERITY_LABELS.medium).toBe('Medium Impact');
      expect(SEVERITY_LABELS.high).toBe('High Impact');
      expect(SEVERITY_LABELS.critical).toBe('Critical Impact');
    });
  });
});

describe('calculatePatternSeverity', () => {
  it('returns low for small gaps', () => {
    expect(calculatePatternSeverity(5, 14)).toBe('low');
    expect(calculatePatternSeverity(6, 14)).toBe('low');
  });

  it('returns medium for moderate gaps', () => {
    expect(calculatePatternSeverity(10, 14)).toBe('medium');
    expect(calculatePatternSeverity(13, 14)).toBe('medium');
  });

  it('returns high for large gaps', () => {
    expect(calculatePatternSeverity(20, 14)).toBe('high');
    expect(calculatePatternSeverity(27, 14)).toBe('high');
  });

  it('returns critical for very large gaps', () => {
    expect(calculatePatternSeverity(30, 14)).toBe('critical');
    expect(calculatePatternSeverity(50, 14)).toBe('critical');
  });

  it('handles zero benchmark gracefully', () => {
    expect(calculatePatternSeverity(10, 0)).toBe('low');
  });
});

describe('getSeverityColor', () => {
  it('returns green colors for low', () => {
    const colors = getSeverityColor('low');
    expect(colors.bg).toContain('green');
    expect(colors.text).toContain('green');
    expect(colors.border).toContain('green');
  });

  it('returns yellow colors for medium', () => {
    const colors = getSeverityColor('medium');
    expect(colors.bg).toContain('yellow');
    expect(colors.text).toContain('yellow');
  });

  it('returns orange colors for high', () => {
    const colors = getSeverityColor('high');
    expect(colors.bg).toContain('orange');
    expect(colors.text).toContain('orange');
  });

  it('returns red colors for critical', () => {
    const colors = getSeverityColor('critical');
    expect(colors.bg).toContain('red');
    expect(colors.text).toContain('red');
  });
});

describe('detectBottleneckPatterns', () => {
  it('returns empty array for empty metrics', () => {
    expect(detectBottleneckPatterns([])).toEqual([]);
  });

  it('detects approval_layers when multiple archetypes have significant gaps', () => {
    const metrics = [
      createMetrics('strategic', 30, 45), // Gap to fast (14) = 16
      createMetrics('hiring', 25, 35), // Gap to fast (14) = 11
      createMetrics('technology', 20, 30), // Gap to fast (7) = 13
    ];

    const detections = detectBottleneckPatterns(metrics);
    const approval = detections.find((d) => d.patternId === 'approval_layers');

    expect(approval).toBeDefined();
    expect(approval?.detected).toBe(true);
    expect(approval?.affectedArchetypes.length).toBeGreaterThanOrEqual(2);
  });

  it('detects meeting_dependencies when latencies cluster around 7-day multiples', () => {
    const metrics = [
      createMetrics('strategic', 14, 21), // Close to 14 (2 weeks)
      createMetrics('hiring', 21, 28), // Close to 21 (3 weeks)
    ];

    const detections = detectBottleneckPatterns(metrics);
    const meeting = detections.find((d) => d.patternId === 'meeting_dependencies');

    expect(meeting).toBeDefined();
    expect(meeting?.detected).toBe(true);
  });

  it('detects unclear_handoffs when execution latency is high relative to decision', () => {
    const metrics = [
      createMetrics('strategic', 20, 30, 15), // Execution (15) > Decision (20) * 0.5
    ];

    const detections = detectBottleneckPatterns(metrics);
    const handoff = detections.find((d) => d.patternId === 'unclear_handoffs');

    expect(handoff).toBeDefined();
    expect(handoff?.detected).toBe(true);
    expect(handoff?.affectedArchetypes).toContain('strategic');
  });

  it('detects rework_loops when p90 is much higher than median', () => {
    const metrics = [
      createMetrics('strategic', 15, 45), // P90 (45) > 2x median (15)
    ];

    const detections = detectBottleneckPatterns(metrics);
    const rework = detections.find((d) => d.patternId === 'rework_loops');

    expect(rework).toBeDefined();
    expect(rework?.detected).toBe(true);
  });

  it('does not detect rework_loops when variance is low', () => {
    const metrics = [
      createMetrics('strategic', 15, 20), // P90 (20) < 2x median (15)
    ];

    const detections = detectBottleneckPatterns(metrics);
    const rework = detections.find((d) => d.patternId === 'rework_loops');

    expect(rework).toBeUndefined();
  });

  it('sets confidence to auto for all detections', () => {
    const metrics = [
      createMetrics('strategic', 30, 45),
      createMetrics('hiring', 25, 35),
    ];

    const detections = detectBottleneckPatterns(metrics);

    for (const detection of detections) {
      expect(detection.confidence).toBe('auto');
      expect(detection.confirmedQuestions).toEqual([]);
    }
  });
});

describe('getOverallVelocityScore', () => {
  it('returns average for empty metrics', () => {
    expect(getOverallVelocityScore([])).toBe('average');
  });

  it('returns fast when all archetypes are below fast threshold', () => {
    const metrics = [
      createMetrics('strategic', 10, 14), // Below fast (14)
      createMetrics('hiring', 12, 14), // Below fast (14)
    ];

    expect(getOverallVelocityScore(metrics)).toBe('fast');
  });

  it('returns average for moderate gaps', () => {
    const metrics = [
      createMetrics('strategic', 20, 30), // Gap = 6 (fast=14)
      createMetrics('technology', 10, 14), // Gap = 3 (fast=7)
    ];

    expect(getOverallVelocityScore(metrics)).toBe('average');
  });

  it('returns slow for large gaps', () => {
    const metrics = [
      createMetrics('strategic', 35, 50), // Gap = 21 (fast=14)
      createMetrics('hiring', 30, 40), // Gap = 16 (fast=14)
    ];

    expect(getOverallVelocityScore(metrics)).toBe('slow');
  });

  it('returns crisis for very large gaps', () => {
    const metrics = [
      createMetrics('strategic', 50, 70), // Gap = 36 (fast=14)
      createMetrics('hiring', 45, 60), // Gap = 31 (fast=14)
    ];

    expect(getOverallVelocityScore(metrics)).toBe('crisis');
  });
});

describe('getTopInterventions', () => {
  it('returns empty array when no detections', () => {
    expect(getTopInterventions([])).toEqual([]);
  });

  it('returns interventions sorted by severity', () => {
    const detections: PatternDetection[] = [
      {
        patternId: 'approval_layers',
        detected: true,
        severity: 'medium',
        affectedArchetypes: ['strategic'],
        confidence: 'auto',
        confirmedQuestions: [],
      },
      {
        patternId: 'rework_loops',
        detected: true,
        severity: 'critical',
        affectedArchetypes: ['hiring'],
        confidence: 'auto',
        confirmedQuestions: [],
      },
    ];

    const top = getTopInterventions(detections);

    // Critical should come first
    expect(top[0].pattern.id).toBe('rework_loops');
    expect(top[1].pattern.id).toBe('approval_layers');
  });

  it('respects limit parameter', () => {
    const detections: PatternDetection[] = [
      {
        patternId: 'approval_layers',
        detected: true,
        severity: 'high',
        affectedArchetypes: ['strategic'],
        confidence: 'auto',
        confirmedQuestions: [],
      },
      {
        patternId: 'meeting_dependencies',
        detected: true,
        severity: 'medium',
        affectedArchetypes: ['hiring'],
        confidence: 'auto',
        confirmedQuestions: [],
      },
      {
        patternId: 'unclear_handoffs',
        detected: true,
        severity: 'low',
        affectedArchetypes: ['technology'],
        confidence: 'auto',
        confirmedQuestions: [],
      },
      {
        patternId: 'rework_loops',
        detected: true,
        severity: 'critical',
        affectedArchetypes: ['analytics'],
        confidence: 'auto',
        confirmedQuestions: [],
      },
    ];

    expect(getTopInterventions(detections, 2)).toHaveLength(2);
    expect(getTopInterventions(detections, 5)).toHaveLength(4);
  });

  it('excludes non-detected patterns', () => {
    const detections: PatternDetection[] = [
      {
        patternId: 'approval_layers',
        detected: false,
        severity: 'critical',
        affectedArchetypes: ['strategic'],
        confidence: 'rejected',
        confirmedQuestions: [],
      },
      {
        patternId: 'rework_loops',
        detected: true,
        severity: 'medium',
        affectedArchetypes: ['hiring'],
        confidence: 'auto',
        confirmedQuestions: [],
      },
    ];

    const top = getTopInterventions(detections);

    expect(top).toHaveLength(1);
    expect(top[0].pattern.id).toBe('rework_loops');
  });
});
