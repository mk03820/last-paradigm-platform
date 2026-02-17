/**
 * Decision Framework Guide Generator
 *
 * Generates a Word document with decision archetype analysis,
 * bottleneck identification, and recommended protocols based on Tool 3 data.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 4: Create Decision Framework Guide generator
 * Covers: AC4, AC7, FR65 (Book attribution)
 */

import { Document, Packer, Paragraph, TextRun } from 'docx';
import type { DiagnosticSessionData } from '@/lib/db/schema';
import {
  createBrandedHeader,
  createBrandedFooter,
  createCoverPage,
  createSectionTitle,
  createSubsectionTitle,
  createBodyParagraph,
  createHighlightMetric,
  createDataTable,
  createBulletList,
  createKeyValue,
  createPageBreak,
  formatScore,
} from './components';
import { PAGE_MARGINS, DOCUMENT_STYLES, BRAND_COLORS, getScoreInterpretation } from './styles';
import type { GenerationResult } from './types';

/**
 * Generate the Decision Framework Guide document
 */
export async function generateDecisionFrameworkGuide(
  diagnosticData: DiagnosticSessionData
): Promise<GenerationResult> {
  const tool3 = diagnosticData.tool3;

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: DOCUMENT_STYLES.body.font,
            size: DOCUMENT_STYLES.body.size,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: PAGE_MARGINS },
        },
        headers: {
          default: createBrandedHeader('Decision Framework Guide'),
        },
        footers: {
          default: createBrandedFooter(),
        },
        children: [
          // Cover Page
          ...createCoverPage(
            'Decision Framework Guide',
            'Accelerating Organizational Decision Velocity'
          ),

          // Executive Summary
          ...createExecutiveSummary(tool3),

          // Decision Archetype Analysis
          ...createArchetypeAnalysis(tool3),

          // Bottleneck Identification
          ...createBottleneckSection(tool3),

          // Decision Protocols
          createPageBreak(),
          ...createDecisionProtocols(),

          // Decision Rights Matrix
          createPageBreak(),
          ...createDecisionRightsMatrix(),

          // Escalation Guidance
          ...createEscalationGuidance(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return {
    buffer: Buffer.from(buffer),
    fileSizeBytes: buffer.byteLength,
  };
}

function createExecutiveSummary(tool3: DiagnosticSessionData['tool3']): Paragraph[] {
  const velocityScore = tool3?.overallVelocityScore || 0;

  return [
    createSectionTitle('Executive Summary'),
    createBodyParagraph(
      'This Decision Framework Guide provides a structured approach to improving organizational decision velocity. Based on your diagnostic results, we\'ve identified key patterns and bottlenecks affecting decision speed, along with recommended protocols for each decision type.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    ...createHighlightMetric(
      'Overall Decision Velocity Score',
      formatScore(velocityScore),
      `Status: ${getScoreInterpretation(velocityScore)}`
    ),
    createBodyParagraph(
      velocityScore < 50
        ? 'Your decision velocity score indicates significant room for improvement. Focus on the bottleneck patterns and protocols in this guide to accelerate decision-making.'
        : velocityScore < 75
        ? 'Your decision velocity is moderate. Targeted improvements in specific areas can yield meaningful acceleration.'
        : 'Your decision velocity is strong. Continue to refine and maintain your decision-making processes.'
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createArchetypeAnalysis(tool3: DiagnosticSessionData['tool3']): Paragraph[] {
  const archetypes = tool3?.archetypes || {};

  const archetypeRows = [
    createArchetypeRow('Strategic', archetypes.strategic, 'Long-term direction, major investments, market entry'),
    createArchetypeRow('Tactical', archetypes.tactical, 'Project priorities, resource allocation, process changes'),
    createArchetypeRow('Operational', archetypes.operational, 'Day-to-day execution, routine approvals'),
    createArchetypeRow('Budgetary', archetypes.budgetary, 'Spending decisions, budget allocation'),
    createArchetypeRow('Hiring', archetypes.hiring, 'Recruitment, promotions, team composition'),
  ].filter(row => row !== null) as string[][];

  return [
    createPageBreak(),
    createSectionTitle('Decision Archetype Analysis'),
    createBodyParagraph(
      'Decisions fall into distinct archetypes, each with different complexity levels, stakeholders, and appropriate timeframes. Understanding your organization\'s performance across these archetypes reveals where decision processes need attention.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Decision Latency by Type'),
    createDataTable(
      ['Archetype', 'Median Days', '90th Percentile', 'Samples', 'Benchmark'],
      archetypeRows
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Archetype Definitions'),
    ...createBulletList([
      'Strategic: Major decisions affecting long-term direction (benchmark: 14-30 days)',
      'Tactical: Medium-term decisions on execution approach (benchmark: 3-7 days)',
      'Operational: Day-to-day execution decisions (benchmark: 0-1 days)',
      'Budgetary: Financial allocation and spending decisions (benchmark: 5-14 days)',
      'Hiring: People decisions including recruitment and promotions (benchmark: 14-21 days)',
    ]),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createArchetypeRow(
  name: string,
  data: { median?: number; p90?: number; samples?: number } | undefined,
  description: string
): string[] | null {
  if (!data) return null;
  const benchmarks: Record<string, string> = {
    Strategic: '14-30 days',
    Tactical: '3-7 days',
    Operational: '0-1 days',
    Budgetary: '5-14 days',
    Hiring: '14-21 days',
  };
  return [
    name,
    `${data.median || 0} days`,
    `${data.p90 || 0} days`,
    `${data.samples || 0}`,
    benchmarks[name] || 'N/A',
  ];
}

function createBottleneckSection(tool3: DiagnosticSessionData['tool3']): Paragraph[] {
  const bottlenecks = tool3?.bottlenecks || [];

  if (bottlenecks.length === 0) {
    return [
      createPageBreak(),
      createSectionTitle('Bottleneck Analysis'),
      createBodyParagraph('No significant bottleneck patterns were identified in your decision processes.'),
    ];
  }

  return [
    createPageBreak(),
    createSectionTitle('Bottleneck Analysis'),
    createBodyParagraph(
      'The following bottleneck patterns were identified in your decision-making processes. Addressing these patterns is critical to improving decision velocity.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createDataTable(
      ['Pattern', 'Severity', 'Description'],
      bottlenecks.map(b => [b.pattern, b.severity.toUpperCase(), b.description])
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Common Bottleneck Patterns'),
    ...createBulletList([
      'Analysis Paralysis: Over-gathering information before deciding. Solution: Set information limits and decision deadlines.',
      'Approval Cascade: Too many levels of approval required. Solution: Flatten approval chains, implement delegation.',
      'Unclear Ownership: No one clearly responsible for the decision. Solution: Use RACI/RAPID to assign decision rights.',
      'Meeting Dependency: Decisions wait for scheduled meetings. Solution: Enable asynchronous decision-making.',
    ]),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createDecisionProtocols(): Paragraph[] {
  return [
    createSectionTitle('Recommended Decision Protocols'),
    createBodyParagraph(
      'Based on your diagnostic results, implement these protocols for each decision archetype to improve velocity while maintaining quality.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),

    createSubsectionTitle('Strategic Decisions'),
    ...createBulletList([
      'Time limit: 30 days maximum from problem identification to decision',
      'Required inputs: Business case, risk assessment, 3 alternatives minimum',
      'Decision makers: Executive team with board approval for major investments',
      'Format: Structured decision document with recommendation',
      'Fallback: If no decision in 30 days, escalate to CEO for forced decision',
    ]),
    new Paragraph({ text: '', spacing: { after: 100 } }),

    createSubsectionTitle('Tactical Decisions'),
    ...createBulletList([
      'Time limit: 7 days maximum',
      'Required inputs: Impact assessment, resource requirements',
      'Decision makers: Department heads or project leads',
      'Format: Brief written summary or meeting decision',
      'Fallback: Manager can decide unilaterally after 7 days',
    ]),
    new Paragraph({ text: '', spacing: { after: 100 } }),

    createSubsectionTitle('Operational Decisions'),
    ...createBulletList([
      'Time limit: Same day or next business day',
      'Required inputs: Minimal - basic context only',
      'Decision makers: Front-line managers or individual contributors',
      'Format: Verbal or quick message confirmation',
      'Fallback: Default to "yes" if no blocker identified',
    ]),
    new Paragraph({ text: '', spacing: { after: 100 } }),

    createSubsectionTitle('Budgetary Decisions'),
    ...createBulletList([
      'Time limit: 14 days for standard requests, 7 days for urgent',
      'Required inputs: Budget justification, ROI projection if >$10K',
      'Decision makers: Budget owner with finance review',
      'Format: Budget request form with approval chain',
      'Fallback: Finance can approve up to threshold without review',
    ]),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createDecisionRightsMatrix(): Paragraph[] {
  return [
    createSectionTitle('Decision Rights Matrix (RAPID)'),
    createBodyParagraph(
      'Use this template to clarify decision rights for your key decisions. RAPID stands for Recommend, Agree, Perform, Input, and Decide.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createDataTable(
      ['Role', 'Definition', 'When to Assign'],
      [
        ['R - Recommend', 'Proposes the decision and makes a recommendation', 'Person closest to the issue'],
        ['A - Agree', 'Must sign off before decision is final (veto power)', 'Use sparingly - only for compliance/legal'],
        ['P - Perform', 'Executes the decision once made', 'Implementation team'],
        ['I - Input', 'Provides information to inform the decision', 'Subject matter experts'],
        ['D - Decide', 'Has final authority to make the decision', 'Single accountable person'],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Template: Decision Rights Assignment'),
    createDataTable(
      ['Decision Type', 'R', 'A', 'I', 'D', 'P'],
      [
        ['New product launch', '[Name]', '[Name]', '[Names]', '[Name]', '[Names]'],
        ['Vendor selection >$50K', '[Name]', '[Name]', '[Names]', '[Name]', '[Names]'],
        ['Hiring decisions', '[Name]', '[Name]', '[Names]', '[Name]', '[Names]'],
        ['Process changes', '[Name]', '[Name]', '[Names]', '[Name]', '[Names]'],
        ['Budget reallocation', '[Name]', '[Name]', '[Names]', '[Name]', '[Names]'],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createEscalationGuidance(): Paragraph[] {
  return [
    createSectionTitle('Escalation Path Guidance'),
    createBodyParagraph(
      'When decisions stall, clear escalation paths ensure they don\'t languish. Use these guidelines to determine when and how to escalate.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('When to Escalate'),
    ...createBulletList([
      'Decision has exceeded its time limit without resolution',
      'Stakeholders have irreconcilable differences',
      'New information significantly changes the scope or risk',
      'Required decision maker is unavailable',
      'Decision impacts multiple departments without clear ownership',
    ]),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Escalation Protocol'),
    ...createBulletList([
      'Level 1 (Days 1-7): Attempt resolution within original decision group',
      'Level 2 (Days 8-14): Escalate to next management level with written summary',
      'Level 3 (Days 15+): Executive intervention with forced decision deadline',
      'Emergency: Direct escalation to appropriate executive if business-critical',
    ]),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Escalation Template'),
    createBodyParagraph(
      'Subject: Decision Escalation - [Decision Name]\n\n' +
      'Decision needed: [Brief description]\n' +
      'Original deadline: [Date]\n' +
      'Blocking issue: [Why it hasn\'t been decided]\n' +
      'Options considered: [List 2-3 options]\n' +
      'Recommendation: [Your recommended option]\n' +
      'Action requested: [What you need from escalation target]'
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}
