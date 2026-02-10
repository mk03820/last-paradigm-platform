/**
 * Diagnostic Tool Hub Constants
 *
 * Metadata and helpers for the 7-tool diagnostic journey.
 *
 * Story 8.5: Diagnostic Tool Hub
 * Covers: AC1 (tool metadata), AC2 (status), AC3 (result summaries)
 */

import type { LucideIcon } from 'lucide-react';
import {
  Target,
  Calculator,
  Clock,
  Users,
  Database,
  MessageSquare,
  DollarSign,
} from 'lucide-react';

export type ToolStatus = 'not_started' | 'in_progress' | 'completed';

export interface DiagnosticTool {
  id: string;
  number: number;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  route: string;
  storeKey: string;
  anonymousAccess: boolean;
  estimatedMinutes: number;
}

/**
 * All 7 diagnostic tools in recommended order
 */
export const DIAGNOSTIC_TOOLS: DiagnosticTool[] = [
  {
    id: 'alignment',
    number: 1,
    name: 'Organizational Alignment Assessment',
    shortName: 'Alignment',
    description: 'Score your organization across 5 alignment dimensions',
    icon: Target,
    route: '/tool/alignment',
    storeKey: 'tool1',
    anonymousAccess: false,
    estimatedMinutes: 10,
  },
  {
    id: 'meeting-audit',
    number: 2,
    name: 'Meeting Audit Calculator',
    shortName: 'Meetings',
    description: 'Quantify the cost of unproductive meetings',
    icon: Calculator,
    route: '/calculator',
    storeKey: 'calculator',
    anonymousAccess: true,
    estimatedMinutes: 5,
  },
  {
    id: 'decision-velocity',
    number: 3,
    name: 'Decision Velocity Scorecard',
    shortName: 'Decisions',
    description: 'Measure how long decisions take across your organization',
    icon: Clock,
    route: '/tool/decision-velocity',
    storeKey: 'tool3',
    anonymousAccess: false,
    estimatedMinutes: 15,
  },
  {
    id: 'stakeholder-map',
    number: 4,
    name: 'Stakeholder Power/Interest Mapping',
    shortName: 'Stakeholders',
    description: 'Map who influences your transformation',
    icon: Users,
    route: '/tool/stakeholder-map',
    storeKey: 'tool4',
    anonymousAccess: false,
    estimatedMinutes: 10,
  },
  {
    id: 'data-flow',
    number: 5,
    name: 'Data Flow Friction Analysis',
    shortName: 'Data Flow',
    description: 'Identify where data gets stuck or degraded',
    icon: Database,
    route: '/tool/data-flow',
    storeKey: 'tool5',
    anonymousAccess: false,
    estimatedMinutes: 20,
  },
  {
    id: 'communication',
    number: 6,
    name: 'Communication Pattern Diagnostic',
    shortName: 'Communication',
    description: 'Analyze how information flows through your organization',
    icon: MessageSquare,
    route: '/tool/communication',
    storeKey: 'tool6',
    anonymousAccess: false,
    estimatedMinutes: 15,
  },
  {
    id: 'total-cost',
    number: 7,
    name: 'Total Cost of Misalignment',
    shortName: 'Total Cost',
    description: 'Aggregate your alignment tax from all tools',
    icon: DollarSign,
    route: '/tool/total-cost',
    storeKey: 'tool7',
    anonymousAccess: false,
    estimatedMinutes: 10,
  },
];

/**
 * Get a tool by its ID
 */
export function getToolById(id: string): DiagnosticTool | undefined {
  return DIAGNOSTIC_TOOLS.find((t) => t.id === id);
}

/**
 * Get a tool by its number (1-7)
 */
export function getToolByNumber(num: number): DiagnosticTool | undefined {
  return DIAGNOSTIC_TOOLS.find((t) => t.number === num);
}

/**
 * Get total number of tools
 */
export const TOTAL_TOOLS = DIAGNOSTIC_TOOLS.length;

/**
 * Status badge configuration
 */
export const STATUS_CONFIG: Record<
  ToolStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline'; className: string }
> = {
  not_started: {
    label: 'Not Started',
    variant: 'outline',
    className: 'text-muted-foreground border-muted-foreground/30',
  },
  in_progress: {
    label: 'In Progress',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200',
  },
  completed: {
    label: 'Completed',
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200',
  },
};

/**
 * Format currency for result summaries
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercentage(completedCount: number): number {
  return Math.round((completedCount / TOTAL_TOOLS) * 100);
}
