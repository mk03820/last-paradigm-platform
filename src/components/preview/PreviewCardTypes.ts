/**
 * PreviewCard Type Definitions
 *
 * TypeScript interfaces for the preview card system with blur zones.
 *
 * Story 16.3: Preview Cards with Blur Effect
 * Task 4: Define visible vs hidden content zones
 * Covers: AC2, AC3, AC4
 */

import type { PB2Tool, RecommendationPriority } from '@/lib/pb2-tools/types';

/**
 * Diagnostic data to display in the visible zone of a preview card.
 * This data is visible and comes from the user's PB1 diagnostic results.
 *
 * Task 4.2: Visible zone includes tool name, description, user's diagnostic score/metric
 */
export interface DiagnosticData {
  /** Label for the primary metric (e.g., "Decision Velocity") */
  metricLabel: string;
  /** Value of the primary metric (e.g., "21 days" or 8000000) */
  metricValue: string | number;
  /** Summary of identified issues from diagnostics */
  issuesSummary?: string;
  /** The PB1 tool ID that generated this data */
  sourceToolId: number;
  /** Optional benchmark value for comparison */
  benchmarkValue?: string | number;
}

/**
 * Content that is blurred/locked in the preview card.
 * This content represents the actual methodology and templates
 * that require purchase to access.
 *
 * Task 4.3: Hidden zone includes framework details, matrix templates, methodology steps
 */
export interface LockedContent {
  /** Placeholder preview text to show blurred (sanitized teaser content) */
  previewText: string;
  /** Additional methodology details shown blurred */
  methodologySteps?: string[];
  /** Template/document preview content */
  templatePreview?: string;
}

/**
 * Props for the main PreviewCard component.
 *
 * Task 4.1: Define TypeScript interface for PreviewCardData
 */
export interface PreviewCardProps {
  /** The PB2 tool being previewed */
  tool: PB2Tool;
  /** User's diagnostic data to display (visible zone) */
  diagnosticData: DiagnosticData;
  /** Locked content to display blurred */
  lockedContent: LockedContent;
  /** Priority level affecting card styling */
  priority?: RecommendationPriority;
  /** Rank for display ordering (1, 2, 3) */
  rank?: number;
  /** Additional CSS classes */
  className?: string;
  /** Callback when card is clicked (for Story 16.4 integration) */
  onClick?: () => void;
}

/**
 * Props for the PreviewCardHeader sub-component.
 */
export interface PreviewCardHeaderProps {
  /** Tool name to display */
  toolName: string;
  /** Tool short name for compact display */
  toolShortName: string;
  /** Tool ID number */
  toolId: number;
  /** Priority badge to show */
  priority?: RecommendationPriority;
  /** Rank indicator (1, 2, 3) */
  rank?: number;
}

/**
 * Props for the VisibleDataZone sub-component.
 *
 * Task 1.3: Create VisibleDataZone sub-component
 */
export interface VisibleDataZoneProps {
  /** Tool description */
  description: string;
  /** User's diagnostic data */
  diagnosticData: DiagnosticData;
  /** Book chapter reference */
  bookChapter: string;
}

/**
 * Props for the BlurredContentZone sub-component.
 *
 * Task 1.4: Create BlurredContentZone sub-component
 */
export interface BlurredContentZoneProps {
  /** Locked content to display blurred */
  lockedContent: LockedContent;
  /** Document output name */
  documentOutput: string;
}

/**
 * Props for the UnlockOverlay sub-component.
 *
 * Task 3: Create blur overlay with unlock CTA
 */
