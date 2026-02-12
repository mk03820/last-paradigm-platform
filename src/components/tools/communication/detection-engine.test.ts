/**
 * Detection Engine Tests
 *
 * Unit tests for anti-pattern detection algorithms.
 *
 * Story 13.2: Anti-Pattern Detection
 * Task 9: Write tests (AC: all)
 */

import { describe, it, expect } from 'vitest';
import {
  detectBroadcastOverload,
  detectTelephoneGame,
  detectTribalKnowledge,
  detectToolSprawl,
  detectCYACulture,
  analyzePatterns,
  getSeverityDistribution,
} from './detection-engine';
import type { CommunicationMetrics } from './comm-constants';

// Helper to create metrics with defaults
function createMetrics(
  overrides: Partial<CommunicationMetrics> = {}
): CommunicationMetrics {
  return {
    email: overrides.email ?? null,
    chat: overrides.chat ?? null,
    meetings: overrides.meetings ?? null,
  };
}

describe('detectBroadcastOverload', () => {
  it('returns not detected when chat metrics are missing', () => {
    const metrics = createMetrics({ chat: null });
    const result = detectBroadcastOverload(metrics);

    expect(result.detected).toBe(false);
    expect(result.severity).toBe('none');
    expect(result.evidence).toHaveLength(0);
  });

  it('detects low severity when @here frequency is sometimes', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 50,
        dmRatioPercent: 30,
        atHereFrequency: 'sometimes',
        crossChannelRedundancyPercent: 10,
      },
    });
    const result = detectBroadcastOverload(metrics);

    expect(result.detected).toBe(true);
    expect(result.severity).toBe('low');
    expect(result.evidence.length).toBeGreaterThan(0);
  });

  it('detects medium severity when @here is often', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 50,
        dmRatioPercent: 30,
        atHereFrequency: 'often',
        crossChannelRedundancyPercent: 10,
      },
    });
    const result = detectBroadcastOverload(metrics);

    expect(result.detected).toBe(true);
    expect(result.severity).toBe('medium');
  });

  it('detects high severity when @here is always', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 50,
        dmRatioPercent: 30,
        atHereFrequency: 'always',
        crossChannelRedundancyPercent: 10,
      },
    });
    const result = detectBroadcastOverload(metrics);

    expect(result.detected).toBe(true);
    expect(result.severity).toBe('high');
  });

  it('detects based on cross-channel redundancy', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 50,
        dmRatioPercent: 30,
        atHereFrequency: 'never',
        crossChannelRedundancyPercent: 35,
      },
    });
    const result = detectBroadcastOverload(metrics);

    expect(result.detected).toBe(true);
    expect(result.severity).toBe('medium');
    expect(result.evidence.some((e) => e.includes('redundancy'))).toBe(true);
  });

  it('combines severity from multiple indicators', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 50,
        dmRatioPercent: 30,
        atHereFrequency: 'always',
        crossChannelRedundancyPercent: 55,
      },
    });
    const result = detectBroadcastOverload(metrics);

    expect(result.detected).toBe(true);
    expect(result.severity).toBe('high');
    expect(result.evidence.length).toBe(2);
    expect(result.confidence).toBe(1.0);
  });

  it('does not detect when all values are healthy', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 50,
        dmRatioPercent: 30,
        atHereFrequency: 'never',
        crossChannelRedundancyPercent: 5,
      },
    });
    const result = detectBroadcastOverload(metrics);

    expect(result.detected).toBe(false);
    expect(result.severity).toBe('none');
  });
});

describe('detectTelephoneGame', () => {
  it('returns not detected when meeting metrics are missing', () => {
    const metrics = createMetrics({ meetings: null });
    const result = detectTelephoneGame(metrics);

    expect(result.detected).toBe(false);
    expect(result.severity).toBe('none');
  });

  it('detects based on info cascade meetings', () => {
    const metrics = createMetrics({
      meetings: {
        infoCascadeMeetingsPerWeek: 6,
        decisionDocumentationRatePercent: 80,
        pulledFromTool2: false,
      },
    });
    const result = detectTelephoneGame(metrics);

    expect(result.detected).toBe(true);
    expect(result.severity).toBe('medium');
    expect(result.evidence.some((e) => e.includes('cascade'))).toBe(true);
  });

  it('detects high severity with many cascade meetings', () => {
    const metrics = createMetrics({
      meetings: {
        infoCascadeMeetingsPerWeek: 12,
        decisionDocumentationRatePercent: 80,
        pulledFromTool2: false,
      },
    });
    const result = detectTelephoneGame(metrics);

    expect(result.detected).toBe(true);
    expect(result.severity).toBe('high');
  });

  it('detects based on low decision documentation rate', () => {
    const metrics = createMetrics({
      meetings: {
        infoCascadeMeetingsPerWeek: 1,
        decisionDocumentationRatePercent: 40,
        pulledFromTool2: false,
      },
    });
    const result = detectTelephoneGame(metrics);

    expect(result.detected).toBe(true);
    expect(result.evidence.some((e) => e.includes('documentation'))).toBe(true);
  });

  it('detects high severity with crisis-level documentation', () => {
    const metrics = createMetrics({
      meetings: {
        infoCascadeMeetingsPerWeek: 1,
        decisionDocumentationRatePercent: 20,
        pulledFromTool2: false,
      },
    });
    const result = detectTelephoneGame(metrics);

    expect(result.detected).toBe(true);
    expect(result.severity).toBe('high');
  });

  it('does not detect when all values are healthy', () => {
    const metrics = createMetrics({
      meetings: {
        infoCascadeMeetingsPerWeek: 1,
        decisionDocumentationRatePercent: 85,
        pulledFromTool2: false,
      },
    });
    const result = detectTelephoneGame(metrics);

    expect(result.detected).toBe(false);
    expect(result.severity).toBe('none');
  });
});

