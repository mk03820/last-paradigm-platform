/**
 * Total Cost of Misalignment Calculator Constants and Types
 *
 * Defines aggregation types for all 7 diagnostic tools and
 * unified cost calculation types.
 *
 * Story 14.1: Cross-Tool Data Aggregation
 * Covers: FR2-31 (Cross-tool aggregation)
 */

// ============================================================================
// Tool Aggregation Types (Task 6.2, 6.3)
// ============================================================================

/**
 * Alignment category from Tool 1 composite score
 */
export type AlignmentCategory = 'chaos' | 'siloed' | 'coordinated' | 'integrated';

/**
 * Risk level from Tool 4 stakeholder analysis
 */
export type StakeholderRiskLevel = 'low' | 'medium' | 'high';

/**
 * Health status from Tool 6 communication analysis
 */
export type CommunicationHealthStatus = 'healthy' | 'warning' | 'crisis';

/**
 * Tool 1 Aggregation: Organizational Alignment Assessment
 */
export interface Tool1Aggregation {
  compositeScore: number; // 1-4 scale
  category: AlignmentCategory;
  weakestDimension: string;
  completedAt: string;
}

/**
 * Tool 2 Aggregation: Meeting Audit Calculator
 */
export interface Tool2Aggregation {
  annualizedWaste: number; // Dollar amount
  meetingsPerWeek: number;
  totalAttendeeHours: number;
  completedAt: string;
}

/**
 * Tool 3 Aggregation: Decision Velocity Scorecard
 */
export interface Tool3Aggregation {
  avgDecisionLatencyDays: number;
  bottleneckPatterns: string[];
  decisionTypeCount: number;
  completedAt: string;
}

/**
 * Tool 4 Aggregation: Stakeholder Power/Interest Map
 */
export interface Tool4Aggregation {
  stakeholderCount: number;
  blockerCount: number;
  keyPlayerCount: number;
  riskLevel: StakeholderRiskLevel;
  completedAt: string;
}

/**
 * Tool 5 Aggregation: Data Flow Friction Analysis
 */
export interface Tool5Aggregation {
  totalFrictionCost: number; // Dollar amount
  journeyCount: number;
  frictionPointCount: number;
  criticalFrictionCount: number;
  completedAt: string;
}

/**
 * Tool 6 Aggregation: Communication Pattern Diagnostic
 */
export interface Tool6Aggregation {
  healthScore: number; // 0-100
  healthStatus: CommunicationHealthStatus;
  patternsDetected: number;
  interventionsRecommended: number;
  completedAt: string;
}

/**
 * Unified aggregated data from all tools
 */
export interface AggregatedToolData {
  tool1: Tool1Aggregation | null;
  tool2: Tool2Aggregation | null;
  tool3: Tool3Aggregation | null;
  tool4: Tool4Aggregation | null;
  tool5: Tool5Aggregation | null;
  tool6: Tool6Aggregation | null;
  aggregatedAt: string;
  completedToolsCount: number;
  canProceed: boolean; // True if Tool 2 is complete (minimum requirement)
}

// ============================================================================
// Tool Metadata (Task 3.2)
// ============================================================================

/**
 * Completion status for a tool
 */
export type ToolCompletionStatus = 'complete' | 'in-progress' | 'not-started';

/**
 * Tool metadata for display
 */
export interface ToolInfo {
  id: string;
  number: number;
  name: string;
  shortName: string;
  description: string;
  path: string;
  isRequired: boolean;
}

/**
 * Tool completion info for display
 */
export interface ToolCompletionInfo {
  tool: ToolInfo;
  status: ToolCompletionStatus;
  primaryMetric?: string;
  primaryValue?: string | number;
}

/**
 * All tool definitions
 */
