/**
 * PB2 Tool Catalog
 *
 * Complete catalog of the 10 Playbook 2 tools with metadata.
 * Each tool is linked to its source PB1 diagnostic tool(s).
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Task 1: Define PB2 Tool Catalog with metadata
 * Covers: FR44, FR55 (PB1 to PB2 data flow)
 */

import type { PB2Tool } from './types';

/**
 * Complete PB2 Tool Catalog
 * 10 tools that build on PB1 diagnostic findings
 */
export const PB2_TOOL_CATALOG: PB2Tool[] = [
  {
    id: 1,
    name: '30/60/90 Day Transformation Roadmap',
    shortName: 'Transformation Roadmap',
    description:
      'A phased action plan that prioritizes quick wins in the first 30 days while building toward sustainable transformation over 90 days.',
    bookChapter: 'Chapter 8: Building the Roadmap',
    feedsFromPB1Tools: [1, 7],
    documentOutput: 'Transformation_Roadmap.docx',
    recommendationDescription:
      'Creates a structured timeline to address your alignment gaps, starting with highest-impact interventions.',
  },
  {
    id: 2,
    name: 'Executive Steering Committee Charter',
    shortName: 'Governance Charter',
    description:
      'Establishes clear governance structures and escalation paths to manage stakeholder engagement and resolve blockers.',
    bookChapter: 'Chapter 9: Governance & Sponsorship',
    feedsFromPB1Tools: [4],
    documentOutput: 'Steering_Committee_Charter.docx',
    recommendationDescription:
      'Provides governance framework to convert blockers to supporters and maintain executive alignment.',
  },
  {
    id: 3,
    name: 'Decision Rights & Delegation Framework',
    shortName: 'Delegation Framework',
    description:
      'Clarifies who can make which decisions and pushes authority to where learning happens fastest.',
    bookChapter: 'Chapter 10: Decision Velocity',
    feedsFromPB1Tools: [3],
    documentOutput: 'Decision_Rights_Matrix.xlsx',
    recommendationDescription:
      'Eliminates decision bottlenecks by establishing clear ownership and delegation levels.',
  },
  {
    id: 4,
    name: 'Meeting Protocol',
    shortName: 'Meeting Protocol',
    description:
      'Establishes rules for when meetings are required, attendee limits, and documentation standards.',
    bookChapter: 'Chapter 11: Meeting Effectiveness',
    feedsFromPB1Tools: [2],
    documentOutput: 'Meeting_Protocol.docx',
    recommendationDescription:
      'Reduces meeting waste by establishing clear protocols for necessity, attendance, and outcomes.',
  },
  {
    id: 5,
    name: 'OKR Framework',
    shortName: 'OKR Framework',
    description:
      'Cascades organizational objectives to team-level key results with clear alignment indicators.',
    bookChapter: 'Chapter 12: Strategic Alignment',
    feedsFromPB1Tools: [1],
    documentOutput: 'OKR_Framework.xlsx',
    recommendationDescription:
      'Improves strategic alignment by connecting team work to organizational outcomes.',
  },
  {
    id: 6,
    name: 'Data Platform Playbook',
    shortName: 'Data Platform Playbook',
    description:
      'Addresses systematic data friction through platform architecture and governance improvements.',
    bookChapter: 'Chapter 13: Information Flow',
    feedsFromPB1Tools: [5],
    documentOutput: 'Data_Platform_Playbook.docx',
    recommendationDescription:
      'Systematically eliminates data silos and reduces the cost of information friction.',
  },
  {
    id: 7,
    name: 'Communication Architecture',
    shortName: 'Communication Architecture',
    description:
      'Maps optimal communication channels to message types and establishes cadence standards.',
    bookChapter: 'Chapter 14: Communication Patterns',
    feedsFromPB1Tools: [6],
    documentOutput: 'Communication_Architecture.docx',
    recommendationDescription:
      'Improves communication health by matching channels to purposes and establishing clear cadences.',
  },
  {
    id: 8,
    name: 'ROI Dashboard',
    shortName: 'ROI Dashboard',
    description:
      'Tracks transformation progress against cost baseline with leading indicators.',
    bookChapter: 'Chapter 15: Measuring Progress',
    feedsFromPB1Tools: [7],
    documentOutput: 'ROI_Dashboard.xlsx',
    recommendationDescription:
      'Monitors your transformation investment against measurable improvement metrics.',
  },
  {
    id: 9,
    name: 'Change Readiness Assessment',
    shortName: 'Change Readiness',
    description:
      'Evaluates organizational readiness for transformation and identifies capability gaps.',
    bookChapter: 'Chapter 16: Change Management',
    feedsFromPB1Tools: [1, 4],
    documentOutput: 'Change_Readiness_Assessment.docx',
    recommendationDescription:
      'Assesses your organization\'s capacity to absorb change and builds readiness plans.',
  },
  {
    id: 10,
    name: 'Executive Briefing Template',
    shortName: 'Executive Briefing',
    description:
      'Provides structured templates for communicating transformation progress to leadership.',
    bookChapter: 'Chapter 17: Executive Communication',
    feedsFromPB1Tools: [1, 7],
    documentOutput: 'Executive_Briefing_Template.pptx',
    recommendationDescription:
      'Enables clear, consistent communication of transformation status to executive sponsors.',
  },
];

/**
 * Get a PB2 tool by its ID
 */
export function getPB2Tool(id: number): PB2Tool | undefined {
  return PB2_TOOL_CATALOG.find((tool) => tool.id === id);
}

/**
 * Get all PB2 tools
 */
export function getAllPB2Tools(): PB2Tool[] {
  return [...PB2_TOOL_CATALOG];
}

/**
 * Get PB2 tools that are fed by a specific PB1 tool
 */
export function getPB2ToolsByPB1Source(pb1ToolId: number): PB2Tool[] {
  return PB2_TOOL_CATALOG.filter((tool) =>
    tool.feedsFromPB1Tools.includes(pb1ToolId)
  );
}

/**
 * Get the count of PB2 tools in the catalog
 */
export function getPB2ToolCount(): number {
  return PB2_TOOL_CATALOG.length;
}
