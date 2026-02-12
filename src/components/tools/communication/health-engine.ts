/**
 * Health Evaluation Engine
 *
 * Evaluates communication metrics against health thresholds
 * and calculates overall communication health score.
 *
 * Story 13.3: Health Indicators Dashboard
 * Covers: FR2-28 (View health indicators against benchmarks)
 */

import type {
  CommunicationMetrics,
  HealthIndicator,
  HealthIndicatorResult,
  HealthEvaluationResult,
  HealthStatus,
} from './comm-constants';
import { HEALTH_INDICATORS } from './comm-constants';

/**
 * Evaluate a single health indicator against thresholds
 */
export function evaluateHealthIndicator(
  indicator: HealthIndicator,
  metrics: CommunicationMetrics
): HealthIndicatorResult {
  const value = indicator.getValue(metrics);

  if (value === null) {
    return {
      indicatorId: indicator.id,
      value: null,
      status: 'warning',
      evidence: 'No data available for this metric',
    };
  }

  const { thresholds, direction } = indicator;
  let status: HealthStatus;
  let evidence: string;

  if (direction === 'lower-is-better') {
    // Lower values are better (e.g., response time, DM ratio)
    if (value <= thresholds.healthy) {
      status = 'healthy';
      evidence = `${value} ${indicator.unit} is within healthy range (≤${thresholds.healthy})`;
    } else if (value <= thresholds.warning) {
      status = 'warning';
      evidence = `${value} ${indicator.unit} exceeds healthy threshold (${thresholds.healthy}) but below crisis (${thresholds.crisis})`;
    } else {
      status = 'crisis';
      evidence = `${value} ${indicator.unit} exceeds crisis threshold (${thresholds.crisis})`;
    }
  } else {
    // Higher values are better (e.g., documentation rate)
    if (value >= thresholds.healthy) {
      status = 'healthy';
      evidence = `${value}${indicator.unit} meets healthy threshold (≥${thresholds.healthy})`;
    } else if (value >= thresholds.warning) {
      status = 'warning';
      evidence = `${value}${indicator.unit} below healthy (${thresholds.healthy}) but above crisis (${thresholds.crisis})`;
    } else {
      status = 'crisis';
      evidence = `${value}${indicator.unit} below crisis threshold (${thresholds.crisis})`;
    }
  }

  return {
    indicatorId: indicator.id,
    value,
    status,
    evidence,
  };
}

/**
 * Evaluate all health indicators
 */
export function evaluateAllIndicators(
  metrics: CommunicationMetrics
): HealthIndicatorResult[] {
  return HEALTH_INDICATORS.map((indicator) =>
    evaluateHealthIndicator(indicator, metrics)
  );
}

/**
 * Calculate overall health score (0-100)
 *
 * Score breakdown:
 * - 100: All indicators in healthy range
 * - 70-99: Mostly healthy with some warnings
 * - 40-69: Mixed with significant warnings
 * - 0-39: Multiple crisis indicators
 */
export function calculateHealthScore(results: HealthIndicatorResult[]): number {
  const validResults = results.filter((r) => r.value !== null);
  if (validResults.length === 0) return 0;

  const scores: number[] = validResults.map((r) => {
    switch (r.status) {
      case 'healthy':
        return 100;
      case 'warning':
        return 50;
      case 'crisis':
        return 0;
    }
  });

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/**
 * Get overall health status from score
 */
export function getOverallStatus(score: number): HealthStatus {
  if (score >= 70) return 'healthy';
  if (score >= 40) return 'warning';
  return 'crisis';
}

/**
 * Get count of indicators by status
 */
export function countIndicatorsByStatus(results: HealthIndicatorResult[]): {
  healthy: number;
  warning: number;
  crisis: number;
  noData: number;
} {
  return {
    healthy: results.filter((r) => r.status === 'healthy' && r.value !== null).length,
    warning: results.filter((r) => r.status === 'warning' && r.value !== null).length,
    crisis: results.filter((r) => r.status === 'crisis').length,
    noData: results.filter((r) => r.value === null).length,
  };
}

/**
 * Run complete health evaluation
 */
export function evaluateHealth(metrics: CommunicationMetrics): HealthEvaluationResult {
  const indicators = evaluateAllIndicators(metrics);
  const overallScore = calculateHealthScore(indicators);
  const overallStatus = getOverallStatus(overallScore);

  return {
    indicators,
    overallScore,
    overallStatus,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Format value with unit for display
 */
export function formatIndicatorValue(value: number | null, unit: string): string {
  if (value === null) return '—';

  // Format based on unit type
  if (unit === '%') {
    return `${value}%`;
  }
  if (unit === 'hours') {
    return `${value}hr`;
  }
  if (unit === '/week') {
    return `${value}/wk`;
  }
  if (unit === 'channels' || unit === 'recipients') {
    return value.toLocaleString();
  }
  return `${value} ${unit}`;
}

/**
 * Format threshold for display based on direction
 */
export function formatThreshold(
  value: number,
  unit: string,
  direction: 'lower-is-better' | 'higher-is-better',
  type: 'healthy' | 'warning' | 'crisis'
): string {
  const formattedValue = unit === '%' ? `${value}%` : value.toString();

  if (direction === 'lower-is-better') {
    if (type === 'healthy') return `<${formattedValue}`;
    if (type === 'crisis') return `>${formattedValue}`;
    return `<${formattedValue}`;
  } else {
    if (type === 'healthy') return `>${formattedValue}`;
    if (type === 'crisis') return `<${formattedValue}`;
    return `>${formattedValue}`;
  }
}