export const TOOLS: ToolInfo[] = [
  {
    id: 'alignment',
    number: 1,
    name: 'Organizational Alignment Assessment',
    shortName: 'Alignment',
    description: 'Score your organization across 5 key alignment dimensions',
    path: '/tool/alignment',
    isRequired: false,
  },
  {
    id: 'meeting-audit',
    number: 2,
    name: 'Meeting Audit Calculator',
    shortName: 'Meeting Audit',
    description: 'Calculate the cost of meeting waste in your organization',
    path: '/calculator',
    isRequired: true, // Minimum requirement per AC3
  },
  {
    id: 'decision-velocity',
    number: 3,
    name: 'Decision Velocity Scorecard',
    shortName: 'Decision Velocity',
    description: 'Measure how fast decisions move from request to implementation',
    path: '/tool/decision-velocity',
    isRequired: false,
  },
  {
    id: 'stakeholder-map',
    number: 4,
    name: 'Stakeholder Power/Interest Map',
    shortName: 'Stakeholder Map',
    description: 'Map stakeholder influence and engagement strategies',
    path: '/tool/stakeholder-map',
    isRequired: false,
  },
  {
    id: 'data-flow',
    number: 5,
    name: 'Data Flow Friction Analysis',
    shortName: 'Data Flow',
    description: 'Identify and quantify data friction in your organization',
    path: '/tool/data-flow',
    isRequired: false,
  },
  {
    id: 'communication',
    number: 6,
    name: 'Communication Pattern Diagnostic',
    shortName: 'Communication',
    description: 'Analyze communication patterns and anti-patterns',
    path: '/tool/communication',
    isRequired: false,
  },
];

/**
 * Get tool info by ID
 */
export function getToolInfo(toolId: string): ToolInfo | undefined {
  return TOOLS.find((t) => t.id === toolId);
}

/**
 * Get tool info by number
 */
export function getToolByNumber(num: number): ToolInfo | undefined {
  return TOOLS.find((t) => t.number === num);
}

// ============================================================================
// Cost Category Types (Task 6.4 - For Story 14.2/14.3)
// ============================================================================

/**
 * Cost category for breakdown
 * Extensible for Stories 14.2 and 14.3
 */
export type CostCategory =
  | 'meeting-waste'        // From Tool 2
  | 'decision-latency'     // From Tool 3
  | 'data-friction'        // From Tool 5
  | 'communication-overhead' // From Tool 6
  | 'additional-manual';   // From Story 14.2

/**
 * Cost breakdown by category
 */
export interface CostBreakdown {
  category: CostCategory;
  label: string;
  amount: number;
  source: string; // Tool source
  percentage?: number; // Percentage of total
}

/**
 * Category labels for display
 */
export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  'meeting-waste': 'Meeting Waste',
  'decision-latency': 'Decision Delays',
  'data-friction': 'Data Friction',
  'communication-overhead': 'Communication Overhead',
  'additional-manual': 'Additional Costs',
};

/**
 * Category sources for display
 */
export const COST_CATEGORY_SOURCES: Record<CostCategory, string> = {
  'meeting-waste': 'Tool 2: Meeting Audit',
  'decision-latency': 'Tool 3: Decision Velocity',
  'data-friction': 'Tool 5: Data Flow',
  'communication-overhead': 'Tool 6: Communication',
  'additional-manual': 'Manual Entry',
};

// ============================================================================
// Aggregation Status Types
// ============================================================================

/**
 * Status of the aggregation process
 */
export type AggregationStatus = 'idle' | 'aggregating' | 'complete' | 'error';

/**
 * Aggregation error info
 */
export interface AggregationError {
  message: string;
  toolId?: string;
}

// ============================================================================
// UI Display Helpers
// ============================================================================

/**
 * Completion status styles for display
 */
export const COMPLETION_STATUS_STYLES: Record<
  ToolCompletionStatus,
  { color: string; bgColor: string; icon: string; label: string }
> = {
  complete: {
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: 'check-circle',
    label: 'Complete',
  },
  'in-progress': {
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: 'clock',
    label: 'In Progress',
  },
  'not-started': {
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    icon: 'circle',
    label: 'Not Started',
  },
};

/**
 * Get completion status style
 */
