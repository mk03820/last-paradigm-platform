/**
 * Friction Point Constants and Types
 *
 * Defines friction categories, severity scoring, and helpers
 * for the Data Flow Friction Analysis tool.
 *
 * Story 12.2: Friction Point Identification
 * Covers: FR2-22 (Categorize friction types)
 */

/**
 * Friction categories from Playbook 1 methodology
 */
export type FrictionCategory =
  | 'access_bureaucracy'
  | 'quality_degradation'
  | 'multiple_sources'
  | 'technical_debt';

/**
 * Severity level (1-3)
 */
export type SeverityLevel = 1 | 2 | 3;

/**
 * Severity scoring dimensions
 */
export interface SeverityScore {
  frequency: SeverityLevel;  // How often does this occur?
  effort: SeverityLevel;     // How much manual effort to work around?
  impact: SeverityLevel;     // How much business impact?
}

/**
 * A documented friction point in a data journey
 */
export interface FrictionPoint {
  id: string;
  journeyId: string;
  stageId: string;
  category: FrictionCategory;
  description: string;
  severity: SeverityScore;
  createdAt: string;
  updatedAt: string;
}

/**
 * Friction category metadata
 */
export interface FrictionCategoryInfo {
  id: FrictionCategory;
  label: string;
  description: string;
  examples: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  isOrganizational: boolean;
}

/**
 * Severity level metadata
 */
export interface SeverityLevelInfo {
  level: SeverityLevel;
  label: string;
  description: string;
}

/**
 * Total severity level classification
 */
export type TotalSeverityLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Friction categories with display info
 */
export const FRICTION_CATEGORIES: FrictionCategoryInfo[] = [
  {
    id: 'access_bureaucracy',
    label: 'Access Bureaucracy',
    description: 'Excessive approvals, tickets, or waiting to get data access',
    examples: [
      'IT ticket required for every new data source',
      'Manager approval needed for dashboard access',
      'Security review takes 2+ weeks',
    ],
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-500',
    isOrganizational: true,
  },
  {
    id: 'quality_degradation',
    label: 'Quality Degradation',
    description: 'Data becomes less accurate, complete, or timely as it flows',
    examples: [
      'Manual data entry introduces errors',
      'Stale data due to batch processing delays',
      'Missing fields from upstream systems',
    ],
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-500',
    isOrganizational: true,
  },
  {
    id: 'multiple_sources',
    label: 'Multiple Sources of Truth',
    description: 'Same data exists in multiple places with different values',
    examples: [
      'Customer records in CRM vs billing system differ',
      'Revenue numbers vary between finance and sales',
      'Product catalog inconsistent across channels',
    ],
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-500',
    isOrganizational: true,
  },
  {
    id: 'technical_debt',
    label: 'Technical Debt',
    description: 'Legacy systems, brittle pipelines, or outdated technology',
    examples: [
      'Mainframe extract requires manual scheduling',
      'Pipeline breaks on schema changes',
      'No monitoring or alerting on data freshness',
    ],
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-500',
    isOrganizational: false,
  },
];

/**
 * Get friction category info by ID
 */
export function getFrictionCategoryInfo(
  category: FrictionCategory
): FrictionCategoryInfo {
  return (
    FRICTION_CATEGORIES.find((c) => c.id === category) || FRICTION_CATEGORIES[0]
  );
}

/**
 * Severity dimension labels
 */
export const SEVERITY_DIMENSIONS = {
  frequency: {
    label: 'Frequency',
    question: 'How often does this friction occur?',
  },
  effort: {
    label: 'Manual Effort',
    question: 'How much manual effort to work around it?',
  },
  impact: {
    label: 'Business Impact',
    question: 'How much does it impact the business?',
  },
} as const;

/**
 * Severity level labels (1-3)
 */