describe('detectTribalKnowledge', () => {
  it('returns not detected when no metrics available', () => {
    const metrics = createMetrics({});
    const result = detectTribalKnowledge(metrics);

    expect(result.detected).toBe(false);
    expect(result.severity).toBe('none');
  });

  it('detects based on high DM ratio', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 50,
        dmRatioPercent: 55,
        atHereFrequency: 'never',
        crossChannelRedundancyPercent: 5,
      },
    });
    const result = detectTribalKnowledge(metrics);

    expect(result.detected).toBe(true);
    expect(result.evidence.some((e) => e.includes('DM'))).toBe(true);
  });

  it('detects high severity with very high DM ratio', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 50,
        dmRatioPercent: 75,
        atHereFrequency: 'never',
        crossChannelRedundancyPercent: 5,
      },
    });
    const result = detectTribalKnowledge(metrics);

    expect(result.detected).toBe(true);
    expect(result.severity).toBe('high');
  });

  it('detects based on low documentation rate from meetings', () => {
    const metrics = createMetrics({
      meetings: {
        infoCascadeMeetingsPerWeek: 1,
        decisionDocumentationRatePercent: 30,
        pulledFromTool2: false,
      },
    });
    const result = detectTribalKnowledge(metrics);

    expect(result.detected).toBe(true);
    expect(result.evidence.some((e) => e.includes('documented'))).toBe(true);
  });

  it('combines DM ratio and documentation rate', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 50,
        dmRatioPercent: 55,
        atHereFrequency: 'never',
        crossChannelRedundancyPercent: 5,
      },
      meetings: {
        infoCascadeMeetingsPerWeek: 1,
        decisionDocumentationRatePercent: 30,
        pulledFromTool2: false,
      },
    });
    const result = detectTribalKnowledge(metrics);

    expect(result.detected).toBe(true);
    expect(result.evidence.length).toBe(2);
    expect(result.confidence).toBe(1.0);
  });
});

describe('detectToolSprawl', () => {
  it('returns not detected when chat metrics are missing', () => {
    const metrics = createMetrics({ chat: null });
    const result = detectToolSprawl(metrics);

    expect(result.detected).toBe(false);
    expect(result.severity).toBe('none');
  });

  it('detects based on high channel count', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 120,
        dmRatioPercent: 30,
        atHereFrequency: 'never',
        crossChannelRedundancyPercent: 5,
      },
    });
    const result = detectToolSprawl(metrics);

    expect(result.detected).toBe(true);
    expect(result.severity).toBe('medium');
    expect(result.evidence.some((e) => e.includes('channel'))).toBe(true);
  });

  it('detects high severity with excessive channels', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 250,
        dmRatioPercent: 30,
        atHereFrequency: 'never',
        crossChannelRedundancyPercent: 5,
      },
    });
    const result = detectToolSprawl(metrics);

    expect(result.detected).toBe(true);
    expect(result.severity).toBe('high');
  });

  it('detects based on cross-channel redundancy', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 50,
        dmRatioPercent: 30,
        atHereFrequency: 'never',
        crossChannelRedundancyPercent: 40,
      },
    });
    const result = detectToolSprawl(metrics);

    expect(result.detected).toBe(true);
    expect(result.evidence.some((e) => e.includes('redundancy'))).toBe(true);
  });

  it('does not detect when channel count is reasonable', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 50,
        dmRatioPercent: 30,
        atHereFrequency: 'never',
        crossChannelRedundancyPercent: 5,
      },
    });
    const result = detectToolSprawl(metrics);

    expect(result.detected).toBe(false);
    expect(result.severity).toBe('none');
  });
});

