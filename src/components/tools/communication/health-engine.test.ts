/**
 * Health Engine Tests
 *
 * Story 13.3: Health Indicators Dashboard
 * Task 9.1: Unit tests for health-engine
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateHealthIndicator,
  evaluateAllIndicators,
  calculateHealthScore,
  getOverallStatus,
  countIndicatorsByStatus,
  evaluateHealth,
  formatIndicatorValue,
  formatThreshold,
} from './health-engine';
import type { CommunicationMetrics, HealthIndicator, HealthIndicatorResult } from './comm-constants';
import { HEALTH_INDICATORS } from './comm-constants';

// Test data helpers
const createCompleteMetrics = (overrides: Partial<{
  urgentResponseTime: number;
  distributionListCount: number;
  avgListSize: number;
  dmRatio: number;
  activeChannels: number;
  crossPostRate: number;
  decisionDocRate: number;
  infoCascadeMeetings: number;
}> = {}): CommunicationMetrics => ({
  email: {
    urgentResponseTimeHours: overrides.urgentResponseTime ?? 4,
    distributionListCount: overrides.distributionListCount ?? 10,
    avgListSize: overrides.avgListSize ?? 25,
    replyAllFrequency: 'sometimes',
  },
  chat: {
    dmRatioPercent: overrides.dmRatio ?? 30,
    activeChannels: overrides.activeChannels ?? 50,
    crossChannelRedundancyPercent: overrides.crossPostRate ?? 10,
    atHereFrequency: 'sometimes',
  },
  meetings: {
    decisionDocumentationRatePercent: overrides.decisionDocRate ?? 70,
    infoCascadeMeetingsPerWeek: overrides.infoCascadeMeetings ?? 2,
    pulledFromTool2: false,
  },
});

const createEmptyMetrics = (): CommunicationMetrics => ({
  email: null,
  chat: null,
  meetings: null,
});

describe('evaluateHealthIndicator', () => {
  describe('lower-is-better indicators', () => {
    const responseTimeIndicator = HEALTH_INDICATORS.find(
      (i) => i.id === 'email-response-time'
    )!;

    it('should return healthy status when value is at or below healthy threshold', () => {
      const metrics = createCompleteMetrics({ urgentResponseTime: 2 });
      const result = evaluateHealthIndicator(responseTimeIndicator, metrics);

      expect(result.status).toBe('healthy');
      expect(result.value).toBe(2);
      expect(result.evidence).toContain('within healthy range');
    });

    it('should return healthy status when value equals healthy threshold', () => {
      const metrics = createCompleteMetrics({ urgentResponseTime: 4 });
      const result = evaluateHealthIndicator(responseTimeIndicator, metrics);

      expect(result.status).toBe('healthy');
    });

    it('should return warning status when value is between healthy and crisis', () => {
      const metrics = createCompleteMetrics({ urgentResponseTime: 8 });
      const result = evaluateHealthIndicator(responseTimeIndicator, metrics);

      expect(result.status).toBe('warning');
      expect(result.evidence).toContain('exceeds healthy threshold');
    });

    it('should return crisis status when value exceeds crisis threshold', () => {
      const metrics = createCompleteMetrics({ urgentResponseTime: 30 });
      const result = evaluateHealthIndicator(responseTimeIndicator, metrics);

      expect(result.status).toBe('crisis');
      expect(result.evidence).toContain('exceeds crisis threshold');
    });
  });

  describe('higher-is-better indicators', () => {
    const docRateIndicator = HEALTH_INDICATORS.find(
      (i) => i.id === 'decision-doc-rate'
    )!;

    it('should return healthy status when value meets or exceeds healthy threshold', () => {
      const metrics = createCompleteMetrics({ decisionDocRate: 80 });
      const result = evaluateHealthIndicator(docRateIndicator, metrics);

      expect(result.status).toBe('healthy');
      expect(result.evidence).toContain('meets healthy threshold');
    });

    it('should return warning status when value is between warning and healthy', () => {
      const metrics = createCompleteMetrics({ decisionDocRate: 50 });
      const result = evaluateHealthIndicator(docRateIndicator, metrics);

      expect(result.status).toBe('warning');
    });

    it('should return crisis status when value is below crisis threshold', () => {
      const metrics = createCompleteMetrics({ decisionDocRate: 15 });
      const result = evaluateHealthIndicator(docRateIndicator, metrics);

      expect(result.status).toBe('crisis');
      expect(result.evidence).toContain('below crisis threshold');
    });
  });

  describe('null/missing data handling', () => {
    it('should return warning status with no data message when metric is null', () => {
      const indicator = HEALTH_INDICATORS[0];
      const metrics = createEmptyMetrics();
      const result = evaluateHealthIndicator(indicator, metrics);

      expect(result.value).toBeNull();
      expect(result.status).toBe('warning');
      expect(result.evidence).toBe('No data available for this metric');
    });
  });

  describe('broadcast intensity (computed metric)', () => {
    const broadcastIndicator = HEALTH_INDICATORS.find(
      (i) => i.id === 'broadcast-intensity'
    )!;

    it('should calculate DL count × avg size correctly', () => {
      const metrics = createCompleteMetrics({
        distributionListCount: 20,
        avgListSize: 30,
      });
      const result = evaluateHealthIndicator(broadcastIndicator, metrics);

      expect(result.value).toBe(600); // 20 * 30 = 600
    });

    it('should return crisis for high broadcast intensity', () => {
      const metrics = createCompleteMetrics({
        distributionListCount: 100,
        avgListSize: 50,
      });
      const result = evaluateHealthIndicator(broadcastIndicator, metrics);

      expect(result.value).toBe(5000); // 100 * 50 = 5000
      expect(result.status).toBe('crisis');
    });
  });
});

describe('evaluateAllIndicators', () => {
  it('should evaluate all 7 health indicators', () => {
    const metrics = createCompleteMetrics();
    const results = evaluateAllIndicators(metrics);

    expect(results).toHaveLength(7);
    expect(results.map((r) => r.indicatorId)).toEqual([
      'email-response-time',
      'broadcast-intensity',
      'dm-ratio',
      'channel-count',
      'cross-post-rate',
      'decision-doc-rate',
      'info-cascade-meetings',
    ]);
  });

  it('should return results for all indicators even with empty metrics', () => {
    const metrics = createEmptyMetrics();
    const results = evaluateAllIndicators(metrics);

    expect(results).toHaveLength(7);
    results.forEach((result) => {
      expect(result.value).toBeNull();
    });
  });
});

describe('calculateHealthScore', () => {
  it('should return 100 when all indicators are healthy', () => {
    const results: HealthIndicatorResult[] = [
      { indicatorId: 'a', value: 1, status: 'healthy', evidence: '' },
      { indicatorId: 'b', value: 2, status: 'healthy', evidence: '' },
      { indicatorId: 'c', value: 3, status: 'healthy', evidence: '' },
    ];

    expect(calculateHealthScore(results)).toBe(100);
  });

  it('should return 0 when all indicators are in crisis', () => {
    const results: HealthIndicatorResult[] = [
      { indicatorId: 'a', value: 1, status: 'crisis', evidence: '' },
      { indicatorId: 'b', value: 2, status: 'crisis', evidence: '' },
    ];

    expect(calculateHealthScore(results)).toBe(0);
  });

  it('should return 50 when all indicators are warning', () => {
    const results: HealthIndicatorResult[] = [
      { indicatorId: 'a', value: 1, status: 'warning', evidence: '' },
      { indicatorId: 'b', value: 2, status: 'warning', evidence: '' },
    ];

    expect(calculateHealthScore(results)).toBe(50);
  });

  it('should calculate mixed scores correctly', () => {
    const results: HealthIndicatorResult[] = [
      { indicatorId: 'a', value: 1, status: 'healthy', evidence: '' },
      { indicatorId: 'b', value: 2, status: 'warning', evidence: '' },
      { indicatorId: 'c', value: 3, status: 'crisis', evidence: '' },
    ];

    // (100 + 50 + 0) / 3 = 50
    expect(calculateHealthScore(results)).toBe(50);
  });

  it('should ignore null values in calculation', () => {
    const results: HealthIndicatorResult[] = [
      { indicatorId: 'a', value: 1, status: 'healthy', evidence: '' },
      { indicatorId: 'b', value: null, status: 'warning', evidence: '' },
      { indicatorId: 'c', value: 3, status: 'crisis', evidence: '' },
    ];

    // Only counts non-null: (100 + 0) / 2 = 50
    expect(calculateHealthScore(results)).toBe(50);
  });

  it('should return 0 when no valid results', () => {
    const results: HealthIndicatorResult[] = [
      { indicatorId: 'a', value: null, status: 'warning', evidence: '' },
    ];

    expect(calculateHealthScore(results)).toBe(0);
  });
});

describe('getOverallStatus', () => {
  it('should return healthy for scores >= 70', () => {
    expect(getOverallStatus(100)).toBe('healthy');
    expect(getOverallStatus(70)).toBe('healthy');
  });

  it('should return warning for scores 40-69', () => {
    expect(getOverallStatus(69)).toBe('warning');
    expect(getOverallStatus(50)).toBe('warning');
    expect(getOverallStatus(40)).toBe('warning');
  });

  it('should return crisis for scores < 40', () => {
    expect(getOverallStatus(39)).toBe('crisis');
    expect(getOverallStatus(0)).toBe('crisis');
  });
});

describe('countIndicatorsByStatus', () => {
  it('should count indicators correctly', () => {
    const results: HealthIndicatorResult[] = [
      { indicatorId: 'a', value: 1, status: 'healthy', evidence: '' },
      { indicatorId: 'b', value: 2, status: 'healthy', evidence: '' },
      { indicatorId: 'c', value: 3, status: 'warning', evidence: '' },
      { indicatorId: 'd', value: 4, status: 'crisis', evidence: '' },
      { indicatorId: 'e', value: null, status: 'warning', evidence: '' },
    ];

    const counts = countIndicatorsByStatus(results);

    expect(counts.healthy).toBe(2);
    expect(counts.warning).toBe(1); // Only counts non-null warnings
    expect(counts.crisis).toBe(1);
    expect(counts.noData).toBe(1);
  });
});

describe('evaluateHealth', () => {
  it('should return complete evaluation result', () => {
    const metrics = createCompleteMetrics();
    const result = evaluateHealth(metrics);

    expect(result.indicators).toHaveLength(7);
    expect(typeof result.overallScore).toBe('number');
    expect(['healthy', 'warning', 'crisis']).toContain(result.overallStatus);
    expect(result.evaluatedAt).toBeTruthy();
    expect(new Date(result.evaluatedAt).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should calculate healthy score for healthy metrics', () => {
    const metrics = createCompleteMetrics({
      urgentResponseTime: 2,
      distributionListCount: 10,
      avgListSize: 20,
      dmRatio: 20,
      activeChannels: 30,
      crossPostRate: 5,
      decisionDocRate: 80,
      infoCascadeMeetings: 1,
    });

    const result = evaluateHealth(metrics);

    expect(result.overallScore).toBeGreaterThanOrEqual(70);
    expect(result.overallStatus).toBe('healthy');
  });

  it('should calculate crisis score for crisis metrics', () => {
    const metrics = createCompleteMetrics({
      urgentResponseTime: 48,
      distributionListCount: 100,
      avgListSize: 50,
      dmRatio: 80,
      activeChannels: 300,
      crossPostRate: 60,
      decisionDocRate: 10,
      infoCascadeMeetings: 15,
    });

    const result = evaluateHealth(metrics);

    expect(result.overallScore).toBeLessThan(40);
    expect(result.overallStatus).toBe('crisis');
  });
});

describe('formatIndicatorValue', () => {
  it('should format percentage values', () => {
    expect(formatIndicatorValue(45, '%')).toBe('45%');
  });

  it('should format hour values', () => {
    expect(formatIndicatorValue(8, 'hours')).toBe('8hr');
  });

  it('should format per week values', () => {
    expect(formatIndicatorValue(5, '/week')).toBe('5/wk');
  });

  it('should format channel counts with locale', () => {
    expect(formatIndicatorValue(1500, 'channels')).toBe('1,500');
  });

  it('should return dash for null values', () => {
    expect(formatIndicatorValue(null, '%')).toBe('—');
  });
});

describe('formatThreshold', () => {
  describe('lower-is-better direction', () => {
    it('should format healthy threshold with less-than', () => {
      expect(formatThreshold(4, 'hours', 'lower-is-better', 'healthy')).toBe('<4');
    });

    it('should format warning threshold with less-than', () => {
      expect(formatThreshold(12, 'hours', 'lower-is-better', 'warning')).toBe('<12');
    });

    it('should format crisis threshold with greater-than', () => {
      expect(formatThreshold(24, 'hours', 'lower-is-better', 'crisis')).toBe('>24');
    });

    it('should include percent sign for percentage units', () => {
      expect(formatThreshold(30, '%', 'lower-is-better', 'healthy')).toBe('<30%');
    });
  });

  describe('higher-is-better direction', () => {
    it('should format healthy threshold with greater-than', () => {
      expect(formatThreshold(70, '%', 'higher-is-better', 'healthy')).toBe('>70%');
    });

    it('should format warning threshold with greater-than', () => {
      expect(formatThreshold(40, '%', 'higher-is-better', 'warning')).toBe('>40%');
    });

    it('should format crisis threshold with less-than', () => {
      expect(formatThreshold(25, '%', 'higher-is-better', 'crisis')).toBe('<25%');
    });
  });
});

describe('evaluateHealthIndicator edge cases', () => {
  it('should handle invalid indicator with missing thresholds', () => {
    const invalidIndicator = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      category: 'email' as const,
      unit: 'hours',
      direction: 'lower-is-better' as const,
      thresholds: undefined as unknown as { healthy: number; warning: number; crisis: number },
      getValue: () => 10,
    };
    const metrics = createCompleteMetrics();
    const result = evaluateHealthIndicator(invalidIndicator, metrics);

    expect(result.status).toBe('warning');
    expect(result.evidence).toBe('Invalid indicator configuration');
  });

  it('should handle invalid indicator with missing direction', () => {
    const invalidIndicator = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      category: 'email' as const,
      unit: 'hours',
      direction: undefined as unknown as 'lower-is-better',
      thresholds: { healthy: 4, warning: 12, crisis: 24 },
      getValue: () => 10,
    };
    const metrics = createCompleteMetrics();
    const result = evaluateHealthIndicator(invalidIndicator, metrics);

    expect(result.status).toBe('warning');
    expect(result.evidence).toBe('Invalid indicator configuration');
  });

  it('should handle invalid indicator with missing id', () => {
    const invalidIndicator = {
      id: undefined as unknown as string,
      name: 'Test',
      description: 'Test',
      category: 'email' as const,
      unit: 'hours',
      direction: 'lower-is-better' as const,
      thresholds: { healthy: 4, warning: 12, crisis: 24 },
      getValue: () => 10,
    };
    const metrics = createCompleteMetrics();
    const result = evaluateHealthIndicator(invalidIndicator, metrics);

    expect(result.indicatorId).toBe('unknown');
    expect(result.status).toBe('warning');
  });
});
