/**
 * Stakeholder Communication Pack Generator
 *
 * Generates a Word document with stakeholder mapping, quadrant strategies,
 * and communication templates based on Tool 4 data.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 3: Create Stakeholder Communication Pack generator
 * Covers: AC3, AC7, FR65 (Book attribution)
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
  createDataTable,
  createBulletList,
  createKeyValue,
  createPageBreak,
} from './components';
import { PAGE_MARGINS, DOCUMENT_STYLES, BRAND_COLORS } from './styles';
import type { GenerationResult } from './types';

/**
 * Generate the Stakeholder Communication Pack document
 */
export async function generateStakeholderCommunicationPack(
  diagnosticData: DiagnosticSessionData
): Promise<GenerationResult> {
  const tool4 = diagnosticData.tool4;

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
          default: createBrandedHeader('Stakeholder Communication Pack'),
        },
        footers: {
          default: createBrandedFooter(),
        },
        children: [
          // Cover Page
          ...createCoverPage(
            'Stakeholder Communication Pack',
            'Strategic Engagement Guide for Transformation Success'
          ),

          // Overview section
          ...createOverviewSection(tool4),

          // Power/Interest Matrix
          ...createMatrixSection(tool4),

          // Quadrant sections
          ...createManageCloselySection(tool4),
          ...createKeepSatisfiedSection(tool4),
          ...createKeepInformedSection(tool4),
          ...createMonitorSection(tool4),

          // Communication strategies
          ...createCommunicationStrategies(),

          // Messaging templates
          createPageBreak(),
          ...createMessagingTemplates(),
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

function createOverviewSection(tool4: DiagnosticSessionData['tool4']): Paragraph[] {
  const stakeholderCount = tool4?.stakeholders?.length || 0;
  const summary = tool4?.quadrantSummary || {};

  return [
    createSectionTitle('Stakeholder Overview'),
    createBodyParagraph(
      'This Stakeholder Communication Pack provides a comprehensive framework for engaging key stakeholders throughout your organizational transformation. Each stakeholder has been mapped based on their power to influence outcomes and their interest in the transformation.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createKeyValue('Total Stakeholders Mapped', `${stakeholderCount}`),
    createKeyValue('High Priority (Manage Closely)', `${summary.manageClosely || 0}`),
    createKeyValue('Influential (Keep Satisfied)', `${summary.keepSatisfied || 0}`),
    createKeyValue('Supporters (Keep Informed)', `${summary.keepInformed || 0}`),
    createKeyValue('Monitor', `${summary.monitor || 0}`),
    createKeyValue('Risk Indicators', `${tool4?.riskCount || 0} identified`),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createMatrixSection(tool4: DiagnosticSessionData['tool4']): Paragraph[] {
  const summary = tool4?.quadrantSummary || {};

  // Create text-based 2x2 matrix visualization
  return [
    createPageBreak(),
    createSectionTitle('Power/Interest Matrix'),
    createBodyParagraph(
      'The Power/Interest Matrix positions stakeholders based on two dimensions: their power to influence the transformation outcome and their interest in the results. This positioning determines the appropriate engagement strategy.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createDataTable(
      ['', 'Low Interest', 'High Interest'],
      [
        [
          'High Power',
          `KEEP SATISFIED\n(${summary.keepSatisfied || 0} stakeholders)`,
          `MANAGE CLOSELY\n(${summary.manageClosely || 0} stakeholders)`,
        ],
        [
          'Low Power',
          `MONITOR\n(${summary.monitor || 0} stakeholders)`,
          `KEEP INFORMED\n(${summary.keepInformed || 0} stakeholders)`,
        ],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createManageCloselySection(tool4: DiagnosticSessionData['tool4']): Paragraph[] {
  const stakeholders = (tool4?.stakeholders || []).filter(
    (s) => s.quadrant === 'manage_closely'
  );

  if (stakeholders.length === 0) {
    return [
      createPageBreak(),
      createSectionTitle('Manage Closely Quadrant'),
      createBodyParagraph('No stakeholders in this quadrant.'),
    ];
  }

  const rows = stakeholders.map((s) => [
    s.name,
    s.role,
    `${s.power}/10`,
    `${s.interest}/10`,
    s.sentiment || 'neutral',
  ]);

  return [
    createPageBreak(),
    createSectionTitle('Manage Closely Quadrant'),
    createSubsectionTitle('High Power + High Interest'),
    createBodyParagraph(
      'These stakeholders have both the power to significantly impact the transformation and a high interest in its outcome. They require the most intensive engagement and should be treated as key partners.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Stakeholders'),
    createDataTable(
      ['Name', 'Role', 'Power', 'Interest', 'Sentiment'],
      rows
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Engagement Strategy'),
    ...createBulletList([
      'Schedule regular one-on-one meetings (weekly or bi-weekly)',
      'Involve in key decision-making processes',
      'Provide early visibility into changes before broader communication',
      'Seek their input on implementation approaches',
      'Address concerns immediately and personally',
      'Position them as transformation champions where possible',
    ]),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createKeepSatisfiedSection(tool4: DiagnosticSessionData['tool4']): Paragraph[] {
  const stakeholders = (tool4?.stakeholders || []).filter(
    (s) => s.quadrant === 'keep_satisfied'
  );

  if (stakeholders.length === 0) {
    return [
      createPageBreak(),
      createSectionTitle('Keep Satisfied Quadrant'),
      createBodyParagraph('No stakeholders in this quadrant.'),
    ];
  }

  const rows = stakeholders.map((s) => [
    s.name,
    s.role,
    `${s.power}/10`,
    `${s.interest}/10`,
    s.sentiment || 'neutral',
  ]);

  return [
    createPageBreak(),
    createSectionTitle('Keep Satisfied Quadrant'),
    createSubsectionTitle('High Power + Low Interest'),
    createBodyParagraph(
      'These stakeholders have significant power but limited day-to-day interest in the transformation. They need to be kept informed at a high level and their concerns addressed, but do not require intensive engagement.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Stakeholders'),
    createDataTable(
      ['Name', 'Role', 'Power', 'Interest', 'Sentiment'],
      rows
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Engagement Strategy'),
    ...createBulletList([
      'Provide executive summary updates (monthly)',
      'Highlight strategic alignment and business impact',
      'Minimize their required time investment',
      'Escalate only significant issues that require their input',
      'Ensure they are not surprised by any public announcements',
    ]),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createKeepInformedSection(tool4: DiagnosticSessionData['tool4']): Paragraph[] {
  const stakeholders = (tool4?.stakeholders || []).filter(
    (s) => s.quadrant === 'keep_informed'
  );

  if (stakeholders.length === 0) {
    return [
      createPageBreak(),
      createSectionTitle('Keep Informed Quadrant'),
      createBodyParagraph('No stakeholders in this quadrant.'),
    ];
  }

  const rows = stakeholders.map((s) => [
    s.name,
    s.role,
    `${s.power}/10`,
    `${s.interest}/10`,
    s.sentiment || 'neutral',
  ]);

  return [
    createPageBreak(),
    createSectionTitle('Keep Informed Quadrant'),
    createSubsectionTitle('Low Power + High Interest'),
    createBodyParagraph(
      'These stakeholders have high interest in the transformation but limited direct power. They can be valuable allies and advocates, and keeping them well-informed builds support and momentum.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Stakeholders'),
    createDataTable(
      ['Name', 'Role', 'Power', 'Interest', 'Sentiment'],
      rows
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Engagement Strategy'),
    ...createBulletList([
      'Include in regular communication channels (newsletters, town halls)',
      'Provide opportunities to contribute ideas and feedback',
      'Recognize their support and contributions publicly',
      'Invite to training sessions and informational events',
      'Consider as candidates for change champion roles',
    ]),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createMonitorSection(tool4: DiagnosticSessionData['tool4']): Paragraph[] {
  const stakeholders = (tool4?.stakeholders || []).filter(
    (s) => s.quadrant === 'monitor'
  );

  if (stakeholders.length === 0) {
    return [
      createPageBreak(),
      createSectionTitle('Monitor Quadrant'),
      createBodyParagraph('No stakeholders in this quadrant.'),
    ];
  }

  const rows = stakeholders.map((s) => [
    s.name,
    s.role,
    `${s.power}/10`,
    `${s.interest}/10`,
    s.sentiment || 'neutral',
  ]);

  return [
    createPageBreak(),
    createSectionTitle('Monitor Quadrant'),
    createSubsectionTitle('Low Power + Low Interest'),
    createBodyParagraph(
      'These stakeholders have limited power and interest. Minimal effort is required, but continue to monitor for any changes in their position or influence.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Stakeholders'),
    createDataTable(
      ['Name', 'Role', 'Power', 'Interest', 'Sentiment'],
      rows
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Engagement Strategy'),
    ...createBulletList([
      'Include in general organizational communications',
      'Monitor for changes in role or influence',
      'Respond to inquiries when initiated',
      'Reassess positioning quarterly',
    ]),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createCommunicationStrategies(): Paragraph[] {
  return [
    createPageBreak(),
    createSectionTitle('Communication Channel Strategy'),
    createBodyParagraph(
      'Different stakeholders require different communication approaches. Use this matrix to determine the most effective channels for each quadrant.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createDataTable(
      ['Quadrant', 'Primary Channels', 'Frequency', 'Format'],
      [
        ['Manage Closely', '1:1 meetings, direct calls', 'Weekly', 'Detailed discussions'],
        ['Keep Satisfied', 'Executive briefings, email', 'Monthly', 'Summary dashboards'],
        ['Keep Informed', 'Town halls, newsletters', 'Bi-weekly', 'Updates & Q&A'],
        ['Monitor', 'Organization-wide comms', 'As needed', 'General announcements'],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createMessagingTemplates(): Paragraph[] {
  return [
    createSectionTitle('Key Messaging Templates'),
    createBodyParagraph(
      'Use these templates as starting points for stakeholder communications. Customize based on the specific stakeholder and context.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),

    createSubsectionTitle('Executive Briefing Template'),
    createBodyParagraph(
      '[SUBJECT]: Transformation Progress Update - [DATE]\n\n' +
      'Key Highlights:\n' +
      '• [Progress milestone 1]\n' +
      '• [Progress milestone 2]\n\n' +
      'Strategic Impact:\n' +
      '• [Business outcome 1]\n' +
      '• [Business outcome 2]\n\n' +
      'Decisions Needed:\n' +
      '• [Decision item if applicable]\n\n' +
      'Next Steps & Timeline: [Brief overview]'
    ),
    new Paragraph({ text: '', spacing: { after: 150 } }),

    createSubsectionTitle('Resistant Stakeholder Template'),
    createBodyParagraph(
      '[SUBJECT]: Addressing Concerns About [Topic]\n\n' +
      'I understand you have concerns about [specific concern]. I\'d like to address these directly:\n\n' +
      'Your concern: [Restate their concern to show understanding]\n\n' +
      'How we\'re addressing it:\n' +
      '• [Specific action 1]\n' +
      '• [Specific action 2]\n\n' +
      'I\'d welcome the opportunity to discuss this further. Would [time] work for a brief conversation?'
    ),
    new Paragraph({ text: '', spacing: { after: 150 } }),

    createSubsectionTitle('Champion Activation Template'),
    createBodyParagraph(
      '[SUBJECT]: Opportunity to Lead [Initiative]\n\n' +
      'Given your expertise in [area] and your support for our transformation goals, I\'d like to invite you to serve as a champion for [specific initiative].\n\n' +
      'What this involves:\n' +
      '• [Responsibility 1]\n' +
      '• [Responsibility 2]\n\n' +
      'Benefits:\n' +
      '• [Benefit 1]\n' +
      '• [Benefit 2]\n\n' +
      'Would you be interested in discussing this opportunity?'
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}
