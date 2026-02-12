/**
 * Communication Pattern Diagnostic Components
 *
 * Exports all components for Tool 6.
 *
 * Story 13.1: Communication Metrics Input
 * Story 13.2: Anti-Pattern Detection
 * Story 13.3: Health Indicators Dashboard
 * Story 13.4: Intervention Recommendations
 */

// Story 13.1 Components
export { EmailMetricsForm } from './EmailMetricsForm';
export { ChatMetricsForm } from './ChatMetricsForm';
export { MeetingMetricsForm } from './MeetingMetricsForm';
export { MetricsSection, getSectionStatus } from './MetricsSection';

// Story 13.2 Components
export { AntiPatternCard } from './AntiPatternCard';
export { AntiPatternSummary } from './AntiPatternSummary';

// Story 13.3 Components
export { HealthIndicatorRow, HealthIndicatorCard } from './HealthIndicatorRow';
export { HealthIndicatorsTable, IndicatorStatusSummary } from './HealthIndicatorsTable';
export { OverallHealthScore, HealthScoreBadge } from './OverallHealthScore';

// Story 13.4 Components
export { InterventionCard, InterventionListItem } from './InterventionCard';
export { PrioritizedActionList } from './PrioritizedActionList';
export { Tool6Summary, Tool6CompleteBadge } from './Tool6Summary';

// Story 13.2 Detection Engine
export {
  detectBroadcastOverload,
  detectTelephoneGame,
  detectTribalKnowledge,
  detectToolSprawl,
  detectCYACulture,
  analyzePatterns,
  getSeverityDistribution,
} from './detection-engine';

// Story 13.3 Health Engine
export {
  evaluateHealthIndicator,
  evaluateAllIndicators,
  calculateHealthScore,
  getOverallStatus,
  countIndicatorsByStatus,
  evaluateHealth,
  formatIndicatorValue,
  formatThreshold,
} from './health-engine';

// Story 13.4 Intervention Engine
export {
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

// Re-export types and constants for convenience
export type {
  // Story 13.1 types
  FrequencyLevel,
  EmailMetrics,
  ChatMetrics,
  MeetingMetrics,
  CommunicationMetrics,
  FrequencyLevelInfo,
  MetricFieldConfig,
  MetricsSectionConfig,
  // Story 13.2 types
  SeverityLevel,
  AntiPattern,
  DetectionResult,
  PatternAnalysis,
  // Story 13.3 types
  HealthStatus,
  IndicatorCategory,
  HealthIndicator,
  HealthIndicatorResult,
  HealthEvaluationResult,
  // Story 13.4 types
  ImpactLevel,
  EffortLevel,
  Intervention,
  RecommendedIntervention,
  Tool6Summary as Tool6SummaryType,
} from './comm-constants';

export {
  // Story 13.1 constants and helpers
  FREQUENCY_LEVELS,
  EMAIL_METRICS_CONFIG,
  CHAT_METRICS_CONFIG,
  MEETING_METRICS_CONFIG,
  METRICS_SECTIONS,
  getFrequencyLevelInfo,
  getSectionConfig,
  createDefaultEmailMetrics,
  createDefaultChatMetrics,
  createDefaultMeetingMetrics,
  isEmailMetricsComplete,
  isChatMetricsComplete,
  isMeetingMetricsComplete,
  isAllMetricsComplete,
  countCompletedSections,
  frequencyToScore,
  // Story 13.2 constants and helpers
  ANTI_PATTERNS,
  DETECTION_THRESHOLDS,
  SEVERITY_STYLES,
  HEALTH_STYLES,
  getAntiPatternById,
  getSeverityStyle,
  calculateOverallHealth,
  // Story 13.3 constants and helpers
  HEALTH_INDICATORS,
  HEALTH_SCORE_INTERPRETATIONS,
  getHealthIndicatorById,
  getHealthIndicatorsByCategory,
  getHealthStatusStyle,
  // Story 13.4 constants and helpers
  INTERVENTIONS,
  IMPACT_STYLES,
  EFFORT_STYLES,
  getInterventionsForPattern,
} from './comm-constants';
