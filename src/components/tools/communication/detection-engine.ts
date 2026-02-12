/**
 * Anti-Pattern Detection Engine
 *
 * Analyzes communication metrics to detect organizational anti-patterns.
 *
 * Story 13.2: Anti-Pattern Detection
 * Task 2: Create anti-pattern detection engine (AC: 1, 2, 4)
 */

import type {
  CommunicationMetrics,
  DetectionResult,
  PatternAnalysis,
  SeverityLevel,
  FrequencyLevel,
} from './comm-constants';
import {
  DETECTION_THRESHOLDS,
  frequencyToScore,
  calculateOverallHealth,
  getFrequencyLevelInfo,
} from './comm-constants';

/**
 * Create a detection result for a pattern that wasn't detected
 */
function notDetected(patternId: string): DetectionResult {
  return {
    patternId,
    detected: false,
    severity: 'none',
    evidence: [],
    confidence: 1.0,
  };
}

/**
 * Determine severity based on frequency level thresholds
 */
function frequencySeverity(
  value: FrequencyLevel,
  thresholds: { low: FrequencyLevel; medium: FrequencyLevel; high: FrequencyLevel }
): SeverityLevel {
  const score = frequencyToScore(value);
  const highScore = frequencyToScore(thresholds.high);
  const mediumScore = frequencyToScore(thresholds.medium);
  const lowScore = frequencyToScore(thresholds.low);

  if (score >= highScore) return 'high';
  if (score >= mediumScore) return 'medium';
  if (score >= lowScore) return 'low';
  return 'none';
}

/**
 * Determine severity based on numeric thresholds
 */
function numericSeverity(
  value: number,
  thresholds: { low: number; medium: number; high: number }
): SeverityLevel {
  if (value >= thresholds.high) return 'high';
  if (value >= thresholds.medium) return 'medium';
  if (value >= thresholds.low) return 'low';
  return 'none';
}

/**
 * Determine severity based on inverse thresholds (lower is worse)
 */
function inverseSeverity(
  value: number,
  thresholds: { healthy: number; warning: number; crisis: number }
): SeverityLevel {
  if (value <= thresholds.crisis) return 'high';
  if (value <= thresholds.warning) return 'medium';
  if (value < thresholds.healthy) return 'low';
  return 'none';
}

/**
 * Combine multiple severity levels, taking the highest
 */
function combineSeverity(...severities: SeverityLevel[]): SeverityLevel {
  const order: SeverityLevel[] = ['none', 'low', 'medium', 'high'];
  let maxIndex = 0;
  for (const severity of severities) {
    const index = order.indexOf(severity);
    if (index > maxIndex) maxIndex = index;
  }
  return order[maxIndex];
}

/**
 * Detect Broadcast Overload anti-pattern
 *
 * Triggered by:
 * - High @here/@channel frequency
 * - High cross-channel redundancy
 */
export function detectBroadcastOverload(metrics: CommunicationMetrics): DetectionResult {
  const patternId = 'broadcast-overload';

  if (!metrics.chat) {
    return notDetected(patternId);
  }

  const evidence: string[] = [];
  let confidence = 0;

  // Check @here/@channel frequency
  const atHereSeverity = frequencySeverity(
    metrics.chat.atHereFrequency,
    DETECTION_THRESHOLDS.atHereFrequency
  );

  if (atHereSeverity !== 'none') {
    const levelInfo = getFrequencyLevelInfo(metrics.chat.atHereFrequency);
    evidence.push(
      `@here/@channel used "${levelInfo.label}" (threshold: "${getFrequencyLevelInfo(DETECTION_THRESHOLDS.atHereFrequency.low).label}" for detection)`
    );
    confidence += 0.5;
  }

  // Check cross-channel redundancy
  const redundancySeverity = numericSeverity(
    metrics.chat.crossChannelRedundancyPercent,
    DETECTION_THRESHOLDS.crossChannelRedundancy
  );

  if (redundancySeverity !== 'none') {
    evidence.push(
      `Cross-channel redundancy at ${metrics.chat.crossChannelRedundancyPercent}% (threshold: ${DETECTION_THRESHOLDS.crossChannelRedundancy.low}%)`
    );
    confidence += 0.5;
  }

  const severity = combineSeverity(atHereSeverity, redundancySeverity);

  return {
    patternId,
    detected: severity !== 'none',
    severity,
    evidence,
    confidence: Math.min(confidence, 1.0),
  };
}

