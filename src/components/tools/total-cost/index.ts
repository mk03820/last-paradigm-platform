/**
 * Total Cost of Misalignment Calculator Components
 *
 * Exports all components and utilities for Tool 7.
 *
 * Story 14.1: Cross-Tool Data Aggregation
 * Story 14.2: Additional Cost Category Inputs
 * Story 14.3: Alignment Tax Calculation and Interpretation
 * Task 8: Update index exports (AC: all)
 */

// ============================================================================
// Story 14.1 Components
// ============================================================================

export { ToolCompletionStatus } from './ToolCompletionStatus';
export type { ToolCompletionStatusProps } from './ToolCompletionStatus';

export { AggregatedDataPreview } from './AggregatedDataPreview';
export type { AggregatedDataPreviewProps } from './AggregatedDataPreview';

// ============================================================================
// Story 14.1 Aggregation Engine
// ============================================================================

export {
  aggregateFromTool1,
  aggregateFromTool2,
  aggregateFromTool3,
  aggregateFromTool4,
  aggregateFromTool5,
  aggregateFromTool6,
  aggregateAllTools,
  isToolComplete,
  getAllToolCompletionStatus,
} from './aggregation-engine';

// ============================================================================
// Types and Constants
// ============================================================================

export type {
  // Tool aggregation types
  Tool1Aggregation,
  Tool2Aggregation,
  Tool3Aggregation,
  Tool4Aggregation,
  Tool5Aggregation,
  Tool6Aggregation,
  AggregatedToolData,

  // Category types
  AlignmentCategory,
  StakeholderRiskLevel,
  CommunicationHealthStatus,

  // Tool metadata types
  ToolCompletionStatus as ToolCompletionStatusType,
  ToolInfo,
  ToolCompletionInfo,

  // Cost types
  CostCategory,
  CostBreakdown,

  // Aggregation status types
  AggregationStatus,
  AggregationError,
} from './cost-constants';

export {
  // Tool metadata
  TOOLS,
  getToolInfo,
  getToolByNumber,

  // Cost category labels
  COST_CATEGORY_LABELS,
  COST_CATEGORY_SOURCES,

  // Completion status styles
  COMPLETION_STATUS_STYLES,
  getCompletionStatusStyle,

  // Formatting utilities
  formatCurrency,
  formatPercentage,

  // Story 14.3 exports
  INTERPRETATION_THRESHOLDS,
  COST_SOURCES,
  getInterpretationByLevel,
  getInterpretationByPercent,
  getCostSourceInfo,
  getToolCostSources,
  getInputCostSources,
  formatThresholdRange,
  getThresholdSummary,
  createEmptyAdditionalCosts,
} from './cost-constants';

// ============================================================================
// Story 14.3 Components
// ============================================================================

export { AlignmentTaxHeadline, AlignmentTaxBadge } from './AlignmentTaxHeadline';
export type { AlignmentTaxHeadlineProps } from './AlignmentTaxHeadline';

export {
  PercentOfRevenueDisplay,
  PercentBadge,
  RevenueContext,
} from './PercentOfRevenueDisplay';
export type { PercentOfRevenueDisplayProps } from './PercentOfRevenueDisplay';

export {
  InterpretationCard,
  InterpretationBadge,
  ThresholdLegend,
  InterpretationIndicator,
} from './InterpretationCard';
export type { InterpretationCardProps } from './InterpretationCard';

export {
  CostSourceBreakdown,
  CostBreakdownList,
  CostSummaryLine,
} from './CostSourceBreakdown';
export type { CostSourceBreakdownProps } from './CostSourceBreakdown';

// ============================================================================
// Story 14.3 Calculation Engine
// ============================================================================

export {
  calculateTotalAlignmentTax,
  calculatePercentOfRevenue,
  getInterpretation,
  buildCostSourceItems,
  getToolCostItems,
  getInputCostItems,
  formatCurrency as formatCurrencyAbbreviated,
  formatFullCurrency,
  formatPercent,
  formatPercentSmart,
  hasValidResult,
  hasMinimumRequirements,
  countActiveCostSources,
  getLargestCostSource,
  getCostSourceLabel,
} from './calculation-engine';

// ============================================================================
// Story 14.3 Types
// ============================================================================

export type {
  InterpretationLevel,
  InterpretationThreshold,
  CostSourceId,
  CostSourceInfo,
  AdditionalCosts,
  AlignmentTaxResult,
  CostSourceItem,
} from './cost-constants';

// ============================================================================
// Story 14.2 Components
// ============================================================================

export { ProjectDelaysCostInput } from './ProjectDelaysCostInput';
export { ReworkCostInput } from './ReworkCostInput';
export { TurnoverCostInput } from './TurnoverCostInput';
export { OpportunityCostInput } from './OpportunityCostInput';
export { RevenueInput } from './RevenueInput';
export { AdditionalCostsForm } from './AdditionalCostsForm';

// ============================================================================
// Story 14.2 Types and Helpers
// ============================================================================

export type {
  CostInputField,
  AdditionalCostCategory,
  ProjectDelaysCostInput as ProjectDelaysCostInputType,
  ReworkCostInput as ReworkCostInputType,
  TurnoverCostInput as TurnoverCostInputType,
  OpportunityCostInput as OpportunityCostInputType,
  AdditionalCostsInput,
} from './cost-constants';

export {
  // Field configurations
  PROJECT_DELAYS_FIELDS,
  REWORK_FIELDS,
  TURNOVER_FIELDS,
  OPPORTUNITY_COST_FIELDS,
  REVENUE_FIELDS,
  ADDITIONAL_COST_CATEGORIES,
  getCostCategoryById,
  // Default creators
  createDefaultProjectDelaysCostInput,
  createDefaultReworkCostInput,
  createDefaultTurnoverCostInput,
  createDefaultOpportunityCostInput,
  createDefaultAdditionalCostsInput,
  // Calculation functions
  calculateProjectDelaysCost,
  calculateReworkCost,
  calculateTurnoverCost,
  calculateOpportunityCostTotal,
  calculateTotalAdditionalCostsInput,
  // Validation helpers
  hasProjectDelaysData,
  hasReworkData,
  hasTurnoverData,
  hasOpportunityCostData,
  hasAnyAdditionalCostsInput,
  countCompletedCostCategories,
} from './cost-constants';
