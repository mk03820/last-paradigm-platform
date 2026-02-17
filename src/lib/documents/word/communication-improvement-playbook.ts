/**
 * Communication Improvement Playbook Generator
 *
 * Generates a Word document with communication metrics analysis,
 * anti-pattern recommendations, and implementation timeline based on Tool 6 data.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 6: Create Communication Improvement Playbook generator
 * Covers: AC6, AC7, FR65 (Book attribution)
 */

import { Document, Packer, Paragraph, TextRun, Table } from 'docx';
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
  formatPercent,
  formatScore,
} from './components';
import { PAGE_MARGINS, DOCUMENT_STYLES, BRAND_COLORS, getScoreInterpretation, getScoreColor } from './styles';
import type { GenerationResult } from './types';

/**
 * Generate the Communication Improvement Playbook document
 */
export async function generateCommunicationImprovementPlaybook(
  diagnosticData: DiagnosticSessionData
): Promise<GenerationResult> {
  const tool6 = diagnosticData.tool6;

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
          default: createBrandedHeader('Communication Improvement Playbook'),
        },
        footers: {
          default: createBrandedFooter(),
        },
        children: [
          // Cover Page
          ...createCoverPage(
            'Communication Improvement Playbook',
            'Optimizing Organizational Communication Patterns'
          ),

          // Executive Summary
          ...createExecutiveSummary(tool6),

          // Current State Metrics
          ...createCurrentStateMetrics(tool6),

          // Anti-Pattern Analysis
          ...createAntiPatternAnalysis(tool6),

          // Channel Optimization
          createPageBreak(),
          ...createChannelOptimization(),

          // Meeting Protocol Improvements
          ...createMeetingProtocols(),

          // Implementation Timeline
          createPageBreak(),
          ...createImplementationTimeline(),

          // Success Metrics
          ...createSuccessMetrics(tool6),
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

function createExecutiveSummary(tool6: DiagnosticSessionData['tool6']): Paragraph[] {
  // Type assertion for healthScore which may exist in runtime data
  const tool6Data = tool6 as DiagnosticSessionData['tool6'] & { healthScore?: number };
  const healthScore = tool6Data?.healthScore || 0;
  const antiPatternCount = tool6?.antiPatterns?.length || 0;

  return [
    createSectionTitle('Executive Summary'),
    createBodyParagraph(
      'This Communication Improvement Playbook provides a structured approach to addressing communication inefficiencies identified in your diagnostic. Poor communication patterns are a major contributor to alignment tax, affecting productivity, decision speed, and employee wellbeing.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    ...createHighlightMetric(
      'Communication Health Score',
      formatScore(healthScore),
      `Status: ${getScoreInterpretation(healthScore)}`
    ),
    createKeyValue('Anti-Patterns Detected', `${antiPatternCount}`, antiPatternCount > 2 ? BRAND_COLORS.red : BRAND_COLORS.slate),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createBodyParagraph(
      healthScore < 50
        ? 'Your communication health score indicates significant dysfunction in communication patterns. Immediate intervention is recommended.'
        : healthScore < 75
        ? 'Your communication patterns show room for improvement. Targeted changes can yield meaningful productivity gains.'
        : 'Your communication health is strong. Focus on maintaining good practices and continuous improvement.'
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createCurrentStateMetrics(tool6: DiagnosticSessionData['tool6']): (Paragraph | Table)[] {
  const rawMetrics = (tool6?.metrics || {}) as Record<string, unknown>;
  const indicators = ((tool6 as Record<string, unknown>)?.healthIndicators || {}) as Record<string, unknown>;

  // Extract metrics with proper typing
  const metrics = {
    emailsPerDay: typeof rawMetrics.emailsPerDay === 'number' ? rawMetrics.emailsPerDay : undefined,
    slackMessagesPerDay: typeof rawMetrics.slackMessagesPerDay === 'number' ? rawMetrics.slackMessagesPerDay : undefined,
    meetingHoursPerWeek: typeof rawMetrics.meetingHoursPerWeek === 'number' ? rawMetrics.meetingHoursPerWeek : undefined,
    afterHoursPercent: typeof rawMetrics.afterHoursPercent === 'number' ? rawMetrics.afterHoursPercent : 0,
    responseTimeMinutes: typeof rawMetrics.responseTimeMinutes === 'number' ? rawMetrics.responseTimeMinutes : 0,
  };

  return [
    createPageBreak(),
    createSectionTitle('Current State Metrics'),
    createBodyParagraph(
      'These metrics represent your organization\'s current communication patterns across different channels.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Communication Volume'),
    createDataTable(
      ['Channel', 'Current', 'Benchmark', 'Status'],
      [
        ['Daily Emails', `${metrics.emailsPerDay || 0}`, '30-50', getVolumeStatus(metrics.emailsPerDay, 30, 50)],
        ['Daily Messages (Slack/Teams)', `${metrics.slackMessagesPerDay || 0}`, '20-40', getVolumeStatus(metrics.slackMessagesPerDay, 20, 40)],
        ['Weekly Meeting Hours', `${metrics.meetingHoursPerWeek || 0}`, '8-15', getVolumeStatus(metrics.meetingHoursPerWeek, 8, 15)],
        ['After-Hours Communication', formatPercent(metrics.afterHoursPercent), '<10%', metrics.afterHoursPercent > 10 ? 'High' : 'Normal'],
        ['Avg Response Time', `${metrics.responseTimeMinutes} min`, '<60 min', metrics.responseTimeMinutes > 60 ? 'Slow' : 'Good'],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Health Indicators'),
    createBodyParagraph(
      'Individual health indicators show the quality of communication across specific dimensions.'
    ),
    createDataTable(
      ['Indicator', 'Score', 'Status'],
      Object.entries(indicators).map(([key, value]) => {
        const numValue = typeof value === 'number' ? value : 0;
        return [
          formatIndicatorName(key),
          formatScore(numValue),
          getScoreInterpretation(numValue),
        ];
      })
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

interface AntiPattern {
  pattern: string;
  severity: string;
  description: string;
  recommendation: string;
}

function createAntiPatternAnalysis(tool6: DiagnosticSessionData['tool6']): (Paragraph | Table)[] {
  const rawAntiPatterns = tool6?.antiPatterns || [];
  const antiPatterns: AntiPattern[] = Array.isArray(rawAntiPatterns)
    ? rawAntiPatterns.map((ap: unknown) => {
        const item = ap as Record<string, unknown>;
        return {
          pattern: String(item.pattern || ''),
          severity: String(item.severity || 'low'),
          description: String(item.description || ''),
          recommendation: String(item.recommendation || ''),
        };
      })
    : [];

  if (antiPatterns.length === 0) {
    return [
      createPageBreak(),
      createSectionTitle('Anti-Pattern Analysis'),
      createBodyParagraph('No significant anti-patterns were detected in your communication analysis.'),
    ];
  }

  const paragraphs: (Paragraph | Table)[] = [
    createPageBreak(),
    createSectionTitle('Anti-Pattern Analysis'),
    createBodyParagraph(
      'The following communication anti-patterns were identified. Each pattern has specific impacts and recommended interventions.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createDataTable(
      ['Pattern', 'Severity', 'Impact', 'Recommendation'],
      antiPatterns.map((ap) => [
        ap.pattern,
        ap.severity.toUpperCase(),
        ap.description,
        ap.recommendation,
      ])
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
  ];

  // Add detailed guidance for each pattern
  paragraphs.push(createSubsectionTitle('Anti-Pattern Intervention Guide'));

  antiPatterns.forEach((ap) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: ap.pattern,
            ...DOCUMENT_STYLES.heading3,
          }),
        ],
        spacing: { before: 150, after: 50 },
      }),
      createKeyValue('Severity', ap.severity.toUpperCase(), getSeverityColor(ap.severity)),
      createBodyParagraph(getAntiPatternGuidance(ap.pattern)),
      new Paragraph({ text: '', spacing: { after: 50 } })
    );
  });

  return paragraphs;
}

function createChannelOptimization(): (Paragraph | Table)[] {
  return [
    createSectionTitle('Channel Optimization Recommendations'),
    createBodyParagraph(
      'Different types of communication are best suited to different channels. Use this guide to optimize channel selection and reduce communication overhead.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createDataTable(
      ['Communication Type', 'Best Channel', 'Avoid', 'Why'],
      [
        ['Quick questions', 'Chat/Slack', 'Email, Meetings', 'Fastest response, minimal overhead'],
        ['Detailed information', 'Email or Doc', 'Chat', 'Creates searchable record, allows async review'],
        ['Urgent issues', 'Phone/Call', 'Email, Chat', 'Immediate attention, tone clarity'],
        ['Complex discussions', 'Meeting', 'Email threads', 'Real-time dialogue, nonverbal cues'],
        ['Status updates', 'Async standup', 'Meetings', 'No need for real-time, respects focus time'],
        ['Decisions', 'Document + Meeting', 'Chat only', 'Provides context, enables preparation'],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Channel Boundaries'),
    ...createBulletList([
      'Email: Use for external communication, formal requests, and information that needs a paper trail',
      'Chat/Slack: Use for quick questions, informal discussion, and time-sensitive coordination',
      'Meetings: Reserve for complex discussions, relationship building, and decisions requiring dialogue',
      'Documents: Use for detailed information sharing, proposals, and asynchronous review',
    ]),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createMeetingProtocols(): (Paragraph | Table)[] {
  return [
    createSectionTitle('Meeting Protocol Improvements'),
    createBodyParagraph(
      'Meetings are often the largest source of communication waste. These protocols help ensure meetings are necessary, efficient, and productive.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Meeting Necessity Test'),
    createBodyParagraph(
      'Before scheduling any meeting, ask these questions:'
    ),
    ...createBulletList([
      'Could this be an email or document instead?',
      'Is real-time dialogue actually necessary?',
      'Who absolutely must participate vs. who just needs the outcome?',
      'What specific decision or outcome will this meeting produce?',
    ]),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Meeting Best Practices'),
    createDataTable(
      ['Practice', 'Implementation'],
      [
        ['Default to 25/50 minutes', 'End 5-10 min early to allow transitions'],
        ['Require agendas', 'No agenda = meeting cancelled'],
        ['Define outcomes upfront', 'State what success looks like'],
        ['Start on time', 'Begin regardless of who\'s present'],
        ['Assign action items', 'Name, task, deadline before ending'],
        ['Designate a note-taker', 'Capture decisions and actions'],
        ['No-meeting time blocks', 'Protect focus time (e.g., mornings)'],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Recurring Meeting Audit'),
    createBodyParagraph(
      'Review all recurring meetings quarterly. For each meeting:'
    ),
    ...createBulletList([
      'Is this meeting still necessary?',
      'Could the frequency be reduced?',
      'Are the right people attending?',
      'Is the format still appropriate?',
      'Is it producing the intended outcomes?',
    ]),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createImplementationTimeline(): Paragraph[] {
  return [
    createSectionTitle('Implementation Timeline'),
    createBodyParagraph(
      'Follow this 30/60/90 day timeline to implement communication improvements incrementally.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Days 1-30: Foundation'),
    ...createBulletList([
      'Communicate initiative and expectations to all teams',
      'Establish channel usage guidelines and share widely',
      'Implement meeting necessity test for all new meetings',
      'Audit and cancel/reduce unnecessary recurring meetings',
      'Set up async standup process for status updates',
    ]),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Days 31-60: Adoption'),
    ...createBulletList([
      'Train teams on meeting best practices',
      'Establish no-meeting time blocks (e.g., Focus Fridays)',
      'Deploy email/chat triage guidelines',
      'Implement response time expectations by channel',
      'Address anti-patterns with specific interventions',
    ]),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Days 61-90: Optimization'),
    ...createBulletList([
      'Measure communication metrics and compare to baseline',
      'Conduct qualitative feedback sessions',
      'Refine guidelines based on learnings',
      'Recognize and share success stories',
      'Plan for ongoing maintenance and improvement',
    ]),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createSuccessMetrics(tool6: DiagnosticSessionData['tool6']): (Paragraph | Table)[] {
  const tool6Data = tool6 as Record<string, unknown> | undefined;
  const currentScore = typeof tool6Data?.healthScore === 'number' ? tool6Data.healthScore : 0;
  const rawMetrics = (tool6?.metrics || {}) as Record<string, unknown>;

  // Extract metrics with proper typing
  const metrics = {
    meetingHoursPerWeek: typeof rawMetrics.meetingHoursPerWeek === 'number' ? rawMetrics.meetingHoursPerWeek : 0,
    afterHoursPercent: typeof rawMetrics.afterHoursPercent === 'number' ? rawMetrics.afterHoursPercent : 0,
    emailsPerDay: typeof rawMetrics.emailsPerDay === 'number' ? rawMetrics.emailsPerDay : 0,
  };

  return [
    createSectionTitle('Success Metrics Tracking'),
    createBodyParagraph(
      'Track these metrics to measure the impact of your communication improvement initiatives.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createDataTable(
      ['Metric', 'Current', '30-Day Target', '90-Day Target'],
      [
        ['Communication Health Score', formatScore(currentScore), formatScore(Math.min(currentScore + 10, 100)), formatScore(Math.min(currentScore + 25, 100))],
        ['Weekly Meeting Hours', `${metrics.meetingHoursPerWeek}`, `-20%`, `-35%`],
        ['After-Hours Communication', formatPercent(metrics.afterHoursPercent), '<15%', '<10%'],
        ['Email Volume', `${metrics.emailsPerDay}/day`, `-15%`, `-25%`],
        ['Anti-Patterns Detected', `${tool6?.antiPatterns?.length || 0}`, `-50%`, 'Eliminated'],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Leading Indicators'),
    ...createBulletList([
      'Decline in "unnecessary meeting" complaints',
      'Increase in deep work time reported',
      'Faster decision-making cycle times',
      'Improved employee satisfaction scores',
      'Reduction in escalated communication issues',
    ]),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

// Helper functions
function getVolumeStatus(value: number | undefined, low: number, high: number): string {
  if (!value) return 'No data';
  if (value < low) return 'Low';
  if (value > high) return 'High';
  return 'Normal';
}

function formatIndicatorName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: BRAND_COLORS.green,
    medium: BRAND_COLORS.amber,
    high: BRAND_COLORS.gold,
    critical: BRAND_COLORS.red,
  };
  return colors[severity] || BRAND_COLORS.slate;
}

function getAntiPatternGuidance(pattern: string): string {
  const guidance: Record<string, string> = {
    'Meeting Overload': 'Implement meeting-free days, enforce agenda requirements, and default to async communication for updates.',
    'Email Chaos': 'Establish email guidelines, use subject line conventions, and move quick discussions to chat.',
    'After-Hours Communication': 'Set explicit expectations around working hours, use scheduled send, and lead by example.',
    'Communication Silos': 'Create cross-functional channels, implement regular cross-team syncs, and improve information sharing practices.',
    'Unclear Ownership': 'Designate communication owners for key topics, use RACI for important initiatives.',
  };
  return guidance[pattern] || 'Implement targeted interventions based on the specific pattern characteristics.';
}