export function getCompletionStatusStyle(status: ToolCompletionStatus) {
  return COMPLETION_STATUS_STYLES[status];
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(0)}%`;
}

// ============================================================================
// Story 14.3: Interpretation Thresholds
// ============================================================================

/**
 * Interpretation levels for alignment tax as % of revenue
 */
export type InterpretationLevel = 'normal' | 'significant' | 'crisis' | 'existential';

/**
 * Interpretation threshold configuration
 */
export interface InterpretationThreshold {
  level: InterpretationLevel;
  minPercent: number;
  maxPercent: number | null;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

/**
 * Interpretation thresholds based on alignment tax as % of revenue
 * - <2%: Normal (green)
 * - 2-4%: Significant (yellow)
 * - 4-7%: Crisis (orange)
 * - >7%: Existential (red)
 */
export const INTERPRETATION_THRESHOLDS: InterpretationThreshold[] = [
  {
    level: 'normal',
    minPercent: 0,
    maxPercent: 2,
    label: 'Normal',
    description:
      'Your alignment tax is within typical organizational ranges. While there is always room for improvement, this level does not require urgent intervention.',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-300 dark:border-green-700',
    icon: 'check-circle',
  },
  {
    level: 'significant',
    minPercent: 2,
    maxPercent: 4,
    label: 'Significant',
    description:
      'Your alignment tax is above average. This represents meaningful drag on organizational performance and warrants focused improvement initiatives.',
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    icon: 'alert-triangle',
  },
  {
    level: 'crisis',
    minPercent: 4,
    maxPercent: 7,
    label: 'Crisis',
    description:
      'Your alignment tax is at crisis level. This is causing substantial competitive disadvantage and requires immediate executive attention.',
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-300 dark:border-orange-700',
    icon: 'alert-octagon',
  },
  {
    level: 'existential',
    minPercent: 7,
    maxPercent: null,
    label: 'Existential',
    description:
      'Your alignment tax poses an existential threat to the organization. Immediate, comprehensive transformation is required for survival.',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-300 dark:border-red-700',
    icon: 'skull',
  },
];

/**
 * Get interpretation threshold by level
 */
export function getInterpretationByLevel(level: InterpretationLevel): InterpretationThreshold {
  return INTERPRETATION_THRESHOLDS.find((t) => t.level === level) || INTERPRETATION_THRESHOLDS[0];
}

/**
 * Get interpretation threshold by percentage
 */
export function getInterpretationByPercent(percent: number): InterpretationThreshold {
  for (const threshold of INTERPRETATION_THRESHOLDS) {
    if (threshold.maxPercent === null) {
      // Last threshold (existential) - no upper bound
      if (percent >= threshold.minPercent) {
        return threshold;
      }
    } else if (percent >= threshold.minPercent && percent < threshold.maxPercent) {
      return threshold;
    }
  }
  // Default to normal if somehow no match
  return INTERPRETATION_THRESHOLDS[0];
}

/**
 * Cost source identifiers
 */
export type CostSourceId =
  | 'meetingWaste'
  | 'dataFriction'
  | 'projectDelays'
  | 'rework'
  | 'turnover'
  | 'opportunityCost';

/**
 * Cost source metadata
 */
export interface CostSourceInfo {
  id: CostSourceId;
  label: string;
  shortLabel: string;
  description: string;
  source: 'tool' | 'input';
  toolNumber?: number;
  icon: string;
}

/**
 * All cost sources for the Total Cost of Misalignment calculation
 */
export const COST_SOURCES: CostSourceInfo[] = [
  {
    id: 'meetingWaste',
    label: 'Meeting Waste',
    shortLabel: 'Meetings',
    description: 'Annual cost of unproductive meeting time',
    source: 'tool',
    toolNumber: 2,
    icon: 'calendar',
  },
  {
    id: 'dataFriction',
    label: 'Data Friction',
    shortLabel: 'Data',
    description: 'Annual cost of data access and quality issues',
    source: 'tool',
    toolNumber: 5,
    icon: 'database',
  },
  {
    id: 'projectDelays',
    label: 'Project Delays',
    shortLabel: 'Delays',
    description: 'Cost of projects delayed due to misalignment',
    source: 'input',
    icon: 'clock',
  },
  {
    id: 'rework',
    label: 'Rework',
    shortLabel: 'Rework',
    description: 'Cost of work redone due to miscommunication',
    source: 'input',
    icon: 'refresh-cw',
  },
  {
    id: 'turnover',
    label: 'Excess Turnover',
    shortLabel: 'Turnover',
    description: 'Cost of turnover attributable to misalignment',
    source: 'input',
    icon: 'users',
  },
  {
    id: 'opportunityCost',
    label: 'Opportunity Cost',
    shortLabel: 'Opportunity',
    description: 'Revenue lost due to slow decisions and execution',
    source: 'input',
    icon: 'trending-up',
  },
];

/**
 * Get cost source info by ID
 */
export function getCostSourceInfo(id: CostSourceId): CostSourceInfo | undefined {
  return COST_SOURCES.find((s) => s.id === id);
}

/**
 * Get tool-sourced cost items
 */
export function getToolCostSources(): CostSourceInfo[] {
  return COST_SOURCES.filter((s) => s.source === 'tool');
}

/**
 * Get manually-input cost items
 */
export function getInputCostSources(): CostSourceInfo[] {
  return COST_SOURCES.filter((s) => s.source === 'input');
}

/**
 * Threshold range display helper
 */
export function formatThresholdRange(threshold: InterpretationThreshold): string {
  if (threshold.maxPercent === null) {
    return `>${threshold.minPercent}%`;
  }
  return `${threshold.minPercent}-${threshold.maxPercent}%`;
}

/**
 * Get all threshold ranges as a summary string
 */
export function getThresholdSummary(): string {
  return INTERPRETATION_THRESHOLDS.map(
    (t) => `${formatThresholdRange(t)} ${t.label}`
  ).join(' | ');
}

// ============================================================================
// Story 14.3: Additional Cost Input Types
// ============================================================================

/**
 * Additional costs entered manually (Story 14.2)
 */
export interface AdditionalCosts {
  projectDelays: {
    annualProjectBudget: number;
    delayPercentage: number;
    subtotal: number;
  };
  rework: {
    annualLaborBudget: number;
    reworkPercentage: number;
    subtotal: number;
  };
  turnover: {
    annualTurnoverCost: number;
    alignmentAttributionPercent: number;
    subtotal: number;
  };
  opportunityCost: {
    estimatedAmount: number;
    subtotal: number;
  };
  total: number;
}

/**
 * Create empty additional costs structure
 */
export function createEmptyAdditionalCosts(): AdditionalCosts {
  return {
    projectDelays: { annualProjectBudget: 0, delayPercentage: 0, subtotal: 0 },
    rework: { annualLaborBudget: 0, reworkPercentage: 0, subtotal: 0 },
    turnover: { annualTurnoverCost: 0, alignmentAttributionPercent: 0, subtotal: 0 },
    opportunityCost: { estimatedAmount: 0, subtotal: 0 },
    total: 0,
  };
}

/**
 * Alignment tax result from calculation engine
 */
export interface AlignmentTaxResult {
  // From tools
  meetingWaste: number; // Tool 2
  dataFriction: number; // Tool 5

  // Additional inputs
  projectDelays: number;
  rework: number;
  turnover: number;
  opportunityCost: number;

  // Totals
  toolsSubtotal: number;
  additionalSubtotal: number;
  total: number;

  // As percentage
  revenue: number;
  percentOfRevenue: number;

  // Interpretation
  interpretation: InterpretationThreshold;
}

/**
 * Cost source item for display
 */
export interface CostSourceItem {
  id: CostSourceId;
  label: string;
  amount: number;
  percentage: number;
  source: 'tool' | 'input';
  toolNumber?: number;
}

// ============================================================================
// Story 14.2: Additional Cost Input Field Configurations
// ============================================================================

/**
 * Cost input field definition
 */
export interface CostInputField {
  id: string;
  label: string;
  type: 'currency' | 'percentage' | 'number';
  placeholder: string;
  helpText: string;
  min?: number;
  max?: number;
  unit?: string;
}

/**
 * Additional cost category definition
 */
export interface AdditionalCostCategory {
  id: string;
  name: string;
  description: string;
  guidance: string;
  icon: string;
  fields: CostInputField[];
}

/**
 * Extended project delays cost data (Story 14.2)
 */
export interface ProjectDelaysCostInput {
  failedProjectsCount: number;
  avgProjectValue: number;
  delayImpactPercent: number;
  subtotal: number;
}

/**
 * Extended rework cost data (Story 14.2)
 */
export interface ReworkCostInput {
  reworkPercent: number;
  annualLaborCost: number;
  subtotal: number;
}

/**
 * Extended turnover cost data (Story 14.2)
 */
export interface TurnoverCostInput {
  excessTurnoverRate: number;
  avgReplacementCost: number;
  headcount: number;
  subtotal: number;
}

/**
 * Extended opportunity cost data (Story 14.2)
 */
export interface OpportunityCostInput {
  delayedRevenue: number;
  missedDeals: number;
  marketShareLoss: number;
  subtotal: number;
}

/**
 * Extended additional costs with detailed input fields (Story 14.2)
 */
export interface AdditionalCostsInput {
  projectDelays: ProjectDelaysCostInput;
  rework: ReworkCostInput;
  turnover: TurnoverCostInput;
  opportunityCost: OpportunityCostInput;
  total: number;
}

/**
 * Create default project delays cost input
 */
export function createDefaultProjectDelaysCostInput(): ProjectDelaysCostInput {
  return {
    failedProjectsCount: 0,
    avgProjectValue: 0,
    delayImpactPercent: 0,
    subtotal: 0,
  };
}

/**
 * Create default rework cost input
 */
export function createDefaultReworkCostInput(): ReworkCostInput {
  return {
    reworkPercent: 0,
    annualLaborCost: 0,
    subtotal: 0,
  };
}

/**
 * Create default turnover cost input
 */
export function createDefaultTurnoverCostInput(): TurnoverCostInput {
  return {
    excessTurnoverRate: 0,
    avgReplacementCost: 0,
    headcount: 0,
    subtotal: 0,
  };
}

/**
 * Create default opportunity cost input
 */
export function createDefaultOpportunityCostInput(): OpportunityCostInput {
  return {
    delayedRevenue: 0,
    missedDeals: 0,
    marketShareLoss: 0,
    subtotal: 0,
  };
}

/**
 * Create default additional costs input
 */
export function createDefaultAdditionalCostsInput(): AdditionalCostsInput {
  return {
    projectDelays: createDefaultProjectDelaysCostInput(),
    rework: createDefaultReworkCostInput(),
    turnover: createDefaultTurnoverCostInput(),
    opportunityCost: createDefaultOpportunityCostInput(),
    total: 0,
  };
}

// ============================================================================
// Cost Calculation Functions (Story 14.2)
// ============================================================================

/**
 * Calculate project delays cost
 * Formula: failedProjectsCount * avgProjectValue * (delayImpactPercent / 100)
 */
export function calculateProjectDelaysCost(data: Omit<ProjectDelaysCostInput, 'subtotal'>): number {
  const { failedProjectsCount, avgProjectValue, delayImpactPercent } = data;
  return Math.round(failedProjectsCount * avgProjectValue * (delayImpactPercent / 100));
}

/**
 * Calculate rework cost
 * Formula: annualLaborCost * (reworkPercent / 100)
 * Industry default: 15-30% of work is redone
 */
export function calculateReworkCost(data: Omit<ReworkCostInput, 'subtotal'>): number {
  const { reworkPercent, annualLaborCost } = data;
  return Math.round(annualLaborCost * (reworkPercent / 100));
}

/**
 * Calculate turnover cost
 * Formula: (excessTurnoverRate / 100) * headcount * avgReplacementCost
 * Note: excess = actual - industry normal (~15%)
 */
export function calculateTurnoverCost(data: Omit<TurnoverCostInput, 'subtotal'>): number {
  const { excessTurnoverRate, avgReplacementCost, headcount } = data;
  return Math.round((excessTurnoverRate / 100) * headcount * avgReplacementCost);
}

/**
 * Calculate opportunity cost
 * Formula: delayedRevenue + missedDeals + marketShareLoss
 */
export function calculateOpportunityCostTotal(data: Omit<OpportunityCostInput, 'subtotal'>): number {
  const { delayedRevenue, missedDeals, marketShareLoss } = data;
  return Math.round(delayedRevenue + missedDeals + marketShareLoss);
}

/**
 * Calculate total additional costs input
 */
export function calculateTotalAdditionalCostsInput(costs: Omit<AdditionalCostsInput, 'total'>): number {
  return (
    costs.projectDelays.subtotal +
    costs.rework.subtotal +
    costs.turnover.subtotal +
    costs.opportunityCost.subtotal
  );
}

// ============================================================================
// Additional Cost Categories Configuration (Story 14.2)
// ============================================================================

/**
 * Project delays field configurations
 */
export const PROJECT_DELAYS_FIELDS: CostInputField[] = [
  {
    id: 'failedProjectsCount',
    label: 'Failed/Delayed Projects',
    type: 'number',
    placeholder: 'e.g., 3',
    helpText: 'Number of projects in the past year that failed or were significantly delayed due to misalignment',
    min: 0,
    max: 100,
  },
  {
    id: 'avgProjectValue',
    label: 'Average Project Value',
    type: 'currency',
    placeholder: 'e.g., 250000',
    helpText: 'Average investment value of projects (budget, resources, opportunity)',
    min: 0,
    unit: '$',
  },
  {
    id: 'delayImpactPercent',
    label: 'Impact Percentage',
    type: 'percentage',
    placeholder: 'e.g., 50',
    helpText: 'What percentage of project value was lost due to delays/failures? (50-100% for failures, 10-50% for delays)',
    min: 0,
    max: 100,
    unit: '%',
  },
];

/**
 * Rework field configurations
 */
export const REWORK_FIELDS: CostInputField[] = [
  {
    id: 'reworkPercent',
    label: 'Rework Percentage',
    type: 'percentage',
    placeholder: 'e.g., 20',
    helpText: 'What percentage of work gets redone due to misalignment? Industry average is 15-30%',
    min: 0,
    max: 100,
    unit: '%',
  },
  {
    id: 'annualLaborCost',
    label: 'Annual Labor Cost',
    type: 'currency',
    placeholder: 'e.g., 5000000',
    helpText: 'Total annual labor cost for teams affected by rework (salaries + benefits)',
    min: 0,
    unit: '$',
  },
];

/**
 * Turnover field configurations
 */
export const TURNOVER_FIELDS: CostInputField[] = [
  {
    id: 'excessTurnoverRate',
    label: 'Excess Turnover Rate',
    type: 'percentage',
    placeholder: 'e.g., 10',
    helpText: 'Turnover rate above normal (your rate minus industry normal ~15%). Enter 0 if below normal.',
    min: 0,
    max: 50,
    unit: '%',
  },
  {
    id: 'avgReplacementCost',
    label: 'Average Replacement Cost',
    type: 'currency',
    placeholder: 'e.g., 75000',
    helpText: 'Cost to replace an employee (recruiting, training, ramp-up). Typically 50-200% of annual salary.',
    min: 0,
    unit: '$',
  },
  {
    id: 'headcount',
    label: 'Affected Headcount',
    type: 'number',
    placeholder: 'e.g., 100',
    helpText: 'Number of employees in roles affected by misalignment-driven turnover',
    min: 0,
    max: 10000,
  },
];

/**
 * Opportunity cost field configurations
 */
export const OPPORTUNITY_COST_FIELDS: CostInputField[] = [
  {
    id: 'delayedRevenue',
    label: 'Delayed Revenue',
    type: 'currency',
    placeholder: 'e.g., 500000',
    helpText: 'Revenue delayed due to slow decision-making or coordination failures',
    min: 0,
    unit: '$',
  },
  {
    id: 'missedDeals',
    label: 'Missed Deals',
    type: 'currency',
    placeholder: 'e.g., 250000',
    helpText: 'Value of deals lost due to inability to respond quickly or coordinate effectively',
    min: 0,
    unit: '$',
  },
  {
    id: 'marketShareLoss',
    label: 'Market Share Loss',
    type: 'currency',
    placeholder: 'e.g., 1000000',
    helpText: 'Estimated annual revenue impact from market share lost to more agile competitors',
    min: 0,
    unit: '$',
  },
];

/**
 * Revenue field configuration
 */
export const REVENUE_FIELDS: CostInputField[] = [
  {
    id: 'annualRevenue',
    label: 'Annual Revenue',
    type: 'currency',
    placeholder: 'e.g., 50000000',
    helpText: 'Total annual company revenue (used to calculate alignment tax as percentage of revenue)',
    min: 0,
    unit: '$',
  },
];

/**
 * All additional cost categories
 */
export const ADDITIONAL_COST_CATEGORIES: AdditionalCostCategory[] = [
  {
    id: 'projectDelays',
    name: 'Project Delays & Failures',
    description: 'Cost of projects that failed or were significantly delayed due to misalignment',
    guidance: 'Think about projects in the past year that went off track. How many failed completely? How many had major delays? What was their average budget or value?',
    icon: 'TrendingDown',
    fields: PROJECT_DELAYS_FIELDS,
  },
  {
    id: 'rework',
    name: 'Rework & Duplication',
    description: 'Cost of work that gets redone due to miscommunication or changing requirements',
    guidance: 'Survey your team: What percentage of work gets redone? Common causes include misunderstood requirements, late feedback, and duplicate efforts across teams.',
    icon: 'RefreshCw',
    fields: REWORK_FIELDS,
  },
  {
    id: 'turnover',
    name: 'Excess Turnover',
    description: 'Cost of losing employees who leave due to organizational friction',
    guidance: 'Excess turnover is above industry normal (~15%). High performers often leave organizations with poor alignment. Calculate replacement cost including recruiting, training, and lost productivity during ramp-up.',
    icon: 'UserMinus',
    fields: TURNOVER_FIELDS,
  },
  {
    id: 'opportunityCost',
    name: 'Opportunity Costs',
    description: 'Revenue and growth opportunities lost due to organizational drag',
    guidance: 'Consider deals that fell through, products that launched late, and market opportunities missed because the organization moved too slowly.',
    icon: 'Target',
    fields: OPPORTUNITY_COST_FIELDS,
  },
];

/**
 * Get cost category by ID
 */
export function getCostCategoryById(categoryId: string): AdditionalCostCategory | undefined {
  return ADDITIONAL_COST_CATEGORIES.find((c) => c.id === categoryId);
}

// ============================================================================
// Story 14.5: ROI Calculator Types
// ============================================================================

/**
 * Scenario type for ROI calculations
 */
export type ROIScenarioType = 'conservative' | 'moderate' | 'aggressive';

/**
 * ROI Scenario configuration
 */
export interface ROIScenario {
  type: ROIScenarioType;
  label: string;
  description: string;
  reductionMultiplier: number; // Multiplier applied to target reduction
  achievementProbability: number; // Percentage likelihood of achieving
  color: string;
  bgColor: string;
  borderColor: string;
}

/**
 * ROI Calculation Result
 */
export interface ROIResult {
  scenarioType: ROIScenarioType;
  scenarioLabel: string;
  targetReduction: number; // Percentage (0-100)
  timelineMonths: number;
  investment: number;

  // Core metrics
  annualSavings: number;
  threeYearSavings: number;
  npv: number; // Net Present Value over 3 years
  roiRatio: number; // ROI as ratio (e.g., 3.5x)
  roiPercent: number; // ROI as percentage (e.g., 350%)
  paybackMonths: number; // Months to break even

  // Achievement probability
  probability: number;
}

/**
 * ROI Calculator Input Parameters
 */
export interface ROICalculatorInput {
  alignmentTax: number; // Current annual alignment tax
  investment: number; // Proposed transformation investment
  targetReduction: number; // Target reduction percentage (0-100)
  timelineMonths: number; // Timeline to achieve reduction
  discountRate?: number; // NPV discount rate (default 10%)
}

/**
 * ROI Scenarios Configuration
 */
export const ROI_SCENARIOS: ROIScenario[] = [
  {
    type: 'conservative',
    label: 'Conservative',
    description: 'Lower reduction targets with higher certainty of achievement',
    reductionMultiplier: 0.6, // Achieves 60% of target
    achievementProbability: 85,
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    type: 'moderate',
    label: 'Moderate',
    description: 'Balanced reduction targets with reasonable probability',
    reductionMultiplier: 1.0, // Achieves 100% of target
    achievementProbability: 65,
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    type: 'aggressive',
    label: 'Aggressive',
    description: 'Higher reduction targets with lower certainty',
    reductionMultiplier: 1.4, // Achieves 140% of target
    achievementProbability: 35,
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
];

/**
 * Default ROI Calculator values
 */
export const ROI_DEFAULTS = {
  targetReduction: 50, // 50% reduction
  timelineMonths: 18, // 18 months
  discountRate: 0.10, // 10% discount rate for NPV
  minInvestment: 10000,
  maxInvestment: 50000000,
};

/**
 * Timeline options for ROI calculator
 */
export const ROI_TIMELINE_OPTIONS = [
  { value: 12, label: '12 months' },
  { value: 18, label: '18 months' },
  { value: 24, label: '24 months' },
  { value: 36, label: '36 months' },
];

/**
 * Target reduction options for ROI calculator
 */
export const ROI_REDUCTION_OPTIONS = [
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
];

/**
 * Get ROI scenario by type
 */
export function getROIScenario(type: ROIScenarioType): ROIScenario {
  return ROI_SCENARIOS.find((s) => s.type === type) || ROI_SCENARIOS[1];
}

/**
 * Format ROI ratio for display
 */
export function formatROIRatio(ratio: number): string {
  if (ratio < 0) return 'Negative';
  if (ratio === Infinity || isNaN(ratio)) return 'N/A';
  return `${ratio.toFixed(1)}x`;
}

/**
 * Format months to years and months
 */
export function formatPaybackPeriod(months: number): string {
  if (months <= 0) return 'Immediate';
  if (months === Infinity || isNaN(months)) return 'Never';
  if (months > 120) return '10+ years';

  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  return `${years}y ${remainingMonths}m`;
}

// ============================================================================
// Validation Helpers (Story 14.2)
// ============================================================================

/**
 * Check if project delays cost has data
 */
export function hasProjectDelaysData(data: ProjectDelaysCostInput): boolean {
  return (
    data.failedProjectsCount > 0 ||
    data.avgProjectValue > 0 ||
    data.delayImpactPercent > 0
  );
}

/**
 * Check if rework cost has data
 */
export function hasReworkData(data: ReworkCostInput): boolean {
  return data.reworkPercent > 0 || data.annualLaborCost > 0;
}

/**
 * Check if turnover cost has data
 */
export function hasTurnoverData(data: TurnoverCostInput): boolean {
  return (
    data.excessTurnoverRate > 0 ||
    data.avgReplacementCost > 0 ||
    data.headcount > 0
  );
}

/**
 * Check if opportunity cost has data
 */
export function hasOpportunityCostData(data: OpportunityCostInput): boolean {
  return (
    data.delayedRevenue > 0 ||
    data.missedDeals > 0 ||
    data.marketShareLoss > 0
  );
}

/**
 * Check if any additional costs have been entered
 */
export function hasAnyAdditionalCostsInput(costs: AdditionalCostsInput): boolean {
  return (
    hasProjectDelaysData(costs.projectDelays) ||
    hasReworkData(costs.rework) ||
    hasTurnoverData(costs.turnover) ||
    hasOpportunityCostData(costs.opportunityCost)
  );
}

/**
 * Count completed cost categories
 */
export function countCompletedCostCategories(costs: AdditionalCostsInput): number {
  let count = 0;
  if (costs.projectDelays.subtotal > 0) count++;
  if (costs.rework.subtotal > 0) count++;
  if (costs.turnover.subtotal > 0) count++;
  if (costs.opportunityCost.subtotal > 0) count++;
  return count;
}
