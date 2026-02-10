/**
 * Guidance Content for Diagnostic Tools
 *
 * Story 8.7: Guided Diagnostic Flow
 * Task 2: Create guidance content data (AC: 6)
 *
 * Provides contextual information for each tool explaining:
 * - What it measures
 * - Why it matters
 * - What data users will need
 */

export interface GuidanceContent {
  whatItMeasures: string;
  whyItMatters: string;
  dataNeeded: string[];
}

export const TOOL_GUIDANCE: Record<string, GuidanceContent> = {
  alignment: {
    whatItMeasures:
      'How aligned your organization is across Strategy, Execution, Technology, People, and Governance dimensions.',
    whyItMatters:
      'Misalignment is the #1 predictor of transformation failure. Knowing where gaps exist helps prioritize interventions.',
    dataNeeded: [
      'Knowledge of strategic priorities',
      'Understanding of execution challenges',
      'Awareness of technology, people, and governance dynamics',
    ],
  },
  'meeting-audit': {
    whatItMeasures:
      'The annual cost of unproductive meeting time across your organization.',
    whyItMatters:
      'Meetings are the most visible symptom of organizational friction. Quantifying waste builds the case for change.',
    dataNeeded: [
      'Number of recurring meetings per week',
      'Average attendees per meeting',
      'Meeting duration',
      'Rough salary distribution across attendees',
    ],
  },
  'decision-velocity': {
    whatItMeasures:
      'How long decisions take from identification to implementation across different decision types.',
    whyItMatters:
      'Slow decisions compound into missed opportunities and frustrated teams. Velocity gaps reveal where authority is unclear.',
    dataNeeded: [
      'Recent examples of strategic, tactical, and operational decisions',
      'Timeline from when decision was needed to when it was made',
      'Timeline from decision to implementation',
    ],
  },
  'stakeholder-map': {
    whatItMeasures:
      'Who has power and interest in your transformation, and how they are likely to respond.',
    whyItMatters:
      'Transformations fail when key stakeholders are surprised or feel excluded. Mapping influence helps you sequence engagement.',
    dataNeeded: [
      'List of stakeholders affected by the transformation',
      'Understanding of each stakeholder\'s influence level',
      'Knowledge of each stakeholder\'s likely support or resistance',
    ],
  },
  'data-flow': {
    whatItMeasures:
      'Where data gets stuck, degraded, or lost as it moves through your organization.',
    whyItMatters:
      'Data friction causes rework, delays decisions, and erodes trust. Identifying bottlenecks reveals systemic issues.',
    dataNeeded: [
      'Key data flows in your organization',
      'Systems and handoffs data passes through',
      'Known pain points where data quality suffers',
    ],
  },
  communication: {
    whatItMeasures:
      'How information flows (or fails to flow) between teams, levels, and functions.',
    whyItMatters:
      'Poor communication multiplies the cost of every other problem. Patterns reveal whether issues are structural or behavioral.',
    dataNeeded: [
      'Primary communication channels used',
      'Frequency of cross-team communication',
      'Known information gaps or silos',
    ],
  },
  'total-cost': {
    whatItMeasures:
      'The total annual cost of organizational misalignment by aggregating results from all diagnostic tools.',
    whyItMatters:
      'Individual symptoms hide the true scale of the problem. The total cost makes the business case for transformation undeniable.',
    dataNeeded: [
      'Completed results from Tools 1-6',
      'This tool aggregates your previous inputs',
    ],
  },
};

/**
 * Get guidance content for a tool by ID
 */
export function getToolGuidance(toolId: string): GuidanceContent | undefined {
  return TOOL_GUIDANCE[toolId];
}
