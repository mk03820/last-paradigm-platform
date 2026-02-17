/**
 * Toolkit Generation Context Types
 *
 * Types for transforming PB1 diagnostic data into PB2 toolkit generation context.
 * This context pre-populates PB2 tools based on PB1 results.
 *
 * Story 15.7: PB1 Data Migration to Database
 * Task 2.2: Define ToolkitGenerationContext type per architecture spec
 *
 * Covers: AC2 (PB1 to PB2 transformation), FR55 (PB1→PB2 data pre-population)
 */

/**
 * Alignment scores from Tool 1
 */
export interface AlignmentScores {
  strategic: number;
  execution: number;
  technology: number;
  people: number;
  governance: number;
}

/**
 * Stakeholder entry from Tool 4
 */
export interface StakeholderEntry {
  name: string;
  role: string;
  power: number;
  interest: number;
  sentiment?: string;
}

/**
 * Decision type metrics from Tool 3
 */
export interface DecisionTypeMetric {
  type: string;
  medianDays: number;
  benchmark: number;
  gap: number;
}

/**
 * Data friction bottleneck from Tool 5
 */
export interface FrictionBottleneck {
  name: string;
  cost: number;
  category: string;
}

/**
 * Anti-pattern detection from Tool 6
 */
export interface AntiPattern {
  pattern: string;
  severity: string;
}

/**
 * Cost breakdown entry from Tool 7
 */
export interface CostBreakdownEntry {
  category: string;
  amount: number;
}

/**
 * Roadmap context derived from Tool 1 and Tool 7
 */
export interface RoadmapContext {
  alignmentScores: AlignmentScores;
  compositeScore: number;
  totalAlignmentTax: number;
  priorityDimensions: string[];
}

/**
 * Governance Charter context from Tool 4
 */
export interface GovernanceCharterContext {
  stakeholders: StakeholderEntry[];
  keyPlayers: string[];
  riskyStakeholders: string[];
}

/**
 * Delegation Framework context from Tool 3
 */
export interface DelegationFrameworkContext {
  decisionTypes: DecisionTypeMetric[];
  bottleneckPatterns: string[];
  slowestDecisions: string[];
}

/**
 * Meeting Protocol context from Tool 2
 */
export interface MeetingProtocolContext {
  meetingCount: number;
  totalHours: number;
  wastedCost: number;
  wasteCategories: string[];
}

/**
 * OKR Framework context from Tool 1
 */
export interface OKRFrameworkContext {
  dimensionScores: Record<string, number>;
  weakestDimensions: string[];
  compositeScore: number;
}

/**
 * Data Platform Playbook context from Tool 5
 */
export interface DataPlatformPlaybookContext {
  frictionCost: number;
  topBottlenecks: FrictionBottleneck[];
  journeyCount: number;
}

/**
 * Communication Architecture context from Tool 6
 */
export interface CommunicationArchitectureContext {
  healthScore: number;
  antiPatterns: AntiPattern[];
  channelMetrics: Record<string, unknown>;
}

/**
 * ROI Dashboard context from Tool 7
 */
export interface ROIDashboardContext {
  totalAlignmentTax: number;
  alignmentTaxPercent: number;
  estimatedSavings: number;
  costBreakdown: CostBreakdownEntry[];
}

/**
 * Complete toolkit generation context
 *
 * This is the unified structure that pre-populates all PB2 tools
 * based on the user's PB1 diagnostic results.
 */
export interface ToolkitGenerationContext {
  userId: string;
  generatedAt: string;

  /** Roadmap inputs from Tool 1 and Tool 7 */
  roadmap: RoadmapContext;

  /** Governance Charter inputs from Tool 4 */
  governanceCharter: GovernanceCharterContext;

  /** Delegation Framework inputs from Tool 3 */
  delegationFramework: DelegationFrameworkContext;

  /** Meeting Protocol inputs from Tool 2 */
  meetingProtocol: MeetingProtocolContext;

  /** OKR Framework inputs from Tool 1 */
  okrFramework: OKRFrameworkContext;

  /** Data Platform Playbook inputs from Tool 5 */
  dataPlatformPlaybook: DataPlatformPlaybookContext;

  /** Communication Architecture inputs from Tool 6 */
  communicationArchitecture: CommunicationArchitectureContext;

  /** ROI Dashboard inputs from Tool 7 */
  roiDashboard: ROIDashboardContext;
}

/**
 * Partial toolkit context for incomplete diagnostics
 */
export type PartialToolkitGenerationContext = Partial<ToolkitGenerationContext> & {
  userId: string;
  generatedAt: string;
};
