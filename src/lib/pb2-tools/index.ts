/**
 * PB2 Tools Module - Barrel Exports
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Task 1.5: Export catalog and types from index.ts
 */

// Types
export type {
  PB2Tool,
  RecommendationInput,
  ToolRecommendation,
  RecommendationResult,
  RecommendationPriority,
  ThresholdConfig,
} from './types';

// Tool Catalog
export {
  PB2_TOOL_CATALOG,
  getPB2Tool,
  getAllPB2Tools,
  getPB2ToolsByPB1Source,
  getPB2ToolCount,
} from './tool-catalog';

// Constants
export {
  DECISION_VELOCITY_BENCHMARK_DAYS,
  DECISION_VELOCITY_THRESHOLD_MULTIPLIER,
  DECISION_VELOCITY_THRESHOLD_DAYS,
  MEETING_WASTE_THRESHOLD_PERCENT,
  MEETING_WASTE_BENCHMARK_PERCENT,
  DATA_FRICTION_THRESHOLD_DOLLARS,
  DATA_FRICTION_BENCHMARK_DOLLARS,
  BLOCKER_COUNT_THRESHOLD,
  MAX_RECOMMENDATIONS,
  MAX_SEVERITY_SCORE,
  ROI_DASHBOARD_TOOL_ID,
  CRITICAL_SEVERITY_THRESHOLD,
  HIGH_SEVERITY_THRESHOLD,
  formatCurrency,
  getDecisionVelocityReasoning,
  getMeetingWasteReasoning,
  getDataFrictionReasoning,
  getStakeholderBlockersReasoning,
  getROIFallbackReasoning,
} from './recommendation-constants';

// Scoring
export {
  calculateSeverityScore,
  calculatePercentageSeverityScore,
  calculateCountSeverityScore,
  determinePriority,
  rankRecommendations,
  filterByMinimumSeverity,
  needsFallbackRecommendation,
} from './recommendation-scoring';

// Engine
export {
  generateRecommendations,
  transformDiagnosticDataToInput,
} from './recommendation-engine';