/**
 * Detect Telephone Game anti-pattern
 *
 * Triggered by:
 * - High info cascade meetings
 * - Low decision documentation rate
 */
export function detectTelephoneGame(metrics: CommunicationMetrics): DetectionResult {
  const patternId = 'telephone-game';

  if (!metrics.meetings) {
    return notDetected(patternId);
  }

  const evidence: string[] = [];
  let confidence = 0;

  // Check info cascade meetings
  const cascadeSeverity = numericSeverity(
    metrics.meetings.infoCascadeMeetingsPerWeek,
    DETECTION_THRESHOLDS.infoCascadeMeetings
  );

  if (cascadeSeverity !== 'none') {
    evidence.push(
      `${metrics.meetings.infoCascadeMeetingsPerWeek} info cascade meetings per week (threshold: ${DETECTION_THRESHOLDS.infoCascadeMeetings.low})`
    );
    confidence += 0.6;
  }

  // Check decision documentation rate (inverse - lower is worse)
  const docRateSeverity = inverseSeverity(
    metrics.meetings.decisionDocumentationRatePercent,
    DETECTION_THRESHOLDS.decisionDocRate
  );

  if (docRateSeverity !== 'none') {
    evidence.push(
      `Decision documentation rate at ${metrics.meetings.decisionDocumentationRatePercent}% (healthy: >${DETECTION_THRESHOLDS.decisionDocRate.healthy}%)`
    );
    confidence += 0.4;
  }

  const severity = combineSeverity(cascadeSeverity, docRateSeverity);

  return {
    patternId,
    detected: severity !== 'none',
    severity,
    evidence,
    confidence: Math.min(confidence, 1.0),
  };
}

/**
 * Detect Tribal Knowledge anti-pattern
 *
 * Triggered by:
 * - High DM ratio (work happening in private)
 * - Low decision documentation rate
 */
export function detectTribalKnowledge(metrics: CommunicationMetrics): DetectionResult {
  const patternId = 'tribal-knowledge';

  const evidence: string[] = [];
  let confidence = 0;
  let severities: SeverityLevel[] = [];

  // Check DM ratio
  if (metrics.chat) {
    const dmSeverity = numericSeverity(
      metrics.chat.dmRatioPercent,
      DETECTION_THRESHOLDS.dmRatio
    );

    if (dmSeverity !== 'none') {
      evidence.push(
        `${metrics.chat.dmRatioPercent}% of conversations in DMs (threshold: ${DETECTION_THRESHOLDS.dmRatio.low}%)`
      );
      confidence += 0.5;
      severities.push(dmSeverity);
    }
  }

  // Check decision documentation rate
  if (metrics.meetings) {
    const docRateSeverity = inverseSeverity(
      metrics.meetings.decisionDocumentationRatePercent,
      DETECTION_THRESHOLDS.decisionDocRate
    );

    if (docRateSeverity !== 'none') {
      evidence.push(
        `Only ${metrics.meetings.decisionDocumentationRatePercent}% of decisions documented`
      );
      confidence += 0.5;
      severities.push(docRateSeverity);
    }
  }

  if (severities.length === 0) {
    return notDetected(patternId);
  }

  const severity = combineSeverity(...severities);

  return {
    patternId,
    detected: severity !== 'none',
    severity,
    evidence,
    confidence: Math.min(confidence, 1.0),
  };
}

/**
 * Detect Tool Sprawl anti-pattern
 *
 * Triggered by:
 * - High number of active channels
 * - High cross-channel redundancy
 */
