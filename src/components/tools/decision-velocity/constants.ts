/**
 * Decision Velocity Scorecard Constants
 *
 * Defines the 5 decision archetypes and budget thresholds.
 * Based on Playbook 1 methodology.
 *
 * Story 10.1: Decision Sample Input Interface
 * Covers: FR2-11 (Decision sample input)
 */

export type ArchetypeId =
  | 'strategic'
  | 'budget'
  | 'technology'
  | 'hiring'
  | 'analytics';

export type BudgetThresholdId = 'tier1' | 'tier2' | 'tier3' | 'tier4';

export interface DecisionArchetype {
  id: ArchetypeId;
  label: string;
  description: string;
  examples: string;
  minSamples: number;
  maxSamples: number;
  hasThresholds?: boolean;
}

export interface BudgetThreshold {
  id: BudgetThresholdId;
  label: string;
  shortLabel: string;
  min: number;
  max: number;
}

export interface DecisionSample {
  id: string;
  description: string;
  requestDate: string; // ISO date string
  decisionDate: string; // ISO date string
  implementationDate?: string; // ISO date string, optional
}

export interface ArchetypeData {
  archetypeId: ArchetypeId;
  skipped: boolean;
  budgetThreshold?: BudgetThresholdId;
  samples: DecisionSample[];
}

/**
 * The 5 decision archetypes from Playbook 1
 */
export const DECISION_ARCHETYPES: DecisionArchetype[] = [
  {
    id: 'strategic',
    label: 'Strategic Initiatives',
    description: 'Major directional decisions affecting company direction',
    examples: 'Market entry, product launch, M&A, restructuring, partnerships',
    minSamples: 3,
    maxSamples: 10,
  },
  {
    id: 'budget',
    label: 'Budget Approvals',
    description: 'Financial spending and investment decisions',
    examples: 'Capex requests, project funding, vendor contracts, tool purchases',
    minSamples: 3,
    maxSamples: 10,
    hasThresholds: true,
  },
  {
    id: 'technology',
    label: 'Technology Decisions',
    description: 'Technical architecture and tooling choices',
    examples: 'Platform selection, build vs buy, security policies, infrastructure',
    minSamples: 3,
    maxSamples: 10,
  },
  {
    id: 'hiring',
    label: 'Hiring Decisions',
    description: 'Headcount and talent acquisition choices',
    examples: 'New roles, backfills, contractor conversions, team restructuring',
    minSamples: 3,
    maxSamples: 10,
  },
  {
    id: 'analytics',
    label: 'Analytics & Reporting',
    description: 'Data and insight request decisions',
    examples: 'New dashboards, ad-hoc analysis, data access, reporting changes',
    minSamples: 3,
    maxSamples: 10,
  },
];

/**
 * Budget thresholds for segmenting budget decisions
 * Each tier has different velocity benchmarks
 */
export const BUDGET_THRESHOLDS: BudgetThreshold[] = [
  { id: 'tier1', label: 'Under $50K', shortLabel: '<$50K', min: 0, max: 50000 },
  { id: 'tier2', label: '$50K - $500K', shortLabel: '$50K-$500K', min: 50000, max: 500000 },
  { id: 'tier3', label: '$500K - $5M', shortLabel: '$500K-$5M', min: 500000, max: 5000000 },
  { id: 'tier4', label: 'Over $5M', shortLabel: '>$5M', min: 5000000, max: Infinity },
];

/**
 * Get archetype by ID
 */
export function getArchetype(id: ArchetypeId): DecisionArchetype | undefined {
  return DECISION_ARCHETYPES.find((a) => a.id === id);
}

/**
 * Get budget threshold by ID
 */
export function getBudgetThreshold(id: BudgetThresholdId): BudgetThreshold | undefined {
  return BUDGET_THRESHOLDS.find((t) => t.id === id);
}

/**
 * Check if archetype has minimum samples for analysis
 */
export function hasMinimumSamples(data: ArchetypeData): boolean {
  if (data.skipped) return true;
  const archetype = getArchetype(data.archetypeId);
  if (!archetype) return false;
  return data.samples.length >= archetype.minSamples;
}

/**
 * Count archetypes with sufficient data
 */
export function countValidArchetypes(archetypes: ArchetypeData[]): number {
  return archetypes.filter((a) => !a.skipped && hasMinimumSamples(a)).length;
}

/**
 * Check if user can proceed to results (at least 1 valid archetype)
 */
export function canCalculateVelocity(archetypes: ArchetypeData[]): boolean {
  return countValidArchetypes(archetypes) >= 1;
}

/**
 * Generate unique ID for a decision sample
 */
export function generateSampleId(): string {
  return `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate decision sample dates
 * Returns error message or null if valid
 */
export function validateSampleDates(sample: Partial<DecisionSample>): string | null {
  if (!sample.requestDate) {
    return 'Request date is required';
  }
  if (!sample.decisionDate) {
    return 'Decision date is required';
  }

  const request = new Date(sample.requestDate);
  const decision = new Date(sample.decisionDate);

  if (decision < request) {
    return 'Decision date must be on or after request date';
  }

  if (sample.implementationDate) {
    const implementation = new Date(sample.implementationDate);
    if (implementation < decision) {
      return 'Implementation date must be on or after decision date';
    }
  }

  // Check if dates are within reasonable range (last 2 years)
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  if (request < twoYearsAgo) {
    return 'Request date should be within the last 2 years';
  }

  return null;
}