export const SEVERITY_LEVELS: Record<SeverityLevel, SeverityLevelInfo> = {
  1: {
    level: 1,
    label: 'Low',
    description: 'Rarely occurs / Minor inconvenience / Limited impact',
  },
  2: {
    level: 2,
    label: 'Medium',
    description: 'Weekly occurrence / Significant workaround / Noticeable impact',
  },
  3: {
    level: 3,
    label: 'High',
    description: 'Daily occurrence / Major manual effort / Critical impact',
  },
};

/**
 * Total severity level thresholds and styling
 */
export const TOTAL_SEVERITY_CONFIG: Record<
  TotalSeverityLevel,
  { min: number; max: number; label: string; color: string; bgColor: string }
> = {
  low: {
    min: 3,
    max: 3,
    label: 'Low',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  medium: {
    min: 4,
    max: 5,
    label: 'Medium',
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  high: {
    min: 6,
    max: 7,
    label: 'High',
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  critical: {
    min: 8,
    max: 9,
    label: 'Critical',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
};

/**
 * Calculate total severity score (3-9)
 */
export function calculateTotalSeverity(severity: SeverityScore): number {
  return severity.frequency + severity.effort + severity.impact;
}

/**
 * Get severity level from total score
 */
export function getSeverityLevel(total: number): TotalSeverityLevel {
  if (total <= 3) return 'low';
  if (total <= 5) return 'medium';
  if (total <= 7) return 'high';
  return 'critical';
}

/**
 * Get severity level config from total score
 */
export function getSeverityConfig(total: number) {
  const level = getSeverityLevel(total);
  return TOTAL_SEVERITY_CONFIG[level];
}

/**
 * Check if friction is critical (severity 7+)
 */
export function isCriticalFriction(severity: SeverityScore): boolean {
  return calculateTotalSeverity(severity) >= 7;
}

/**
 * Generate a unique friction point ID
 */
export function generateFrictionId(): string {
  return `friction_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create default severity score
 */
export function createDefaultSeverity(): SeverityScore {
  return {
    frequency: 2,
    effort: 2,
    impact: 2,
  };
}

/**
 * Validate friction point data
 */
export interface FrictionValidation {
  valid: boolean;
  errors: {
    category?: string;
    description?: string;
    stageId?: string;
  };
}

export function validateFrictionPoint(
  point: Partial<FrictionPoint>
): FrictionValidation {
  const errors: FrictionValidation['errors'] = {};

  if (!point.category) {
    errors.category = 'Category is required';
  }

  if (!point.description?.trim()) {
    errors.description = 'Description is required';
  }

  if (!point.stageId) {
    errors.stageId = 'Stage is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculate average severity for a list of friction points
 */
export function calculateAverageSeverity(points: FrictionPoint[]): number {
  if (points.length === 0) return 0;
  const total = points.reduce(
    (sum, p) => sum + calculateTotalSeverity(p.severity),
    0
  );
  return Math.round((total / points.length) * 10) / 10;
}

/**
 * Count friction points by category
 */
export function countByCategory(
  points: FrictionPoint[]
): Record<FrictionCategory, number> {
  const counts: Record<FrictionCategory, number> = {
    access_bureaucracy: 0,
    quality_degradation: 0,
    multiple_sources: 0,
    technical_debt: 0,
  };

  for (const point of points) {
    counts[point.category]++;
  }

  return counts;
}

/**
 * Check if friction is organizational (vs technical)
 */
export function isOrganizationalFriction(category: FrictionCategory): boolean {
  const info = getFrictionCategoryInfo(category);
  return info.isOrganizational;
}

/**
 * Get organizational vs technical friction split
 */
export function getFrictionSplit(
  points: FrictionPoint[]
): { organizational: number; technical: number } {
  let organizational = 0;
  let technical = 0;

  for (const point of points) {
    if (isOrganizationalFriction(point.category)) {
      organizational++;
    } else {
      technical++;
    }
  }

  return { organizational, technical };
}