export interface UnlockOverlayProps {
  /** CTA text to display (default: "Unlock with Playbook 2") */
  ctaText?: string;
  /** Whether to show the lock icon */
  showIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the PreviewCardGrid component.
 */
export interface PreviewCardGridProps {
  /** Array of preview cards to render */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Sample locked content generator for tools.
 * Used when actual content isn't available yet.
 *
 * Task 4.4: Create sample/placeholder content for hidden zone
 */
export const DEFAULT_LOCKED_CONTENT: Record<number, LockedContent> = {
  1: {
    previewText:
      'The 30/60/90 Day Transformation Roadmap includes prioritized action sequences, milestone definitions, and success metrics for each phase...',
    methodologySteps: [
      'Phase 1: Quick Wins (Days 1-30)',
      'Phase 2: Foundation Building (Days 31-60)',
      'Phase 3: Sustainable Change (Days 61-90)',
    ],
    templatePreview: 'Transformation_Roadmap.docx template with pre-built sections...',
  },
  2: {
    previewText:
      'The Executive Steering Committee Charter defines governance structures, meeting cadences, decision authorities, and escalation paths...',
    methodologySteps: [
      'Committee Composition Matrix',
      'Decision Rights Framework',
      'Escalation Protocol',
    ],
    templatePreview: 'Steering_Committee_Charter.docx with role definitions...',
  },
  3: {
    previewText:
      'The Decision Rights Matrix maps decision types to authority levels with clear delegation criteria and accountability structures...',
    methodologySteps: [
      'Decision Type Categorization',
      'Authority Level Assignment',
      'Delegation Criteria Definition',
    ],
    templatePreview: 'Decision_Rights_Matrix.xlsx with pre-built formulas...',
  },
  4: {
    previewText:
      'The Meeting Protocol establishes necessity criteria, attendee limits, agenda requirements, and documentation standards...',
    methodologySteps: [
      'Meeting Necessity Checklist',
      'Attendee Role Matrix',
      'Agenda Template Standards',
    ],
    templatePreview: 'Meeting_Protocol.docx with ready-to-use templates...',
  },
  5: {
    previewText:
      'The OKR Framework cascades organizational objectives to team-level key results with alignment scoring and tracking mechanisms...',
    methodologySteps: [
      'Objective Definition Workshop',
      'Key Result Formulation',
      'Alignment Scoring System',
    ],
    templatePreview: 'OKR_Framework.xlsx with cascading formulas...',
  },
  6: {
    previewText:
      'The Data Platform Playbook addresses data friction through architecture patterns, governance frameworks, and implementation guides...',
    methodologySteps: [
      'Data Architecture Assessment',
      'Integration Pattern Selection',
      'Governance Framework Setup',
    ],
    templatePreview: 'Data_Platform_Playbook.docx with technical specifications...',
  },
  7: {
    previewText:
      'The Communication Architecture maps channels to message types with cadence standards and effectiveness metrics...',
    methodologySteps: [
      'Channel-Purpose Matrix',
      'Cadence Calendar Template',
      'Effectiveness Tracking Dashboard',
    ],
    templatePreview: 'Communication_Architecture.docx with channel maps...',
  },
  8: {
    previewText:
      'The ROI Dashboard tracks transformation progress with leading indicators, cost baselines, and improvement metrics...',
    methodologySteps: [
      'Baseline Cost Capture',
      'Leading Indicator Selection',
      'Progress Visualization Setup',
    ],
    templatePreview: 'ROI_Dashboard.xlsx with pre-built charts...',
  },
  9: {
    previewText:
      'The Change Readiness Assessment evaluates organizational capacity for transformation with gap analysis and readiness plans...',
    methodologySteps: [
      'Readiness Survey Instrument',
      'Gap Analysis Framework',
      'Readiness Building Plan',
    ],
    templatePreview: 'Change_Readiness_Assessment.docx with survey tools...',
  },
  10: {
    previewText:
      'The Executive Briefing Template provides structured formats for communicating transformation progress to leadership...',
    methodologySteps: [
      'Status Update Template',
      'Risk Communication Framework',
      'Success Story Format',
    ],
    templatePreview: 'Executive_Briefing_Template.pptx with slide templates...',
  },
};

/**
 * Get default locked content for a tool.
 * Falls back to generic content if tool-specific content isn't defined.
 */
export function getDefaultLockedContent(toolId: number): LockedContent {
  return (
    DEFAULT_LOCKED_CONTENT[toolId] ?? {
      previewText:
        'This tool includes comprehensive frameworks, templates, and step-by-step implementation guides based on The Last Paradigm methodology...',
      methodologySteps: [
        'Assessment Framework',
        'Implementation Guide',
        'Success Metrics',
      ],
      templatePreview: 'Document template with pre-built sections...',
    }
  );
}
