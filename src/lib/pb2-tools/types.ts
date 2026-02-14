/**
 * PB2 Tool Recommendation Types
 *
 * TypeScript interfaces for the Playbook 2 recommendation system.
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Covers: FR44 (Tool recommendation algorithm)
 */

/**
 * PB2 Tool Definition
 * Represents a single tool in the Playbook 2 toolkit
 */
export interface PB2Tool {
  id: number;
  name: string;
  shortName: string;
  description: string;
  bookChapter: string;
  feedsFromPB1Tools: number[];
  documentOutput: string;
  recommendationDescription: string;
}

/**
 * Input data for the recommendation engine
 * Maps to diagnostic data collected from PB1 tools
 */
export interface RecommendationInput {
  // From PB1 Tool 3: Decision Velocity
  decisionVelocity?: {
    worstMedianDays: number;
    worstArchetype: string;
    benchmarkDays: number;
  };

  // From PB1 Tool 2: Meeting Audit
  meetingWastePercent?: number;
  meetingWasteCost?: number;

  // From PB1 Tool 5: Data Friction
  dataFrictionCost?: number;
  topBottleneck?: string;

  // From PB1 Tool 4: Stakeholder Mapping
  stakeholders?: {
    name: string;
    role: string;
    power: number;
    interest: number;
    sentiment?: 'supporter' | 'neutral' | 'blocker';
  }[];

  // From PB1 Tool 7: Total Cost
  totalAlignmentTax?: number;
  estimatedSavings?: number;
}

/**
 * Priority level for recommendations
 */
export type RecommendationPriority = 'critical' | 'high' | 'moderate';

/**
 * A single tool recommendation with reasoning
 */
export interface ToolRecommendation {
  rank: number;
  toolId: number;
  tool: PB2Tool;
  reasoning: string;
  triggerMetric: string;
  triggerValue: number | string;
  benchmarkValue?: number | string;
  severityScore: number;
  priority: RecommendationPriority;
}

/**
 * Result of the recommendation engine
 */
export interface RecommendationResult {
  recommendations: ToolRecommendation[];
  generatedAt: Date;
  inputSummary: {
    worstDecisionVelocity?: number;
    meetingWastePercent?: number;
    dataFrictionCost?: number;
    blockerCount: number;
    totalAlignmentTax?: number;
  };
}

/**
 * Threshold configuration for a recommendation rule
 */
export interface ThresholdConfig {
  threshold: number;
  benchmark?: number;
  multiplier?: number;
}