export function detectToolSprawl(metrics: CommunicationMetrics): DetectionResult {
  const patternId = 'tool-sprawl';

  if (!metrics.chat) {
    return notDetected(patternId);
  }

  const evidence: string[] = [];
  let confidence = 0;

  // Check active channels count
  const channelSeverity = numericSeverity(
    metrics.chat.activeChannels,
    DETECTION_THRESHOLDS.activeChannels
  );

  if (channelSeverity !== 'none') {
    evidence.push(
      `${metrics.chat.activeChannels} active channels (threshold: ${DETECTION_THRESHOLDS.activeChannels.low})`
    );
    confidence += 0.6;
  }

  // Check cross-channel redundancy
  const redundancySeverity = numericSeverity(
    metrics.chat.crossChannelRedundancyPercent,
    DETECTION_THRESHOLDS.crossChannelRedundancy
  );

  if (redundancySeverity !== 'none') {
    evidence.push(
      `${metrics.chat.crossChannelRedundancyPercent}% cross-channel message redundancy`
    );
    confidence += 0.4;
  }

  const severity = combineSeverity(channelSeverity, redundancySeverity);

  return {
    patternId,
    detected: severity !== 'none',
    severity,
    evidence,
    confidence: Math.min(confidence, 1.0),
  };
}

/**
 * Detect CYA Culture anti-pattern
 *
 * Triggered by:
 * - High reply-all frequency
 * - Large distribution list impact (count × size)
 */
export function detectCYACulture(metrics: CommunicationMetrics): DetectionResult {
  const patternId = 'cya-culture';

  const evidence: string[] = [];
  let confidence = 0;
  let severities: SeverityLevel[] = [];

  // Check reply-all frequency
  if (metrics.email) {
    const replyAllSeverity = frequencySeverity(
      metrics.email.replyAllFrequency,
      DETECTION_THRESHOLDS.replyAllFrequency
    );

    if (replyAllSeverity !== 'none') {
      const levelInfo = getFrequencyLevelInfo(metrics.email.replyAllFrequency);
      evidence.push(
        `Reply-all frequency: "${levelInfo.label}"`
      );
      confidence += 0.5;
      severities.push(replyAllSeverity);
    }

    // Check distribution list impact
    const dlImpact = metrics.email.distributionListCount * metrics.email.avgListSize;
    const dlSeverity = numericSeverity(dlImpact, DETECTION_THRESHOLDS.distributionListImpact);

    if (dlSeverity !== 'none') {
      evidence.push(
        `Distribution list impact: ${metrics.email.distributionListCount} lists × ${metrics.email.avgListSize} avg recipients = ${dlImpact} reach`
      );
      confidence += 0.5;
      severities.push(dlSeverity);
    }
  }

  if (severities.length === 0) {
    return notDetected(patternId);
  }

  const severity = combineSeverity(...severities);

  return {
    patternId,
    detected: severity !== 'none',
    severity,
    evidence,
    confidence: Math.min(confidence, 1.0),
  };
}

/**
 * Run all pattern detectors and return complete analysis
 */
export function analyzePatterns(metrics: CommunicationMetrics): PatternAnalysis {
  const results: DetectionResult[] = [
    detectBroadcastOverload(metrics),
    detectTelephoneGame(metrics),
    detectTribalKnowledge(metrics),
    detectToolSprawl(metrics),
    detectCYACulture(metrics),
  ];

  const detectedCount = results.filter((r) => r.detected).length;
  const overallHealth = calculateOverallHealth(results);

  return {
    results,
    detectedCount,
    overallHealth,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Get severity distribution from results
 */
export function getSeverityDistribution(results: DetectionResult[]): {
  high: number;
  medium: number;
  low: number;
} {
  return {
    high: results.filter((r) => r.severity === 'high').length,
    medium: results.filter((r) => r.severity === 'medium').length,
    low: results.filter((r) => r.severity === 'low').length,
  };
}