describe('detectCYACulture', () => {
  it('returns not detected when email metrics are missing', () => {
    const metrics = createMetrics({});
    const result = detectCYACulture(metrics);

    expect(result.detected).toBe(false);
    expect(result.severity).toBe('none');
  });

  it('detects based on reply-all frequency', () => {
    const metrics = createMetrics({
      email: {
        distributionListCount: 10,
        avgListSize: 10,
        replyAllFrequency: 'often',
        urgentResponseTimeHours: 4,
      },
    });
    const result = detectCYACulture(metrics);

    expect(result.detected).toBe(true);
    expect(result.evidence.some((e) => e.includes('Reply-all'))).toBe(true);
  });

  it('detects based on distribution list impact', () => {
    const metrics = createMetrics({
      email: {
        distributionListCount: 50,
        avgListSize: 25,
        replyAllFrequency: 'never',
        urgentResponseTimeHours: 4,
      },
    });
    const result = detectCYACulture(metrics);

    expect(result.detected).toBe(true);
    expect(result.evidence.some((e) => e.includes('Distribution list'))).toBe(true);
  });

  it('detects high severity with high DL impact', () => {
    const metrics = createMetrics({
      email: {
        distributionListCount: 100,
        avgListSize: 30,
        replyAllFrequency: 'never',
        urgentResponseTimeHours: 4,
      },
    });
    const result = detectCYACulture(metrics);

    expect(result.detected).toBe(true);
    expect(result.severity).toBe('high');
  });

  it('does not detect with healthy email patterns', () => {
    const metrics = createMetrics({
      email: {
        distributionListCount: 5,
        avgListSize: 10,
        replyAllFrequency: 'rarely',
        urgentResponseTimeHours: 4,
      },
    });
    const result = detectCYACulture(metrics);

    expect(result.detected).toBe(false);
    expect(result.severity).toBe('none');
  });
});

describe('analyzePatterns', () => {
  it('returns results for all 5 patterns', () => {
    const metrics = createMetrics({});
    const analysis = analyzePatterns(metrics);

    expect(analysis.results).toHaveLength(5);
    expect(analysis.results.map((r) => r.patternId)).toEqual([
      'broadcast-overload',
      'telephone-game',
      'tribal-knowledge',
      'tool-sprawl',
      'cya-culture',
    ]);
  });

  it('calculates detected count correctly', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 250,
        dmRatioPercent: 75,
        atHereFrequency: 'always',
        crossChannelRedundancyPercent: 55,
      },
    });
    const analysis = analyzePatterns(metrics);

    expect(analysis.detectedCount).toBeGreaterThan(0);
  });

  it('calculates healthy status when no patterns detected', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 30,
        dmRatioPercent: 20,
        atHereFrequency: 'never',
        crossChannelRedundancyPercent: 5,
      },
      meetings: {
        infoCascadeMeetingsPerWeek: 1,
        decisionDocumentationRatePercent: 90,
        pulledFromTool2: false,
      },
      email: {
        distributionListCount: 5,
        avgListSize: 10,
        replyAllFrequency: 'rarely',
        urgentResponseTimeHours: 2,
      },
    });
    const analysis = analyzePatterns(metrics);

    expect(analysis.overallHealth).toBe('healthy');
  });

  it('calculates critical status with multiple high severity patterns', () => {
    const metrics = createMetrics({
      chat: {
        activeChannels: 300,
        dmRatioPercent: 80,
        atHereFrequency: 'always',
        crossChannelRedundancyPercent: 60,
      },
      meetings: {
        infoCascadeMeetingsPerWeek: 15,
        decisionDocumentationRatePercent: 10,
        pulledFromTool2: false,
      },
      email: {
        distributionListCount: 100,
        avgListSize: 50,
        replyAllFrequency: 'always',
        urgentResponseTimeHours: 24,
      },
    });
    const analysis = analyzePatterns(metrics);

    expect(analysis.overallHealth).toBe('critical');
  });

  it('includes analyzedAt timestamp', () => {
    const metrics = createMetrics({});
    const analysis = analyzePatterns(metrics);

    expect(analysis.analyzedAt).toBeDefined();
    expect(new Date(analysis.analyzedAt).getTime()).toBeLessThanOrEqual(Date.now());
  });
});

describe('getSeverityDistribution', () => {
  it('returns correct distribution', () => {
    const results = [
      { patternId: 'a', detected: true, severity: 'high' as const, evidence: [], confidence: 1 },
      { patternId: 'b', detected: true, severity: 'high' as const, evidence: [], confidence: 1 },
      { patternId: 'c', detected: true, severity: 'medium' as const, evidence: [], confidence: 1 },
      { patternId: 'd', detected: true, severity: 'low' as const, evidence: [], confidence: 1 },
      { patternId: 'e', detected: false, severity: 'none' as const, evidence: [], confidence: 1 },
    ];

    const distribution = getSeverityDistribution(results);

    expect(distribution.high).toBe(2);
    expect(distribution.medium).toBe(1);
    expect(distribution.low).toBe(1);
  });

  it('returns zeros when no patterns detected', () => {
    const results = [
      { patternId: 'a', detected: false, severity: 'none' as const, evidence: [], confidence: 1 },
    ];

    const distribution = getSeverityDistribution(results);

    expect(distribution.high).toBe(0);
    expect(distribution.medium).toBe(0);
    expect(distribution.low).toBe(0);
  });
});
